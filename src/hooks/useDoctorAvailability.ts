import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays } from "date-fns";

export type DoctorAvailability = {
  doctor_id: string;
  doctor_name: string;
  specialization: string | null;
  department: string | null;
  image_url: string | null;
  next_slot_date: string;
  next_slot_time: string;
  available_today: number;
};

export function useDoctorAvailability() {
  return useQuery({
    queryKey: ["doctor-availability-public"],
    queryFn: async (): Promise<DoctorAvailability[]> => {
      const today = format(new Date(), "yyyy-MM-dd");
      const end = format(addDays(new Date(), 14), "yyyy-MM-dd");

      const { data: slots, error } = await supabase
        .from("time_slots")
        .select("doctor_id, slot_date, start_time, is_available")
        .gte("slot_date", today)
        .lte("slot_date", end)
        .eq("is_available", true)
        .order("slot_date", { ascending: true })
        .order("start_time", { ascending: true })
        .limit(500);

      if (error) throw error;
      if (!slots || slots.length === 0) return [];

      const doctorIds = Array.from(new Set(slots.map((s) => s.doctor_id)));
      const { data: doctors } = await supabase
        .from("doctors")
        .select("id, full_name, specialization, image_url, departments(name_en, name_sq, name_mk)")
        .in("id", doctorIds)
        .eq("is_active", true);

      const docMap = new Map((doctors || []).map((d: any) => [d.id, d]));

      const grouped = new Map<string, DoctorAvailability>();
      for (const s of slots) {
        const d = docMap.get(s.doctor_id);
        if (!d) continue;
        if (!grouped.has(s.doctor_id)) {
          grouped.set(s.doctor_id, {
            doctor_id: s.doctor_id,
            doctor_name: d.full_name,
            specialization: d.specialization,
            department: d.departments?.name_en || null,
            image_url: d.image_url,
            next_slot_date: s.slot_date,
            next_slot_time: s.start_time,
            available_today: s.slot_date === today ? 1 : 0,
          });
        } else if (s.slot_date === today) {
          grouped.get(s.doctor_id)!.available_today += 1;
        }
      }

      return Array.from(grouped.values()).slice(0, 6);
    },
  });
}
