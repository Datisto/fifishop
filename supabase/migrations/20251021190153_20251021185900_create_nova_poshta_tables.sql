/*
  # Create Nova Poshta Cities and Warehouses Tables

  1. New Tables
    - `nova_poshta_cities`
      - `id` (uuid, primary key)
      - `ref` (text, unique) - Nova Poshta city reference ID
      - `description` (text) - City name in Ukrainian
      - `description_ru` (text) - City name in Russian
      - `area` (text) - Area reference
      - `area_description` (text) - Area name
      - `region` (text) - Region reference
      - `region_description` (text) - Region name
      - `latitude` (text, nullable)
      - `longitude` (text, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `nova_poshta_warehouses`
      - `id` (uuid, primary key)
      - `ref` (text, unique) - Nova Poshta warehouse reference ID
      - `site_key` (text) - Site key/number
      - `description` (text) - Warehouse description in Ukrainian
      - `description_ru` (text) - Warehouse description in Russian
      - `short_address` (text) - Short address in Ukrainian
      - `short_address_ru` (text) - Short address in Russian
      - `phone` (text) - Contact phone
      - `type_of_warehouse` (text) - Type of warehouse
      - `number` (text) - Warehouse number
      - `city_ref` (text) - Reference to city
      - `city_description` (text) - City name
      - `settlement_ref` (text) - Settlement reference
      - `latitude` (text, nullable)
      - `longitude` (text, nullable)
      - `schedule` (jsonb) - Working schedule
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Indexes
    - Index on city description for fast search
    - Index on warehouse city_ref for filtering by city
    - Index on warehouse number for search

  3. Security
    - Enable RLS on both tables
    - Add policies for public read access (cities and warehouses are public information)
    - Add policies for admin write access
*/

-- Create nova_poshta_cities table
CREATE TABLE IF NOT EXISTS nova_poshta_cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref text UNIQUE NOT NULL,
  description text NOT NULL,
  description_ru text DEFAULT '',
  area text DEFAULT '',
  area_description text DEFAULT '',
  region text DEFAULT '',
  region_description text DEFAULT '',
  latitude text,
  longitude text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create nova_poshta_warehouses table
CREATE TABLE IF NOT EXISTS nova_poshta_warehouses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref text UNIQUE NOT NULL,
  site_key text DEFAULT '',
  description text NOT NULL,
  description_ru text DEFAULT '',
  short_address text NOT NULL,
  short_address_ru text DEFAULT '',
  phone text DEFAULT '',
  type_of_warehouse text DEFAULT '',
  number text NOT NULL,
  city_ref text NOT NULL,
  city_description text NOT NULL,
  settlement_ref text DEFAULT '',
  latitude text,
  longitude text,
  schedule jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for fast search
CREATE INDEX IF NOT EXISTS idx_nova_poshta_cities_description ON nova_poshta_cities(description);
CREATE INDEX IF NOT EXISTS idx_nova_poshta_cities_ref ON nova_poshta_cities(ref);
CREATE INDEX IF NOT EXISTS idx_nova_poshta_warehouses_city_ref ON nova_poshta_warehouses(city_ref);
CREATE INDEX IF NOT EXISTS idx_nova_poshta_warehouses_number ON nova_poshta_warehouses(number);
CREATE INDEX IF NOT EXISTS idx_nova_poshta_warehouses_description ON nova_poshta_warehouses(description);

-- Enable Row Level Security
ALTER TABLE nova_poshta_cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE nova_poshta_warehouses ENABLE ROW LEVEL SECURITY;

-- Policies for nova_poshta_cities
-- Anyone can read cities (public information)
CREATE POLICY "Anyone can read cities"
  ON nova_poshta_cities
  FOR SELECT
  TO public
  USING (true);

-- Only authenticated users with admin role can insert cities
CREATE POLICY "Admins can insert cities"
  ON nova_poshta_cities
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Only authenticated users with admin role can update cities
CREATE POLICY "Admins can update cities"
  ON nova_poshta_cities
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Only authenticated users with admin role can delete cities
CREATE POLICY "Admins can delete cities"
  ON nova_poshta_cities
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policies for nova_poshta_warehouses
-- Anyone can read warehouses (public information)
CREATE POLICY "Anyone can read warehouses"
  ON nova_poshta_warehouses
  FOR SELECT
  TO public
  USING (true);

-- Only authenticated users with admin role can insert warehouses
CREATE POLICY "Admins can insert warehouses"
  ON nova_poshta_warehouses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Only authenticated users with admin role can update warehouses
CREATE POLICY "Admins can update warehouses"
  ON nova_poshta_warehouses
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Only authenticated users with admin role can delete warehouses
CREATE POLICY "Admins can delete warehouses"
  ON nova_poshta_warehouses
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );
