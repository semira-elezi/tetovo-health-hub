import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useDepartments(category?: string) {
  return useQuery({
    queryKey: ["departments", category],
    queryFn: async () => {
      let query = supabase
        .from("departments")
        .select("*")
        .eq("is_active", true)
        .order("name_en");

      if (category && category !== "All") {
        query = query.eq("category", category as any);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useDepartment(slug: string) {
  return useQuery({
    queryKey: ["department", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("departments")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
}
