/*
  # Add Nova Poshta fields to orders table

  1. Changes to orders table
    - Add `delivery_type` (text) - Type of delivery: 'nova_poshta' or 'manual'
    - Add `nova_poshta_city_ref` (text, nullable) - Reference to Nova Poshta city
    - Add `nova_poshta_warehouse_ref` (text, nullable) - Reference to Nova Poshta warehouse
    - Update existing city and address fields to support both delivery types

  2. Notes
    - Existing orders will have null values for Nova Poshta fields (manual delivery by default)
    - The city and address fields will contain either Nova Poshta formatted data or manual entry
*/

-- Add new columns to orders table for Nova Poshta integration
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'delivery_type'
  ) THEN
    ALTER TABLE orders ADD COLUMN delivery_type text DEFAULT 'manual';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'nova_poshta_city_ref'
  ) THEN
    ALTER TABLE orders ADD COLUMN nova_poshta_city_ref text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'nova_poshta_warehouse_ref'
  ) THEN
    ALTER TABLE orders ADD COLUMN nova_poshta_warehouse_ref text;
  END IF;
END $$;

-- Create index for filtering orders by delivery type
CREATE INDEX IF NOT EXISTS idx_orders_delivery_type ON orders(delivery_type);
CREATE INDEX IF NOT EXISTS idx_orders_nova_poshta_city_ref ON orders(nova_poshta_city_ref);
CREATE INDEX IF NOT EXISTS idx_orders_nova_poshta_warehouse_ref ON orders(nova_poshta_warehouse_ref);
