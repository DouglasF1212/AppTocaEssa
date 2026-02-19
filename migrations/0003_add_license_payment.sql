-- Add license payment tracking
ALTER TABLE users ADD COLUMN license_paid INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN license_paid_at DATETIME;
ALTER TABLE users ADD COLUMN license_payment_id TEXT;

-- Add license amount to artists (R$ 199)
ALTER TABLE artists ADD COLUMN license_amount DECIMAL(10,2) DEFAULT 199.00;
