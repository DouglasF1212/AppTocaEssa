-- Add license payment tracking columns

-- Add columns to users table for license tracking
ALTER TABLE users ADD COLUMN license_status TEXT DEFAULT 'pending'; -- pending, paid, approved, rejected
ALTER TABLE users ADD COLUMN license_payment_proof TEXT; -- URL or base64 of payment proof
ALTER TABLE users ADD COLUMN license_paid_date DATETIME;
ALTER TABLE users ADD COLUMN license_approved_date DATETIME;
ALTER TABLE users ADD COLUMN license_approved_by INTEGER; -- admin user_id

-- Create license_payments table for tracking
CREATE TABLE IF NOT EXISTS license_payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 199.00,
  payment_proof TEXT, -- URL to payment proof image
  payment_status TEXT DEFAULT 'pending', -- pending, paid, approved, rejected
  payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  approved_date DATETIME,
  approved_by INTEGER, -- admin user_id
  rejection_reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_license_payments_user_id ON license_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_license_payments_status ON license_payments(payment_status);
