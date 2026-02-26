-- Checkout tables for Export / Checkout flow
-- Run with: supabase db push (or supabase migration up)

-- Export items catalog
CREATE TABLE IF NOT EXISTS exports_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  type TEXT NOT NULL CHECK (type IN ('one-time', 'subscription')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Promo codes
CREATE TABLE IF NOT EXISTS promos (
  code TEXT PRIMARY KEY,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'amount')),
  value DECIMAL(10,2) NOT NULL,
  expires_at TIMESTAMPTZ,
  usage_limit INT,
  usage_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  items_json JSONB DEFAULT '[]',
  promo_code TEXT,
  payment_intent_id TEXT,
  download_links JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE exports_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE promos ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Exports items: public read
CREATE POLICY "exports_items_select" ON exports_items FOR SELECT USING (true);

-- Promos: service role only (validated via Edge Function)
CREATE POLICY "promos_select" ON promos FOR SELECT USING (auth.role() = 'service_role');

-- Orders: users can read their own
CREATE POLICY "orders_select_own" ON orders FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "orders_insert" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_update" ON orders FOR UPDATE USING (auth.role() = 'service_role');
