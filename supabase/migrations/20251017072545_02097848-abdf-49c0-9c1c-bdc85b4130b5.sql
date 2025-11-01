-- Create role enum
CREATE TYPE app_role AS ENUM ('admin');

-- User roles table for RBAC
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Only admins can view roles
CREATE POLICY "Admins can view roles"
ON user_roles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Site settings table
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_title TEXT NOT NULL DEFAULT 'Georges Boutros',
  logo_url TEXT,
  favicon_url TEXT,
  maintenance_mode BOOLEAN DEFAULT FALSE,
  maintenance_message TEXT DEFAULT 'We are currently performing maintenance. Please check back soon.',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view settings"
ON site_settings FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins can update settings"
ON site_settings FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Hero section table
CREATE TABLE hero_section (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  description TEXT NOT NULL,
  video_url TEXT,
  background_overlay_opacity NUMERIC(3,2) DEFAULT 0.7,
  cta_primary_text TEXT DEFAULT 'See My Work',
  cta_secondary_text TEXT DEFAULT 'Contact Me',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hero_section ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view hero"
ON hero_section FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins can manage hero"
ON hero_section FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- About section table
CREATE TABLE about_section (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT 'About Me',
  subtitle TEXT,
  image_url TEXT NOT NULL,
  content_intro TEXT NOT NULL,
  content_main TEXT NOT NULL,
  skills JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE about_section ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view about"
ON about_section FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins can manage about"
ON about_section FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Education table
CREATE TABLE education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year TEXT NOT NULL,
  institution TEXT NOT NULL,
  degree TEXT NOT NULL,
  description TEXT NOT NULL,
  technologies TEXT[] DEFAULT '{}',
  display_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE education ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view education"
ON education FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins can manage education"
ON education FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  short_description TEXT NOT NULL,
  detailed_description TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  duration TEXT NOT NULL,
  role TEXT,
  team_size TEXT,
  technologies TEXT[] DEFAULT '{}',
  challenges TEXT NOT NULL,
  live_url TEXT,
  github_url TEXT,
  featured BOOLEAN DEFAULT FALSE,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view projects"
ON projects FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins can manage projects"
ON projects FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Project images table
CREATE TABLE project_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view project images"
ON project_images FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins can manage project images"
ON project_images FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Future projects table
CREATE TABLE future_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Planning', 'In Development')),
  features TEXT[] DEFAULT '{}',
  icon_name TEXT DEFAULT 'Lightbulb',
  display_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE future_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view future projects"
ON future_projects FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins can manage future projects"
ON future_projects FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Contact messages table
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  read_by UUID REFERENCES auth.users(id)
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact"
ON contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Admins can view contact messages"
ON contact_messages FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update contact messages"
ON contact_messages FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete contact messages"
ON contact_messages FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Analytics events table
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN ('page_view', 'project_view', 'contact_submit', 'button_click')),
  event_data JSONB,
  page_path TEXT,
  referrer TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can track analytics"
ON analytics_events FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Admins can view analytics"
ON analytics_events FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('site-assets', 'site-assets', true, 2097152, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp']),
  ('project-images', 'project-images', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']),
  ('about-images', 'about-images', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']);

-- Storage RLS policies
CREATE POLICY "Admins can upload to site-assets"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'site-assets'
  AND has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can upload to project-images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'project-images'
  AND has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can upload to about-images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'about-images'
  AND has_role(auth.uid(), 'admin')
);

CREATE POLICY "Public can view site-assets"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'site-assets');

CREATE POLICY "Public can view project-images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'project-images');

CREATE POLICY "Public can view about-images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'about-images');

CREATE POLICY "Admins can delete from site-assets"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'site-assets'
  AND has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete from project-images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'project-images'
  AND has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete from about-images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'about-images'
  AND has_role(auth.uid(), 'admin')
);

-- Insert default site settings
INSERT INTO site_settings (site_title, maintenance_mode)
VALUES ('Georges Boutros', false);

-- Insert default hero section (you'll update this with actual content)
INSERT INTO hero_section (name, subtitle, description, video_url)
VALUES (
  'Georges Boutros',
  'Full-Stack Developer & Data Engineer',
  'Building innovative solutions with modern technologies',
  'https://assets.mixkit.co/videos/preview/mixkit-computer-code-closeup-1181-large.mp4'
);