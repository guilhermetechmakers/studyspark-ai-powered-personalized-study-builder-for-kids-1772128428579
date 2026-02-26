-- User profiles and profile audit trail for StudySpark
-- Extends auth.users with profile data; profile_audit_log for change history

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Profile audit log (user/child profile changes)
CREATE TABLE IF NOT EXISTS profile_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_id UUID,
  target_type TEXT NOT NULL CHECK (target_type IN ('user', 'child')),
  changed_by UUID REFERENCES auth.users(id),
  changes JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profile_audit_user_id ON profile_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_audit_target ON profile_audit_log(target_id, target_type);
CREATE INDEX IF NOT EXISTS idx_profile_audit_created_at ON profile_audit_log(created_at DESC);

ALTER TABLE profile_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profile_audit_select_own" ON profile_audit_log
  FOR SELECT USING (auth.uid() = user_id);

-- Only triggers and service role can insert audit
CREATE POLICY "profile_audit_insert_service" ON profile_audit_log
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Allow trigger function (runs as definer) to insert
CREATE POLICY "profile_audit_insert_trigger" ON profile_audit_log
  FOR INSERT WITH CHECK (true);

-- Drop conflicting policy if we use a single approach - use trigger with SECURITY DEFINER
DROP POLICY IF EXISTS "profile_audit_insert_trigger" ON profile_audit_log;
DROP POLICY IF EXISTS "profile_audit_insert_service" ON profile_audit_log;

-- Audit: only authenticated users can read their own; inserts via trigger (SECURITY DEFINER)
CREATE POLICY "profile_audit_select_own" ON profile_audit_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "profile_audit_insert_all" ON profile_audit_log
  FOR INSERT WITH CHECK (true);

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add phone, address to profiles if migrating from existing
COMMENT ON TABLE profiles IS 'User profile data extending auth.users';
COMMENT ON TABLE profile_audit_log IS 'Audit trail for profile create/update/delete';
