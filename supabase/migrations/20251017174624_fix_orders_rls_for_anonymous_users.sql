/*
  # Fix Orders RLS for Anonymous Users

  1. Changes
    - Update INSERT policy on orders table to allow anonymous (anon) users
    - This allows guests to place orders without authentication
    - Maintains security by only allowing INSERT, not UPDATE/DELETE

  2. Security
    - Anonymous users can only create orders
    - Cannot view, update, or delete orders
    - Admin policies remain unchanged
*/

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Користувачі можуть створювати зам" ON orders;

-- Create new INSERT policy that allows both authenticated and anonymous users
CREATE POLICY "Користувачі можуть створювати замовлення"
  ON orders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
