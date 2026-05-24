import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DEPARTMENTS = [
  "Cardiology", "Neurology", "Pediatrics", "Orthopedics", "Gastroenterology",
  "Dermatology", "Ophthalmology", "Pulmonology", "Gynecology", "Urology",
  "ENT", "Endocrinology", "Oncology", "Psychiatry", "Rheumatology",
  "General Medicine", "Emergency", "Surgery",
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, language = "en" } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const langInstruction =
      language === "sq" ? "Reply in Albanian (Shqip)." :
      language === "mk" ? "Reply in Macedonian (Македонски)." :
      "Reply in English.";

    const systemPrompt = `You are a friendly hospital triage assistant for PHI Clinical Hospital Tetovo. Your job is to:
1. Listen empathetically to patient symptoms.
2. Ask clarifying questions when needed (duration, severity, location).
3. Recommend the most appropriate department from this list: ${DEPARTMENTS.join(", ")}.
4. Flag emergency red-flags (chest pain with sweating, stroke signs, severe bleeding, breathing difficulty) and direct to Emergency immediately.
5. ${langInstruction}
6. Keep responses concise (2-4 sentences).
7. NEVER diagnose. NEVER prescribe. Always end recommendations with a gentle disclaimer that this is informational only and a doctor's visit is required.
8. When confident about a department, include a single line at the end formatted exactly as: [DEPARTMENT: <name>] using one of the listed departments.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, try again later" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    // Extract department tag
    const match = content.match(/\[DEPARTMENT:\s*([^\]]+)\]/i);
    const department = match ? match[1].trim() : null;
    const cleanText = content.replace(/\[DEPARTMENT:[^\]]+\]/i, "").trim();

    return new Response(JSON.stringify({ text: cleanText, department }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("symptom-triage error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
