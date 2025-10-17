/*
  # Clean and Fix Order Items RLS Policies - Final

  1. Changes
    - Remove ALL existing INSERT policies on order_items table
    - Create single INSERT policy for public role (includes anon and authenticated)
    - This allows all users to add items when placing orders

  2. Security
    - Public users can only INSERT order items
    - SELECT, UPDATE, DELETE remain restricted to authenticated/admin
*/

-- Drop ALL possible INSERT policy variations
DROP POLICY IF EXISTS "Користувачі можуть створювати поз" ON order_items;
DROP POLICY IF EXISTS "Користувачі можуть створювати позиції замовлення" ON order_items;
DROP POLICY IF EXISTS "Анонімні користувачі можуть створ" ON order_items;
DROP POLICY IF EXISTS "Анонімні користувачі можуть створювати позиції" ON order_items;
DROP POLICY IF EXISTS "Авторизовані користувачі можуть с" ON order_items;
DROP POLICY IF EXISTS "Авторизовані користувачі можуть створювати позиції" ON order_items;

-- Create single INSERT policy for all users (public includes anon and authenticated)
CREATE POLICY "Всі користувачі можуть створювати позиції замовлення"
  ON order_items
  FOR INSERT
  TO public
  WITH CHECK (true);
