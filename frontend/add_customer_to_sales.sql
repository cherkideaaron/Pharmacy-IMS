-- Migration: Add customer tracking to sales
-- This allows linking sales to customers for purchase history tracking

ALTER TABLE sales 
ADD COLUMN customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
ADD COLUMN customer_name TEXT;

-- Add indexes for faster customer-based searches
CREATE INDEX idx_sales_customer_name ON sales(customer_name);
CREATE INDEX idx_sales_customer_id ON sales(customer_id);

-- Add comments
COMMENT ON COLUMN sales.customer_id IS 'Optional: Links sale to customer for purchase history tracking';
COMMENT ON COLUMN sales.customer_name IS 'Denormalized customer name for faster searches without joins';
