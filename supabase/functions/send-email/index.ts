// Generic transactional email sender via Resend (PHI Clinical Hospital Tetovo)
// Public function — invoked from client + other edge functions.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Override by setting EMAIL_FROM secret once a domain is verified in Resend
// e.g. EMAIL_FROM="PHI Tetovo <no-reply@yourdomain.com>"
const FROM = Deno.env.get("EMAIL_FROM") || "PHI Tetovo <onboarding@resend.dev>";
const NAVY = "#1E3A8A";
const SOFT = "#3B82F6";
const BG = "#F5F7FA";

type Lang = "sq" | "mk" | "en";

interface SendEmailRequest {
  type: string;
  to?: string;
  userId?: string; // resolved server-side to auth email
  lang?: Lang;
  data?: Record<string, any>;
}

const L = {
  sq: {
    hi: "Përshëndetje",
    regards: "Përshëndetje,\nEkipi i SPK Tetovë",
    poweredBy: "Powered by Optimus Solutions",
    appt_confirm_sub: "Termini juaj është konfirmuar",
    appt_confirm_h: "Termini juaj është rezervuar",
    appt_reminder_sub: "Kujtim: Termini juaj nesër",
    appt_reminder_h: "Kujtim për terminin tuaj",
    appt_status_sub: "Përditësim për terminin tuaj",
    appt_cancelled_sub: "Termini juaj është anuluar",
    appt_cancelled_h: "Termini juaj është anuluar",
    lab_sub: "Rezultatet e analizave janë gati",
    lab_h: "Rezultatet e laboratorit janë në dispozicion",
    presc_sub: "Receta e re elektronike",
    presc_h: "Keni një recetë të re elektronike",
    welcome_sub: "Mirë se vini në SPK Tetovë",
    welcome_h: "Mirë se vini",
    doctor_alert_sub: "Termin i ri i rezervuar",
    doctor_digest_sub: "Orari juaj për sot",
    doctor_welcome_sub: "Llogaria juaj e mjekut është krijuar",
    feedback_sub: "Reagim i ri për moderim",
  },
  mk: {
    hi: "Здраво",
    regards: "Со почит,\nТимот на ЈЗУ Тетово",
    poweredBy: "Powered by Optimus Solutions",
    appt_confirm_sub: "Вашиот термин е потврден",
    appt_confirm_h: "Вашиот термин е резервиран",
    appt_reminder_sub: "Потсетник: Вашиот термин утре",
    appt_reminder_h: "Потсетник за вашиот термин",
    appt_status_sub: "Ажурирање на вашиот термин",
    appt_cancelled_sub: "Вашиот термин е откажан",
    appt_cancelled_h: "Вашиот термин е откажан",
    lab_sub: "Резултатите од анализите се готови",
    lab_h: "Лабораториските резултати се достапни",
    presc_sub: "Нов електронски рецепт",
    presc_h: "Имате нов електронски рецепт",
    welcome_sub: "Добредојдовте во ЈЗУ Тетово",
    welcome_h: "Добредојдовте",
    doctor_alert_sub: "Нов резервиран термин",
    doctor_digest_sub: "Вашиот распоред за денес",
    doctor_welcome_sub: "Вашата докторска сметка е креирана",
    feedback_sub: "Нов фидбек за модерација",
  },
  en: {
    hi: "Hello",
    regards: "Best regards,\nPHI Tetovo Team",
    poweredBy: "Powered by Optimus Solutions",
    appt_confirm_sub: "Your appointment is confirmed",
    appt_confirm_h: "Your appointment is booked",
    appt_reminder_sub: "Reminder: Your appointment tomorrow",
    appt_reminder_h: "Appointment reminder",
    appt_status_sub: "Appointment update",
    appt_cancelled_sub: "Your appointment was cancelled",
    appt_cancelled_h: "Your appointment was cancelled",
    lab_sub: "Your lab results are ready",
    lab_h: "Lab results available",
    presc_sub: "New e-prescription issued",
    presc_h: "You have a new e-prescription",
    welcome_sub: "Welcome to PHI Tetovo",
    welcome_h: "Welcome",
    doctor_alert_sub: "New appointment booked",
    doctor_digest_sub: "Your schedule for today",
    doctor_welcome_sub: "Your doctor account has been created",
    feedback_sub: "New feedback to moderate",
  },
} as const;

const shell = (title: string, bodyHtml: string) => `<!doctype html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/>
<title>${title}</title></head>
<body style="margin:0;padding:0;background:${BG};font-family:Inter,Arial,Helvetica,sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:32px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(15,23,42,.06);">
        <tr><td style="background:${NAVY};padding:20px 28px;color:#fff;font-size:18px;font-weight:700;letter-spacing:.2px;">PHI Clinical Hospital Tetovo</td></tr>
        <tr><td style="padding:28px;font-size:15px;line-height:1.6;">${bodyHtml}</td></tr>
        <tr><td style="padding:18px 28px;background:${BG};font-size:12px;color:#64748b;text-align:center;border-top:1px solid #e2e8f0;">
          Rr. Ilindenit pn, Tetovo · +389 44 333 000 · Emergency 194<br/>
          <span style="color:#94a3b8;">Powered by Optimus Solutions</span>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

const button = (href: string, label: string) =>
  `<a href="${href}" style="display:inline-block;background:${NAVY};color:#fff;text-decoration:none;padding:12px 22px;border-radius:9999px;font-weight:600;font-size:14px;">${label}</a>`;

const infoRow = (k: string, v: string) =>
  `<tr><td style="padding:6px 0;color:#64748b;width:140px;">${k}</td><td style="padding:6px 0;color:#0f172a;font-weight:600;">${v}</td></tr>`;

const esc = (s: any) => String(s ?? "").replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]!));

function render(type: string, lang: Lang, data: Record<string, any>): { subject: string; html: string } {
  const t = L[lang];
  const portalUrl = data.portalUrl || "https://phi-tetovo.com/portal";

  const apptBlock = () => `
    <table cellpadding="0" cellspacing="0" style="width:100%;margin:18px 0;background:${BG};border-radius:12px;padding:16px;">
      ${infoRow(lang === "sq" ? "Mjeku" : lang === "mk" ? "Доктор" : "Doctor", esc(data.doctorName))}
      ${infoRow(lang === "sq" ? "Departamenti" : lang === "mk" ? "Оддел" : "Department", esc(data.department))}
      ${infoRow(lang === "sq" ? "Data" : lang === "mk" ? "Датум" : "Date", esc(data.date))}
      ${infoRow(lang === "sq" ? "Ora" : lang === "mk" ? "Време" : "Time", esc(data.time))}
    </table>`;

  switch (type) {
    case "appointment_confirm":
      return {
        subject: t.appt_confirm_sub,
        html: shell(t.appt_confirm_sub, `
          <h2 style="margin:0 0 12px;color:${NAVY};font-size:22px;">${t.appt_confirm_h}</h2>
          <p>${t.hi} <b>${esc(data.patientName)}</b>,</p>
          ${apptBlock()}
          <p style="margin-bottom:22px;">${button(portalUrl, lang === "sq" ? "Shiko në portal" : lang === "mk" ? "Види во портал" : "View in portal")}</p>
          <p style="color:#64748b;white-space:pre-line;">${t.regards}</p>`),
      };

    case "appointment_reminder":
      return {
        subject: t.appt_reminder_sub,
        html: shell(t.appt_reminder_sub, `
          <h2 style="margin:0 0 12px;color:${NAVY};font-size:22px;">${t.appt_reminder_h}</h2>
          <p>${t.hi} <b>${esc(data.patientName)}</b>,</p>
          <p>${lang === "sq" ? "Ky është një kujtim miqësor për terminin tuaj nesër." : lang === "mk" ? "Ова е пријателски потсетник за вашиот термин утре." : "This is a friendly reminder about your appointment tomorrow."}</p>
          ${apptBlock()}
          <p style="margin-bottom:22px;">${button(portalUrl, lang === "sq" ? "Menaxho terminin" : lang === "mk" ? "Управувај термин" : "Manage appointment")}</p>
          <p style="color:#64748b;white-space:pre-line;">${t.regards}</p>`),
      };

    case "appointment_status":
      return {
        subject: t.appt_status_sub,
        html: shell(t.appt_status_sub, `
          <h2 style="margin:0 0 12px;color:${NAVY};font-size:22px;">${t.appt_status_sub}</h2>
          <p>${t.hi} <b>${esc(data.patientName)}</b>,</p>
          <p>${lang === "sq" ? "Statusi i terminit tuaj është përditësuar në" : lang === "mk" ? "Статусот на вашиот термин е променет во" : "Your appointment status has been updated to"} <b style="color:${SOFT};">${esc(data.status)}</b>.</p>
          ${apptBlock()}
          <p style="margin-bottom:22px;">${button(portalUrl, lang === "sq" ? "Shiko në portal" : lang === "mk" ? "Види во портал" : "View in portal")}</p>
          <p style="color:#64748b;white-space:pre-line;">${t.regards}</p>`),
      };

    case "appointment_cancelled":
      return {
        subject: t.appt_cancelled_sub,
        html: shell(t.appt_cancelled_sub, `
          <h2 style="margin:0 0 12px;color:${NAVY};font-size:22px;">${t.appt_cancelled_h}</h2>
          <p>${t.hi} <b>${esc(data.patientName)}</b>,</p>
          ${apptBlock()}
          ${data.reason ? `<p style="color:#64748b;"><b>${lang === "sq" ? "Arsyeja" : lang === "mk" ? "Причина" : "Reason"}:</b> ${esc(data.reason)}</p>` : ""}
          <p style="margin-bottom:22px;">${button(portalUrl + "/appointments", lang === "sq" ? "Rezervo një tjetër" : lang === "mk" ? "Резервирај нов" : "Book another")}</p>
          <p style="color:#64748b;white-space:pre-line;">${t.regards}</p>`),
      };

    case "lab_results":
      return {
        subject: t.lab_sub,
        html: shell(t.lab_sub, `
          <h2 style="margin:0 0 12px;color:${NAVY};font-size:22px;">${t.lab_h}</h2>
          <p>${t.hi} <b>${esc(data.patientName)}</b>,</p>
          <p>${lang === "sq" ? "Rezultatet e analizave të porositura janë gati. I gjeni në portalin tuaj." : lang === "mk" ? "Резултатите од вашите лабораториски анализи се достапни во вашиот портал." : "Your ordered lab results are now available in your portal."}</p>
          ${data.testName ? `<p><b>${lang === "sq" ? "Analiza" : lang === "mk" ? "Анализа" : "Test"}:</b> ${esc(data.testName)}</p>` : ""}
          <p style="margin:18px 0 22px;">${button(portalUrl, lang === "sq" ? "Shiko rezultatet" : lang === "mk" ? "Види резултати" : "View results")}</p>
          <p style="font-size:12px;color:#64748b;">${lang === "sq" ? "Shënim: Konsultohuni gjithmonë me mjekun tuaj për interpretimin e rezultateve." : lang === "mk" ? "Напомена: Секогаш консултирајте се со вашиот доктор за толкување на резултатите." : "Note: Always consult your doctor for interpretation of results."}</p>
          <p style="color:#64748b;white-space:pre-line;">${t.regards}</p>`),
      };

    case "prescription_issued":
      return {
        subject: t.presc_sub,
        html: shell(t.presc_sub, `
          <h2 style="margin:0 0 12px;color:${NAVY};font-size:22px;">${t.presc_h}</h2>
          <p>${t.hi} <b>${esc(data.patientName)}</b>,</p>
          <p>${lang === "sq" ? "Mjeku juaj ka lëshuar një recetë të re elektronike." : lang === "mk" ? "Вашиот доктор издаде нов електронски рецепт." : "Your doctor has issued a new e-prescription."}</p>
          ${data.medication ? `<p><b>${lang === "sq" ? "Mjekimi" : lang === "mk" ? "Лек" : "Medication"}:</b> ${esc(data.medication)}</p>` : ""}
          <p style="margin:18px 0 22px;">${button(portalUrl, lang === "sq" ? "Shkarko PDF" : lang === "mk" ? "Преземи PDF" : "Download PDF")}</p>
          <p style="color:#64748b;white-space:pre-line;">${t.regards}</p>`),
      };

    case "welcome_patient":
      return {
        subject: t.welcome_sub,
        html: shell(t.welcome_sub, `
          <h2 style="margin:0 0 12px;color:${NAVY};font-size:22px;">${t.welcome_h}, ${esc(data.patientName)}!</h2>
          <p>${lang === "sq" ? "Faleminderit që krijuat llogarinë tuaj. Tani mund të rezervoni termine, të shihni rezultate dhe receta nga portali juaj i pacientit." : lang === "mk" ? "Ви благодариме што ја креиравте вашата сметка. Сега може да резервирате термини, да гледате резултати и рецепти од пациентскиот портал." : "Thank you for creating your account. You can now book appointments and access lab results and e-prescriptions from your patient portal."}</p>
          <p style="margin:18px 0 22px;">${button(portalUrl, lang === "sq" ? "Hap portalin" : lang === "mk" ? "Отвори портал" : "Open portal")}</p>
          <p style="color:#64748b;white-space:pre-line;">${t.regards}</p>`),
      };

    case "doctor_new_booking":
      return {
        subject: t.doctor_alert_sub,
        html: shell(t.doctor_alert_sub, `
          <h2 style="margin:0 0 12px;color:${NAVY};font-size:22px;">${t.doctor_alert_sub}</h2>
          <p>${t.hi} Dr. ${esc(data.doctorName)},</p>
          <p>${lang === "sq" ? "Një pacient sapo rezervoi një termin me ju." : lang === "mk" ? "Пациент токму резервираше термин кај вас." : "A patient just booked an appointment with you."}</p>
          <table cellpadding="0" cellspacing="0" style="width:100%;margin:18px 0;background:${BG};border-radius:12px;padding:16px;">
            ${infoRow(lang === "sq" ? "Pacienti" : lang === "mk" ? "Пациент" : "Patient", esc(data.patientName))}
            ${infoRow(lang === "sq" ? "Data" : lang === "mk" ? "Датум" : "Date", esc(data.date))}
            ${infoRow(lang === "sq" ? "Ora" : lang === "mk" ? "Време" : "Time", esc(data.time))}
            ${data.reason ? infoRow(lang === "sq" ? "Arsyeja" : lang === "mk" ? "Причина" : "Reason", esc(data.reason)) : ""}
          </table>
          <p style="margin-bottom:22px;">${button((data.portalUrl || "https://phi-tetovo.com") + "/doctor/dashboard", lang === "sq" ? "Hap orarin" : lang === "mk" ? "Отвори распоред" : "Open schedule")}</p>`),
      };

    case "doctor_daily_digest": {
      const rows = (data.appointments || []).map((a: any) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-weight:600;color:${NAVY};white-space:nowrap;">${esc(a.time)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;">${esc(a.patientName)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px;">${esc(a.reason || "—")}</td>
        </tr>`).join("");
      return {
        subject: `${t.doctor_digest_sub} (${data.count || 0})`,
        html: shell(t.doctor_digest_sub, `
          <h2 style="margin:0 0 12px;color:${NAVY};font-size:22px;">${t.doctor_digest_sub}</h2>
          <p>${t.hi} Dr. ${esc(data.doctorName)},</p>
          <p>${lang === "sq" ? `Keni ${data.count} termine sot (${esc(data.date)}).` : lang === "mk" ? `Имате ${data.count} термини денес (${esc(data.date)}).` : `You have ${data.count} appointments today (${esc(data.date)}).`}</p>
          ${data.count > 0 ? `<table cellpadding="0" cellspacing="0" style="width:100%;margin:18px 0;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">${rows}</table>` : ""}
          <p style="margin-bottom:22px;">${button((data.portalUrl || "https://phi-tetovo.com") + "/doctor/dashboard", lang === "sq" ? "Hap panelin" : lang === "mk" ? "Отвори панел" : "Open dashboard")}</p>`),
      };
    }

    case "doctor_welcome":
      return {
        subject: t.doctor_welcome_sub,
        html: shell(t.doctor_welcome_sub, `
          <h2 style="margin:0 0 12px;color:${NAVY};font-size:22px;">${t.doctor_welcome_sub}</h2>
          <p>${t.hi} Dr. ${esc(data.doctorName)},</p>
          <p>${lang === "sq" ? "Llogaria juaj në SPK Tetovë është krijuar. Mund të kyçeni dhe të menaxhoni terminet tuaja." : lang === "mk" ? "Вашата сметка во ЈЗУ Тетово е креирана. Може да се најавите и да ги менаџирате термините." : "Your account at PHI Tetovo has been created. You can sign in and manage your appointments."}</p>
          ${data.email ? `<p><b>Email:</b> ${esc(data.email)}</p>` : ""}
          <p style="margin:18px 0 22px;">${button((data.portalUrl || "https://phi-tetovo.com") + "/login", lang === "sq" ? "Kyçu" : lang === "mk" ? "Најави се" : "Sign in")}</p>`),
      };

    case "admin_new_feedback":
      return {
        subject: t.feedback_sub,
        html: shell(t.feedback_sub, `
          <h2 style="margin:0 0 12px;color:${NAVY};font-size:22px;">${t.feedback_sub}</h2>
          <p>${lang === "sq" ? "Një reagim i ri është dorëzuar dhe pret moderim." : lang === "mk" ? "Поднесен е нов фидбек кој чека модерација." : "A new feedback has been submitted and is awaiting moderation."}</p>
          <table cellpadding="0" cellspacing="0" style="width:100%;margin:18px 0;background:${BG};border-radius:12px;padding:16px;">
            ${infoRow(lang === "sq" ? "Vlerësimi" : lang === "mk" ? "Оцена" : "Rating", "★".repeat(Number(data.rating || 0)) + "☆".repeat(5 - Number(data.rating || 0)))}
            ${data.department ? infoRow(lang === "sq" ? "Departamenti" : lang === "mk" ? "Оддел" : "Department", esc(data.department)) : ""}
            ${infoRow(lang === "sq" ? "Komenti" : lang === "mk" ? "Коментар" : "Comment", esc(data.comment || "—"))}
          </table>
          <p style="margin-bottom:22px;">${button((data.portalUrl || "https://phi-tetovo.com") + "/admin/feedback", lang === "sq" ? "Modero" : lang === "mk" ? "Модерирај" : "Moderate")}</p>`),
      };

    default:
      throw new Error(`Unknown email type: ${type}`);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) throw new Error("RESEND_API_KEY not configured");

    const body = (await req.json()) as SendEmailRequest;
    if (!body?.type || (!body?.to && !body?.userId)) {
      return new Response(JSON.stringify({ error: "type and (to or userId) are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Resolve email from userId if needed
    let recipient = body.to;
    if (!recipient && body.userId) {
      const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      const { data: u } = await sb.auth.admin.getUserById(body.userId);
      recipient = u?.user?.email || undefined;
      if (!recipient) {
        return new Response(JSON.stringify({ error: "Could not resolve recipient email" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const lang = (body.lang || "sq") as Lang;
    const { subject, html } = render(body.type, lang, body.data || {});

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        from: FROM,
        to: [recipient],
        subject,
        html,
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      console.error("Resend error", res.status, json);
      return new Response(JSON.stringify({ error: "Resend failed", details: json }), {
        status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, id: json.id }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("send-email error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
