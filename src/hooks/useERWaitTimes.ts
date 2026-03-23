import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export function useERWaitTimes() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["er_wait_times"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("er_wait_times")
        .select("*")
        .order("department");
      if (error) throw error;
      return data;
    },
  });

  // Realtime updates
  useEffect(() => {
    const channel = supabase
      .channel("er-wait-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "er_wait_times" },
        () => queryClient.invalidateQueries({ queryKey: ["er_wait_times"] })
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return query;
}
