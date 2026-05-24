import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, AlertCircle, Shield, Activity, Syringe, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const sb: any = supabase;

function useList(table: string, patientId?: string) {
  return useQuery({
    queryKey: [table, patientId],
    enabled: !!patientId,
    queryFn: async () => {
      const { data, error } = await sb.from(table).select("*").eq("patient_id", patientId).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

function useDel(table: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await sb.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [table] }); toast.success("Deleted"); },
  });
}

function useAdd(table: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: any) => {
      const { error } = await sb.from(table).insert(row);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [table] }); toast.success("Saved"); },
    onError: (e: any) => toast.error(e.message || "Save failed"),
  });
}

export default function PatientHealthProfile() {
  return (
    <Tabs defaultValue="emergency" className="w-full">
      <TabsList className="flex w-full justify-start overflow-x-auto">
        <TabsTrigger value="emergency"><Phone className="h-3.5 w-3.5 mr-1.5" />Emergency</TabsTrigger>
        <TabsTrigger value="insurance"><Shield className="h-3.5 w-3.5 mr-1.5" />Insurance</TabsTrigger>
        <TabsTrigger value="allergies"><AlertCircle className="h-3.5 w-3.5 mr-1.5" />Allergies</TabsTrigger>
        <TabsTrigger value="conditions"><Activity className="h-3.5 w-3.5 mr-1.5" />Conditions</TabsTrigger>
        <TabsTrigger value="vaccinations"><Syringe className="h-3.5 w-3.5 mr-1.5" />Vaccines</TabsTrigger>
      </TabsList>

      <TabsContent value="emergency" className="mt-4"><EmergencyContactsPanel /></TabsContent>
      <TabsContent value="insurance" className="mt-4"><InsurancePanel /></TabsContent>
      <TabsContent value="allergies" className="mt-4"><AllergiesPanel /></TabsContent>
      <TabsContent value="conditions" className="mt-4"><ConditionsPanel /></TabsContent>
      <TabsContent value="vaccinations" className="mt-4"><VaccinationsPanel /></TabsContent>
    </Tabs>
  );
}

function EmergencyContactsPanel() {
  const { user } = useAuth();
  const { data, isLoading } = useList("emergency_contacts", user?.id);
  const add = useAdd("emergency_contacts");
  const del = useDel("emergency_contacts");
  const [form, setForm] = useState({ full_name: "", phone: "", relationship: "" });

  return (
    <Card><CardContent className="pt-6 space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Input placeholder="Full name" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
        <Input placeholder="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
        <div className="flex gap-2">
          <Input placeholder="Relationship" value={form.relationship} onChange={e => setForm(f => ({ ...f, relationship: e.target.value }))} />
          <Button size="icon" onClick={() => { if (!form.full_name || !form.phone) return; add.mutate({ ...form, patient_id: user!.id }, { onSuccess: () => setForm({ full_name: "", phone: "", relationship: "" }) }); }}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {isLoading ? <Skeleton className="h-20" /> : !data?.length ? <p className="text-center text-sm text-muted-foreground py-4">No emergency contacts</p> : (
        <div className="space-y-2">
          {data.map((c: any) => (
            <div key={c.id} className="flex items-center justify-between rounded-xl border p-3">
              <div><p className="font-medium text-sm">{c.full_name}</p><p className="text-xs text-muted-foreground">{c.phone} · {c.relationship}</p></div>
              <Button variant="ghost" size="icon" onClick={() => del.mutate(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          ))}
        </div>
      )}
    </CardContent></Card>
  );
}

function InsurancePanel() {
  const { user } = useAuth();
  const { data, isLoading } = useList("insurance_info", user?.id);
  const add = useAdd("insurance_info");
  const del = useDel("insurance_info");
  const [form, setForm] = useState({ provider: "", policy_number: "", group_number: "", expiry_date: "" });

  return (
    <Card><CardContent className="pt-6 space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Input placeholder="Provider" value={form.provider} onChange={e => setForm(f => ({ ...f, provider: e.target.value }))} />
        <Input placeholder="Policy number" value={form.policy_number} onChange={e => setForm(f => ({ ...f, policy_number: e.target.value }))} />
        <Input placeholder="Group number" value={form.group_number} onChange={e => setForm(f => ({ ...f, group_number: e.target.value }))} />
        <div className="flex gap-2"><Input type="date" value={form.expiry_date} onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))} />
          <Button size="icon" onClick={() => { if (!form.provider) return; add.mutate({ ...form, expiry_date: form.expiry_date || null, patient_id: user!.id }, { onSuccess: () => setForm({ provider: "", policy_number: "", group_number: "", expiry_date: "" }) }); }}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {isLoading ? <Skeleton className="h-20" /> : !data?.length ? <p className="text-center text-sm text-muted-foreground py-4">No insurance on file</p> : (
        <div className="space-y-2">
          {data.map((i: any) => (
            <div key={i.id} className="flex items-center justify-between rounded-xl border p-3">
              <div><p className="font-medium text-sm">{i.provider}</p><p className="text-xs text-muted-foreground">Policy: {i.policy_number || "—"} {i.expiry_date && `· exp ${i.expiry_date}`}</p></div>
              <Button variant="ghost" size="icon" onClick={() => del.mutate(i.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          ))}
        </div>
      )}
    </CardContent></Card>
  );
}

function AllergiesPanel() {
  const { user } = useAuth();
  const { data, isLoading } = useList("allergies", user?.id);
  const add = useAdd("allergies");
  const del = useDel("allergies");
  const [form, setForm] = useState({ allergen: "", reaction: "", severity: "mild" });
  const sevColor: Record<string, string> = { mild: "bg-green-500/10 text-green-700 dark:text-green-300", moderate: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300", severe: "bg-red-500/10 text-red-700 dark:text-red-300" };

  return (
    <Card><CardContent className="pt-6 space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Input placeholder="Allergen" value={form.allergen} onChange={e => setForm(f => ({ ...f, allergen: e.target.value }))} />
        <Input placeholder="Reaction" value={form.reaction} onChange={e => setForm(f => ({ ...f, reaction: e.target.value }))} />
        <div className="flex gap-2">
          <Select value={form.severity} onValueChange={v => setForm(f => ({ ...f, severity: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="mild">Mild</SelectItem><SelectItem value="moderate">Moderate</SelectItem><SelectItem value="severe">Severe</SelectItem>
            </SelectContent>
          </Select>
          <Button size="icon" onClick={() => { if (!form.allergen) return; add.mutate({ ...form, patient_id: user!.id }, { onSuccess: () => setForm({ allergen: "", reaction: "", severity: "mild" }) }); }}><Plus className="h-4 w-4" /></Button>
        </div>
      </div>
      {isLoading ? <Skeleton className="h-20" /> : !data?.length ? <p className="text-center text-sm text-muted-foreground py-4">No allergies recorded</p> : (
        <div className="space-y-2">
          {data.map((a: any) => (
            <div key={a.id} className="flex items-center justify-between rounded-xl border p-3">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sevColor[a.severity]}`}>{a.severity}</span>
                <div><p className="font-medium text-sm">{a.allergen}</p><p className="text-xs text-muted-foreground">{a.reaction}</p></div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => del.mutate(a.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          ))}
        </div>
      )}
    </CardContent></Card>
  );
}

function ConditionsPanel() {
  const { user } = useAuth();
  const { data, isLoading } = useList("chronic_conditions", user?.id);
  const add = useAdd("chronic_conditions");
  const del = useDel("chronic_conditions");
  const [form, setForm] = useState({ condition: "", diagnosed_date: "", notes: "" });

  return (
    <Card><CardContent className="pt-6 space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Input placeholder="Condition" value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))} />
        <Input type="date" value={form.diagnosed_date} onChange={e => setForm(f => ({ ...f, diagnosed_date: e.target.value }))} />
        <div className="flex gap-2">
          <Input placeholder="Notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          <Button size="icon" onClick={() => { if (!form.condition) return; add.mutate({ ...form, diagnosed_date: form.diagnosed_date || null, patient_id: user!.id }, { onSuccess: () => setForm({ condition: "", diagnosed_date: "", notes: "" }) }); }}><Plus className="h-4 w-4" /></Button>
        </div>
      </div>
      {isLoading ? <Skeleton className="h-20" /> : !data?.length ? <p className="text-center text-sm text-muted-foreground py-4">No conditions recorded</p> : (
        <div className="space-y-2">
          {data.map((c: any) => (
            <div key={c.id} className="flex items-center justify-between rounded-xl border p-3">
              <div><p className="font-medium text-sm">{c.condition}</p><p className="text-xs text-muted-foreground">{c.diagnosed_date && `Diagnosed ${c.diagnosed_date} · `}{c.notes}</p></div>
              <Button variant="ghost" size="icon" onClick={() => del.mutate(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          ))}
        </div>
      )}
    </CardContent></Card>
  );
}

function VaccinationsPanel() {
  const { user } = useAuth();
  const { data, isLoading } = useList("vaccinations", user?.id);
  const add = useAdd("vaccinations");
  const del = useDel("vaccinations");
  const [form, setForm] = useState({ vaccine_name: "", administered_date: "", next_dose_date: "", lot_number: "" });

  return (
    <Card><CardContent className="pt-6 space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Input placeholder="Vaccine name" value={form.vaccine_name} onChange={e => setForm(f => ({ ...f, vaccine_name: e.target.value }))} />
        <Input type="date" value={form.administered_date} onChange={e => setForm(f => ({ ...f, administered_date: e.target.value }))} placeholder="Date" />
        <Input type="date" value={form.next_dose_date} onChange={e => setForm(f => ({ ...f, next_dose_date: e.target.value }))} placeholder="Next dose" />
        <div className="flex gap-2">
          <Input placeholder="Lot #" value={form.lot_number} onChange={e => setForm(f => ({ ...f, lot_number: e.target.value }))} />
          <Button size="icon" onClick={() => { if (!form.vaccine_name || !form.administered_date) return; add.mutate({ ...form, next_dose_date: form.next_dose_date || null, patient_id: user!.id }, { onSuccess: () => setForm({ vaccine_name: "", administered_date: "", next_dose_date: "", lot_number: "" }) }); }}><Plus className="h-4 w-4" /></Button>
        </div>
      </div>
      {isLoading ? <Skeleton className="h-20" /> : !data?.length ? <p className="text-center text-sm text-muted-foreground py-4">No vaccinations recorded</p> : (
        <div className="space-y-2">
          {data.map((v: any) => (
            <div key={v.id} className="flex items-center justify-between rounded-xl border p-3">
              <div>
                <p className="font-medium text-sm">{v.vaccine_name}</p>
                <p className="text-xs text-muted-foreground">Given {v.administered_date}{v.next_dose_date && ` · next ${v.next_dose_date}`}</p>
              </div>
              {v.next_dose_date && new Date(v.next_dose_date) < new Date(Date.now() + 30 * 86400000) && (
                <Badge variant="outline" className="border-yellow-500 text-yellow-700 dark:text-yellow-300 mr-2">Due soon</Badge>
              )}
              <Button variant="ghost" size="icon" onClick={() => del.mutate(v.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          ))}
        </div>
      )}
    </CardContent></Card>
  );
}
