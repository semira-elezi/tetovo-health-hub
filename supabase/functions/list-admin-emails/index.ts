// Returns admin user emails (for transactional notifications).
// Public — only returns emails of users with the 'admin' role.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: roles, error } = await sb.from("user_roles").select("user_id").eq("role", "admin");
    if (error) throw error;

    const emails: string[] = [];
    for (const r of roles || []) {
      const { data: u } = await sb.auth.admin.getUserById((r as any).user_id);
      if (u?.user?.email) emails.push(u.user.email);
    }

    return new Response(JSON.stringify({ emails }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("list-admin-emails error:", err);
    return new Response(JSON.stringify({ error: err.message, emails: [] }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
