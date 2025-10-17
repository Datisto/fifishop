/*
  # Fix Order Items RLS for Anonymous Users

  1. Changes
    - Update INSERT policy on order_items table to allow anonymous (anon) users
    - This allows guests to add items when placing orders
    - Maintains security by only allowing INSERT, not UPDATE/DELETE

  2. Security
    - Anonymous users can only create order items
    - Cannot view, update, or delete order items
    - Admin policies remain unchanged
*/

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Користувачі можуть створювати поз" ON order_items;

-- Create new INSERT policy that allows both authenticated and anonymous users
CREATE POLICY "Користувачі можуть створювати позиції замовлення"
  ON order_items
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
