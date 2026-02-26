-- Admin Tools & Analytics: RBAC, audit logs, moderation queues
-- Supports admin role on profiles, admin_audit_logs, content_review_queue, user_moderation_queue

-- Add role to profiles for RBAC
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'parent', 'admin', 'super_admin'));

-- Admin audit logs (immutable)
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_id TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('study', 'folder', 'user', 'content', 'moderation', 'system')),
  payload JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_admin_id ON admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_target ON admin_audit_logs(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_created_at ON admin_audit_logs(created_at DESC);

ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_audit_select_service" ON admin_audit_logs
  FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "admin_audit_insert_service" ON admin_audit_logs
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Content review queue
CREATE TABLE IF NOT EXISTS content_review_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('study', 'material', 'post', 'comment', 'media')),
  title TEXT NOT NULL,
  submitted_by UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'changes_requested', 'escalated')),
  assigned_to UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}',
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_review_status ON content_review_queue(status);
CREATE INDEX IF NOT EXISTS idx_content_review_submitted ON content_review_queue(submitted_by);

ALTER TABLE content_review_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content_review_service" ON content_review_queue
  FOR ALL USING (auth.role() = 'service_role');

-- User moderation queue
CREATE TABLE IF NOT EXISTS user_moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'resolved')),
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_moderation_status ON user_moderation_queue(status);
CREATE INDEX IF NOT EXISTS idx_user_moderation_user ON user_moderation_queue(user_id);

ALTER TABLE user_moderation_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_moderation_service" ON user_moderation_queue
  FOR ALL USING (auth.role() = 'service_role');

COMMENT ON TABLE admin_audit_logs IS 'Immutable audit log for admin actions';
COMMENT ON TABLE content_review_queue IS 'Content awaiting admin review';
COMMENT ON TABLE user_moderation_queue IS 'Users flagged for moderation';
