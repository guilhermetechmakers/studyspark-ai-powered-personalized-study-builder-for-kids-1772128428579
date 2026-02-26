-- Export & Print-Ready Generation - Database schema for StudySpark
-- Tables: exports, bundles, templates, export_audit_logs
-- Supports PDF exports, asset bundles, queueing, and watermarking

-- Export jobs table (queue + progress)
CREATE TABLE IF NOT EXISTS exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  study_id UUID REFERENCES studies(id) ON DELETE SET NULL,
  export_type TEXT NOT NULL CHECK (export_type IN ('pdf', 'bundle')),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'rendering', 'completed', 'failed', 'partial', 'cancelled')),
  progress INT NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  result_url TEXT,
  result_data TEXT,
  error_message TEXT,
  watermark_enabled BOOLEAN NOT NULL DEFAULT false,
  paper_size TEXT NOT NULL DEFAULT 'A4' CHECK (paper_size IN ('A4', 'Letter', 'Legal')),
  orientation TEXT NOT NULL DEFAULT 'portrait' CHECK (orientation IN ('portrait', 'landscape')),
  included_sections JSONB NOT NULL DEFAULT '{"studySheet":true,"flashcards":true,"answers":true,"notes":true}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exports_user_id ON exports(user_id);
CREATE INDEX IF NOT EXISTS idx_exports_status ON exports(status);
CREATE INDEX IF NOT EXISTS idx_exports_created_at ON exports(created_at DESC);

ALTER TABLE exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exports_select_own" ON exports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "exports_insert_own" ON exports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "exports_update_own" ON exports
  FOR UPDATE USING (auth.uid() = user_id);

-- Bundles table (asset bundles linked to exports)
CREATE TABLE IF NOT EXISTS bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  export_id UUID NOT NULL REFERENCES exports(id) ON DELETE CASCADE,
  bundle_type TEXT NOT NULL CHECK (bundle_type IN ('flashcards', 'answers', 'media')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  files JSONB NOT NULL DEFAULT '[]',
  archive_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bundles_export_id ON bundles(export_id);

ALTER TABLE bundles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bundles_select_via_export" ON bundles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM exports e WHERE e.id = bundles.export_id AND e.user_id = auth.uid())
  );

CREATE POLICY "bundles_insert_via_export" ON bundles
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM exports e WHERE e.id = bundles.export_id AND e.user_id = auth.uid())
  );

-- Templates table (reusable export templates)
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('pdf', 'bundle')),
  paper_size TEXT NOT NULL DEFAULT 'A4',
  orientation TEXT NOT NULL DEFAULT 'portrait',
  css_print TEXT,
  content_blocks JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_templates_type ON templates(type);

-- Seed default templates
INSERT INTO templates (name, type, paper_size, orientation, css_print) VALUES
  ('Study Sheet - A4', 'pdf', 'A4', 'portrait', ''),
  ('Study Sheet - Letter', 'pdf', 'Letter', 'portrait', ''),
  ('Flashcards - A4', 'pdf', 'A4', 'landscape', ''),
  ('Answer Key - A4', 'pdf', 'A4', 'portrait', '');

-- Export audit logs (for access tracking)
CREATE TABLE IF NOT EXISTS export_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_id UUID,
  target_type TEXT,
  details JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_export_audit_user_id ON export_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_export_audit_timestamp ON export_audit_logs(timestamp DESC);

ALTER TABLE export_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "export_audit_select_own" ON export_audit_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "export_audit_insert_own" ON export_audit_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE exports IS 'Export jobs with queue status and progress';
COMMENT ON TABLE bundles IS 'Asset bundles (flashcards, answers) linked to exports';
COMMENT ON TABLE templates IS 'Reusable export templates';
COMMENT ON TABLE export_audit_logs IS 'Audit trail for export access';

-- Storage bucket for export files (requires storage schema)
-- Run via Supabase Dashboard if migration fails: create bucket 'exports' (private)
