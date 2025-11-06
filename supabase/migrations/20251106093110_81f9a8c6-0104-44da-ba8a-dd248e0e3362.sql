-- Add category column to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Web';

-- Update existing projects with appropriate categories based on their technologies
-- This is a simple categorization, can be adjusted in admin panel later
UPDATE projects SET category = 'Web' WHERE category IS NULL OR category = 'Web';

-- Add comment for documentation
COMMENT ON COLUMN projects.category IS 'Project category: Web, Data, AI, Cloud, Mobile';
