/*
  # Створення схеми бази даних для інтернет-магазину

  ## 1. Таблиці
  
  ### Категорії (`categories`)
  - `id` (uuid, primary key)
  - `name` (text) - назва категорії
  - `slug` (text, unique) - URL-friendly назва
  - `description` (text) - опис категорії
  - `parent_id` (uuid, nullable) - посилання на батьківську категорію
  - `icon_url` (text, nullable) - URL іконки
  - `is_published` (boolean) - чи опублікована
  - `sort_order` (integer) - порядок сортування
  - `seo_title` (text)
  - `seo_description` (text)
  - `seo_keywords` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### Товари (`products`)
  - `id` (uuid, primary key)
  - `name` (text) - назва товару
  - `slug` (text, unique) - URL-friendly назва
  - `sku` (text, unique) - артикул
  - `description` (text) - короткий опис
  - `full_description` (text) - повний опис
  - `specifications` (jsonb) - технічні характеристики
  - `price` (decimal) - ціна
  - `discount_price` (decimal, nullable) - ціна зі знижкою
  - `stock_quantity` (integer) - залишок на складі
  - `is_published` (boolean) - чи опублікований
  - `main_image_url` (text) - основне фото
  - `brand` (text) - бренд
  - `seo_title` (text)
  - `seo_description` (text)
  - `seo_keywords` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### Зображення товарів (`product_images`)
  - `id` (uuid, primary key)
  - `product_id` (uuid, foreign key)
  - `image_url` (text) - URL зображення
  - `alt_text` (text) - alt текст для SEO
  - `sort_order` (integer) - порядок відображення
  - `created_at` (timestamptz)

  ### Зв'язок товарів та категорій (`product_categories`)
  - `product_id` (uuid, foreign key)
  - `category_id` (uuid, foreign key)
  - primary key (product_id, category_id)

  ### Банери (`banners`)
  - `id` (uuid, primary key)
  - `title` (text) - назва банера
  - `image_url` (text) - URL зображення
  - `mobile_image_url` (text, nullable) - URL для мобільних пристроїв
  - `link_url` (text, nullable) - посилання при кліку
  - `placement` (text) - місце розміщення (home, category, promo)
  - `category_id` (uuid, nullable) - прив'язка до категорії
  - `is_active` (boolean) - чи активний
  - `sort_order` (integer) - порядок у слайдері
  - `start_date` (timestamptz, nullable) - дата початку показу
  - `end_date` (timestamptz, nullable) - дата завершення показу
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### Промокоди (`promo_codes`)
  - `id` (uuid, primary key)
  - `code` (text, unique) - код промокоду
  - `type` (text) - тип знижки (fixed, percentage, free_shipping, gift)
  - `value` (decimal) - значення знижки
  - `description` (text) - опис акції
  - `min_order_amount` (decimal, nullable) - мінімальна сума замовлення
  - `max_uses` (integer, nullable) - максимальна кількість використань
  - `max_uses_per_user` (integer) - максимум використань на користувача
  - `used_count` (integer) - скільки разів використано
  - `start_date` (timestamptz) - дата початку дії
  - `end_date` (timestamptz) - дата завершення дії
  - `is_active` (boolean) - чи активний
  - `applicable_categories` (jsonb, nullable) - до яких категорій застосовується
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### Використання промокодів (`promo_code_usage`)
  - `id` (uuid, primary key)
  - `promo_code_id` (uuid, foreign key)
  - `user_id` (uuid, nullable, foreign key)
  - `order_id` (uuid, nullable, foreign key)
  - `used_at` (timestamptz)
  - `discount_amount` (decimal) - сума знижки

  ### Замовлення (`orders`)
  - `id` (uuid, primary key)
  - `order_number` (text, unique) - номер замовлення
  - `user_id` (uuid, nullable, foreign key) - користувач (може бути null для гостей)
  - `status` (text) - статус (pending, confirmed, shipped, delivered, cancelled)
  - `total_amount` (decimal) - загальна сума
  - `discount_amount` (decimal) - сума знижки
  - `shipping_cost` (decimal) - вартість доставки
  - `customer_name` (text) - ПІБ покупця
  - `customer_email` (text) - email
  - `customer_phone` (text) - телефон
  - `shipping_address` (text) - адреса доставки
  - `shipping_method` (text) - спосіб доставки
  - `payment_method` (text) - спосіб оплати
  - `comment` (text, nullable) - коментар
  - `promo_code_id` (uuid, nullable, foreign key)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### Позиції замовлення (`order_items`)
  - `id` (uuid, primary key)
  - `order_id` (uuid, foreign key)
  - `product_id` (uuid, foreign key)
  - `product_name` (text) - назва на момент замовлення
  - `product_sku` (text) - артикул на момент замовлення
  - `quantity` (integer) - кількість
  - `price` (decimal) - ціна за одиницю
  - `total` (decimal) - загальна вартість позиції

  ### Логи адмін-панелі (`admin_logs`)
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `action` (text) - дія (login, create_product, update_product, delete_product, etc.)
  - `entity_type` (text) - тип сутності (product, category, banner, promo_code)
  - `entity_id` (uuid, nullable) - ID сутності
  - `details` (jsonb, nullable) - деталі дії
  - `ip_address` (text, nullable)
  - `created_at` (timestamptz)

  ## 2. Безпека
  - Увімкнено RLS для всіх таблиць
  - Політики доступу для адміністраторів та користувачів
*/

-- Створення enum типів
DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE promo_code_type AS ENUM ('fixed', 'percentage', 'free_shipping', 'gift');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Категорії
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  icon_url text,
  is_published boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  seo_title text DEFAULT '',
  seo_description text DEFAULT '',
  seo_keywords text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Товари
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  sku text UNIQUE NOT NULL,
  description text DEFAULT '',
  full_description text DEFAULT '',
  specifications jsonb DEFAULT '{}',
  price decimal(10,2) NOT NULL,
  discount_price decimal(10,2),
  stock_quantity integer DEFAULT 0,
  is_published boolean DEFAULT true,
  main_image_url text,
  brand text DEFAULT '',
  seo_title text DEFAULT '',
  seo_description text DEFAULT '',
  seo_keywords text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Зображення товарів
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  alt_text text DEFAULT '',
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Зв'язок товарів та категорій
CREATE TABLE IF NOT EXISTS product_categories (
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);

-- Банери
CREATE TABLE IF NOT EXISTS banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image_url text NOT NULL,
  mobile_image_url text,
  link_url text,
  placement text DEFAULT 'home',
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  start_date timestamptz,
  end_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Промокоди
CREATE TABLE IF NOT EXISTS promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  type text NOT NULL,
  value decimal(10,2) NOT NULL,
  description text DEFAULT '',
  min_order_amount decimal(10,2),
  max_uses integer,
  max_uses_per_user integer DEFAULT 1,
  used_count integer DEFAULT 0,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  applicable_categories jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Використання промокодів
CREATE TABLE IF NOT EXISTS promo_code_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id uuid REFERENCES promo_codes(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id uuid,
  used_at timestamptz DEFAULT now(),
  discount_amount decimal(10,2) NOT NULL
);

-- Замовлення
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text DEFAULT 'pending',
  total_amount decimal(10,2) NOT NULL,
  discount_amount decimal(10,2) DEFAULT 0,
  shipping_cost decimal(10,2) DEFAULT 0,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  shipping_address text NOT NULL,
  shipping_method text NOT NULL,
  payment_method text NOT NULL,
  comment text,
  promo_code_id uuid REFERENCES promo_codes(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Додаємо foreign key для order_id в promo_code_usage
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'promo_code_usage_order_id_fkey'
  ) THEN
    ALTER TABLE promo_code_usage
    ADD CONSTRAINT promo_code_usage_order_id_fkey
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Позиції замовлення
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_sku text NOT NULL,
  quantity integer NOT NULL,
  price decimal(10,2) NOT NULL,
  total decimal(10,2) NOT NULL
);

-- Логи адмін-панелі
CREATE TABLE IF NOT EXISTS admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  details jsonb,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

-- Індекси для продуктивності
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_is_published ON products(is_published);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_banners_placement ON banners(placement);
CREATE INDEX IF NOT EXISTS idx_banners_is_active ON banners(is_active);
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Увімкнення RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_code_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Політики для публічного перегляду
CREATE POLICY "Всі можуть переглядати опубліковані категорії"
  ON categories FOR SELECT
  TO public
  USING (is_published = true);

CREATE POLICY "Всі можуть переглядати опубліковані товари"
  ON products FOR SELECT
  TO public
  USING (is_published = true);

CREATE POLICY "Всі можуть переглядати зображення товарів"
  ON product_images FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Всі можуть переглядати зв'язки товарів та категорій"
  ON product_categories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Всі можуть переглядати активні банери"
  ON banners FOR SELECT
  TO public
  USING (is_active = true AND (start_date IS NULL OR start_date <= now()) AND (end_date IS NULL OR end_date >= now()));

-- Політики для авторизованих користувачів (створення замовлень)
CREATE POLICY "Користувачі можуть створювати замовлення"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Користувачі можуть переглядати свої замовлення"
  ON orders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Користувачі можуть переглядати позиції своїх замовлень"
  ON order_items FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
  ));

CREATE POLICY "Користувачі можуть створювати позиції замовлень"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Функція для оновлення updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Тригери для автоматичного оновлення updated_at
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_banners_updated_at ON banners;
CREATE TRIGGER update_banners_updated_at
  BEFORE UPDATE ON banners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_promo_codes_updated_at ON promo_codes;
CREATE TRIGGER update_promo_codes_updated_at
  BEFORE UPDATE ON promo_codes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
