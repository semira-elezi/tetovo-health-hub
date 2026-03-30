import { supabase } from "@/integrations/supabase/client";

export interface PrescriptionInput {
  patient_id: string;
  doctor_id: string;
  appointment_id?: string;
  medication_name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  notes?: string;
}

export async function fetchPrescriptions(patientId: string) {
  const { data, error } = await supabase
    .from("prescriptions")
    .select("*, doctors(full_name, title)")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchDoctorPrescriptions(doctorId: string) {
  const { data, error } = await supabase
    .from("prescriptions")
    .select("*")
    .eq("doctor_id", doctorId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createPrescription(input: PrescriptionInput) {
  const { data, error } = await supabase
    .from("prescriptions")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePrescriptionStatus(id: string, status: "active" | "completed" | "cancelled") {
  const { error } = await supabase
    .from("prescriptions")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}
