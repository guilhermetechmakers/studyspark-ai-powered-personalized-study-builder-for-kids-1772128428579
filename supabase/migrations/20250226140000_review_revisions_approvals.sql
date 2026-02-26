-- Review, Edit & Iterative Revision Workflow
-- Tables: revisions (AI revision requests), approvals, conflict_log
-- Run with: supabase db push (or supabase migration up)

-- Revisions table (AI revision requests with block context)
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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

-- Approvals table
CREATE TABLE IF NOT EXISTS approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  approved_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  approved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('approved', 'changes_requested')),
  notes TEXT
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

-- Conflict log table (concurrent edit conflicts)
CREATE TABLE IF NOT EXISTS conflict_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  conflict_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  details JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_conflict_log_study_id ON conflict_log(study_id);

ALTER TABLE conflict_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conflict_log_select_via_study" ON conflict_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM studies s WHERE s.id = conflict_log.study_id AND s.user_id = auth.uid())
  );

CREATE POLICY "conflict_log_insert_via_study" ON conflict_log
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM studies s WHERE s.id = conflict_log.study_id AND s.user_id = auth.uid())
  );

COMMENT ON TABLE revisions IS 'AI revision requests with block context';
COMMENT ON TABLE approvals IS 'Study approval records';
COMMENT ON TABLE conflict_log IS 'Concurrent edit conflict log';
