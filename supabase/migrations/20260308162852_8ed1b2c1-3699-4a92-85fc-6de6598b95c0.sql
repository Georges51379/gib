
CREATE TABLE public.rescue_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  company text,
  urgency text NOT NULL DEFAULT 'medium',
  problems jsonb NOT NULL DEFAULT '[]'::jsonb,
  additional_notes text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.rescue_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit rescue requests"
  ON public.rescue_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view rescue requests"
  ON public.rescue_requests FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update rescue requests"
  ON public.rescue_requests FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete rescue requests"
  ON public.rescue_requests FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_rescue_requests_updated_at
  BEFORE UPDATE ON public.rescue_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Validation trigger: at least one contact method
CREATE OR REPLACE FUNCTION public.validate_rescue_contact()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
AS $$
BEGIN
  IF (NEW.email IS NULL OR trim(NEW.email) = '') AND (NEW.phone IS NULL OR trim(NEW.phone) = '') THEN
    RAISE EXCEPTION 'At least one contact method (email or phone) is required';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_rescue_contact_trigger
  BEFORE INSERT OR UPDATE ON public.rescue_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_rescue_contact();
