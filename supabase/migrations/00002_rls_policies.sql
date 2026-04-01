-- GNC Hub: Row Level Security Policies (Phase 1)
-- All authenticated internal users can read everything and mutate business data.
-- Only admins can modify configuration tables.
-- Customer isolation comes in Phase 4.

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.process_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaires ENABLE ROW LEVEL SECURITY;

-- ── READ: all authenticated users can read everything ──
CREATE POLICY "Authenticated users can read all" ON public.users
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read all" ON public.creators
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read all" ON public.product_types
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read all" ON public.process_templates
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read all" ON public.customers
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read all" ON public.video_projects
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read all" ON public.tasks
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read all" ON public.postings
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read all" ON public.approvals
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read all" ON public.questionnaires
  FOR SELECT TO authenticated USING (true);

-- ── WRITE: authenticated users can mutate business data ──
CREATE POLICY "Authenticated users can manage" ON public.customers
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage" ON public.video_projects
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage" ON public.tasks
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage" ON public.postings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage" ON public.approvals
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage" ON public.questionnaires
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── CONFIG TABLES: admin-only writes ──
CREATE POLICY "Admins can manage creators" ON public.creators
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage product types" ON public.product_types
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage process templates" ON public.process_templates
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- ── USERS: can update own profile ──
CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE TO authenticated USING (id = auth.uid());
