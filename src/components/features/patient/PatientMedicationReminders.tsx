import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Trash2, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const sb: any = supabase;
const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

export default function PatientMedicationReminders() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState({ medication_name: "", dosage: "", time_of_day: "08:00" });
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 7]);

  const { data, isLoading } = useQuery({
    queryKey: ["medication_reminders", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await sb.from("medication_reminders").select("*").eq("patient_id", user!.id).order("time_of_day");
      if (error) throw error;
      return data;
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await sb.from("medication_reminders").insert({ ...form, days_of_week: days, patient_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["medication_reminders"] }); setForm({ medication_name: "", dosage: "", time_of_day: "08:00" }); toast.success("Reminder added"); },
    onError: (e: any) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await sb.from("medication_reminders").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["medication_reminders"] }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await sb.from("medication_reminders").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["medication_reminders"] }),
  });

  return (
    <Card><CardContent className="pt-6 space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <Input placeholder="Medication" value={form.medication_name} onChange={e => setForm(f => ({ ...f, medication_name: e.target.value }))} />
        <Input placeholder="Dosage" value={form.dosage} onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))} />
        <Input type="time" value={form.time_of_day} onChange={e => setForm(f => ({ ...f, time_of_day: e.target.value }))} />
        <Button onClick={() => { if (!form.medication_name) return; add.mutate(); }}><Plus className="h-4 w-4 mr-1" />Add</Button>
      </div>
      <div className="flex items-center gap-1.5 text-xs">
        <span className="text-muted-foreground mr-1">Repeat:</span>
        {DAYS.map((d, i) => {
          const dayNum = i + 1;
          const active = days.includes(dayNum);
          return (
            <button key={i} onClick={() => setDays(p => active ? p.filter(x => x !== dayNum) : [...p, dayNum])}
              className={`h-7 w-7 rounded-full border text-xs font-medium ${active ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground"}`}>{d}</button>
          );
        })}
      </div>

      {isLoading ? <Skeleton className="h-20" /> : !data?.length ? <p className="text-center text-sm text-muted-foreground py-6"><Bell className="h-8 w-8 mx-auto opacity-30 mb-2" />No reminders set</p> : (
        <div className="space-y-2">
          {data.map((r: any) => (
            <div key={r.id} className="flex items-center justify-between rounded-xl border p-3">
              <div className="flex items-center gap-3">
                <Bell className={`h-4 w-4 ${r.is_active ? "text-primary" : "text-muted-foreground"}`} />
                <div>
                  <p className="font-medium text-sm">{r.medication_name} <span className="text-muted-foreground font-normal">{r.dosage}</span></p>
                  <p className="text-xs text-muted-foreground">{r.time_of_day?.slice(0, 5)} · {(r.days_of_week || []).length}/7 days</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={r.is_active} onCheckedChange={(v) => toggle.mutate({ id: r.id, is_active: v })} />
                <Button size="icon" variant="ghost" onClick={() => del.mutate(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </CardContent></Card>
  );
}
