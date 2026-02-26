-- Payments & Subscription Management for StudySpark
-- Stripe integration: customers, subscriptions, plans, coupons, invoices, webhooks

-- Plans (synced with Stripe products/prices)
CREATE TABLE IF NOT EXISTS payment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  stripe_price_id TEXT,
  stripe_product_id TEXT,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  interval TEXT NOT NULL CHECK (interval IN ('month', 'year')),
  trial_period_days INT DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_plans_name_interval ON payment_plans(name, interval);
CREATE INDEX IF NOT EXISTS idx_payment_plans_stripe_price ON payment_plans(stripe_price_id);
CREATE INDEX IF NOT EXISTS idx_payment_plans_active ON payment_plans(active);

-- Customers (Stripe customer mapping)
CREATE TABLE IF NOT EXISTS payment_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id TEXT UNIQUE,
  email TEXT NOT NULL,
  billing_address JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_customers_user ON payment_customers(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_customers_stripe ON payment_customers(stripe_customer_id);

-- Subscriptions
CREATE TABLE IF NOT EXISTS payment_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES payment_customers(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  plan_id UUID REFERENCES payment_plans(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'unpaid', 'incomplete', 'incomplete_expired', 'paused')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  quantity INT NOT NULL DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_subscriptions_customer ON payment_subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_subscriptions_stripe ON payment_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_subscriptions_status ON payment_subscriptions(status);

-- Coupons (Stripe coupons / promo codes)
CREATE TABLE IF NOT EXISTS payment_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  stripe_coupon_id TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'amount')),
  discount_value DECIMAL(10,2) NOT NULL,
  duration TEXT CHECK (duration IN ('once', 'repeating', 'forever')),
  duration_in_months INT,
  max_redemptions INT,
  redeemed_count INT NOT NULL DEFAULT 0,
  valid_until TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_coupons_code ON payment_coupons(code);
CREATE INDEX IF NOT EXISTS idx_payment_coupons_valid ON payment_coupons(valid_until) WHERE valid_until IS NOT NULL;

-- Invoices
CREATE TABLE IF NOT EXISTS payment_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_invoice_id TEXT UNIQUE,
  customer_id UUID NOT NULL REFERENCES payment_customers(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES payment_subscriptions(id) ON DELETE SET NULL,
  amount_due DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL CHECK (status IN ('draft', 'open', 'paid', 'uncollectible', 'void')),
  pdf_url TEXT,
  hosted_invoice_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_invoices_customer ON payment_invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_invoices_stripe ON payment_invoices(stripe_invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_invoices_created ON payment_invoices(created_at DESC);

-- Payments (one-time payment intents)
CREATE TABLE IF NOT EXISTS payment_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_payment_intent_id TEXT UNIQUE,
  customer_id UUID REFERENCES payment_customers(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL CHECK (status IN ('succeeded', 'pending', 'failed', 'canceled')),
  method TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_payments_customer ON payment_payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_payments_stripe ON payment_payments(stripe_payment_intent_id);

-- Webhook events (idempotency)
CREATE TABLE IF NOT EXISTS payment_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed')),
  retry_count INT NOT NULL DEFAULT 0,
  error_message TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_webhook_event_id ON payment_webhook_events(event_id);
CREATE INDEX IF NOT EXISTS idx_payment_webhook_status ON payment_webhook_events(status);
CREATE INDEX IF NOT EXISTS idx_payment_webhook_received ON payment_webhook_events(received_at DESC);

-- RLS
ALTER TABLE payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_webhook_events ENABLE ROW LEVEL SECURITY;

-- Plans: public read
CREATE POLICY "payment_plans_select" ON payment_plans FOR SELECT USING (true);

-- Coupons: service role for validation
CREATE POLICY "payment_coupons_select" ON payment_coupons FOR SELECT USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

-- Customers: users see own
CREATE POLICY "payment_customers_select_own" ON payment_customers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "payment_customers_insert_own" ON payment_customers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "payment_customers_update_own" ON payment_customers FOR UPDATE USING (auth.uid() = user_id);

-- Subscriptions: via customer ownership
CREATE POLICY "payment_subscriptions_select_own" ON payment_subscriptions FOR SELECT
  USING (EXISTS (SELECT 1 FROM payment_customers c WHERE c.id = payment_subscriptions.customer_id AND c.user_id = auth.uid()));

-- Invoices: via customer ownership
CREATE POLICY "payment_invoices_select_own" ON payment_invoices FOR SELECT
  USING (EXISTS (SELECT 1 FROM payment_customers c WHERE c.id = payment_invoices.customer_id AND c.user_id = auth.uid()));

-- Payments: via customer ownership
CREATE POLICY "payment_payments_select_own" ON payment_payments FOR SELECT
  USING (customer_id IS NULL OR EXISTS (SELECT 1 FROM payment_customers c WHERE c.id = payment_payments.customer_id AND c.user_id = auth.uid()));

-- Webhook events: admin/service only
CREATE POLICY "payment_webhook_select" ON payment_webhook_events FOR SELECT USING (auth.role() = 'service_role');
CREATE POLICY "payment_webhook_insert" ON payment_webhook_events FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "payment_webhook_update" ON payment_webhook_events FOR UPDATE USING (auth.role() = 'service_role');

-- Service role policies for Edge Functions
CREATE POLICY "payment_customers_service" ON payment_customers FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "payment_subscriptions_service" ON payment_subscriptions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "payment_invoices_service" ON payment_invoices FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "payment_payments_service" ON payment_payments FOR ALL USING (auth.role() = 'service_role');

-- Seed default plans (ignore if already exist)
INSERT INTO payment_plans (name, amount, currency, interval, trial_period_days, active)
VALUES
  ('Free', 0, 'USD', 'month', 0, true),
  ('Pro Monthly', 9.99, 'USD', 'month', 14, true),
  ('Pro Annual', 79.99, 'USD', 'year', 14, true)
ON CONFLICT (name, interval) DO NOTHING;

COMMENT ON TABLE payment_plans IS 'Subscription plans synced with Stripe';
COMMENT ON TABLE payment_customers IS 'Stripe customer mapping per user';
COMMENT ON TABLE payment_subscriptions IS 'Active subscriptions';
COMMENT ON TABLE payment_webhook_events IS 'Stripe webhook idempotency';
