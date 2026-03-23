import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useLabResults(status?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["lab_results", user?.id, status],
    queryFn: async () => {
      let query = supabase
        .from("lab_results")
        .select("*, doctors(full_name)")
        .eq("patient_id", user!.id)
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}
