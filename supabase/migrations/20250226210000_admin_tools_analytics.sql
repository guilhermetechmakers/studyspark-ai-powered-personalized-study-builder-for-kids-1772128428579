-- Admin Tools & Analytics: RBAC, moderation, content review, audit logs
-- StudySpark admin portal schema

-- Add role to profiles for RBAC (admin, moderator, parent, user)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'parent', 'moderator', 'admin'));

-- Admin roles and permissions (for future RBAC expansion)
CREATE TABLE IF NOT EXISTS admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  permissions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_user_roles (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES admin_roles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id)
);

-- Admin audit log (immutable log of admin actions)
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_id UUID,
  target_type TEXT,
  payload JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_admin_id ON admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_target ON admin_audit_logs(target_id, target_type);
CREATE INDEX IF NOT EXISTS idx_admin_audit_created_at ON admin_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_action ON admin_audit_logs(action);

ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_audit_service_only" ON admin_audit_logs FOR ALL USING (auth.role() = 'service_role');

-- User moderation queue (users flagged for moderation)
CREATE TABLE IF NOT EXISTS moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'suspended', 'deactivated', 'warned', 'resolved')),
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_moderation_queue_status ON moderation_queue(status);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_user_id ON moderation_queue(user_id);

ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "moderation_queue_service_only" ON moderation_queue FOR ALL USING (auth.role() = 'service_role');

-- Content review queue (content awaiting review)
CREATE TABLE IF NOT EXISTS content_review_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('study', 'material', 'comment', 'post')),
  submitted_by UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'changes_requested', 'escalated')),
  assigned_to UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_review_status ON content_review_queue(status);
CREATE INDEX IF NOT EXISTS idx_content_review_content ON content_review_queue(content_id, content_type);

ALTER TABLE content_review_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "content_review_service_only" ON content_review_queue FOR ALL USING (auth.role() = 'service_role');

-- System health metrics (for dashboards)
CREATE TABLE IF NOT EXISTS system_health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  value NUMERIC NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_system_health_metric ON system_health_metrics(metric_name, timestamp DESC);

ALTER TABLE system_health_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "system_health_service_only" ON system_health_metrics FOR ALL USING (auth.role() = 'service_role');

-- Seed default admin role
INSERT INTO admin_roles (name, permissions) VALUES
  ('admin', ARRAY['users:read', 'users:write', 'moderation:read', 'moderation:write', 'content:read', 'content:write', 'analytics:read', 'health:read', 'audit:read', 'settings:read', 'settings:write'])
ON CONFLICT (name) DO NOTHING;
