-- Add status column to products table for soft delete support
ALTER TABLE products 
ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived'));

-- Optional: Update existing records to be active (default handles this for new inserts, but good for clarity)
UPDATE products SET status = 'active' WHERE status IS NULL;
