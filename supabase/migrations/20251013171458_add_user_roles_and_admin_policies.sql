/*
  # Додавання ролей користувачів та політик для адміністраторів

  ## 1. Зміни
  
  ### Таблиця профілів користувачів (`user_profiles`)
  - `id` (uuid, foreign key до auth.users)
  - `role` (text) - роль користувача (admin, user)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### Таблиця спроб входу (`login_attempts`)
  - `id` (uuid, primary key)
  - `email` (text) - email користувача
  - `ip_address` (text) - IP адреса
  - `success` (boolean) - чи успішний вхід
  - `attempted_at` (timestamptz) - час спроби
  
  ## 2. Безпека
  - RLS політики для адміністраторів
  - Функція перевірки ролі користувача
  - Захист від brute-force через обмеження спроб входу
*/

-- Таблиця профілів користувачів
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Таблиця спроб входу (для захисту від brute-force)
CREATE TABLE IF NOT EXISTS login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip_address text,
  success boolean DEFAULT false,
  attempted_at timestamptz DEFAULT now()
);

-- Індекси
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email, attempted_at);

-- Увімкнення RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

-- Функція для перевірки чи є користувач адміністратором
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Політики для user_profiles
CREATE POLICY "Користувачі можуть переглядати свій профіль"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Адміністратори можуть переглядати всі профілі"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (is_admin());

-- Політики для адміністраторів (повний доступ до всіх таблиць)
CREATE POLICY "Адміни можуть управляти категоріями"
  ON categories FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Адміни можуть управляти товарами"
  ON products FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Адміни можуть управляти зображеннями товарів"
  ON product_images FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Адміни можуть управляти зв'язками товар-категорія"
  ON product_categories FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Адміни можуть управляти банерами"
  ON banners FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Адміни можуть управляти промокодами"
  ON promo_codes FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Адміни можуть переглядати використання промокодів"
  ON promo_code_usage FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Адміни можуть переглядати всі замовлення"
  ON orders FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Адміни можуть оновлювати замовлення"
  ON orders FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Адміни можуть переглядати позиції замовлень"
  ON order_items FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Адміни можуть переглядати логи"
  ON admin_logs FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Адміни можуть створювати логи"
  ON admin_logs FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- Політика для login_attempts (тільки сервісні функції можуть записувати)
CREATE POLICY "Система може записувати спроби входу"
  ON login_attempts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Адміни можуть переглядати спроби входу"
  ON login_attempts FOR SELECT
  TO authenticated
  USING (is_admin());

-- Функція для очищення старих спроб входу (старше 24 годин)
CREATE OR REPLACE FUNCTION cleanup_old_login_attempts()
RETURNS void AS $$
BEGIN
  DELETE FROM login_attempts
  WHERE attempted_at < now() - interval '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Тригер для автоматичного оновлення updated_at в user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Функція для створення профілю при реєстрації
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_profiles (id, role)
  VALUES (new.id, 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Тригер для автоматичного створення профілю
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
