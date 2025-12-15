-- Create tech_stack table
CREATE TABLE public.tech_stack (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  experience_level INTEGER NOT NULL CHECK (experience_level >= 0 AND experience_level <= 100),
  description TEXT NOT NULL,
  icon TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create skills_timeline table
CREATE TABLE public.skills_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year TEXT NOT NULL,
  month TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  skills TEXT[] DEFAULT '{}',
  category TEXT NOT NULL,
  project_link TEXT,
  icon TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.tech_stack ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills_timeline ENABLE ROW LEVEL SECURITY;

-- RLS policies for tech_stack
CREATE POLICY "Public can view active tech stack" 
ON public.tech_stack 
FOR SELECT 
USING (status = 'active');

CREATE POLICY "Admins can manage tech stack" 
ON public.tech_stack 
FOR ALL 
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- RLS policies for skills_timeline
CREATE POLICY "Public can view active timeline" 
ON public.skills_timeline 
FOR SELECT 
USING (status = 'active');

CREATE POLICY "Admins can manage timeline" 
ON public.skills_timeline 
FOR ALL 
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Add updated_at triggers
CREATE TRIGGER update_tech_stack_updated_at
BEFORE UPDATE ON public.tech_stack
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_skills_timeline_updated_at
BEFORE UPDATE ON public.skills_timeline
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial tech_stack data
INSERT INTO public.tech_stack (name, category, experience_level, description, display_order) VALUES
('React', 'Frontend', 95, 'Building modern, responsive user interfaces with React hooks and functional components', 1),
('TypeScript', 'Frontend', 90, 'Type-safe JavaScript development for scalable applications', 2),
('Node.js', 'Backend', 85, 'Server-side JavaScript runtime for building APIs and services', 3),
('Python', 'Backend', 80, 'Versatile programming language for backend, automation, and AI', 4),
('PostgreSQL', 'Database', 85, 'Advanced relational database management and optimization', 5),
('MongoDB', 'Database', 75, 'NoSQL database for flexible, document-based data storage', 6),
('AWS', 'Cloud', 80, 'Cloud infrastructure, serverless computing, and DevOps on AWS', 7),
('Docker', 'DevOps', 85, 'Containerization and orchestration for consistent deployments', 8),
('TensorFlow', 'AI', 70, 'Machine learning framework for building and training models', 9),
('OpenAI API', 'AI', 85, 'Integration of large language models and AI capabilities', 10),
('Git', 'Tools', 95, 'Version control and collaborative development workflows', 11),
('Figma', 'Tools', 75, 'UI/UX design and prototyping for web applications', 12),
('Tailwind CSS', 'Frontend', 90, 'Utility-first CSS framework for rapid UI development', 13),
('Next.js', 'Frontend', 80, 'React framework with SSR, SSG, and API routes', 14),
('GraphQL', 'Backend', 75, 'Query language for APIs with efficient data fetching', 15),
('Redis', 'Database', 70, 'In-memory data structure store for caching and sessions', 16),
('Kubernetes', 'DevOps', 65, 'Container orchestration for scalable deployments', 17),
('CI/CD', 'DevOps', 85, 'Automated testing and deployment pipelines', 18);

-- Seed initial skills_timeline data
INSERT INTO public.skills_timeline (year, month, title, description, skills, category, display_order) VALUES
('2024', 'December', 'AI-Powered Portfolio Launch', 'Launched a comprehensive portfolio featuring AI chatbot, real-time analytics, and 3D visualizations', ARRAY['React', 'TypeScript', 'Supabase', 'Three.js', 'AI Integration'], 'frontend', 1),
('2024', 'November', 'Advanced Analytics Dashboard', 'Built real-time visitor analytics with geographic visualization using Mapbox', ARRAY['Supabase', 'Mapbox GL', 'React Query', 'Real-time Subscriptions'], 'backend', 2),
('2024', 'October', 'Dev Tools Hub Creation', 'Developed a suite of 12+ client-side developer tools for the portfolio', ARRAY['React', 'TypeScript', 'Crypto API', 'Client-side Processing'], 'frontend', 3),
('2024', 'September', '3D Web Graphics Mastery', 'Implemented performant 3D scenes with Three.js and React Three Fiber', ARRAY['Three.js', 'React Three Fiber', 'WebGL', 'Performance Optimization'], 'frontend', 4),
('2024', 'August', 'AI Automation Projects', 'Built multiple AI-powered automation tools and chatbots using OpenAI APIs', ARRAY['OpenAI API', 'LangChain', 'Python', 'Prompt Engineering'], 'ai-automation', 5),
('2024', 'June', 'Full-Stack Supabase Integration', 'Mastered Supabase for authentication, database, storage, and edge functions', ARRAY['Supabase', 'PostgreSQL', 'Row Level Security', 'Edge Functions'], 'backend', 6),
('2024', 'March', 'React & TypeScript Deep Dive', 'Advanced patterns in React including custom hooks, context, and TypeScript generics', ARRAY['React', 'TypeScript', 'Custom Hooks', 'State Management'], 'frontend', 7),
('2023', 'December', 'Cloud Architecture Certification', 'Completed AWS Solutions Architect certification and cloud deployment strategies', ARRAY['AWS', 'Cloud Architecture', 'Serverless', 'Infrastructure as Code'], 'education', 8),
('2023', 'August', 'Backend Development Focus', 'Built REST and GraphQL APIs with Node.js, Express, and database optimization', ARRAY['Node.js', 'Express', 'GraphQL', 'API Design'], 'backend', 9),
('2023', 'March', 'Web Development Bootcamp', 'Completed intensive full-stack development program covering modern web technologies', ARRAY['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'], 'education', 10);