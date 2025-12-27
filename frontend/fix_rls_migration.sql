-- Enable RLS (ensure it is on)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy to allow generic access for authenticated users (Employees/Admins)

-- 1. Allow SELECT (Viewing products)
CREATE POLICY "Enable read access for authenticated users" 
ON products FOR SELECT 
TO authenticated 
USING (true);

-- 2. Allow INSERT (Adding products)
CREATE POLICY "Enable insert access for authenticated users" 
ON products FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- 3. Allow UPDATE (Updating stock & Soft delete)
CREATE POLICY "Enable update access for authenticated users" 
ON products FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Note: DELETE is technically not needed if we are doing Soft Delete (UPDATE status='archived')
-- But if you ever want hard delete:
CREATE POLICY "Enable delete access for authenticated users" 
ON products FOR DELETE 
TO authenticated 
USING (true);
