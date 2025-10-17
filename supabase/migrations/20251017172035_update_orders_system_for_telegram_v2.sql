/*
  # Update Orders System for Telegram Notifications

  1. Updates to existing tables
    - Add missing fields to `orders` table for detailed customer information
    - Add missing fields to `order_items` table for discount tracking
    - Create new table `order_promo_codes` for tracking used promo codes
  
  2. Security
    - Enable RLS on new table
    - Add policies for public insert and admin view
    - Use user_profiles table for admin checking

  3. Notes
    - Preserves existing data and structure
    - Adds only missing fields needed for Telegram notifications
*/

-- Add missing fields to orders table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'first_name'
  ) THEN
    ALTER TABLE orders ADD COLUMN first_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'last_name'
  ) THEN
    ALTER TABLE orders ADD COLUMN last_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'city'
  ) THEN
    ALTER TABLE orders ADD COLUMN city text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'address'
  ) THEN
    ALTER TABLE orders ADD COLUMN address text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'postal_code'
  ) THEN
    ALTER TABLE orders ADD COLUMN postal_code text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'subtotal_amount'
  ) THEN
    ALTER TABLE orders ADD COLUMN subtotal_amount decimal(10,2) DEFAULT 0;
  END IF;
END $$;

-- Add missing fields to order_items table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'order_items' AND column_name = 'discount_price'
  ) THEN
    ALTER TABLE order_items ADD COLUMN discount_price decimal(10,2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'order_items' AND column_name = 'subtotal'
  ) THEN
    ALTER TABLE order_items ADD COLUMN subtotal decimal(10,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'order_items' AND column_name = 'is_on_sale'
  ) THEN
    ALTER TABLE order_items ADD COLUMN is_on_sale boolean DEFAULT false;
  END IF;
END $$;

-- Create order_promo_codes table if it doesn't exist
CREATE TABLE IF NOT EXISTS order_promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  promo_code_id uuid REFERENCES promo_codes(id) ON DELETE SET NULL,
  promo_code_name text NOT NULL,
  promo_code_description text,
  discount_amount decimal(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create index on order_promo_codes
CREATE INDEX IF NOT EXISTS idx_order_promo_codes_order_id ON order_promo_codes(order_id);

-- Enable RLS on order_promo_codes if not already enabled
ALTER TABLE order_promo_codes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Anyone can create order promo codes" ON order_promo_codes;
DROP POLICY IF EXISTS "Admins can view all order promo codes" ON order_promo_codes;

-- RLS Policies for order_promo_codes
CREATE POLICY "Anyone can create order promo codes"
  ON order_promo_codes FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can view all order promo codes"
  ON order_promo_codes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );