-- Posting period columns on video_projects
ALTER TABLE public.video_projects ADD COLUMN IF NOT EXISTS posting_period_start DATE;
ALTER TABLE public.video_projects ADD COLUMN IF NOT EXISTS posting_period_end DATE;

-- Posting slots table for individual scheduled posts
CREATE TABLE IF NOT EXISTS public.posting_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.video_projects(id) ON DELETE CASCADE,
  video_number INT NOT NULL,
  scheduled_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'posted', 'skipped')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_posting_slots_project ON public.posting_slots(project_id);

-- RLS
ALTER TABLE public.posting_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view posting_slots"
  ON public.posting_slots FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage posting_slots"
  ON public.posting_slots FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
