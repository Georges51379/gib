-- Phase 2: Add enterprise-grade fields to existing tables

-- Add case study fields to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS problem_statement TEXT,
ADD COLUMN IF NOT EXISTS solution_description TEXT,
ADD COLUMN IF NOT EXISTS architecture_summary TEXT,
ADD COLUMN IF NOT EXISTS security_features TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS key_features TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS results_impact TEXT,
ADD COLUMN IF NOT EXISTS category_tags TEXT[] DEFAULT '{}';

-- Add deliverables to pricing_plans table
ALTER TABLE pricing_plans 
ADD COLUMN IF NOT EXISTS deliverables TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS cta_text TEXT DEFAULT 'Get Started';

-- Add trust badges and tagline to hero_section
ALTER TABLE hero_section 
ADD COLUMN IF NOT EXISTS trust_badges TEXT[] DEFAULT '{"Payments", "RBAC", "Secure Dashboards", "API Integrations"}',
ADD COLUMN IF NOT EXISTS tagline TEXT DEFAULT 'Building secure, scalable, data-driven web applications';

-- Add SEO fields to site_settings
ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS default_description TEXT DEFAULT 'Full-stack developer specializing in secure, scalable web applications',
ADD COLUMN IF NOT EXISTS default_og_image TEXT,
ADD COLUMN IF NOT EXISTS twitter_handle TEXT DEFAULT '@georgesboutros',
ADD COLUMN IF NOT EXISTS resume_url TEXT;