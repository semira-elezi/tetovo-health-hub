import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Upload, FileText, Trash2, Download, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const CATS = [
  { v: "medical_record", l: "Medical Record" },
  { v: "lab_result", l: "Lab Result" },
  { v: "prescription", l: "Prescription" },
  { v: "imaging", l: "Imaging" },
  { v: "other", l: "Other" },
];

export default function PatientDocumentUpload() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("medical_record");
  const [uploading, setUploading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["patient-uploaded-docs", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from("documents").select("*").eq("patient_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const upload = async (file: File) => {
    if (!user) return;
    if (!title) { toast.error("Add a title first"); return; }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error: upErr } = await supabase.storage.from("lab-results").upload(path, file);
    if (upErr) { toast.error(upErr.message); setUploading(false); return; }
    const { data: pub } = supabase.storage.from("lab-results").getPublicUrl(path);
    const { error } = await supabase.from("documents").insert({
      patient_id: user.id, title, category: category as any, file_url: pub.publicUrl, file_type: file.type,
    });
    setUploading(false);
    if (error) toast.error(error.message);
    else { toast.success("Uploaded"); setTitle(""); qc.invalidateQueries({ queryKey: ["patient-uploaded-docs"] }); if (fileInput.current) fileInput.current.value = ""; }
  };

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("documents").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["patient-uploaded-docs"] }); toast.success("Removed"); },
  });

  return (
    <Card><CardContent className="pt-6 space-y-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_180px_auto]">
        <Input placeholder="Document title" value={title} onChange={e => setTitle(e.target.value)} />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{CATS.map(c => <SelectItem key={c.v} value={c.v}>{c.l}</SelectItem>)}</SelectContent>
        </Select>
        <Button onClick={() => fileInput.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Upload className="h-4 w-4 mr-1.5" />}Upload
        </Button>
        <input ref={fileInput} type="file" accept="application/pdf,image/*" hidden onChange={e => e.target.files?.[0] && upload(e.target.files[0])} />
      </div>

      {isLoading ? <Skeleton className="h-20" /> : !data?.length ? <p className="text-center text-sm text-muted-foreground py-6"><FileText className="h-8 w-8 mx-auto opacity-30 mb-2" />No documents uploaded</p> : (
        <div className="space-y-2">
          {data.map((d: any) => (
            <div key={d.id} className="flex items-center justify-between rounded-xl border p-3">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="h-5 w-5 text-primary shrink-0" />
                <div className="min-w-0"><p className="font-medium text-sm truncate">{d.title}</p><p className="text-xs text-muted-foreground">{d.category} · {new Date(d.created_at).toLocaleDateString()}</p></div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {d.file_url && <a href={d.file_url} target="_blank" rel="noreferrer"><Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button></a>}
                <Button variant="ghost" size="icon" onClick={() => del.mutate(d.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </CardContent></Card>
  );
}
