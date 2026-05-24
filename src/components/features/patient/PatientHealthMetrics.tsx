import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const sb: any = supabase;
const METRICS = [
  { key: "blood_pressure", label: "Blood Pressure", unit: "mmHg", textValue: true },
  { key: "weight", label: "Weight", unit: "kg" },
  { key: "glucose", label: "Glucose", unit: "mg/dL" },
  { key: "heart_rate", label: "Heart Rate", unit: "bpm" },
  { key: "temperature", label: "Temperature", unit: "°C" },
  { key: "oxygen", label: "Oxygen Saturation", unit: "%" },
];

export default function PatientHealthMetrics() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [metric, setMetric] = useState("weight");
  const [val, setVal] = useState("");
  const cfg = METRICS.find(m => m.key === metric)!;

  const { data, isLoading } = useQuery({
    queryKey: ["health_metrics", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await sb.from("health_metrics").select("*").eq("patient_id", user!.id).order("recorded_at", { ascending: false }).limit(200);
      if (error) throw error;
      return data;
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      const row: any = { patient_id: user!.id, metric_type: metric, unit: cfg.unit };
      if (cfg.textValue) row.value_text = val; else row.value_numeric = parseFloat(val);
      const { error } = await sb.from("health_metrics").insert(row);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["health_metrics"] }); setVal(""); toast.success("Logged"); },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await sb.from("health_metrics").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["health_metrics"] }),
  });

  const chartData = (data || []).filter((d: any) => d.metric_type === metric && d.value_numeric != null).slice(0, 30).reverse().map((d: any) => ({
    date: new Date(d.recorded_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    value: Number(d.value_numeric),
  }));

  return (
    <Card><CardContent className="pt-6 space-y-4">
      <div className="grid gap-3 sm:grid-cols-[200px_1fr_auto]">
        <Select value={metric} onValueChange={(v) => { setMetric(v); setVal(""); }}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {METRICS.map(m => <SelectItem key={m.key} value={m.key}>{m.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input placeholder={cfg.textValue ? "e.g. 120/80" : `Value in ${cfg.unit}`} value={val} onChange={e => setVal(e.target.value)} />
        <Button onClick={() => { if (!val) return; add.mutate(); }} disabled={add.isPending}><Plus className="h-4 w-4 mr-1" />Log</Button>
      </div>

      {chartData.length > 1 && (
        <div className="h-56 rounded-xl border p-3">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {isLoading ? <Skeleton className="h-32" /> : (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Recent {cfg.label} entries</h4>
          {(data || []).filter((d: any) => d.metric_type === metric).slice(0, 10).map((d: any) => (
            <div key={d.id} className="flex items-center justify-between rounded-xl border p-3 text-sm">
              <span>{d.value_text || d.value_numeric} <span className="text-muted-foreground">{d.unit}</span></span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{new Date(d.recorded_at).toLocaleString()}</span>
                <Button size="icon" variant="ghost" onClick={() => del.mutate(d.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
              </div>
            </div>
          ))}
          {(data || []).filter((d: any) => d.metric_type === metric).length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">No entries yet</p>
          )}
        </div>
      )}
    </CardContent></Card>
  );
}
