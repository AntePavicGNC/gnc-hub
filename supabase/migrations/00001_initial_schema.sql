-- GNC Hub: Initial Schema
-- All tables for Phase 1-4 (empty tables for later phases created now)

-- ============================================================
-- USERS (extends Supabase auth.users)
-- ============================================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'team' CHECK (role IN ('admin', 'team', 'viewer')),
  job_function TEXT NOT NULL DEFAULT 'admin' CHECK (job_function IN ('cutter', 'scripter', 'sm_manager', 'backoffice', 'sales', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- CREATORS
-- ============================================================
CREATE TABLE public.creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  short_code TEXT NOT NULL UNIQUE,
  platform TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  color TEXT NOT NULL DEFAULT '#6B7280',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- PRODUCT TYPES
-- ============================================================
CREATE TABLE public.product_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- PROCESS TEMPLATES (pipeline steps per product type)
-- ============================================================
CREATE TABLE public.process_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_type_id UUID NOT NULL REFERENCES public.product_types(id) ON DELETE CASCADE,
  step_order INT NOT NULL,
  step_name TEXT NOT NULL,
  step_label TEXT NOT NULL,
  default_tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_type_id, step_order),
  UNIQUE (product_type_id, step_name)
);

-- ============================================================
-- CUSTOMERS
-- ============================================================
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  logo_url TEXT,
  contract_status TEXT NOT NULL DEFAULT 'active' CHECK (contract_status IN ('active', 'negotiation', 'paused', 'completed')),
  hubspot_deal_id TEXT,
  drive_folder_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- VIDEO PROJECTS (core entity)
-- ============================================================
CREATE TABLE public.video_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  product_type_id UUID NOT NULL REFERENCES public.product_types(id),
  creator_id UUID REFERENCES public.creators(id),
  title TEXT,
  video_count INT NOT NULL DEFAULT 1,
  location TEXT NOT NULL DEFAULT 'studio' CHECK (location IN ('studio', 'on_site')),
  status TEXT NOT NULL DEFAULT 'backoffice',
  priority INT NOT NULL DEFAULT 4 CHECK (priority BETWEEN 1 AND 8),
  desired_post_date DATE,
  latest_post_date DATE,
  shoot_date DATE,
  actual_post_date DATE,
  assigned_cutter UUID REFERENCES public.users(id),
  assigned_scripter UUID REFERENCES public.users(id),
  assigned_sm_manager UUID REFERENCES public.users(id),
  script_url TEXT,
  drive_link TEXT,
  notes TEXT,
  is_on_hold BOOLEAN NOT NULL DEFAULT false,
  is_rejected BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TASKS (sub-tasks per pipeline step)
-- ============================================================
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.video_projects(id) ON DELETE CASCADE,
  pipeline_step TEXT NOT NULL,
  title TEXT NOT NULL,
  assigned_to UUID REFERENCES public.users(id),
  estimated_minutes INT,
  deadline DATE,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- POSTINGS (Phase 2 — table created now)
-- ============================================================
CREATE TABLE public.postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.video_projects(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  creator_id UUID NOT NULL REFERENCES public.creators(id),
  platform TEXT,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'posted', 'rescheduled')),
  posted_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- APPROVALS (Phase 4 — table created now)
-- ============================================================
CREATE TABLE public.approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.video_projects(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'changes_requested')),
  feedback TEXT,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  token TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- QUESTIONNAIRES (Phase 3 — table created now)
-- ============================================================
CREATE TABLE public.questionnaires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('hochschule', 'ausbildungsbetrieb')),
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_video_projects_status ON public.video_projects(status);
CREATE INDEX idx_video_projects_creator ON public.video_projects(creator_id);
CREATE INDEX idx_video_projects_customer ON public.video_projects(customer_id);
CREATE INDEX idx_video_projects_cutter ON public.video_projects(assigned_cutter);
CREATE INDEX idx_video_projects_scripter ON public.video_projects(assigned_scripter);
CREATE INDEX idx_video_projects_sm ON public.video_projects(assigned_sm_manager);
CREATE INDEX idx_tasks_project ON public.tasks(project_id);
CREATE INDEX idx_tasks_assigned ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_incomplete ON public.tasks(assigned_to) WHERE is_completed = false;
CREATE INDEX idx_postings_project ON public.postings(project_id);
CREATE INDEX idx_postings_date ON public.postings(date);

-- ============================================================
-- TRIGGERS: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_users
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_customers
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_video_projects
  BEFORE UPDATE ON public.video_projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
