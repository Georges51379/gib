-- Add slug column to projects table for SEO-friendly URLs
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create unique index on slug (only for non-null values)
CREATE UNIQUE INDEX IF NOT EXISTS projects_slug_unique_idx ON public.projects (slug) WHERE slug IS NOT NULL;

-- Generate slugs for existing projects based on title
UPDATE public.projects 
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(title, '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    ),
    '-+', '-', 'g'
  )
)
WHERE slug IS NULL;

-- Make sure slugs are unique by appending id suffix if needed
DO $$
DECLARE
  dup_slug TEXT;
  project_record RECORD;
BEGIN
  -- Find duplicate slugs
  FOR dup_slug IN 
    SELECT slug FROM public.projects GROUP BY slug HAVING COUNT(*) > 1
  LOOP
    -- For each duplicate, append part of the id to make unique
    FOR project_record IN 
      SELECT id, slug FROM public.projects WHERE slug = dup_slug
    LOOP
      UPDATE public.projects 
      SET slug = project_record.slug || '-' || LEFT(project_record.id::text, 8)
      WHERE id = project_record.id;
    END LOOP;
  END LOOP;
END $$;