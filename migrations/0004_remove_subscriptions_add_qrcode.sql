-- Remove subscription system and add one-time payment
-- Artists pay once to activate their account

-- Drop subscription-related tables
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS credit_cards;
DROP TABLE IF EXISTS subscriptions;

-- Add one-time payment tracking to users table
-- We'll use a simple flag since payment is one-time
ALTER TABLE users ADD COLUMN account_paid INTEGER DEFAULT 0; -- 0 = not paid, 1 = paid
ALTER TABLE users ADD COLUMN payment_amount DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE users ADD COLUMN payment_date DATETIME;
ALTER TABLE users ADD COLUMN payment_method TEXT; -- pix, credit_card, etc
ALTER TABLE users ADD COLUMN payment_transaction_id TEXT;

-- Add QR code data for each artist
ALTER TABLE artists ADD COLUMN qr_code_data TEXT; -- URL that the QR code points to
ALTER TABLE artists ADD COLUMN qr_code_generated_at DATETIME;
