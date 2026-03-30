-- Allow doctors to update appointments assigned to them
CREATE POLICY "Doctors manage own appointments"
ON public.appointments
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.doctors d
    WHERE d.id = appointments.doctor_id
    AND d.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.doctors d
    WHERE d.id = appointments.doctor_id
    AND d.user_id = auth.uid()
  )
);