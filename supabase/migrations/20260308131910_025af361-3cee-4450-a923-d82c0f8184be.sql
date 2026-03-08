
-- Fix: Drop all RESTRICTIVE policies and recreate as PERMISSIVE

-- expenses
DROP POLICY IF EXISTS "Authenticated can delete expenses" ON public.expenses;
DROP POLICY IF EXISTS "Authenticated can insert expenses" ON public.expenses;
DROP POLICY IF EXISTS "Authenticated can read expenses" ON public.expenses;
DROP POLICY IF EXISTS "Authenticated can update expenses" ON public.expenses;

CREATE POLICY "Authenticated can read expenses" ON public.expenses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert expenses" ON public.expenses FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update expenses" ON public.expenses FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete expenses" ON public.expenses FOR DELETE TO authenticated USING (true);

-- menu_items
DROP POLICY IF EXISTS "Authenticated can delete menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Authenticated can insert menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Authenticated can read menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Authenticated can update menu items" ON public.menu_items;

CREATE POLICY "Authenticated can read menu items" ON public.menu_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert menu items" ON public.menu_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update menu items" ON public.menu_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete menu items" ON public.menu_items FOR DELETE TO authenticated USING (true);

-- sales
DROP POLICY IF EXISTS "Authenticated can insert sales" ON public.sales;
DROP POLICY IF EXISTS "Authenticated can read sales" ON public.sales;

CREATE POLICY "Authenticated can read sales" ON public.sales FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert sales" ON public.sales FOR INSERT TO authenticated WITH CHECK (true);

-- sale_items
DROP POLICY IF EXISTS "Authenticated can insert sale items" ON public.sale_items;
DROP POLICY IF EXISTS "Authenticated can read sale items" ON public.sale_items;

CREATE POLICY "Authenticated can read sale items" ON public.sale_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert sale items" ON public.sale_items FOR INSERT TO authenticated WITH CHECK (true);

-- staff
DROP POLICY IF EXISTS "Authenticated can delete staff" ON public.staff;
DROP POLICY IF EXISTS "Authenticated can insert staff" ON public.staff;
DROP POLICY IF EXISTS "Authenticated can read staff" ON public.staff;

CREATE POLICY "Authenticated can read staff" ON public.staff FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert staff" ON public.staff FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can delete staff" ON public.staff FOR DELETE TO authenticated USING (true);

-- profiles
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Admins can read all profiles" ON public.profiles FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());

-- user_roles
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;

CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
