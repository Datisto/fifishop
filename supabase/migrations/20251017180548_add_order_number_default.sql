/*
  # Add default value for order_number

  1. Changes
    - Add default value for order_number column
    - Use timestamp-based order number generation
    - Ensure order_number is never empty

  2. Notes
    - This fixes RLS issues caused by empty order_number values
*/

-- Add default value for order_number
ALTER TABLE orders 
ALTER COLUMN order_number SET DEFAULT 'ORD-' || EXTRACT(EPOCH FROM NOW())::bigint::text;

-- Make order_number nullable temporarily to fix existing records
ALTER TABLE orders 
ALTER COLUMN order_number DROP NOT NULL;

-- Update any existing empty order numbers
UPDATE orders 
SET order_number = 'ORD-' || EXTRACT(EPOCH FROM created_at)::bigint::text
WHERE order_number = '' OR order_number IS NULL;

-- Make it NOT NULL again
ALTER TABLE orders 
ALTER COLUMN order_number SET NOT NULL;
