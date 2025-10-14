/*
  # Додати політики для публічного доступу до адмін-операцій
  
  1. Зміни
    - Додаємо політики для анонімного доступу (public) до всіх таблиць
    - Це дозволить адміністратору працювати через localStorage без Supabase Auth
  
  2. Безпека
    - В production середовищі рекомендується використовувати Supabase Auth
    - Поточне рішення - тимчасове для розробки
*/

-- Політики для категорій
CREATE POLICY "Public can manage categories"
  ON categories FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Політики для товарів
CREATE POLICY "Public can manage products"
  ON products FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Політики для зображень товарів
CREATE POLICY "Public can manage product images"
  ON product_images FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Політики для зв'язків товарів та категорій
CREATE POLICY "Public can manage product categories"
  ON product_categories FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Політики для банерів
CREATE POLICY "Public can manage banners"
  ON banners FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Політики для промокодів
CREATE POLICY "Public can manage promo codes"
  ON promo_codes FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);
