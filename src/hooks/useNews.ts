import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useNews(category?: string) {
  return useQuery({
    queryKey: ["news", category],
    queryFn: async () => {
      let query = supabase
        .from("news")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (category && category !== "All") {
        query = query.eq("category", category as any);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useNewsArticle(slug: string) {
  return useQuery({
    queryKey: ["news", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
}
