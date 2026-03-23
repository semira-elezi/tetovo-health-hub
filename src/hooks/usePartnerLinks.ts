import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function usePartnerLinks() {
  return useQuery({
    queryKey: ["partner_links"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partner_links")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });
}
