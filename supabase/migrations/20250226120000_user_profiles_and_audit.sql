-- User profiles and profile audit trail for StudySpark
-- Extends auth.users with parent profile data; profile_audit_log for change history

-- User profiles (extends auth.users with contact info)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_profiles_select_own" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "user_profiles_insert_own" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "user_profiles_update_own" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Profile audit log (who changed what when)
CREATE TABLE IF NOT EXISTS profile_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_id UUID,
  target_type TEXT NOT NULL CHECK (target_type IN ('user', 'child')),
  changed_by UUID NOT NULL REFERENCES auth.users(id),
  changes JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profile_audit_user_id ON profile_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_audit_target ON profile_audit_log(target_id, target_type);
CREATE INDEX IF NOT EXISTS idx_profile_audit_created_at ON profile_audit_log(created_at DESC);

ALTER TABLE profile_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profile_audit_select_own" ON profile_audit_log
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can insert audit entries (via Edge Functions or triggers)
CREATE POLICY "profile_audit_insert_own" ON profile_audit_log
  FOR INSERT WITH CHECK (auth.uid() = changed_by);

-- Note: Age (4-18) and grade (K,1-12) validation enforced in application layer
-- to avoid breaking existing data. learning_preferences already exists as TEXT[]

-- Trigger to sync user_profiles from auth.users on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
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
