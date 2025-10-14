/*
  # Налаштування Storage для зображень товарів

  ## 1. Зміни
  
  ### Storage bucket
  - Створення публічного bucket для зображень товарів
  - Налаштування політик доступу

  ## 2. Безпека
  - Публічний доступ для читання
  - Адміністратори можуть завантажувати та видаляти файли
*/

-- Створення bucket для зображень товарів
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Політика: всі можуть читати
CREATE POLICY "Публічний доступ для читання зображень товарів"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Політика: адміністратори можуть завантажувати
CREATE POLICY "Адміністратори можуть завантажувати зображення товарів"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images' AND
  (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin'
);

-- Політика: адміністратори можуть оновлювати
CREATE POLICY "Адміністратори можуть оновлювати зображення товарів"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
  bucket_id = 'product-images' AND
  (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin'
);

-- Політика: адміністратори можуть видаляти
CREATE POLICY "Адміністратори можуть видаляти зображення товарів"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin'
);
