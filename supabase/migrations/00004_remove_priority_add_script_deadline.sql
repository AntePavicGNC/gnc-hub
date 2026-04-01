-- Remove priority column (replaced by deadline-based sorting)
ALTER TABLE public.video_projects DROP COLUMN IF EXISTS priority;

-- Add script_deadline for clients who need scripts early
ALTER TABLE public.video_projects ADD COLUMN IF NOT EXISTS script_deadline DATE;
