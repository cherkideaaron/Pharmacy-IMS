-- Enable Row Level Security (RLS) on the sales table if not already enabled
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Drop the policy if it already exists to avoid errors on run
DROP POLICY IF EXISTS "Enable delete for admins" ON "public"."sales";

-- Create a policy that allows users with the 'admin' role to delete sales
-- This assumes you have a 'users' table in public schema that links to auth.users
CREATE POLICY "Enable delete for admins" ON "public"."sales"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);
