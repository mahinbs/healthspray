# Implementation Log - Healthspray Features

## Date: 2026-06-04

---

## 1. ICICI Payment Gateway Integration

**Replaces:** Razorpay (existing integration)

### Files Created:
- `supabase/functions/icici-initiate-payment/index.ts`
  - Validates user auth + cart
  - Generates unique `merchantTxnNo` (20 chars, timestamp + random)
  - Sorts request params alphabetically
  - Generates HMAC-SHA256 secureHash using `crypto.subtle`
  - Calls ICICI UAT API: `https://pgpayuat.icicibank.com/tsp/pg/api/v2/initiateSale`
  - Creates order in DB with status `pending`, stores `icici_txn_no`
  - Returns `paymentUrl` = `redirectURI?tranCtx=...` to frontend

- `supabase/functions/icici-payment-callback/index.ts`
  - Receives POST from ICICI (browser redirect after payment)
  - `verify_jwt = false` (publicly accessible)
  - Parses `application/x-www-form-urlencoded` form data
  - Verifies `secureHash` from ICICI response (HMAC-SHA256)
  - Looks up order by `icici_txn_no` (= `merchantTxnNo` sent in request)
  - Updates order: `status = "paid"/"failed"`, stores `icici_txn_id`, `icici_payment_id`, `payment_mode`
  - On success: triggers `generate-invoice` and `send-order-notification` (async, non-blocking)
  - Redirects browser to `{APP_URL}/payment-callback?status=success&orderId={id}`

### Files Modified:
- `src/components/CheckoutModal.tsx` — Rewritten: calls `icici-initiate-payment`, then `window.location.href = paymentUrl` (full-page redirect to ICICI)
- `src/pages/PaymentCallback.tsx` — Rewritten: handles ICICI return with `?status=success/failed&orderId=...`, polls for invoice readiness, shows success/failure UI
- `src/pages/OrderDetails.tsx` — Updated: shows ICICI payment details (mode, txn ID, payment ID), invoice download button, "Get Invoice" button for paid orders

### Environment Variables Required (Supabase secrets):
```
ICICI_MERCHANT_ID=100000000007164
ICICI_SECRET_KEY=db06cca0-838b-4e01-8b20-6ac446ffb6bd
ICICI_AGGREGATOR_ID=A100000000007164
ICICI_API_URL=https://pgpayuat.icicibank.com/tsp/pg/api/v2/initiateSale
APP_URL=https://your-frontend-url.vercel.app
```

### Payment Flow:
1. User fills checkout form → clicks "Pay"
2. Frontend calls `icici-initiate-payment` edge function (POST, authenticated)
3. Edge function creates DB order (pending), calls ICICI initiateSale, returns payment URL
4. Frontend redirects to: `https://pgpayuat.icicibank.com/tsp/pg/api/v2/authRedirect?tranCtx=...`
5. User pays on ICICI's page (Card / UPI / NetBanking)
6. ICICI POSTs response to: `https://gielqkfnsypadbplaaci.supabase.co/functions/v1/icici-payment-callback`
7. Callback verifies hash, updates order, generates invoice, sends notifications
8. Browser redirects to: `/payment-callback?status=success&orderId=...`
9. Frontend clears cart, shows success page with invoice download

---

## 2. Order Status Notifications

### Files Created:
- `supabase/functions/send-order-notification/index.ts`
  - `verify_jwt = false` (called internally by callback + from admin)
  - **Email (Resend):** Full HTML email with order details, items table, delivery address; attaches invoice PDF if available
  - **SMS (MSG91):** Sends via Flow API with template
  - **WhatsApp (Meta Cloud API):** Sends template message via `graph.facebook.com/v18.0/{PHONE_NUMBER_ID}/messages`
  - All 3 channels are optional — gracefully skips if API keys not configured
  - Logs all notification attempts to `notification_logs` table

### Triggered by:
- **Automatic:** After successful payment (event: `payment_confirmed`) — called from icici-payment-callback
- **Automatic:** After payment failure (event: `payment_failed`)
- **Admin manual:** From OrderManagement component — buttons for `payment_confirmed`, `order_shipped`, `order_delivered`, `order_cancelled`
- **Auto on status change:** Admin changing order to `shipped`, `delivered`, or `cancelled` auto-sends notification

### Supported event types:
- `payment_confirmed` — "Payment Confirmed - Order Placed"
- `payment_failed` — "Payment Failed"
- `order_shipped` — "Order Shipped"
- `order_delivered` — "Order Delivered"
- `order_cancelled` — "Order Cancelled"

### Environment Variables Required:
```
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=orders@healthspray.in

MSG91_AUTH_KEY=...
MSG91_TEMPLATE_ID=...
MSG91_SENDER_ID=HLTHSP

META_ACCESS_TOKEN=...
META_PHONE_NUMBER_ID=...
META_WA_TEMPLATE_NAME=order_status_update
META_WA_LANG_CODE=en_US
```

---

## 3. Invoice Generation (PDF)

### Files Created:
- `supabase/functions/generate-invoice/index.ts`
  - `verify_jwt = false` (called from callback + admin)
  - Uses `pdf-lib@1.17.1` (esm.sh) for pure-JS PDF generation in Deno
  - A4 format invoice with: company header, invoice number, customer details, items table, totals, payment info, footer
  - Generates sequential invoice numbers: `INV-{YEAR}-{SEQ}` (using Postgres sequence `invoice_number_seq`)
  - Uploads PDF to Supabase storage bucket `invoices` (public)
  - Updates order: `invoice_number`, `invoice_url`, `invoice_generated_at`
  - Idempotent: won't regenerate if invoice already exists (returns existing URL)

### Invoice Number Format:
`INV-2026-001000` (year + 6-digit sequence starting at 1000)

### Storage:
- Bucket: `invoices` (public)
- File: `{invoiceNumber}.pdf`
- Public URL: `https://gielqkfnsypadbplaaci.supabase.co/storage/v1/object/public/invoices/{invoiceNumber}.pdf`

### Email attachment:
The `send-order-notification` function fetches the invoice PDF and attaches it to the Resend email.

---

## 4. Database Migration

### File: `supabase/migrations/20260604000001_icici_invoice_notifications.sql`

**New columns on `orders` table:**
- `icici_txn_no TEXT` — merchantTxnNo sent to ICICI (for callback lookup)
- `icici_txn_id TEXT` — txnID from ICICI response
- `icici_payment_id TEXT` — paymentID from ICICI response
- `payment_mode TEXT` — Card / UPI / NB
- `invoice_number TEXT` — INV-YYYY-NNNNNN
- `invoice_url TEXT` — public PDF download URL
- `invoice_generated_at TIMESTAMPTZ`

**New table: `notification_logs`**
- Tracks all email/SMS/WhatsApp notifications sent
- Fields: `order_id`, `notification_type`, `event_type`, `recipient`, `status`, `error_message`, `sent_at`

**New storage bucket: `invoices`** (public)

**New Postgres sequence: `invoice_number_seq`** (starts at 1000)

**Index:** `idx_orders_icici_txn_no` on `orders.icici_txn_no`

---

## 5. Admin Panel Updates

### Files Modified:
- `src/pages/Admin.tsx` — Added "Notifications" tab with `NotificationLogs` component (inline)
  - Shows all notification_logs with type badge, event, recipient, status
- `src/components/OrderManagement.tsx` — Major update:
  - Shows ICICI payment mode column
  - Invoice download button per order
  - "Generate Invoice" button for paid orders without invoice
  - "Send Notification" buttons in order detail dialog
  - Auto-notification on status change to shipped/delivered/cancelled
  - Revenue stat in admin dashboard

---

## 6. Config Updates

### `supabase/config.toml`:
Added `verify_jwt = false` for:
- `icici-payment-callback` (ICICI posts to this)
- `generate-invoice` (called from callback)
- `send-order-notification` (called from callback + admin)

### `src/integrations/supabase/types.ts`:
Added all new order fields to `Row`, `Insert`, and `Update` types.

---

## Setup Instructions

### 1. Run the migration
```bash
supabase db push
# OR apply manually in Supabase SQL editor
```

### 2. Set Supabase secrets
```bash
supabase secrets set ICICI_MERCHANT_ID=100000000007164
supabase secrets set ICICI_SECRET_KEY=db06cca0-838b-4e01-8b20-6ac446ffb6bd
supabase secrets set ICICI_AGGREGATOR_ID=A100000000007164
supabase secrets set ICICI_API_URL=https://pgpayuat.icicibank.com/tsp/pg/api/v2/initiateSale
supabase secrets set APP_URL=https://your-app.vercel.app

supabase secrets set RESEND_API_KEY=re_your_key_here
supabase secrets set RESEND_FROM_EMAIL=orders@healthspray.in

supabase secrets set MSG91_AUTH_KEY=your_msg91_key
supabase secrets set MSG91_TEMPLATE_ID=your_template_id
supabase secrets set MSG91_SENDER_ID=HLTHSP

supabase secrets set META_ACCESS_TOKEN=your_meta_token
supabase secrets set META_PHONE_NUMBER_ID=your_phone_number_id
supabase secrets set META_WA_TEMPLATE_NAME=order_status_update
```

### 3. Deploy edge functions
```bash
supabase functions deploy icici-initiate-payment
supabase functions deploy icici-payment-callback
supabase functions deploy send-order-notification
supabase functions deploy generate-invoice
```

### 4. Create invoices storage bucket (if not auto-created by migration)
Go to Supabase Dashboard → Storage → Create bucket `invoices` → Set to public

### 5. WhatsApp setup
- Create approved message template `order_status_update` in Meta Business Manager
- Template body: `Hello {{1}}, your order status is: {{2}}. Order ID: {{3}}, Amount: {{4}}`

### 6. UAT Test Card
```
Card Number: 4761 3400 0000 0035
Expiry: 12/25
CVV: 123
Name: test
```

---

## Notes
- The `returnURL` in ICICI requests is set to the edge function callback URL (not a frontend URL)
- ICICI requires the HMAC to be generated from ALL params (sorted alphabetically) EXCEPT `secureHash`
- The response from ICICI also contains a `secureHash` — the callback function verifies it
- All notifications gracefully degrade if API keys are not configured (no crash)
- Invoice generation is idempotent (safe to retry)
- The invoice PDF is generated server-side using `pdf-lib` (no browser needed)
