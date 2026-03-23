import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSubmitContactMessage() {
  return useMutation({
    mutationFn: async (message: {
      full_name: string;
      email: string;
      subject?: string;
      message: string;
    }) => {
      const { data, error } = await supabase
        .from("contact_messages")
        .insert(message)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
  });
}
