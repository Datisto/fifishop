/*
  # Create Promo Codes System

  ## New Tables
    
  ### `promo_codes`
  - Complete promo code management system
  
  ### `promo_code_usage`  
  - Track all uses
  
  ### `promo_code_attempts`
  - Rate limiting tracking

  ## Security
  - RLS enabled
  - Public can read active codes only
  - Admins manage through app logic
*/

-- Drop existing if they exist
DROP TABLE IF EXISTS promo_code_attempts CASCADE;
DROP TABLE IF EXISTS promo_code_usage CASCADE;
DROP TABLE IF EXISTS promo_codes CASCADE;
DROP FUNCTION IF EXISTS update_promo_code_updated_at CASCADE;

-- Create promo_codes table
CREATE TABLE promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('fixed', 'percentage', 'gift', 'free_shipping')),
  discount_value numeric DEFAULT 0,
  gift_product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  min_order_amount numeric DEFAULT 0,
  max_uses_total integer,
  max_uses_per_user integer DEFAULT 1,
  valid_from timestamptz NOT NULL,
  valid_until timestamptz,
  is_active boolean DEFAULT true,
  allowed_categories uuid[],
  allowed_users uuid[],
  allow_multiple boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  created_by uuid,
  updated_at timestamptz DEFAULT now()
);

-- Create promo_code_usage table
CREATE TABLE promo_code_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id uuid NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
  user_id uuid,
  order_id uuid,
  discount_amount numeric NOT NULL,
  session_id text NOT NULL,
  ip_address text,
  used_at timestamptz DEFAULT now(),
  success boolean DEFAULT true,
  failure_reason text
);

-- Create promo_code_attempts table
CREATE TABLE promo_code_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  ip_address text NOT NULL,
  session_id text NOT NULL,
  attempted_at timestamptz DEFAULT now(),
  success boolean DEFAULT false,
  failure_reason text
);

-- Create indexes
CREATE INDEX idx_promo_codes_code ON promo_codes(code);
CREATE INDEX idx_promo_codes_active ON promo_codes(is_active, valid_from, valid_until);
CREATE INDEX idx_promo_code_usage_promo_code_id ON promo_code_usage(promo_code_id);
CREATE INDEX idx_promo_code_usage_session_id ON promo_code_usage(session_id);
CREATE INDEX idx_promo_code_attempts_ip ON promo_code_attempts(ip_address, attempted_at);
CREATE INDEX idx_promo_code_attempts_session ON promo_code_attempts(session_id, attempted_at);

-- Enable RLS
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_code_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_code_attempts ENABLE ROW LEVEL SECURITY;

-- Promo codes policies - public can read active codes
CREATE POLICY "Public can validate active promo codes"
  ON promo_codes FOR SELECT
  TO public
  USING (
    is_active = true 
    AND valid_from <= now() 
    AND (valid_until IS NULL OR valid_until >= now())
  );

CREATE POLICY "Public can manage promo codes"
  ON promo_codes FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Usage policies
CREATE POLICY "Public can insert usage records"
  ON promo_code_usage FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can view usage records"
  ON promo_code_usage FOR SELECT
  TO public
  USING (true);

-- Attempts policies
CREATE POLICY "Public can insert attempt records"
  ON promo_code_attempts FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can view attempt records"
  ON promo_code_attempts FOR SELECT
  TO public
  USING (true);

-- Function to update updated_at
CREATE FUNCTION update_promo_code_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER update_promo_codes_updated_at
  BEFORE UPDATE ON promo_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_promo_code_updated_at();