DROP POLICY IF EXISTS "Maintenance public read" ON public.maintenance_modules;
CREATE POLICY "Active maintenance public read" ON public.maintenance_modules FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "Admins read all maintenance" ON public.maintenance_modules FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));