-- ============================================================
-- SplitBase AI — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- Users table (populated by NextAuth adapter)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  email_verified TIMESTAMPTZ,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- NextAuth required tables
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  UNIQUE(provider, provider_account_id)
);

CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  expires TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS public.verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- Groups
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES public.users(id),
  invite_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Group members
CREATE TABLE IF NOT EXISTS public.members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'left')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Expenses
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  paid_by UUID NOT NULL REFERENCES public.users(id),
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other' 
    CHECK (category IN ('food', 'transport', 'accommodation', 'entertainment', 'utilities', 'other')),
  ai_parsed BOOLEAN DEFAULT FALSE,
  ai_confidence DECIMAL(3, 2),
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Splits (who owes what for each expense)
CREATE TABLE IF NOT EXISTS public.splits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  expense_id UUID NOT NULL REFERENCES public.expenses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id),
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  reason TEXT,
  UNIQUE(expense_id, user_id)
);

-- Settlements (marking debts as paid)
CREATE TABLE IF NOT EXISTS public.settlements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  from_user UUID NOT NULL REFERENCES public.users(id),
  to_user UUID NOT NULL REFERENCES public.users(id),
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  method TEXT DEFAULT 'other',
  notes TEXT,
  settled_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- VIEWS — Computed Balances
-- ============================================================

CREATE OR REPLACE VIEW public.balances AS
WITH expense_flows AS (
  -- Money owed to payer from each split member (excluding payer's own split)
  SELECT
    e.group_id,
    s.user_id AS debtor_id,
    e.paid_by AS creditor_id,
    s.amount
  FROM public.splits s
  JOIN public.expenses e ON s.expense_id = e.id
  WHERE s.user_id != e.paid_by
),
settlement_flows AS (
  -- Settlements reduce debt (from_user pays to_user)
  SELECT
    group_id,
    from_user AS debtor_id,
    to_user AS creditor_id,
    -amount AS amount
  FROM public.settlements
),
all_flows AS (
  SELECT * FROM expense_flows
  UNION ALL
  SELECT * FROM settlement_flows
),
net_flows AS (
  SELECT
    group_id,
    debtor_id,
    creditor_id,
    SUM(amount) AS amount
  FROM all_flows
  GROUP BY group_id, debtor_id, creditor_id
)
SELECT
  group_id,
  debtor_id,
  creditor_id,
  amount
FROM net_flows
WHERE amount > 0.01;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;

-- Users: can read all (for group member display), update own
CREATE POLICY "users_read_all" ON public.users FOR SELECT USING (true);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Groups: members can read their groups
CREATE POLICY "groups_select_member" ON public.groups FOR SELECT
  USING (id IN (SELECT group_id FROM public.members WHERE user_id = auth.uid() AND status = 'active'));
CREATE POLICY "groups_insert_auth" ON public.groups FOR INSERT
  WITH CHECK (auth.uid() = created_by);
CREATE POLICY "groups_update_admin" ON public.groups FOR UPDATE
  USING (created_by = auth.uid());

-- Members: read if in same group
CREATE POLICY "members_select_group" ON public.members FOR SELECT
  USING (group_id IN (SELECT group_id FROM public.members WHERE user_id = auth.uid() AND status = 'active'));
CREATE POLICY "members_insert_admin" ON public.members FOR INSERT
  WITH CHECK (group_id IN (SELECT id FROM public.groups WHERE created_by = auth.uid()));
CREATE POLICY "members_self_join" ON public.members FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Expenses: group members can read
CREATE POLICY "expenses_select_member" ON public.expenses FOR SELECT
  USING (group_id IN (SELECT group_id FROM public.members WHERE user_id = auth.uid() AND status = 'active'));
CREATE POLICY "expenses_insert_member" ON public.expenses FOR INSERT
  WITH CHECK (group_id IN (SELECT group_id FROM public.members WHERE user_id = auth.uid() AND status = 'active'));
CREATE POLICY "expenses_update_payer" ON public.expenses FOR UPDATE
  USING (paid_by = auth.uid());

-- Splits: group members can read
CREATE POLICY "splits_select_member" ON public.splits FOR SELECT
  USING (expense_id IN (
    SELECT e.id FROM public.expenses e
    JOIN public.members m ON e.group_id = m.group_id
    WHERE m.user_id = auth.uid() AND m.status = 'active'
  ));
CREATE POLICY "splits_insert_member" ON public.splits FOR INSERT
  WITH CHECK (expense_id IN (
    SELECT e.id FROM public.expenses e
    JOIN public.members m ON e.group_id = m.group_id
    WHERE m.user_id = auth.uid() AND m.status = 'active'
  ));

-- Settlements: group members can read, insert
CREATE POLICY "settlements_select_member" ON public.settlements FOR SELECT
  USING (group_id IN (SELECT group_id FROM public.members WHERE user_id = auth.uid() AND status = 'active'));
CREATE POLICY "settlements_insert_member" ON public.settlements FOR INSERT
  WITH CHECK (
    group_id IN (SELECT group_id FROM public.members WHERE user_id = auth.uid() AND status = 'active')
    AND from_user = auth.uid()
  );

-- ============================================================
-- INDEXES for performance
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_members_user_id ON public.members(user_id);
CREATE INDEX IF NOT EXISTS idx_members_group_id ON public.members(group_id);
CREATE INDEX IF NOT EXISTS idx_expenses_group_id ON public.expenses(group_id);
CREATE INDEX IF NOT EXISTS idx_splits_expense_id ON public.splits(expense_id);
CREATE INDEX IF NOT EXISTS idx_splits_user_id ON public.splits(user_id);
CREATE INDEX IF NOT EXISTS idx_settlements_group_id ON public.settlements(group_id);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Update updated_at automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON public.groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- STORAGE BUCKETS (run in Supabase dashboard)
-- ============================================================
-- Create a 'receipts' bucket with private access
-- INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', false);
