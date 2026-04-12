-- 00007: IA Rebuild — Roles, Teams, Assets, Changes, Messages, Dashboard, Portal
-- Additive migration. Preserves all existing data.

-- ============================================================
-- 1. USER ROLES: add 'customer' to allowed values
-- ============================================================
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users ADD CONSTRAINT users_role_check
  CHECK (role IN ('admin', 'team', 'viewer', 'customer'));

-- ============================================================
-- 2. TEAMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#6B7280',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.team_members (
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (team_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_team_members_user ON public.team_members(user_id);

CREATE TRIGGER set_updated_at_teams
  BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 3. TASKS — add team assignment (in addition to user assignment)
-- ============================================================
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS assigned_team_id UUID REFERENCES public.teams(id);

CREATE INDEX IF NOT EXISTS idx_tasks_team ON public.tasks(assigned_team_id);

-- ============================================================
-- 4. PROCESS TEMPLATES — editable in-tool (add metadata)
-- ============================================================
ALTER TABLE public.process_templates
  ADD COLUMN IF NOT EXISTS expected_days INT,
  ADD COLUMN IF NOT EXISTS default_team_id UUID REFERENCES public.teams(id),
  ADD COLUMN IF NOT EXISTS description TEXT;

-- ============================================================
-- 5. PROJECT ASSETS — video-level overrides
-- ============================================================
CREATE TABLE IF NOT EXISTS public.project_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.video_projects(id) ON DELETE CASCADE,
  asset_index INT NOT NULL,
  title TEXT,
  script_status TEXT NOT NULL DEFAULT 'pending' CHECK (script_status IN ('pending', 'in_progress', 'review', 'approved')),
  video_status TEXT NOT NULL DEFAULT 'pending' CHECK (video_status IN ('pending', 'in_progress', 'review', 'approved', 'posted')),
  script_deadline DATE,
  delivery_deadline DATE,
  drive_link TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (project_id, asset_index)
);

CREATE INDEX IF NOT EXISTS idx_project_assets_project ON public.project_assets(project_id);

CREATE TRIGGER set_updated_at_project_assets
  BEFORE UPDATE ON public.project_assets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 6. PROJECT CHANGES — change log
-- ============================================================
CREATE TABLE IF NOT EXISTS public.project_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.video_projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id),
  action TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_changes_project ON public.project_changes(project_id);
CREATE INDEX IF NOT EXISTS idx_project_changes_created ON public.project_changes(created_at DESC);

-- ============================================================
-- 7. PROJECT MESSAGES — chat per project (internal <-> customer)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.project_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.video_projects(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id),
  body TEXT NOT NULL,
  attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  read_by_customer BOOLEAN NOT NULL DEFAULT false,
  read_by_team BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_messages_project ON public.project_messages(project_id);
CREATE INDEX IF NOT EXISTS idx_project_messages_created ON public.project_messages(created_at DESC);

-- ============================================================
-- 8. DASHBOARD LAYOUTS — per-user widget config
-- ============================================================
CREATE TABLE IF NOT EXISTS public.dashboard_layouts (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  widgets JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 9. CUSTOMERS — link to portal user
-- ============================================================
ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS portal_user_id UUID REFERENCES public.users(id);

CREATE INDEX IF NOT EXISTS idx_customers_portal_user ON public.customers(portal_user_id);

-- ============================================================
-- 10. VIDEO PROJECTS — split projects + drive folder metadata
-- ============================================================
ALTER TABLE public.video_projects
  ADD COLUMN IF NOT EXISTS parent_project_id UUID REFERENCES public.video_projects(id),
  ADD COLUMN IF NOT EXISTS split_label TEXT,
  ADD COLUMN IF NOT EXISTS drive_folder_id TEXT;

CREATE INDEX IF NOT EXISTS idx_video_projects_parent ON public.video_projects(parent_project_id);

-- ============================================================
-- 11. APPROVALS — extend existing table for per-asset + user tracking
-- ============================================================
ALTER TABLE public.approvals
  ADD COLUMN IF NOT EXISTS asset_id UUID REFERENCES public.project_assets(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS requested_by UUID REFERENCES public.users(id),
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.users(id),
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- ============================================================
-- 12. RLS — new tables
-- ============================================================
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_layouts ENABLE ROW LEVEL SECURITY;

-- Teams: all authenticated can read, admins manage
CREATE POLICY "teams_select" ON public.teams FOR SELECT TO authenticated USING (true);
CREATE POLICY "teams_manage" ON public.teams FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "team_members_select" ON public.team_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "team_members_manage" ON public.team_members FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Project assets: team members see all, customers only their own projects
CREATE POLICY "project_assets_team_select" ON public.project_assets FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'team')));
CREATE POLICY "project_assets_customer_select" ON public.project_assets FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.video_projects vp
    JOIN public.customers c ON c.id = vp.customer_id
    WHERE vp.id = project_assets.project_id AND c.portal_user_id = auth.uid()
  ));
CREATE POLICY "project_assets_team_manage" ON public.project_assets FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'team')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'team')));

-- Project changes: team reads all, inserts own
CREATE POLICY "project_changes_select" ON public.project_changes FOR SELECT TO authenticated USING (true);
CREATE POLICY "project_changes_insert" ON public.project_changes FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Project messages: team sees all; customer sees only own project's messages
CREATE POLICY "project_messages_team_select" ON public.project_messages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'team')));
CREATE POLICY "project_messages_customer_select" ON public.project_messages FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.video_projects vp
    JOIN public.customers c ON c.id = vp.customer_id
    WHERE vp.id = project_messages.project_id AND c.portal_user_id = auth.uid()
  ));
CREATE POLICY "project_messages_insert" ON public.project_messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid());

-- Dashboard layouts: only the owning user
CREATE POLICY "dashboard_layouts_own" ON public.dashboard_layouts FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
