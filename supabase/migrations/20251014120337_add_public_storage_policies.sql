/*
  # Додати політики для публічного доступу до Storage
  
  1. Зміни
    - Додаємо політики для анонімного доступу (public) до storage
    - Це дозволить адміністратору завантажувати файли через localStorage auth
  
  2. Безпека
    - В production середовищі рекомендується використовувати Supabase Auth
    - Поточне рішення - тимчасове для розробки
*/

-- Політика: публічне завантаження зображень
CREATE POLICY "Public can upload product images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'product-images');

-- Політика: публічне оновлення зображень
CREATE POLICY "Public can update product images"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

-- Політика: публічне видалення зображень
CREATE POLICY "Public can delete product images"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'product-images');
