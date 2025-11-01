-- Step 1: Drop existing constraint
ALTER TABLE public.future_projects 
DROP CONSTRAINT IF EXISTS future_projects_status_check;

-- Step 2: Add new project_status column
ALTER TABLE public.future_projects 
ADD COLUMN IF NOT EXISTS project_status text DEFAULT 'Planning';

-- Step 3: Migrate existing status values to project_status
UPDATE public.future_projects 
SET project_status = CASE 
  WHEN status IN ('Planning', 'In Development') THEN status
  ELSE 'Planning'
END;

-- Step 4: Set all status values to 'active' where they were project phases
UPDATE public.future_projects 
SET status = 'active'
WHERE status IN ('Planning', 'In Development');

-- Step 5: Add constraints using NOT VALID first, then validate
ALTER TABLE public.future_projects 
ADD CONSTRAINT future_projects_status_check CHECK (status IN ('active', 'inactive')) NOT VALID;

ALTER TABLE public.future_projects 
VALIDATE CONSTRAINT future_projects_status_check;

ALTER TABLE public.future_projects 
ADD CONSTRAINT future_projects_project_status_check CHECK (project_status IN ('Planning', 'In Development'));