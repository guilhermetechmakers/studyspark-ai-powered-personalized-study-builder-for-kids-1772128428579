-- Notifications & Email System - StudySpark
-- Tables: notifications_in_app, notification_email_templates, notification_email_logs,
-- notification_push_tokens, notification_preferences, notification_delivery_events, retry_queue

-- In-app notifications
CREATE TABLE IF NOT EXISTS notifications_in_app (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  type VARCHAR(64) NOT NULL DEFAULT 'general'
);

CREATE INDEX IF NOT EXISTS idx_notifications_in_app_user ON notifications_in_app(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_in_app_read_at ON notifications_in_app(read_at);
CREATE INDEX IF NOT EXISTS idx_notifications_in_app_created_at ON notifications_in_app(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_in_app_type ON notifications_in_app(type);

ALTER TABLE notifications_in_app ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_in_app_select_own" ON notifications_in_app
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notifications_in_app_insert_own" ON notifications_in_app
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_in_app_update_own" ON notifications_in_app
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "notifications_in_app_delete_own" ON notifications_in_app
  FOR DELETE USING (auth.uid() = user_id);

-- Allow service role to insert for system-triggered notifications
CREATE POLICY "notifications_in_app_insert_service" ON notifications_in_app
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Email templates (admin-managed)
CREATE TABLE IF NOT EXISTS notification_email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  html_body TEXT NOT NULL,
  text_body TEXT,
  placeholders JSONB DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_email_templates_active ON notification_email_templates(is_active);

ALTER TABLE notification_email_templates ENABLE ROW LEVEL SECURITY;

-- Templates readable by authenticated users (for rendering); only service_role can manage
CREATE POLICY "notification_email_templates_select_auth" ON notification_email_templates
  FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "notification_email_templates_manage_service" ON notification_email_templates
  FOR ALL USING (auth.role() = 'service_role');

-- Email send logs
CREATE TABLE IF NOT EXISTS notification_email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES notification_email_templates(id) ON DELETE SET NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  message_id VARCHAR(255),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  error_details TEXT,
  retries INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_email_logs_user ON notification_email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_email_logs_status ON notification_email_logs(status);
CREATE INDEX IF NOT EXISTS idx_notification_email_logs_created_at ON notification_email_logs(created_at DESC);

ALTER TABLE notification_email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notification_email_logs_select_own" ON notification_email_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notification_email_logs_insert_service" ON notification_email_logs
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "notification_email_logs_update_service" ON notification_email_logs
  FOR UPDATE USING (auth.role() = 'service_role');

-- Push device tokens
CREATE TABLE IF NOT EXISTS notification_push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_token TEXT NOT NULL,
  platform VARCHAR(32) NOT NULL,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  preferences JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_notification_push_tokens_user ON notification_push_tokens(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_notification_push_tokens_user_device ON notification_push_tokens(user_id, device_token);

ALTER TABLE notification_push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notification_push_tokens_select_own" ON notification_push_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notification_push_tokens_insert_own" ON notification_push_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notification_push_tokens_update_own" ON notification_push_tokens
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "notification_push_tokens_delete_own" ON notification_push_tokens
  FOR DELETE USING (auth.uid() = user_id);

-- User notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email_marketing BOOLEAN NOT NULL DEFAULT false,
  email_transactional BOOLEAN NOT NULL DEFAULT true,
  push_enabled BOOLEAN NOT NULL DEFAULT true,
  push_platforms JSONB DEFAULT '["fcm","apns"]',
  unsubscribe_status VARCHAR(32) DEFAULT 'active',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_user ON notification_preferences(user_id);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notification_preferences_select_own" ON notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notification_preferences_insert_own" ON notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notification_preferences_update_own" ON notification_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Delivery events (for webhooks, analytics)
CREATE TABLE IF NOT EXISTS notification_delivery_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_id VARCHAR(255) NOT NULL,
  target_type VARCHAR(64) NOT NULL,
  event_type VARCHAR(64) NOT NULL,
  event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_notification_delivery_events_target ON notification_delivery_events(target_id, target_type);
CREATE INDEX IF NOT EXISTS idx_notification_delivery_events_timestamp ON notification_delivery_events(event_timestamp DESC);

ALTER TABLE notification_delivery_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notification_delivery_events_service" ON notification_delivery_events
  FOR ALL USING (auth.role() = 'service_role');

-- Retry queue for failed deliveries
CREATE TABLE IF NOT EXISTS retry_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payload_type VARCHAR(64) NOT NULL,
  payload JSONB NOT NULL,
  retry_count INT NOT NULL DEFAULT 0,
  next_attempt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  max_attempts INT NOT NULL DEFAULT 5,
  status VARCHAR(32) NOT NULL DEFAULT 'pending'
);

CREATE INDEX IF NOT EXISTS idx_retry_queue_status ON retry_queue(status);
CREATE INDEX IF NOT EXISTS idx_retry_queue_next_attempt ON retry_queue(next_attempt);

ALTER TABLE retry_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "retry_queue_service" ON retry_queue
  FOR ALL USING (auth.role() = 'service_role');

-- Trigger to auto-create default notification preferences on first access
CREATE OR REPLACE FUNCTION public.ensure_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notification_preferences (user_id, email_marketing, email_transactional, push_enabled)
  VALUES (NEW.id, false, true, true)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: We don't auto-create on signup to avoid migration dependency on auth; Edge Functions will upsert on first fetch.

COMMENT ON TABLE notifications_in_app IS 'In-app notification items per user';
COMMENT ON TABLE notification_email_templates IS 'Email templates for transactional and marketing';
COMMENT ON TABLE notification_email_logs IS 'Log of sent emails with delivery status';
COMMENT ON TABLE notification_push_tokens IS 'Device tokens for FCM/APNS push';
COMMENT ON TABLE notification_preferences IS 'Per-user notification channel preferences';
COMMENT ON TABLE notification_delivery_events IS 'Webhook delivery events from providers';
COMMENT ON TABLE retry_queue IS 'Failed delivery retry queue with exponential backoff';
