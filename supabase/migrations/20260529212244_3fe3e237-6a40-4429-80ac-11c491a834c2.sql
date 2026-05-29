-- Add blood_type to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS blood_type public.blood_type;

-- Blood demand campaigns
CREATE TABLE public.blood_demand_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blood_type public.blood_type NOT NULL,
  units_needed integer NOT NULL DEFAULT 1,
  urgency text NOT NULL DEFAULT 'normal',
  message text,
  status text NOT NULL DEFAULT 'active',
  contacted_count integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.blood_demand_campaigns TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.blood_demand_campaigns TO authenticated;
GRANT ALL ON public.blood_demand_campaigns TO service_role;

ALTER TABLE public.blood_demand_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active campaigns"
  ON public.blood_demand_campaigns FOR SELECT
  TO public
  USING (status = 'active');

CREATE POLICY "Admin manage campaigns"
  ON public.blood_demand_campaigns FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Staff view campaigns"
  ON public.blood_demand_campaigns FOR SELECT
  TO authenticated
  USING (is_staff(auth.uid()));

CREATE TRIGGER trg_blood_campaign_updated
  BEFORE UPDATE ON public.blood_demand_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();