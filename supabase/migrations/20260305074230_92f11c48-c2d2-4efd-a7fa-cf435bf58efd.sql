CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text,
  excerpt text NOT NULL,
  content text NOT NULL,
  cover_image_url text NOT NULL,
  tags text[] DEFAULT '{}'::text[],
  featured boolean DEFAULT false,
  status text DEFAULT 'active',
  display_order integer NOT NULL DEFAULT 0,
  author text DEFAULT 'Georges Boutros',
  reading_time_minutes integer DEFAULT 5,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX blog_posts_slug_unique_idx ON public.blog_posts (slug) WHERE slug IS NOT NULL;

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active blog posts"
  ON public.blog_posts FOR SELECT
  USING (status = 'active');

CREATE POLICY "Admins can manage blog posts"
  ON public.blog_posts FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();