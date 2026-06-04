-- Add ICICI payment fields, invoice fields, and notification support to orders table
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS icici_txn_no TEXT,
  ADD COLUMN IF NOT EXISTS icici_txn_id TEXT,
  ADD COLUMN IF NOT EXISTS icici_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_mode TEXT,
  ADD COLUMN IF NOT EXISTS invoice_number TEXT,
  ADD COLUMN IF NOT EXISTS invoice_url TEXT,
  ADD COLUMN IF NOT EXISTS invoice_generated_at TIMESTAMPTZ;

-- Create invoice sequence for unique invoice numbers
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1000;

-- Index for fast lookup by ICICI transaction number
CREATE INDEX IF NOT EXISTS idx_orders_icici_txn_no ON orders(icici_txn_no);

-- Create invoices storage bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('invoices', 'invoices', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to read their own invoices
CREATE POLICY IF NOT EXISTS "Users can read own invoices"
ON storage.objects FOR SELECT
USING (bucket_id = 'invoices' AND auth.role() = 'authenticated');

-- Allow service role to insert invoices
CREATE POLICY IF NOT EXISTS "Service role can insert invoices"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'invoices');

-- Notification log table for tracking sent notifications
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  notification_type TEXT NOT NULL, -- 'email' | 'sms' | 'whatsapp'
  event_type TEXT NOT NULL,        -- 'order_placed' | 'payment_confirmed' | 'shipped' | 'delivered' | 'cancelled'
  recipient TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'sent' | 'failed'
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for notification_logs (admin only)
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Admin can view notification logs"
ON notification_logs FOR SELECT
USING (auth.role() = 'service_role');

CREATE POLICY IF NOT EXISTS "Service role manages notification logs"
ON notification_logs FOR ALL
USING (auth.role() = 'service_role');
