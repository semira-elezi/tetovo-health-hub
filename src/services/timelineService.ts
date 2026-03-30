import { supabase } from "@/integrations/supabase/client";

export type TimelineEventType = "appointment" | "diagnosis" | "lab_result" | "prescription";

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  title: string;
  description?: string;
  date: string;
  status?: string;
  metadata?: Record<string, any>;
}

export async function fetchPatientTimeline(patientId: string): Promise<TimelineEvent[]> {
  const [aptsRes, histRes, labRes, rxRes] = await Promise.all([
    supabase.from("appointments")
      .select("id, appointment_date, start_time, status, reason, doctors(full_name, title), departments(name_en)")
      .eq("patient_id", patientId)
      .order("appointment_date", { ascending: false })
      .limit(50),
    supabase.from("medical_history")
      .select("id, condition, diagnosis_date, notes, is_active, doctors(full_name)")
      .eq("patient_id", patientId)
      .order("diagnosis_date", { ascending: false })
      .limit(50),
    supabase.from("lab_results")
      .select("id, test_name, result_value, unit, status, created_at, doctors(full_name)")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase.from("prescriptions")
      .select("id, medication_name, dosage, frequency, status, created_at, doctors(full_name)")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const events: TimelineEvent[] = [];

  aptsRes.data?.forEach((a: any) => {
    events.push({
      id: a.id,
      type: "appointment",
      title: `${a.doctors?.title || ""} ${a.doctors?.full_name || "Doctor"}`.trim(),
      description: a.reason || a.departments?.name_en || undefined,
      date: a.appointment_date,
      status: a.status,
      metadata: { start_time: a.start_time, department: a.departments?.name_en },
    });
  });

  histRes.data?.forEach((h: any) => {
    events.push({
      id: h.id,
      type: "diagnosis",
      title: h.condition,
      description: h.notes || undefined,
      date: h.diagnosis_date || h.created_at?.split("T")[0],
      status: h.is_active ? "active" : "resolved",
      metadata: { doctor: h.doctors?.full_name },
    });
  });

  labRes.data?.forEach((l: any) => {
    const labType = l.type || "manual";
    const hasFile = !!l.file_url;
    const hasSummary = !!l.summary;
    
    let description = l.result_value ? `${l.result_value} ${l.unit || ""}`.trim() : undefined;
    if (hasFile && labType === "uploaded") description = "Document uploaded";
    if (labType === "hybrid") description = `${description || ""} (+ document)`.trim();
    
    events.push({
      id: l.id,
      type: "lab_result",
      title: l.test_name,
      description,
      date: l.created_at.split("T")[0],
      status: l.status,
      metadata: { 
        doctor: l.doctors?.full_name,
        labType,
        hasFile,
        hasSummary,
      },
    });
  });

  rxRes.data?.forEach((r: any) => {
    events.push({
      id: r.id,
      type: "prescription",
      title: r.medication_name,
      description: [r.dosage, r.frequency].filter(Boolean).join(" · ") || undefined,
      date: r.created_at.split("T")[0],
      status: r.status,
      metadata: { doctor: r.doctors?.full_name },
    });
  });

  events.sort((a, b) => b.date.localeCompare(a.date));
  return events;
}
