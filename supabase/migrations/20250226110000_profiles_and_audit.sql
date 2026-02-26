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

-- Allow inserts from authenticated users (for audit triggers) and service role
CREATE POLICY "profile_audit_insert" ON profile_audit_log
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

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

-- Audit trigger for profiles
CREATE OR REPLACE FUNCTION public.audit_profile_change()
RETURNS TRIGGER AS $$
DECLARE
  changes_json JSONB;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    changes_json := jsonb_build_object(
      'before', to_jsonb(OLD),
      'after', to_jsonb(NEW)
    );
    INSERT INTO profile_audit_log (user_id, action, target_id, target_type, changed_by, changes)
    VALUES (NEW.id, 'update_user', NEW.id, 'user', auth.uid(), changes_json);
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO profile_audit_log (user_id, action, target_id, target_type, changed_by, changes)
    VALUES (NEW.id, 'create_user', NEW.id, 'user', auth.uid(), to_jsonb(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO profile_audit_log (user_id, action, target_id, target_type, changed_by, changes)
    VALUES (OLD.id, 'delete_user', OLD.id, 'user', auth.uid(), to_jsonb(OLD));
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS audit_profiles_change ON profiles;
CREATE TRIGGER audit_profiles_change
  AFTER INSERT OR UPDATE OR DELETE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_profile_change();

-- Audit trigger for child_profiles
CREATE OR REPLACE FUNCTION public.audit_child_profile_change()
RETURNS TRIGGER AS $$
DECLARE
  changes_json JSONB;
  uid UUID;
BEGIN
  uid := COALESCE(NEW.user_id, OLD.user_id);
  IF TG_OP = 'UPDATE' THEN
    changes_json := jsonb_build_object(
      'before', to_jsonb(OLD),
      'after', to_jsonb(NEW)
    );
    INSERT INTO profile_audit_log (user_id, action, target_id, target_type, changed_by, changes)
    VALUES (uid, 'update_child', NEW.id, 'child', auth.uid(), changes_json);
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO profile_audit_log (user_id, action, target_id, target_type, changed_by, changes)
    VALUES (uid, 'create_child', NEW.id, 'child', auth.uid(), to_jsonb(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO profile_audit_log (user_id, action, target_id, target_type, changed_by, changes)
    VALUES (uid, 'delete_child', OLD.id, 'child', auth.uid(), to_jsonb(OLD));
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS audit_child_profiles_change ON child_profiles;
CREATE TRIGGER audit_child_profiles_change
  AFTER INSERT OR UPDATE OR DELETE ON child_profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_child_profile_change();

-- Backfill profiles for existing auth.users
INSERT INTO profiles (id, name, email, created_at, updated_at)
SELECT id, COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1)), COALESCE(email, ''), created_at, COALESCE(updated_at, created_at, NOW())
FROM auth.users
WHERE email IS NOT NULL
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE profiles IS 'User profile data extending auth.users';
COMMENT ON TABLE profile_audit_log IS 'Audit trail for profile create/update/delete';
