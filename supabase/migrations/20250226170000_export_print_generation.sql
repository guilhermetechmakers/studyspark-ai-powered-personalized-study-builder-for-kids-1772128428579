-- Export & Print-Ready Generation - StudySpark
-- Tables: export_jobs, export_bundles, export_templates
-- Supports PDF exports, asset bundles, queueing, watermarking

-- Export templates (reusable templates for study sheets, flashcards, answer keys)
CREATE TABLE IF NOT EXISTS export_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('pdf', 'bundle')),
  paper_size TEXT NOT NULL DEFAULT 'A4' CHECK (paper_size IN ('A4', 'Letter', 'Legal')),
  orientation TEXT NOT NULL DEFAULT 'portrait' CHECK (orientation IN ('portrait', 'landscape')),
  css_print TEXT,
  content_blocks JSONB DEFAULT '[]',
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_export_templates_type ON export_templates(type);

-- Export jobs (queue-driven export workflow)
CREATE TABLE IF NOT EXISTS export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  study_id UUID REFERENCES studies(id) ON DELETE SET NULL,
  export_type TEXT NOT NULL CHECK (export_type IN ('pdf', 'bundle')),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'rendering', 'completed', 'failed', 'cancelled')),
  progress INT NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  result_url TEXT,
  result_expires_at TIMESTAMPTZ,
  watermark_enabled BOOLEAN NOT NULL DEFAULT false,
  paper_size TEXT NOT NULL DEFAULT 'A4' CHECK (paper_size IN ('A4', 'Letter', 'Legal')),
  orientation TEXT NOT NULL DEFAULT 'portrait' CHECK (orientation IN ('portrait', 'landscape')),
  included_sections JSONB DEFAULT '{"studySheet":true,"flashcards":true,"answers":true,"notes":true}',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_export_jobs_user_id ON export_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_export_jobs_status ON export_jobs(status);
CREATE INDEX IF NOT EXISTS idx_export_jobs_created_at ON export_jobs(created_at DESC);

ALTER TABLE export_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "export_jobs_select_own" ON export_jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "export_jobs_insert_own" ON export_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "export_jobs_update_own" ON export_jobs
  FOR UPDATE USING (auth.uid() = user_id);

-- Export bundles (asset bundles: flashcards, answer keys, media)
CREATE TABLE IF NOT EXISTS export_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  export_job_id UUID NOT NULL REFERENCES export_jobs(id) ON DELETE CASCADE,
  bundle_type TEXT NOT NULL CHECK (bundle_type IN ('flashcards', 'answers', 'media')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  files JSONB DEFAULT '[]',
  archive_url TEXT,
  archive_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_export_bundles_job ON export_bundles(export_job_id);

ALTER TABLE export_bundles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "export_bundles_select_via_job" ON export_bundles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM export_jobs j WHERE j.id = export_bundles.export_job_id AND j.user_id = auth.uid())
  );

CREATE POLICY "export_bundles_insert_via_job" ON export_bundles
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM export_jobs j WHERE j.id = export_bundles.export_job_id AND j.user_id = auth.uid())
  );

-- Seed default templates (only when table is empty)
INSERT INTO export_templates (name, type, paper_size, orientation, content_blocks)
SELECT 'Study Sheet (A4)', 'pdf', 'A4', 'portrait', '[{"type":"studySheet","order":1},{"type":"flashcards","order":2},{"type":"answers","order":3},{"type":"notes","order":4}]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM export_templates LIMIT 1);
INSERT INTO export_templates (name, type, paper_size, orientation, content_blocks)
SELECT 'Flashcards Only (Letter)', 'pdf', 'Letter', 'portrait', '[{"type":"flashcards","order":1}]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM export_templates LIMIT 1);
INSERT INTO export_templates (name, type, paper_size, orientation, content_blocks)
SELECT 'Teacher Pack (Legal)', 'pdf', 'Legal', 'landscape', '[{"type":"studySheet","order":1},{"type":"flashcards","order":2},{"type":"answers","order":3},{"type":"notes","order":4}]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM export_templates LIMIT 1);
INSERT INTO export_templates (name, type, paper_size, orientation, content_blocks)
SELECT 'Full Bundle', 'bundle', 'A4', 'portrait', '[{"type":"flashcards","order":1},{"type":"answers","order":2},{"type":"media","order":3}]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM export_templates LIMIT 1);

-- Storage bucket for export files (private; access via signed URLs)
-- Create bucket if not exists (run via Supabase Dashboard or: Storage -> New bucket -> exports)
-- Edge Functions use service role for upload; signed URLs for download

COMMENT ON TABLE export_templates IS 'Reusable templates for PDF and bundle exports';
COMMENT ON TABLE export_jobs IS 'Export job queue with progress tracking';
COMMENT ON TABLE export_bundles IS 'Asset bundles (flashcards, answers, media) per export job';
