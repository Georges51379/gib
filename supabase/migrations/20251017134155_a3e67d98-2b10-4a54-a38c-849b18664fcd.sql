-- Add status column to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' CHECK (status IN ('active', 'inactive'));

-- Add status column to education table
ALTER TABLE public.education 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' CHECK (status IN ('active', 'inactive'));

-- Add status column to future_projects table
ALTER TABLE public.future_projects 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' CHECK (status IN ('active', 'inactive'));

-- Add status column to pricing_plans table
ALTER TABLE public.pricing_plans 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' CHECK (status IN ('active', 'inactive'));

-- Update RLS policies to only show active items to public
-- Projects table
DROP POLICY IF EXISTS "Public can view projects" ON public.projects;
CREATE POLICY "Public can view active projects"
  ON public.projects
  FOR SELECT
  USING (status = 'active');

-- Education table
DROP POLICY IF EXISTS "Public can view education" ON public.education;
CREATE POLICY "Public can view active education"
  ON public.education
  FOR SELECT
  USING (status = 'active');

-- Future projects table
DROP POLICY IF EXISTS "Public can view future projects" ON public.future_projects;
CREATE POLICY "Public can view active future projects"
  ON public.future_projects
  FOR SELECT
  USING (status = 'active');

-- Pricing plans table
DROP POLICY IF EXISTS "Public can view pricing plans" ON public.pricing_plans;
CREATE POLICY "Public can view active pricing plans"
  ON public.pricing_plans
  FOR SELECT
  USING (status = 'active');