-- Add new columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS country_origin TEXT,
ADD COLUMN IF NOT EXISTS description TEXT;

-- Verify columns were added (optional check, usually for manual verification)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products';
