/*
  # Fix Order Items INSERT Policy for Anonymous Users

  1. Changes
    - Drop and recreate INSERT policy with explicit separation for anon and authenticated
    - This ensures both roles can insert order items

  2. Security
    - Anonymous and authenticated users can create order items
    - Other operations remain restricted
*/

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Користувачі можуть створювати поз" ON order_items;
DROP POLICY IF EXISTS "Користувачі можуть створювати позиції замовлення" ON order_items;

-- Create new INSERT policy for anon
CREATE POLICY "Анонімні користувачі можуть створювати позиції"
  ON order_items
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create new INSERT policy for authenticated
CREATE POLICY "Авторизовані користувачі можуть створювати позиції"
  ON order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
