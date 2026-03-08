
-- Update existing RLS policies to require authentication
-- Drop old permissive policies and create auth-based ones

-- MENU ITEMS
DROP POLICY IF EXISTS "Anyone can read menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Anyone can insert menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Anyone can update menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Anyone can delete menu items" ON public.menu_items;

CREATE POLICY "Authenticated can read menu items" ON public.menu_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert menu items" ON public.menu_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update menu items" ON public.menu_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete menu items" ON public.menu_items FOR DELETE TO authenticated USING (true);

-- STAFF
DROP POLICY IF EXISTS "Anyone can read staff" ON public.staff;
DROP POLICY IF EXISTS "Anyone can insert staff" ON public.staff;
DROP POLICY IF EXISTS "Anyone can delete staff" ON public.staff;

CREATE POLICY "Authenticated can read staff" ON public.staff FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert staff" ON public.staff FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can delete staff" ON public.staff FOR DELETE TO authenticated USING (true);

-- SALES
DROP POLICY IF EXISTS "Anyone can read sales" ON public.sales;
DROP POLICY IF EXISTS "Anyone can insert sales" ON public.sales;

CREATE POLICY "Authenticated can read sales" ON public.sales FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert sales" ON public.sales FOR INSERT TO authenticated WITH CHECK (true);

-- SALE ITEMS
DROP POLICY IF EXISTS "Anyone can read sale items" ON public.sale_items;
DROP POLICY IF EXISTS "Anyone can insert sale items" ON public.sale_items;

CREATE POLICY "Authenticated can read sale items" ON public.sale_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert sale items" ON public.sale_items FOR INSERT TO authenticated WITH CHECK (true);

-- EXPENSES
DROP POLICY IF EXISTS "Anyone can read expenses" ON public.expenses;
DROP POLICY IF EXISTS "Anyone can insert expenses" ON public.expenses;
DROP POLICY IF EXISTS "Anyone can update expenses" ON public.expenses;
DROP POLICY IF EXISTS "Anyone can delete expenses" ON public.expenses;

CREATE POLICY "Authenticated can read expenses" ON public.expenses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert expenses" ON public.expenses FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update expenses" ON public.expenses FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete expenses" ON public.expenses FOR DELETE TO authenticated USING (true);
