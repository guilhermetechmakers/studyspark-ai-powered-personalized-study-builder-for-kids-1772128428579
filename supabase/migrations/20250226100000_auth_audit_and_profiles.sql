-- Auth audit logging and child profiles for StudySpark
-- Run with: supabase db push (or supabase migration up)

-- Audit logs for security-relevant actions (login, signup, logout, OAuth, password reset)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT true,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only service role can insert/select audit logs (via Edge Functions)
CREATE POLICY "audit_logs_service_role_all" ON audit_logs
  FOR ALL USING (auth.role() = 'service_role');

-- Child profiles for onboarding (linked to auth.users)
CREATE TABLE IF NOT EXISTS child_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INT DEFAULT 0,
  grade TEXT DEFAULT '',
  learning_preferences TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_child_profiles_user_id ON child_profiles(user_id);

ALTER TABLE child_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "child_profiles_select_own" ON child_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "child_profiles_insert_own" ON child_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "child_profiles_update_own" ON child_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "child_profiles_delete_own" ON child_profiles
  FOR DELETE USING (auth.uid() = user_id);
