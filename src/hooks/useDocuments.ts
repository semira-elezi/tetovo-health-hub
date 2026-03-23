import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useDocuments(category?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["documents", user?.id, category],
    queryFn: async () => {
      let query = supabase
        .from("documents")
        .select("*, doctors(full_name)")
        .eq("patient_id", user!.id)
        .order("created_at", { ascending: false });

      if (category) {
        query = query.eq("category", category as any);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}
