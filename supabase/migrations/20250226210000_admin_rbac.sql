-- Admin RBAC: admin_users, admin_roles, admin_audit_logs
-- Enables role-based access control for admin portal

-- Admin roles (super_admin, moderator, support, etc.)
CREATE TABLE IF NOT EXISTS admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  permissions TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admin users (users who can access admin portal)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES admin_roles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Only admins can read admin_users (enforced by service role in Edge Functions)
-- For client: allow users to check if THEY are in admin_users
CREATE POLICY "admin_users_select_own" ON admin_users
  FOR SELECT USING (auth.uid() = user_id);

-- Admin audit log (immutable log of admin actions)
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_id UUID,
  target_type TEXT NOT NULL,
  payload JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_admin_id ON admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_created_at ON admin_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_action ON admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_target ON admin_audit_logs(target_type, target_id);

ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins can read audit logs (RLS will be supplemented by Edge Functions for full access)
CREATE POLICY "admin_audit_select" ON admin_audit_logs
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM admin_users)
  );

-- Seed default admin role
INSERT INTO admin_roles (name, permissions)
SELECT 'super_admin', ARRAY['*']
WHERE NOT EXISTS (SELECT 1 FROM admin_roles WHERE name = 'super_admin');

COMMENT ON TABLE admin_users IS 'Users with admin portal access';
COMMENT ON TABLE admin_roles IS 'Admin role definitions with permissions';
COMMENT ON TABLE admin_audit_logs IS 'Immutable audit trail for admin actions';
