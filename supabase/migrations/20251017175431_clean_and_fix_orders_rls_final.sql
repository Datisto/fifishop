/*
  # Clean and Fix Orders RLS Policies - Final

  1. Changes
    - Remove ALL existing INSERT policies on orders table
    - Create single INSERT policy for public role (includes anon and authenticated)
    - This allows all users (guests and logged in) to place orders

  2. Security
    - Public users can only INSERT orders
    - SELECT, UPDATE, DELETE remain restricted to authenticated/admin
*/

-- Drop ALL possible INSERT policy variations
DROP POLICY IF EXISTS "Користувачі можуть створювати зам" ON orders;
DROP POLICY IF EXISTS "Користувачі можуть створювати замовлення" ON orders;
DROP POLICY IF EXISTS "Анонімні користувачі можуть створ" ON orders;
DROP POLICY IF EXISTS "Анонімні користувачі можуть створювати замовлення" ON orders;
DROP POLICY IF EXISTS "Авторизовані користувачі можуть с" ON orders;
DROP POLICY IF EXISTS "Авторизовані користувачі можуть створювати замовлення" ON orders;

-- Create single INSERT policy for all users (public includes anon and authenticated)
CREATE POLICY "Всі користувачі можуть створювати замовлення"
  ON orders
  FOR INSERT
  TO public
  WITH CHECK (true);
