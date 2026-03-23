import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useDoctors(departmentId?: string) {
  return useQuery({
    queryKey: ["doctors", departmentId],
    queryFn: async () => {
      let query = supabase
        .from("doctors")
        .select("*, departments(name_en, slug)")
        .eq("is_active", true)
        .order("full_name");

      if (departmentId) {
        query = query.eq("department_id", departmentId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}
