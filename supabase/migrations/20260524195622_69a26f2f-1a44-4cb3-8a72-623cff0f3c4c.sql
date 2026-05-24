CREATE OR REPLACE FUNCTION public.get_taken_slots(_doctor_id uuid, _date date)
RETURNS TABLE(start_time time)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT a.start_time
  FROM public.appointments a
  WHERE a.doctor_id = _doctor_id
    AND a.appointment_date = _date
    AND a.status NOT IN ('cancelled', 'no_show');
$$;

GRANT EXECUTE ON FUNCTION public.get_taken_slots(uuid, date) TO anon, authenticated;