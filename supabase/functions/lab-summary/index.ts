import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { lab_result_id } = await req.json();
    if (!lab_result_id) {
      return new Response(JSON.stringify({ error: "lab_result_id is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Fetch the lab result
    const { data: labResult, error: fetchErr } = await supabase
      .from("lab_results")
      .select("*")
      .eq("id", lab_result_id)
      .single();

    if (fetchErr || !labResult) {
      return new Response(JSON.stringify({ error: "Lab result not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build prompt from lab data
    let prompt = "";
    if (labResult.result_value) {
      prompt = `Lab test results:\n- Test: ${labResult.test_name}\n- Category: ${labResult.test_category || "N/A"}\n- Result: ${labResult.result_value} ${labResult.unit || ""}\n- Reference Range: ${labResult.reference_range || "N/A"}\n- Notes: ${labResult.notes || "None"}`;
    } else {
      prompt = `Lab test: ${labResult.test_name}. No manual values provided. Status: ${labResult.status}.`;
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: "You are a medical lab results summarizer. Write a brief, patient-friendly summary in 2-4 sentences. Use simple language without medical jargon. Highlight any abnormal values. Do NOT provide medical advice or diagnoses. Always end with: 'Please consult your doctor for interpretation.'"
          },
          { role: "user", content: prompt },
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
    const summary = aiData.choices?.[0]?.message?.content || "Summary could not be generated.";

    // Save summary to DB
    const { error: updateErr } = await supabase
      .from("lab_results")
      .update({ summary })
      .eq("id", lab_result_id);

    if (updateErr) {
      console.error("Failed to save summary:", updateErr);
    }

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("lab-summary error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
