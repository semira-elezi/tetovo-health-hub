import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type BloodStock = {
  id: string;
  blood_type: string;
  level: string;
  units: number;
  updated_at: string;
};

export function useBloodStock() {
  return useQuery({
    queryKey: ["blood-stock"],
    queryFn: async (): Promise<BloodStock[]> => {
      const { data, error } = await supabase
        .from("blood_stock")
        .select("*")
        .order("blood_type");
      if (error) throw error;
      return (data || []) as BloodStock[];
    },
  });
}
