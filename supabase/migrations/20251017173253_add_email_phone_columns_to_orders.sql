/*
  # Add email and phone columns to orders table

  1. Changes to orders table
    - Add `email` column (text) - customer email address
    - Add `phone` column (text) - customer phone number
    - Copy data from `customer_email` to `email` for existing records
    - Copy data from `customer_phone` to `phone` for existing records
    - Keep old columns `customer_email` and `customer_phone` for backward compatibility

  2. Notes
    - This fixes PGRST204 error: "Could not find the 'email' column"
    - Ensures compatibility between database schema and TypeScript interfaces
    - Preserves existing data by copying from old columns to new columns
    - No data loss - all existing orders will have email and phone populated
*/

-- Add email and phone columns to orders table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'email'
  ) THEN
    ALTER TABLE orders ADD COLUMN email text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'phone'
  ) THEN
    ALTER TABLE orders ADD COLUMN phone text;
  END IF;
END $$;

-- Copy existing data from customer_email to email and customer_phone to phone
UPDATE orders 
SET 
  email = COALESCE(customer_email, ''),
  phone = COALESCE(customer_phone, '')
WHERE email IS NULL OR phone IS NULL;

-- Create indexes for the new columns to improve query performance
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(phone);
