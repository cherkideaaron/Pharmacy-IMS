-- SQL script to create daily_deposits table
CREATE TABLE daily_deposits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE DEFAULT CURRENT_DATE,
  employee_id UUID REFERENCES users(id),
  employee_name TEXT,
  cash_revenue DECIMAL(12,2) DEFAULT 0.00,
  amount_submitted DECIMAL(12,2) DEFAULT 0.00,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, employee_id)
);

-- Enable RLS
ALTER TABLE daily_deposits ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read for all authenticated" ON daily_deposits
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated" ON daily_deposits
  FOR INSERT TO authenticated WITH CHECK (true);
