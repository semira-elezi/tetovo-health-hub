// Cron job — sends each doctor their schedule for today.
// Triggered daily by pg_cron (around 07:00 local).
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

    const today = new Date().toISOString().split("T")[0];

    const { data: doctors, error: dErr } = await sb
      .from("doctors")
      .select("id, full_name, email, user_id")
      .eq("is_active", true);

    if (dErr) throw dErr;

    let sent = 0;
    let skipped = 0;

    for (const d of doctors || []) {
      const { data: appts } = await sb
        .from("appointments")
        .select("patient_id, start_time, reason")
        .eq("doctor_id", d.id)
        .eq("appointment_date", today)
        .in("status", ["pending", "confirmed"])
        .order("start_time");

      if (!appts || appts.length === 0) {
        skipped++;
        continue;
      }

      // resolve patient names
      const rows: any[] = [];
      for (const a of appts) {
        const { data: prof } = await sb.from("profiles").select("full_name").eq("id", a.patient_id).single();
        rows.push({
          time: String(a.start_time).slice(0, 5),
          patientName: prof?.full_name || "Patient",
          reason: a.reason,
        });
      }

      // find email
      let email = d.email as string | null;
      if (!email && d.user_id) {
        const { data: u } = await sb.auth.admin.getUserById(d.user_id);
        email = u?.user?.email || null;
      }
      if (!email) {
        skipped++;
        continue;
      }

      try {
        await sb.functions.invoke("send-email", {
          body: {
            type: "doctor_daily_digest",
            to: email,
            lang: "sq",
            data: {
              doctorName: d.full_name,
              date: today,
              count: rows.length,
              appointments: rows,
            },
          },
        });
        sent++;
      } catch (e) {
        console.error("digest send failed for", d.id, e);
      }
    }

    return new Response(JSON.stringify({ ok: true, date: today, sent, skipped }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("doctor-daily-digest error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
