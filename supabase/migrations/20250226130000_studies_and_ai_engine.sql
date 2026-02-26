-- AI Generation Engine (Study Builder) - Database schema
-- Tables: studies, materials, drafts, versions, prompt_logs, progress, moderations, quotas

-- Studies table
CREATE TABLE IF NOT EXISTS studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  topic_tags TEXT[] DEFAULT '{}',
  learning_style TEXT NOT NULL,
  age INT NOT NULL DEFAULT 8,
  folders_path TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'drafting', 'streaming', 'ready', 'exported')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_studies_user_id ON studies(user_id);
CREATE INDEX IF NOT EXISTS idx_studies_status ON studies(status);
CREATE INDEX IF NOT EXISTS idx_studies_created_at ON studies(created_at DESC);

ALTER TABLE studies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "studies_select_own" ON studies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "studies_insert_own" ON studies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "studies_update_own" ON studies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "studies_delete_own" ON studies FOR DELETE USING (auth.uid() = user_id);

-- Materials table (uploaded documents, photos, text)
CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('document', 'photo', 'text')),
  source_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_materials_study_id ON materials(study_id);

ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "materials_select_via_study" ON materials
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM studies s WHERE s.id = materials.study_id AND s.user_id = auth.uid())
  );
CREATE POLICY "materials_insert_via_study" ON materials
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM studies s WHERE s.id = materials.study_id AND s.user_id = auth.uid())
  );
CREATE POLICY "materials_update_via_study" ON materials
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM studies s WHERE s.id = materials.study_id AND s.user_id = auth.uid())
  );
CREATE POLICY "materials_delete_via_study" ON materials
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM studies s WHERE s.id = materials.study_id AND s.user_id = auth.uid())
  );

-- Drafts table (versioned content payloads)
CREATE TABLE IF NOT EXISTS drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  version INT NOT NULL DEFAULT 1,
  content_payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_drafts_study_id ON drafts(study_id);
CREATE INDEX IF NOT EXISTS idx_drafts_version ON drafts(study_id, version);

ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "drafts_select_via_study" ON drafts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM studies s WHERE s.id = drafts.study_id AND s.user_id = auth.uid())
  );
CREATE POLICY "drafts_insert_via_study" ON drafts
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM studies s WHERE s.id = drafts.study_id AND s.user_id = auth.uid())
  );
CREATE POLICY "drafts_update_via_study" ON drafts
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM studies s WHERE s.id = drafts.study_id AND s.user_id = auth.uid())
  );
CREATE POLICY "drafts_delete_via_study" ON drafts
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM studies s WHERE s.id = drafts.study_id AND s.user_id = auth.uid())
  );

-- Versions table (snapshots with diffs)
CREATE TABLE IF NOT EXISTS versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  diffs JSONB DEFAULT '{}',
  content_snapshot JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_versions_study_id ON versions(study_id);

ALTER TABLE versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "versions_select_via_study" ON versions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM studies s WHERE s.id = versions.study_id AND s.user_id = auth.uid())
  );
CREATE POLICY "versions_insert_via_study" ON versions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM studies s WHERE s.id = versions.study_id AND s.user_id = auth.uid())
  );

-- Prompt logs (for audit and context)
CREATE TABLE IF NOT EXISTS prompt_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('system', 'user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prompt_logs_study_id ON prompt_logs(study_id);

ALTER TABLE prompt_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prompt_logs_select_via_study" ON prompt_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM studies s WHERE s.id = prompt_logs.study_id AND s.user_id = auth.uid())
  );
CREATE POLICY "prompt_logs_insert_via_study" ON prompt_logs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM studies s WHERE s.id = prompt_logs.study_id AND s.user_id = auth.uid())
  );

-- Progress table (streaming status)
CREATE TABLE IF NOT EXISTS progress (
  study_id UUID PRIMARY KEY REFERENCES studies(id) ON DELETE CASCADE,
  stage TEXT NOT NULL DEFAULT 'idle',
  progress_pct INT NOT NULL DEFAULT 0,
  streaming_token TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "progress_select_via_study" ON progress
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM studies s WHERE s.id = progress.study_id AND s.user_id = auth.uid())
  );
CREATE POLICY "progress_insert_via_study" ON progress
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM studies s WHERE s.id = progress.study_id AND s.user_id = auth.uid())
  );
CREATE POLICY "progress_update_via_study" ON progress
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM studies s WHERE s.id = progress.study_id AND s.user_id = auth.uid())
  );

-- Moderations table (safety checks)
CREATE TABLE IF NOT EXISTS moderations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'passed', 'flagged')),
  issues JSONB DEFAULT '[]',
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_moderations_study_id ON moderations(study_id);

ALTER TABLE moderations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "moderations_select_via_study" ON moderations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM studies s WHERE s.id = moderations.study_id AND s.user_id = auth.uid())
  );
CREATE POLICY "moderations_insert_via_study" ON moderations
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM studies s WHERE s.id = moderations.study_id AND s.user_id = auth.uid())
  );
CREATE POLICY "moderations_update_via_study" ON moderations
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM studies s WHERE s.id = moderations.study_id AND s.user_id = auth.uid())
  );

-- Quotas table (per-user generation limits)
CREATE TABLE IF NOT EXISTS quotas (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  used_count INT NOT NULL DEFAULT 0,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  window_end TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (user_id)
);

ALTER TABLE quotas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quotas_select_own" ON quotas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "quotas_insert_own" ON quotas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "quotas_update_own" ON quotas FOR UPDATE USING (auth.uid() = user_id);

COMMENT ON TABLE studies IS 'Study sets created by users for AI generation';
COMMENT ON TABLE materials IS 'Uploaded materials (documents, photos) for studies';
COMMENT ON TABLE drafts IS 'Draft content payloads per study version';
COMMENT ON TABLE versions IS 'Version snapshots with diffs for restore';
COMMENT ON TABLE prompt_logs IS 'Audit log of prompts sent to LLM';
COMMENT ON TABLE progress IS 'Streaming generation progress';
COMMENT ON TABLE moderations IS 'Content moderation results';
COMMENT ON TABLE quotas IS 'Per-user generation quota tracking';
