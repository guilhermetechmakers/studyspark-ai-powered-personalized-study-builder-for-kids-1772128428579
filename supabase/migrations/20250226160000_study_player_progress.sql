-- Interactive Study Player & Progress Tracking
-- Tables: child_sessions, activities, attempts, progress_summary, privacy_settings
-- Run with: supabase db push (or supabase migration up)

-- Child sessions (short-lived tokens for child study access)
CREATE TABLE IF NOT EXISTS child_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_child_sessions_token ON child_sessions(token);
CREATE INDEX IF NOT EXISTS idx_child_sessions_child_id ON child_sessions(child_id);
CREATE INDEX IF NOT EXISTS idx_child_sessions_study_id ON child_sessions(study_id);
CREATE INDEX IF NOT EXISTS idx_child_sessions_expires_at ON child_sessions(expires_at);

ALTER TABLE child_sessions ENABLE ROW LEVEL SECURITY;

-- Sessions: parent creates via RLS (user owns child); child accesses via token (Edge Function validates)
CREATE POLICY "child_sessions_select_via_child" ON child_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM child_profiles cp
      JOIN studies s ON s.id = child_sessions.study_id
      WHERE cp.id = child_sessions.child_id
      AND (cp.user_id = auth.uid() OR s.user_id = auth.uid())
    )
  );

CREATE POLICY "child_sessions_insert_via_study" ON child_sessions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM studies s
      JOIN child_profiles cp ON cp.user_id = s.user_id AND cp.id = child_sessions.child_id
      WHERE s.id = child_sessions.study_id AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "child_sessions_update_via_study" ON child_sessions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM studies s
      WHERE s.id = child_sessions.study_id AND s.user_id = auth.uid()
    )
  );

-- Activities (derived from study drafts; stored for attempt linking)
CREATE TABLE IF NOT EXISTS study_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('quiz', 'read_aloud', 'flashcard', 'puzzle', 'lesson')),
  content JSONB NOT NULL DEFAULT '{}',
  max_score INT NOT NULL DEFAULT 10,
  position_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_study_activities_study_id ON study_activities(study_id);

ALTER TABLE study_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "study_activities_select_via_study" ON study_activities
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM studies s WHERE s.id = study_activities.study_id AND s.user_id = auth.uid())
  );

CREATE POLICY "study_activities_insert_via_study" ON study_activities
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM studies s WHERE s.id = study_activities.study_id AND s.user_id = auth.uid())
  );

-- Attempts (per-activity completion records)
CREATE TABLE IF NOT EXISTS study_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES child_sessions(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES study_activities(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL,
  score INT NOT NULL DEFAULT 0,
  time_spent_ms INT NOT NULL DEFAULT 0,
  hints_used INT NOT NULL DEFAULT 0,
  responses JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_study_attempts_session_id ON study_attempts(session_id);
CREATE INDEX IF NOT EXISTS idx_study_attempts_activity_id ON study_attempts(activity_id);
CREATE INDEX IF NOT EXISTS idx_study_attempts_started_at ON study_attempts(started_at DESC);

ALTER TABLE study_attempts ENABLE ROW LEVEL SECURITY;

-- Attempts: insert via session (Edge Function validates token); select via session->child->user
CREATE POLICY "study_attempts_select_via_session" ON study_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM child_sessions cs
      JOIN child_profiles cp ON cp.id = cs.child_id
      JOIN studies s ON s.id = cs.study_id
      WHERE cs.id = study_attempts.session_id
      AND (cp.user_id = auth.uid() OR s.user_id = auth.uid())
    )
  );

CREATE POLICY "study_attempts_insert_via_session" ON study_attempts
  FOR INSERT WITH CHECK (true); -- Edge Function validates token; service role or anon with valid token

-- Progress summary (aggregate table for fast dashboard queries - one row per child per study)
CREATE TABLE IF NOT EXISTS progress_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  total_score INT NOT NULL DEFAULT 0,
  total_time_ms INT NOT NULL DEFAULT 0,
  attempt_count INT NOT NULL DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  activity_breakdown JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(child_id, study_id)
);

CREATE INDEX IF NOT EXISTS idx_progress_summary_child_id ON progress_summary(child_id);
CREATE INDEX IF NOT EXISTS idx_progress_summary_study_id ON progress_summary(study_id);
CREATE INDEX IF NOT EXISTS idx_progress_summary_last_attempt ON progress_summary(last_attempt_at DESC);

ALTER TABLE progress_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "progress_summary_select_own" ON progress_summary
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM child_profiles cp
      WHERE cp.id = progress_summary.child_id AND cp.user_id = auth.uid()
    )
  );

-- Privacy settings (optional; for data retention)
CREATE TABLE IF NOT EXISTS privacy_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE UNIQUE,
  data_retention_days INT DEFAULT 365,
  sharing_permissions TEXT DEFAULT 'parent_only' CHECK (sharing_permissions IN ('parent_only', 'export', 'anonymized')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE privacy_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "privacy_settings_select_own" ON privacy_settings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM child_profiles cp WHERE cp.id = privacy_settings.child_id AND cp.user_id = auth.uid())
  );

CREATE POLICY "privacy_settings_insert_own" ON privacy_settings
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM child_profiles cp WHERE cp.id = privacy_settings.child_id AND cp.user_id = auth.uid())
  );

CREATE POLICY "privacy_settings_update_own" ON privacy_settings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM child_profiles cp WHERE cp.id = privacy_settings.child_id AND cp.user_id = auth.uid())
  );

-- Function to upsert progress_summary on attempt insert
CREATE OR REPLACE FUNCTION upsert_progress_summary()
RETURNS TRIGGER AS $$
DECLARE
  v_child_id UUID;
  v_study_id UUID;
  v_breakdown JSONB;
BEGIN
  SELECT cs.child_id, cs.study_id INTO v_child_id, v_study_id
  FROM child_sessions cs WHERE cs.id = NEW.session_id;
  IF v_child_id IS NULL OR v_study_id IS NULL THEN RETURN NEW; END IF;

  INSERT INTO progress_summary (child_id, study_id, total_score, total_time_ms, attempt_count, last_attempt_at, updated_at)
  VALUES (v_child_id, v_study_id, NEW.score, NEW.time_spent_ms, 1, COALESCE(NEW.ended_at, NOW()), NOW())
  ON CONFLICT (child_id, study_id)
  DO UPDATE SET
    total_score = progress_summary.total_score + NEW.score,
    total_time_ms = progress_summary.total_time_ms + NEW.time_spent_ms,
    attempt_count = progress_summary.attempt_count + 1,
    last_attempt_at = GREATEST(COALESCE(progress_summary.last_attempt_at, '1970-01-01'::timestamptz), COALESCE(NEW.ended_at, NOW())),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_study_attempt_insert ON study_attempts;
CREATE TRIGGER on_study_attempt_insert
  AFTER INSERT ON study_attempts
  FOR EACH ROW EXECUTE FUNCTION upsert_progress_summary();

COMMENT ON TABLE child_sessions IS 'Short-lived child study sessions with tokens';
COMMENT ON TABLE study_activities IS 'Activities derived from study content';
COMMENT ON TABLE study_attempts IS 'Per-activity attempt records';
COMMENT ON TABLE progress_summary IS 'Aggregated progress for dashboard';
COMMENT ON TABLE privacy_settings IS 'Child privacy and data retention settings';
