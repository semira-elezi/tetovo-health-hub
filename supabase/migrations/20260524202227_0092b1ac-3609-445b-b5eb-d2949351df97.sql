
-- Emergency contacts
CREATE TABLE public.emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  relationship TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients manage own contacts" ON public.emergency_contacts FOR ALL TO authenticated USING (patient_id = auth.uid()) WITH CHECK (patient_id = auth.uid());
CREATE POLICY "Staff view emergency contacts" ON public.emergency_contacts FOR SELECT TO authenticated USING (is_staff(auth.uid()));

-- Insurance info
CREATE TABLE public.insurance_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  provider TEXT NOT NULL,
  policy_number TEXT,
  group_number TEXT,
  expiry_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.insurance_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients manage own insurance" ON public.insurance_info FOR ALL TO authenticated USING (patient_id = auth.uid()) WITH CHECK (patient_id = auth.uid());
CREATE POLICY "Staff view insurance" ON public.insurance_info FOR SELECT TO authenticated USING (is_staff(auth.uid()));

-- Allergies
CREATE TABLE public.allergies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  allergen TEXT NOT NULL,
  reaction TEXT,
  severity TEXT CHECK (severity IN ('mild','moderate','severe')) DEFAULT 'mild',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.allergies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients manage own allergies" ON public.allergies FOR ALL TO authenticated USING (patient_id = auth.uid()) WITH CHECK (patient_id = auth.uid());
CREATE POLICY "Staff view allergies" ON public.allergies FOR SELECT TO authenticated USING (is_staff(auth.uid()));

-- Chronic conditions
CREATE TABLE public.chronic_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  condition TEXT NOT NULL,
  diagnosed_date DATE,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.chronic_conditions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients manage own conditions" ON public.chronic_conditions FOR ALL TO authenticated USING (patient_id = auth.uid()) WITH CHECK (patient_id = auth.uid());
CREATE POLICY "Staff view conditions" ON public.chronic_conditions FOR SELECT TO authenticated USING (is_staff(auth.uid()));

-- Vaccinations
CREATE TABLE public.vaccinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  vaccine_name TEXT NOT NULL,
  administered_date DATE NOT NULL,
  next_dose_date DATE,
  lot_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.vaccinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients manage own vaccinations" ON public.vaccinations FOR ALL TO authenticated USING (patient_id = auth.uid()) WITH CHECK (patient_id = auth.uid());
CREATE POLICY "Staff manage vaccinations" ON public.vaccinations FOR ALL TO authenticated USING (is_staff(auth.uid())) WITH CHECK (is_staff(auth.uid()));

-- Health metrics
CREATE TABLE public.health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('blood_pressure','weight','glucose','heart_rate','temperature','oxygen')),
  value_numeric NUMERIC,
  value_text TEXT,
  unit TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.health_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients manage own metrics" ON public.health_metrics FOR ALL TO authenticated USING (patient_id = auth.uid()) WITH CHECK (patient_id = auth.uid());
CREATE POLICY "Staff view metrics" ON public.health_metrics FOR SELECT TO authenticated USING (is_staff(auth.uid()));

-- Medication reminders
CREATE TABLE public.medication_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  prescription_id UUID,
  medication_name TEXT NOT NULL,
  dosage TEXT,
  time_of_day TIME NOT NULL,
  days_of_week INTEGER[] DEFAULT ARRAY[1,2,3,4,5,6,7],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.medication_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients manage own reminders" ON public.medication_reminders FOR ALL TO authenticated USING (patient_id = auth.uid()) WITH CHECK (patient_id = auth.uid());

-- Messages (doctor-patient chat)
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  body TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own messages" ON public.messages FOR SELECT TO authenticated USING (sender_id = auth.uid() OR recipient_id = auth.uid());
CREATE POLICY "Users send messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid());
CREATE POLICY "Users update own received messages" ON public.messages FOR UPDATE TO authenticated USING (recipient_id = auth.uid()) WITH CHECK (recipient_id = auth.uid());
CREATE INDEX idx_messages_pair ON public.messages (sender_id, recipient_id, created_at DESC);

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- FAQs
CREATE TABLE public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_en TEXT NOT NULL,
  question_mk TEXT,
  question_sq TEXT,
  answer_en TEXT NOT NULL,
  answer_mk TEXT,
  answer_sq TEXT,
  category TEXT DEFAULT 'general',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read faqs" ON public.faqs FOR SELECT TO public USING (is_active = true);
CREATE POLICY "Admin manage faqs" ON public.faqs FOR ALL TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Working hours
CREATE TABLE public.working_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  open_time TIME,
  close_time TIME,
  is_closed BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read working hours" ON public.working_hours FOR SELECT TO public USING (true);
CREATE POLICY "Admin manage working hours" ON public.working_hours FOR ALL TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Seed FAQs
INSERT INTO public.faqs (question_en, question_sq, question_mk, answer_en, answer_sq, answer_mk, sort_order) VALUES
('How do I book an appointment?', 'Si mund të rezervoj një termin?', 'Како да резервирам термин?', 'Log in to your patient portal, click "Book Appointment", choose a department, doctor, date, and time slot.', 'Hyni në portalin tuaj të pacientit, klikoni "Rezervo Termin", zgjidhni një departament, mjek, datë dhe orar.', 'Најавете се на пациентскиот портал, кликнете „Резервирај термин", изберете оддел, лекар, датум и време.', 1),
('Can I cancel an appointment?', 'A mund të anuloj një termin?', 'Можам ли да откажам термин?', 'Yes. From the Patient Portal under Appointments, you can cancel any pending or confirmed appointment at least 2 hours in advance.', 'Po. Nga Portali i Pacientit në seksionin Termine, mund të anuloni çdo termin në pritje ose të konfirmuar të paktën 2 orë para.', 'Да. Од Пациентскиот портал во делот Термини, можете да откажете секој термин најмалку 2 часа однапред.', 2),
('How do I access my lab results?', 'Si mund të shoh rezultatet e laboratorit?', 'Како да ги видам резултатите од лабораторија?', 'Lab results appear in the Patient Portal under "Lab Results" once the doctor publishes them. You can also download the original document and AI summary.', 'Rezultatet shfaqen në Portalin e Pacientit nën "Rezultatet e Laboratorit" pasi mjeku t''i publikojë. Mund të shkarkoni dokumentin origjinal dhe përmbledhjen AI.', 'Резултатите се појавуваат во Пациентскиот портал под „Лабораториски резултати" откако лекарот ќе ги објави.', 3),
('What documents do I need for my first visit?', 'Çfarë dokumentesh më duhen për vizitën e parë?', 'Кои документи ми требаат за првата посета?', 'Bring a valid ID, your insurance card, any previous medical records relevant to your visit, and a list of current medications.', 'Sillni një dokument identifikimi, kartën e sigurimit, çdo regjistër mjekësor të mëparshëm dhe listën e medikamenteve aktuale.', 'Донесете лична карта, картичка за осигурување, претходни медицински извештаи и листа на тековни лекови.', 4),
('Is there an emergency number?', 'A ka numër emergjence?', 'Дали постои број за итни случаи?', 'Yes — call 194 for medical emergencies 24/7. For non-urgent matters, contact the hospital reception.', 'Po — telefononi 194 për urgjenca mjekësore 24/7. Për çështje jo urgjente, kontaktoni recepsionin e spitalit.', 'Да — повикајте 194 за итни медицински случаи 24/7. За неитни прашања, контактирајте ја рецепцијата.', 5);

-- Seed working hours for every active department (Mon-Fri 8-16, Sat 8-13, Sun closed)
INSERT INTO public.working_hours (department_id, day_of_week, open_time, close_time, is_closed)
SELECT d.id, dow, 
  CASE WHEN dow = 0 THEN NULL WHEN dow = 6 THEN '08:00'::time ELSE '08:00'::time END,
  CASE WHEN dow = 0 THEN NULL WHEN dow = 6 THEN '13:00'::time ELSE '16:00'::time END,
  CASE WHEN dow = 0 THEN true ELSE false END
FROM public.departments d, generate_series(0,6) dow
WHERE d.is_active = true;
