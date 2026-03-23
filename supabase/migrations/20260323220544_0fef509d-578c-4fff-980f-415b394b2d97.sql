
-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.er_wait_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptom_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurement_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES
-- ============================================
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "Staff can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Admin full access profiles" ON public.profiles FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ============================================
-- USER ROLES
-- ============================================
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admin manages roles" ON public.user_roles FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ============================================
-- DEPARTMENTS (public read)
-- ============================================
CREATE POLICY "Public read departments" ON public.departments FOR SELECT USING (true);
CREATE POLICY "Admin manages departments" ON public.departments FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ============================================
-- DOCTORS (public read)
-- ============================================
CREATE POLICY "Public read doctors" ON public.doctors FOR SELECT USING (true);
CREATE POLICY "Admin manages doctors" ON public.doctors FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ============================================
-- TIME SLOTS
-- ============================================
CREATE POLICY "Public read available slots" ON public.time_slots FOR SELECT USING (true);
CREATE POLICY "Staff manages time slots" ON public.time_slots FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- ============================================
-- APPOINTMENTS
-- ============================================
CREATE POLICY "Patients view own appointments" ON public.appointments FOR SELECT TO authenticated USING (patient_id = auth.uid());
CREATE POLICY "Patients create appointments" ON public.appointments FOR INSERT TO authenticated WITH CHECK (patient_id = auth.uid());
CREATE POLICY "Patients cancel own appointments" ON public.appointments FOR UPDATE TO authenticated USING (patient_id = auth.uid()) WITH CHECK (patient_id = auth.uid());
CREATE POLICY "Staff view all appointments" ON public.appointments FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff manage appointments" ON public.appointments FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ============================================
-- LAB RESULTS
-- ============================================
CREATE POLICY "Patients view own lab results" ON public.lab_results FOR SELECT TO authenticated USING (patient_id = auth.uid());
CREATE POLICY "Staff manage lab results" ON public.lab_results FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- ============================================
-- MEDICAL HISTORY
-- ============================================
CREATE POLICY "Patients view own history" ON public.medical_history FOR SELECT TO authenticated USING (patient_id = auth.uid());
CREATE POLICY "Staff manage medical history" ON public.medical_history FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- ============================================
-- PRESCRIPTIONS
-- ============================================
CREATE POLICY "Patients view own prescriptions" ON public.prescriptions FOR SELECT TO authenticated USING (patient_id = auth.uid());
CREATE POLICY "Staff manage prescriptions" ON public.prescriptions FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- ============================================
-- DOCUMENTS
-- ============================================
CREATE POLICY "Patients view own documents" ON public.documents FOR SELECT TO authenticated USING (patient_id = auth.uid());
CREATE POLICY "Staff manage documents" ON public.documents FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Staff create notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Admin manage notifications" ON public.notifications FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ============================================
-- NEWS (public read)
-- ============================================
CREATE POLICY "Public read published news" ON public.news FOR SELECT USING (is_published = true);
CREATE POLICY "Admin manage news" ON public.news FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ============================================
-- ANNOUNCEMENTS (public read)
-- ============================================
CREATE POLICY "Public read active announcements" ON public.announcements FOR SELECT USING (is_active = true);
CREATE POLICY "Admin manage announcements" ON public.announcements FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ============================================
-- ER WAIT TIMES (public read)
-- ============================================
CREATE POLICY "Public read er wait times" ON public.er_wait_times FOR SELECT USING (true);
CREATE POLICY "Staff manage er wait times" ON public.er_wait_times FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- ============================================
-- FEEDBACK
-- ============================================
CREATE POLICY "Patients create feedback" ON public.feedback FOR INSERT TO authenticated WITH CHECK (patient_id = auth.uid() OR is_anonymous = true);
CREATE POLICY "Staff view feedback" ON public.feedback FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Admin manage feedback" ON public.feedback FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ============================================
-- CONTACT MESSAGES (public insert)
-- ============================================
CREATE POLICY "Anyone can submit contact" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Staff view contacts" ON public.contact_messages FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Admin manage contacts" ON public.contact_messages FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ============================================
-- SYMPTOM LOGS
-- ============================================
CREATE POLICY "Patients view own symptoms" ON public.symptom_logs FOR SELECT TO authenticated USING (patient_id = auth.uid());
CREATE POLICY "Patients create symptom logs" ON public.symptom_logs FOR INSERT TO authenticated WITH CHECK (patient_id = auth.uid());
CREATE POLICY "Staff view symptom logs" ON public.symptom_logs FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

-- ============================================
-- PROCUREMENT DOCUMENTS (public read)
-- ============================================
CREATE POLICY "Public read procurement" ON public.procurement_documents FOR SELECT USING (true);
CREATE POLICY "Admin manage procurement" ON public.procurement_documents FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ============================================
-- PARTNER LINKS (public read)
-- ============================================
CREATE POLICY "Public read partners" ON public.partner_links FOR SELECT USING (true);
CREATE POLICY "Admin manage partners" ON public.partner_links FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ============================================
-- AUDIT LOGS
-- ============================================
CREATE POLICY "Admin view audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "System insert audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);
