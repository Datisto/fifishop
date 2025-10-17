/*
  # Fix Orders INSERT Policy for Anonymous Users

  1. Changes
    - Drop and recreate INSERT policy with explicit separation for anon and authenticated
    - This ensures both roles can insert orders

  2. Security
    - Anonymous and authenticated users can create orders
    - Other operations remain restricted
*/

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Користувачі можуть створювати зам" ON orders;
DROP POLICY IF EXISTS "Користувачі можуть створювати замовлення" ON orders;

-- Create new INSERT policy for anon
CREATE POLICY "Анонімні користувачі можуть створювати замовлення"
  ON orders
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create new INSERT policy for authenticated
CREATE POLICY "Авторизовані користувачі можуть створювати замовлення"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
