-- Payments & Subscription Management - StudySpark
-- Extends checkout with Stripe subscriptions, invoices, webhooks, billing portal
-- Tables: payment_customers, payment_plans, payment_subscriptions, payment_invoices,
--         payment_payments, payment_webhook_events
-- Coupons: extends promos with duration, duration_in_months, redemption tracking

-- Payment customers (Stripe customer mapping)
CREATE TABLE IF NOT EXISTS payment_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL UNIQUE,
  email TEXT,
  billing_address JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_customers_user ON payment_customers(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_customers_stripe ON payment_customers(stripe_customer_id);

ALTER TABLE payment_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payment_customers_select_own" ON payment_customers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "payment_customers_insert_own" ON payment_customers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "payment_customers_update_own" ON payment_customers
  FOR UPDATE USING (auth.uid() = user_id);

-- Service role for webhook/Edge Function writes
CREATE POLICY "payment_customers_service" ON payment_customers
  FOR ALL USING (auth.role() = 'service_role');

-- Payment plans (Stripe product/price mapping)
CREATE TABLE IF NOT EXISTS payment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  stripe_price_id TEXT,
  stripe_product_id TEXT,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  interval TEXT CHECK (interval IN ('month', 'year')),
  trial_period_days INT DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_plans_active ON payment_plans(active);

ALTER TABLE payment_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payment_plans_select" ON payment_plans FOR SELECT USING (active = true);
CREATE POLICY "payment_plans_service" ON payment_plans FOR ALL USING (auth.role() = 'service_role');

-- Extend promos for coupon engine (duration, redemption)
ALTER TABLE promos ADD COLUMN IF NOT EXISTS duration TEXT CHECK (duration IN ('once', 'repeating', 'forever'));
ALTER TABLE promos ADD COLUMN IF NOT EXISTS duration_in_months INT;
ALTER TABLE promos ADD COLUMN IF NOT EXISTS max_redemptions INT;
ALTER TABLE promos ADD COLUMN IF NOT EXISTS redeemed_count INT DEFAULT 0;
ALTER TABLE promos ADD COLUMN IF NOT EXISTS valid_from TIMESTAMPTZ;
ALTER TABLE promos ADD COLUMN IF NOT EXISTS valid_until TIMESTAMPTZ;

-- Payment subscriptions
CREATE TABLE IF NOT EXISTS payment_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES payment_customers(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  plan_id UUID REFERENCES payment_plans(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'paused', 'incomplete', 'incomplete_expired')),
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

ALTER TABLE payment_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payment_subscriptions_select_via_customer" ON payment_subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM payment_customers c
      WHERE c.id = payment_subscriptions.customer_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "payment_subscriptions_service" ON payment_subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- Payment invoices
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

ALTER TABLE payment_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payment_invoices_select_via_customer" ON payment_invoices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM payment_customers c
      WHERE c.id = payment_invoices.customer_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "payment_invoices_service" ON payment_invoices
  FOR ALL USING (auth.role() = 'service_role');

-- Payment transactions (one-time payments, token refs only)
CREATE TABLE IF NOT EXISTS payment_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_payment_intent_id TEXT,
  customer_id UUID REFERENCES payment_customers(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'canceled')),
  method TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_payments_customer ON payment_payments(customer_id);

ALTER TABLE payment_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payment_payments_select_via_customer" ON payment_payments
  FOR SELECT USING (
    customer_id IS NULL OR EXISTS (
      SELECT 1 FROM payment_customers c
      WHERE c.id = payment_payments.customer_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "payment_payments_service" ON payment_payments
  FOR ALL USING (auth.role() = 'service_role');

-- Webhook events (idempotency, replay protection)
CREATE TABLE IF NOT EXISTS payment_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed')),
  retry_count INT NOT NULL DEFAULT 0,
  error_message TEXT,
  details JSONB DEFAULT '{}'
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_webhook_events_id ON payment_webhook_events(event_id);
CREATE INDEX IF NOT EXISTS idx_payment_webhook_events_status ON payment_webhook_events(status);

ALTER TABLE payment_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payment_webhook_events_service" ON payment_webhook_events
  FOR ALL USING (auth.role() = 'service_role');
