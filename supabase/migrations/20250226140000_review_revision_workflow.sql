-- Review, Edit & Iterative Revision Workflow
-- Tables: revisions, approvals, conflict_logs
-- Supports block-level revisions, version diffs, approvals, conflict resolution

-- Revisions table (AI revision requests with intent and block context)
CREATE TABLE IF NOT EXISTS revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  prompted_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  block_ids TEXT[] DEFAULT '{}',
  prompt_text TEXT NOT NULL,
  intent TEXT NOT NULL DEFAULT 'rephrase' CHECK (intent IN (
    'clarify', 'expand', 'shorten', 'rephrase', 'upgrade_difficulty', 'adjust_tone'
  )),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  result_content JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_revisions_study_id ON revisions(study_id);
CREATE INDEX IF NOT EXISTS idx_revisions_status ON revisions(status);
CREATE INDEX IF NOT EXISTS idx_revisions_created_at ON revisions(created_at DESC);

ALTER TABLE revisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "revisions_select_via_study" ON revisions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM studies s WHERE s.id = revisions.study_id AND s.user_id = auth.uid())
  );

CREATE POLICY "revisions_insert_via_study" ON revisions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM studies s WHERE s.id = revisions.study_id AND s.user_id = auth.uid())
  );

CREATE POLICY "revisions_update_via_study" ON revisions
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM studies s WHERE s.id = revisions.study_id AND s.user_id = auth.uid())
  );

-- Approvals table (study approval workflow)
CREATE TABLE IF NOT EXISTS approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  approved_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('approved', 'changes_requested')),
  notes TEXT,
  approved_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_approvals_study_id ON approvals(study_id);

ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "approvals_select_via_study" ON approvals
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM studies s WHERE s.id = approvals.study_id AND s.user_id = auth.uid())
  );

CREATE POLICY "approvals_insert_via_study" ON approvals
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM studies s WHERE s.id = approvals.study_id AND s.user_id = auth.uid())
  );

-- Conflict logs (concurrent edit conflicts)
CREATE TABLE IF NOT EXISTS conflict_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  conflict_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  details JSONB DEFAULT '{}',
  resolved_at TIMESTAMPTZ,
  resolution_strategy TEXT
);

CREATE INDEX IF NOT EXISTS idx_conflict_logs_study_id ON conflict_logs(study_id);

ALTER TABLE conflict_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conflict_logs_select_via_study" ON conflict_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM studies s WHERE s.id = conflict_logs.study_id AND s.user_id = auth.uid())
  );

CREATE POLICY "conflict_logs_insert_via_study" ON conflict_logs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM studies s WHERE s.id = conflict_logs.study_id AND s.user_id = auth.uid())
  );

CREATE POLICY "conflict_logs_update_via_study" ON conflict_logs
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM studies s WHERE s.id = conflict_logs.study_id AND s.user_id = auth.uid())
  );

-- Add note column to versions if not exists (for version metadata)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'versions' AND column_name = 'note'
  ) THEN
    ALTER TABLE versions ADD COLUMN note TEXT;
  END IF;
END $$;

COMMENT ON TABLE revisions IS 'AI revision requests with block context and intent';
COMMENT ON TABLE approvals IS 'Study approval workflow';
COMMENT ON TABLE conflict_logs IS 'Concurrent edit conflict tracking';
