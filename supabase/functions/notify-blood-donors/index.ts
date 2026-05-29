// Notify patients matching a blood type campaign (email + in-app notification)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { campaign_id } = await req.json();
    if (!campaign_id) {
      return new Response(JSON.stringify({ error: "campaign_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(SUPABASE_URL, SERVICE_KEY);

    // Verify caller is admin
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await sb.auth.getUser(token);
    const caller = userData?.user;
    if (!caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: roleRow } = await sb.from("user_roles").select("role").eq("user_id", caller.id).eq("role", "admin").maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: campaign, error: cErr } = await sb.from("blood_demand_campaigns").select("*").eq("id", campaign_id).single();
    if (cErr || !campaign) {
      return new Response(JSON.stringify({ error: "Campaign not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find matching patients. O- universal donor for everyone; O+ for all positives.
    // For simplicity, match exact type and also include O- donors for any type.
    const targetTypes = [campaign.blood_type];
    if (campaign.blood_type !== "O-") targetTypes.push("O-");

    const { data: matchingProfiles } = await sb
      .from("profiles")
      .select("id, full_name, blood_type")
      .in("blood_type", targetTypes);

    if (!matchingProfiles || matchingProfiles.length === 0) {
      await sb.from("blood_demand_campaigns").update({ contacted_count: 0 }).eq("id", campaign_id);
      return new Response(JSON.stringify({ ok: true, contacted: 0, message: "No matching donors found" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Filter to patients only
    const userIds = matchingProfiles.map(p => p.id);
    const { data: patientRoles } = await sb.from("user_roles").select("user_id").in("user_id", userIds).eq("role", "patient");
    const patientIds = new Set((patientRoles || []).map(r => r.user_id));
    const recipients = matchingProfiles.filter(p => patientIds.has(p.id));

    const urgencyLabel = campaign.urgency === "critical" ? "URGENT" : campaign.urgency === "high" ? "High priority" : "Normal";
    const title = `Blood donation needed: ${campaign.blood_type}`;
    const message = `${urgencyLabel} — ${campaign.units_needed} unit(s) of ${campaign.blood_type} needed.${campaign.message ? " " + campaign.message : ""}`;

    // Insert in-app notifications in bulk
    const notifRows = recipients.map(r => ({
      user_id: r.id,
      title,
      message,
      type: "system" as const,
      link: "/blood-donation",
    }));
    if (notifRows.length > 0) {
      await sb.from("notifications").insert(notifRows);
    }

    // Send emails (best effort, parallel, capped)
    const userResults = await Promise.all(recipients.map(r => sb.auth.admin.getUserById(r.id)));
    const emails = userResults.map((u, i) => ({ email: u.data?.user?.email, name: recipients[i].full_name })).filter(e => !!e.email);

    const apiKey = Deno.env.get("RESEND_API_KEY");
    const FROM = Deno.env.get("EMAIL_FROM") || "PHI Tetovo <onboarding@resend.dev>";
    const NAVY = "#1E3A8A";
    const BG = "#F5F7FA";
    const urgencyColor = campaign.urgency === "critical" ? "#dc2626" : campaign.urgency === "high" ? "#f59e0b" : NAVY;

    const renderHtml = (name: string) => `<!doctype html><html><body style="margin:0;padding:0;background:${BG};font-family:Inter,Arial,sans-serif;color:#0f172a;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:32px 0;"><tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(15,23,42,.06);">
        <tr><td style="background:${NAVY};padding:20px 28px;color:#fff;font-size:18px;font-weight:700;">PHI Clinical Hospital Tetovo</td></tr>
        <tr><td style="padding:28px;font-size:15px;line-height:1.6;">
          <div style="display:inline-block;background:${urgencyColor};color:#fff;padding:4px 12px;border-radius:9999px;font-size:12px;font-weight:700;margin-bottom:12px;">${urgencyLabel}</div>
          <h2 style="margin:0 0 12px;color:${NAVY};font-size:22px;">Blood donation request: ${campaign.blood_type}</h2>
          <p>Hello <b>${name || "donor"}</b>,</p>
          <p>Our blood bank is in need of <b>${campaign.units_needed} unit(s) of ${campaign.blood_type}</b> blood. Your blood type matches this request, and your donation could save a life.</p>
          ${campaign.message ? `<p style="background:${BG};border-radius:12px;padding:14px 16px;color:#334155;">${campaign.message}</p>` : ""}
          <p style="margin:18px 0;"><a href="https://phi-tetovo.com/blood-donation" style="display:inline-block;background:${NAVY};color:#fff;text-decoration:none;padding:12px 22px;border-radius:9999px;font-weight:600;">Sign up to donate</a></p>
          <p style="color:#64748b;">Best regards,<br/>PHI Tetovo Blood Bank</p>
        </td></tr>
        <tr><td style="padding:18px 28px;background:${BG};font-size:12px;color:#64748b;text-align:center;border-top:1px solid #e2e8f0;">
          Rr. Ilindenit pn, Tetovo · +389 44 333 000 · Emergency 194<br/>
          <span style="color:#94a3b8;">Powered by Optimus Solutions</span>
        </td></tr>
      </table></td></tr></table></body></html>`;

    let emailsSent = 0;
    if (apiKey && emails.length > 0) {
      await Promise.all(emails.map(async (e) => {
        try {
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
            body: JSON.stringify({
              from: FROM, to: [e.email], subject: `${urgencyLabel}: ${campaign.blood_type} blood donation needed`, html: renderHtml(e.name || ""),
            }),
          });
          if (res.ok) emailsSent++;
        } catch (_) { /* swallow */ }
      }));
    }

    await sb.from("blood_demand_campaigns").update({ contacted_count: recipients.length }).eq("id", campaign_id);

    return new Response(JSON.stringify({ ok: true, contacted: recipients.length, emails_sent: emailsSent }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("notify-blood-donors error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
