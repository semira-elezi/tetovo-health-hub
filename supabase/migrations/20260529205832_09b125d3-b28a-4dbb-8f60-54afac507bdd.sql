
CREATE TYPE public.blood_type AS ENUM ('A+','A-','B+','B-','AB+','AB-','O+','O-','unknown');
CREATE TYPE public.donation_status AS ENUM ('pending','contacted','scheduled','completed','cancelled');

CREATE TABLE public.blood_donation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text NOT NULL,
  email text,
  blood_type public.blood_type NOT NULL DEFAULT 'unknown',
  date_of_birth date,
  city text,
  preferred_date date,
  notes text,
  consent_contact boolean NOT NULL DEFAULT true,
  status public.donation_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.blood_donation_requests TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.blood_donation_requests TO authenticated;
GRANT ALL ON public.blood_donation_requests TO service_role;

ALTER TABLE public.blood_donation_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit donation request"
  ON public.blood_donation_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admin manage donation requests"
  ON public.blood_donation_requests FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Staff view donation requests"
  ON public.blood_donation_requests FOR SELECT
  TO authenticated
  USING (is_staff(auth.uid()));

CREATE TRIGGER trg_blood_donation_updated
  BEFORE UPDATE ON public.blood_donation_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.blood_stock (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blood_type public.blood_type NOT NULL UNIQUE,
  level text NOT NULL DEFAULT 'normal',
  units integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.blood_stock TO anon, authenticated;
GRANT ALL ON public.blood_stock TO service_role, authenticated;

ALTER TABLE public.blood_stock ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read blood stock"
  ON public.blood_stock FOR SELECT TO public USING (true);

CREATE POLICY "Admin manage blood stock"
  ON public.blood_stock FOR ALL TO authenticated
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

INSERT INTO public.blood_stock (blood_type, level, units) VALUES
  ('O+','normal',45),('O-','low',8),('A+','normal',38),('A-','normal',15),
  ('B+','normal',22),('B-','low',6),('AB+','normal',12),('AB-','critical',3);
