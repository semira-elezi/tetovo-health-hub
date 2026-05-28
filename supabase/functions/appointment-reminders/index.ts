// Cron job — sends 24h appointment reminders to patients.
// Triggered daily by pg_cron.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, serviceKey);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const date = tomorrow.toISOString().split("T")[0];

    const { data: appts, error } = await sb
      .from("appointments")
      .select("id, patient_id, appointment_date, start_time, doctors(full_name), departments(name_sq, name_en, name_mk)")
      .eq("appointment_date", date)
      .in("status", ["pending", "confirmed"]);

    if (error) throw error;

    let sent = 0;
    let failed = 0;

    for (const a of appts || []) {
      try {
        const { data: userRes } = await sb.auth.admin.getUserById((a as any).patient_id);
        const email = userRes?.user?.email;
        if (!email) continue;

        const { data: profile } = await sb.from("profiles").select("full_name").eq("id", (a as any).patient_id).single();

        const dept: any = (a as any).departments;
        await sb.functions.invoke("send-email", {
          body: {
            type: "appointment_reminder",
            to: email,
            lang: "sq",
            data: {
              patientName: profile?.full_name || "",
              doctorName: (a as any).doctors?.full_name || "",
              department: dept?.name_sq || dept?.name_en || "",
              date: (a as any).appointment_date,
              time: String((a as any).start_time).slice(0, 5),
            },
          },
        });
        sent++;
      } catch (e) {
        console.error("reminder send failed", e);
        failed++;
      }
    }

    return new Response(JSON.stringify({ ok: true, date, total: appts?.length || 0, sent, failed }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("appointment-reminders error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
