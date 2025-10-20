/*
  # Add function to increment promo code usage

  1. New Functions
    - `increment_promo_code_usage` - Safely increments the used_count for a promo code

  2. Changes
    - Creates a PostgreSQL function that atomically increments the usage counter
    - Updates the updated_at timestamp automatically

  3. Security
    - Function is accessible to public (needed for anonymous checkout)
*/

CREATE OR REPLACE FUNCTION increment_promo_code_usage(promo_code_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE promo_codes
  SET
    used_count = used_count + 1,
    updated_at = now()
  WHERE id = promo_code_id;
END;
$$;
