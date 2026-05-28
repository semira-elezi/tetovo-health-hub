// Thin wrapper around the send-email edge function.
// All transactional emails (Resend) go through here.
import { supabase } from "@/integrations/supabase/client";

export type EmailType =
  | "appointment_confirm"
  | "appointment_reminder"
  | "appointment_status"
  | "appointment_cancelled"
  | "lab_results"
  | "prescription_issued"
  | "welcome_patient"
  | "doctor_new_booking"
  | "doctor_daily_digest"
  | "doctor_welcome"
  | "admin_new_feedback";

export interface SendEmailPayload {
  type: EmailType;
  to: string;
  lang?: "sq" | "mk" | "en";
  data?: Record<string, any>;
}

/**
 * Fire-and-forget email send. Never throws — failures are logged
 * to console so they don't block the user's primary action.
 */
export async function sendEmail(payload: SendEmailPayload): Promise<void> {
  try {
    const { error } = await supabase.functions.invoke("send-email", { body: payload });
    if (error) console.warn("[email] send failed:", error.message, payload.type);
  } catch (e) {
    console.warn("[email] invoke threw:", e);
  }
}
