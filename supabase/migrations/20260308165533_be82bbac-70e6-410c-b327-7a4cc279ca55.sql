
-- =============================================
-- FIX: Recreate ALL RLS policies as PERMISSIVE
-- =============================================

-- ==================== about_section ====================
DROP POLICY IF EXISTS "Admins can manage about" ON public.about_section;
DROP POLICY IF EXISTS "Public can view about" ON public.about_section;

CREATE POLICY "Admins can manage about" ON public.about_section
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view about" ON public.about_section
  FOR SELECT TO anon, authenticated
  USING (true);

-- ==================== analytics_events ====================
DROP POLICY IF EXISTS "Admins can view analytics" ON public.analytics_events;
DROP POLICY IF EXISTS "Anyone can track analytics" ON public.analytics_events;

CREATE POLICY "Admins can view analytics" ON public.analytics_events
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can track analytics" ON public.analytics_events
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- ==================== blog_posts ====================
DROP POLICY IF EXISTS "Admins can manage blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Public can view active blog posts" ON public.blog_posts;

CREATE POLICY "Admins can manage blog posts" ON public.blog_posts
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view active blog posts" ON public.blog_posts
  FOR SELECT TO anon, authenticated
  USING (status = 'active'::text);

-- ==================== contact_messages ====================
DROP POLICY IF EXISTS "Admins can delete contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can update contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can view contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Anyone can submit contact" ON public.contact_messages;

CREATE POLICY "Admins can delete contact messages" ON public.contact_messages
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update contact messages" ON public.contact_messages
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view contact messages" ON public.contact_messages
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can submit contact" ON public.contact_messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- ==================== education ====================
DROP POLICY IF EXISTS "Admins can manage education" ON public.education;
DROP POLICY IF EXISTS "Public can view active education" ON public.education;

CREATE POLICY "Admins can manage education" ON public.education
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view active education" ON public.education
  FOR SELECT TO anon, authenticated
  USING (status = 'active'::text);

-- ==================== future_projects ====================
DROP POLICY IF EXISTS "Admins can manage future projects" ON public.future_projects;
DROP POLICY IF EXISTS "Public can view active future projects" ON public.future_projects;

CREATE POLICY "Admins can manage future projects" ON public.future_projects
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view active future projects" ON public.future_projects
  FOR SELECT TO anon, authenticated
  USING (status = 'active'::text);

-- ==================== hero_section ====================
DROP POLICY IF EXISTS "Admins can manage hero" ON public.hero_section;
DROP POLICY IF EXISTS "Public can view hero" ON public.hero_section;

CREATE POLICY "Admins can manage hero" ON public.hero_section
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view hero" ON public.hero_section
  FOR SELECT TO anon, authenticated
  USING (true);

-- ==================== pricing_plans ====================
DROP POLICY IF EXISTS "Admins can manage pricing plans" ON public.pricing_plans;
DROP POLICY IF EXISTS "Public can view active pricing plans" ON public.pricing_plans;

CREATE POLICY "Admins can manage pricing plans" ON public.pricing_plans
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view active pricing plans" ON public.pricing_plans
  FOR SELECT TO anon, authenticated
  USING (status = 'active'::text);

-- ==================== project_images ====================
DROP POLICY IF EXISTS "Admins can manage project images" ON public.project_images;
DROP POLICY IF EXISTS "Public can view project images" ON public.project_images;

CREATE POLICY "Admins can manage project images" ON public.project_images
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view project images" ON public.project_images
  FOR SELECT TO anon, authenticated
  USING (true);

-- ==================== projects ====================
DROP POLICY IF EXISTS "Admins can manage projects" ON public.projects;
DROP POLICY IF EXISTS "Public can view active projects" ON public.projects;

CREATE POLICY "Admins can manage projects" ON public.projects
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view active projects" ON public.projects
  FOR SELECT TO anon, authenticated
  USING (status = 'active'::text);

-- ==================== rescue_requests ====================
DROP POLICY IF EXISTS "Admins can delete rescue requests" ON public.rescue_requests;
DROP POLICY IF EXISTS "Admins can update rescue requests" ON public.rescue_requests;
DROP POLICY IF EXISTS "Admins can view rescue requests" ON public.rescue_requests;
DROP POLICY IF EXISTS "Anyone can submit rescue requests" ON public.rescue_requests;

CREATE POLICY "Admins can delete rescue requests" ON public.rescue_requests
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update rescue requests" ON public.rescue_requests
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view rescue requests" ON public.rescue_requests
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can submit rescue requests" ON public.rescue_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- ==================== site_settings ====================
DROP POLICY IF EXISTS "Admins can update settings" ON public.site_settings;
DROP POLICY IF EXISTS "Public can view settings" ON public.site_settings;

CREATE POLICY "Admins can update settings" ON public.site_settings
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view settings" ON public.site_settings
  FOR SELECT TO anon, authenticated
  USING (true);

-- ==================== skills_timeline ====================
DROP POLICY IF EXISTS "Admins can manage timeline" ON public.skills_timeline;
DROP POLICY IF EXISTS "Public can view active timeline" ON public.skills_timeline;

CREATE POLICY "Admins can manage timeline" ON public.skills_timeline
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view active timeline" ON public.skills_timeline
  FOR SELECT TO anon, authenticated
  USING (status = 'active'::text);

-- ==================== tech_stack ====================
DROP POLICY IF EXISTS "Admins can manage tech stack" ON public.tech_stack;
DROP POLICY IF EXISTS "Public can view active tech stack" ON public.tech_stack;

CREATE POLICY "Admins can manage tech stack" ON public.tech_stack
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view active tech stack" ON public.tech_stack
  FOR SELECT TO anon, authenticated
  USING (status = 'active'::text);

-- ==================== testimonials ====================
DROP POLICY IF EXISTS "Admins can manage testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Testimonials are publicly readable" ON public.testimonials;

CREATE POLICY "Admins can manage testimonials" ON public.testimonials
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Testimonials are publicly readable" ON public.testimonials
  FOR SELECT TO anon, authenticated
  USING (status = 'active'::text);

-- ==================== user_roles ====================
DROP POLICY IF EXISTS "Admins can view roles" ON public.user_roles;

CREATE POLICY "Admins can view roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
  ));
