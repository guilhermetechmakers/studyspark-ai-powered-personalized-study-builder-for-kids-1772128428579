-- File Upload & OCR Ingestion - StudySpark
-- Tables: uploaded_files, file_versions, ocr_results, file_access_controls, file_audit_logs
-- Storage bucket: Create 'uploaded-files' via Supabase Dashboard (private, RLS)

-- Uploaded files metadata
CREATE TABLE IF NOT EXISTS uploaded_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size BIGINT NOT NULL DEFAULT 0,
  storage_key TEXT NOT NULL,
  etag TEXT,
  ocr_status TEXT NOT NULL DEFAULT 'pending' CHECK (ocr_status IN ('pending', 'in_progress', 'completed', 'failed', 'corrected')),
  ocr_confidence NUMERIC(5,4) DEFAULT NULL,
  ocr_text TEXT,
  ocr_version INT NOT NULL DEFAULT 1,
  related_study_id UUID REFERENCES studies(id) ON DELETE SET NULL,
  child_profile_id UUID REFERENCES child_profiles(id) ON DELETE SET NULL,
  subject TEXT,
  tags TEXT[] DEFAULT '{}',
  virus_scan_status TEXT NOT NULL DEFAULT 'pending' CHECK (virus_scan_status IN ('pending', 'clean', 'infected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_uploaded_files_owner ON uploaded_files(owner_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_ocr_status ON uploaded_files(ocr_status);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_related_study ON uploaded_files(related_study_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_created_at ON uploaded_files(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_storage_key ON uploaded_files(storage_key);

-- Full-text search on filename, ocr_text, tags
ALTER TABLE uploaded_files ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION uploaded_files_search_vector_trigger()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.filename, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.ocr_text, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(COALESCE(NEW.tags, '{}'), ' '), '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS uploaded_files_search_vector_update ON uploaded_files;
CREATE TRIGGER uploaded_files_search_vector_update
  BEFORE INSERT OR UPDATE OF filename, ocr_text, tags ON uploaded_files
  FOR EACH ROW EXECUTE FUNCTION uploaded_files_search_vector_trigger();

CREATE INDEX IF NOT EXISTS idx_uploaded_files_search_vector ON uploaded_files USING GIN(search_vector) WHERE search_vector IS NOT NULL;

-- File access controls (created before uploaded_files RLS policies that reference it)
CREATE TABLE IF NOT EXISTS file_access_controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES uploaded_files(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission TEXT NOT NULL CHECK (permission IN ('view', 'edit', 'owner')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(file_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_file_access_controls_file ON file_access_controls(file_id);
CREATE INDEX IF NOT EXISTS idx_file_access_controls_user ON file_access_controls(user_id);

ALTER TABLE file_access_controls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "file_access_controls_select_owner_or_shared" ON file_access_controls
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM uploaded_files f WHERE f.id = file_access_controls.file_id AND f.owner_id = auth.uid())
  );

CREATE POLICY "file_access_controls_insert_owner" ON file_access_controls
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM uploaded_files f WHERE f.id = file_access_controls.file_id AND f.owner_id = auth.uid())
  );

CREATE POLICY "file_access_controls_delete_owner" ON file_access_controls
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM uploaded_files f WHERE f.id = file_access_controls.file_id AND f.owner_id = auth.uid())
  );

ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "uploaded_files_insert_own" ON uploaded_files
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "uploaded_files_delete_own" ON uploaded_files
  FOR DELETE USING (auth.uid() = owner_id);

CREATE POLICY "uploaded_files_select_own_or_shared" ON uploaded_files
  FOR SELECT USING (
    auth.uid() = owner_id OR
    EXISTS (SELECT 1 FROM file_access_controls fac WHERE fac.file_id = uploaded_files.id AND fac.user_id = auth.uid())
  );

CREATE POLICY "uploaded_files_update_own_or_editor" ON uploaded_files
  FOR UPDATE USING (
    auth.uid() = owner_id OR
    EXISTS (SELECT 1 FROM file_access_controls fac WHERE fac.file_id = uploaded_files.id AND fac.user_id = auth.uid() AND fac.permission IN ('edit', 'owner'))
  );

-- File versions (OCR corrections)
CREATE TABLE IF NOT EXISTS file_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES uploaded_files(id) ON DELETE CASCADE,
  version INT NOT NULL,
  ocr_text TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_file_versions_file_id ON file_versions(file_id);

ALTER TABLE file_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "file_versions_select_via_file" ON file_versions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM uploaded_files f WHERE f.id = file_versions.file_id AND (f.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM file_access_controls fac WHERE fac.file_id = f.id AND fac.user_id = auth.uid())))
  );

CREATE POLICY "file_versions_insert_via_file" ON file_versions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM uploaded_files f WHERE f.id = file_versions.file_id AND (f.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM file_access_controls fac WHERE fac.file_id = f.id AND fac.user_id = auth.uid() AND fac.permission IN ('edit', 'owner'))))
  );

-- OCR results (structured blocks) - one per file, upserted on OCR run
CREATE TABLE IF NOT EXISTS ocr_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES uploaded_files(id) ON DELETE CASCADE UNIQUE,
  full_text TEXT,
  language TEXT,
  blocks JSONB DEFAULT '[]',
  words JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ocr_results_file_id ON ocr_results(file_id);

ALTER TABLE ocr_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ocr_results_select_via_file" ON ocr_results
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM uploaded_files f WHERE f.id = ocr_results.file_id AND (f.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM file_access_controls fac WHERE fac.file_id = f.id AND fac.user_id = auth.uid())))
  );

CREATE POLICY "ocr_results_insert_via_file" ON ocr_results
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM uploaded_files f WHERE f.id = ocr_results.file_id AND f.owner_id = auth.uid())
  );

-- File audit logs
CREATE TABLE IF NOT EXISTS file_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID REFERENCES uploaded_files(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_file_audit_logs_file ON file_audit_logs(file_id);
CREATE INDEX IF NOT EXISTS idx_file_audit_logs_actor ON file_audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_file_audit_logs_created_at ON file_audit_logs(created_at DESC);

ALTER TABLE file_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "file_audit_logs_select_own" ON file_audit_logs
  FOR SELECT USING (
    auth.uid() = actor_id OR
    EXISTS (SELECT 1 FROM uploaded_files f WHERE f.id = file_audit_logs.file_id AND f.owner_id = auth.uid())
  );

CREATE POLICY "file_audit_logs_insert_own" ON file_audit_logs
  FOR INSERT WITH CHECK (auth.uid() = actor_id);

-- Upload sessions for chunked uploads (ephemeral)
CREATE TABLE IF NOT EXISTS upload_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_id UUID REFERENCES uploaded_files(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size BIGINT NOT NULL,
  chunk_count INT NOT NULL,
  uploaded_chunks INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours')
);

CREATE INDEX IF NOT EXISTS idx_upload_sessions_owner ON upload_sessions(owner_id);
CREATE INDEX IF NOT EXISTS idx_upload_sessions_expires ON upload_sessions(expires_at);

ALTER TABLE upload_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "upload_sessions_select_own" ON upload_sessions
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "upload_sessions_insert_own" ON upload_sessions
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "upload_sessions_update_own" ON upload_sessions
  FOR UPDATE USING (auth.uid() = owner_id);

COMMENT ON TABLE uploaded_files IS 'Uploaded documents and images with OCR metadata';
COMMENT ON TABLE file_versions IS 'OCR correction version history';
COMMENT ON TABLE ocr_results IS 'Structured OCR output (blocks, words)';
COMMENT ON TABLE file_access_controls IS 'Sharing permissions for files';
COMMENT ON TABLE file_audit_logs IS 'Audit trail for file actions';
COMMENT ON TABLE upload_sessions IS 'Chunked upload session tracking';

-- Storage bucket for file uploads (Supabase Storage)
-- Create via Dashboard if this fails: Storage > New bucket > file-uploads (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('file-uploads', 'file-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- RLS for storage.objects - allow owner to upload/read their files
-- Path format: {owner_id}/{file_id}/{filename}
-- Note: Create bucket 'file-uploads' via Supabase Dashboard if migration fails
DROP POLICY IF EXISTS "file_uploads_insert_own" ON storage.objects;
CREATE POLICY "file_uploads_insert_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'file-uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "file_uploads_select_own" ON storage.objects;
CREATE POLICY "file_uploads_select_own" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'file-uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
