-- Create pricing_plans table
CREATE TABLE IF NOT EXISTS public.pricing_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price text NOT NULL,
  period text NOT NULL,
  description text NOT NULL,
  features text[] NOT NULL DEFAULT '{}',
  highlighted boolean DEFAULT false,
  display_order integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;

-- Public can view pricing plans
CREATE POLICY "Public can view pricing plans"
  ON public.pricing_plans
  FOR SELECT
  USING (true);

-- Admins can manage pricing plans
CREATE POLICY "Admins can manage pricing plans"
  ON public.pricing_plans
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert existing pricing data
INSERT INTO public.pricing_plans (name, price, period, description, features, highlighted, display_order)
VALUES
  (
    'Starter',
    '$2,500',
    'per project',
    'Perfect for small projects and MVPs',
    ARRAY[
      'Landing page or small website',
      'Responsive design',
      'Basic SEO optimization',
      'Contact form integration',
      '1 month of support',
      'Source code included'
    ],
    false,
    1
  ),
  (
    'Professional',
    '$7,500',
    'per project',
    'Ideal for medium-sized applications',
    ARRAY[
      'Full-stack web application',
      'Custom design & branding',
      'Database integration',
      'User authentication',
      'API development',
      'Advanced SEO & performance',
      '3 months of support',
      'CI/CD setup'
    ],
    true,
    2
  ),
  (
    'Enterprise',
    'Custom',
    'contact for pricing',
    'For large-scale applications',
    ARRAY[
      'Complex web platform',
      'Microservices architecture',
      'Data engineering pipelines',
      'Cloud infrastructure setup',
      'Real-time features',
      'Advanced security',
      '6 months of support',
      'Scalability optimization',
      'Team training'
    ],
    false,
    3
  );