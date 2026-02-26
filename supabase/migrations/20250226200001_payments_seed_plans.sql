-- Seed default payment plans (Stripe price IDs to be set via Stripe Dashboard)
-- Replace stripe_price_id with actual Stripe Price IDs for checkout to work

INSERT INTO payment_plans (name, stripe_price_id, stripe_product_id, amount, currency, interval, trial_period_days, active, metadata)
VALUES
  ('Monthly', NULL, NULL, 4.99, 'USD', 'month', 7, true, '{"features": ["Unlimited PDF exports", "Priority support", "Cancel anytime"]}'::jsonb),
  ('Annual', NULL, NULL, 39.99, 'USD', 'year', 14, true, '{"features": ["Unlimited exports", "2 months free", "Priority support", "Best value"]}'::jsonb);
