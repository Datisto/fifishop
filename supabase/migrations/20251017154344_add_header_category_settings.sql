/*
  # Add Header Category Settings

  1. Changes
    - Add `header_icon_url` column to categories table for separate header icon
    - Add `show_in_header` column to categories table to control visibility in header
    - Add `header_sort_order` column to categories table for custom ordering in header
  
  2. Notes
    - `header_icon_url` allows different icons for header vs main category display
    - `show_in_header` defaults to false for existing categories
    - `header_sort_order` allows independent sorting from main sort_order
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'categories' AND column_name = 'header_icon_url'
  ) THEN
    ALTER TABLE categories ADD COLUMN header_icon_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'categories' AND column_name = 'show_in_header'
  ) THEN
    ALTER TABLE categories ADD COLUMN show_in_header boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'categories' AND column_name = 'header_sort_order'
  ) THEN
    ALTER TABLE categories ADD COLUMN header_sort_order integer DEFAULT 0;
  END IF;
END $$;