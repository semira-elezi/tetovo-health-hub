import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { FlaskConical, CheckCircle, Loader2, Upload, FileText, Image, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createNotification } from "@/services/notificationService";
import { uploadLabFile, generateLabSummary } from "@/services/labService";
import { toast } from "sonner";
import { format } from "date-fns";

const STATUS_BADGE: Record<string, "default" | "secondary" | "outline"> = {
  pending: "outline",
  completed: "default",
  reviewed: "secondary",
};

export default function LabResultsPanel({ doctorId }: { doctorId: string }) {
  const queryClient = useQueryClient();
  const [editingResult, setEditingResult] = useState<any>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  const { data: labResults, isLoading } = useQuery({
    queryKey: ["doctor-lab-results-full", doctorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lab_results")
        .select("*, profiles!lab_results_patient_id_fkey(full_name)")
        .eq("doctor_id", doctorId)
        .order("created_at", { ascending: false });
      if (error) {
        const { data: d2, error: e2 } = await supabase
          .from("lab_results")
          .select("*")
          .eq("doctor_id", doctorId)
          .order("created_at", { ascending: false });
        if (e2) throw e2;
        return d2;
      }
      return data;
    },
    enabled: !!doctorId,
  });

  const updateResult = useMutation({
    mutationFn: async (payload: {
      id: string; result_value: string; notes?: string; status: string;
      file_url?: string; file_type?: string; type?: string;
    }) => {
      const updateData: any = {
        result_value: payload.result_value,
        notes: payload.notes || null,
        status: payload.status as any,
      };
      if (payload.file_url) updateData.file_url = payload.file_url;
      if (payload.file_type) updateData.file_type = payload.file_type;
      if (payload.type) updateData.type = payload.type;

      const { error } = await supabase.from("lab_results")
        .update(updateData)
        .eq("id", payload.id);
      if (error) throw error;
    },
    onSuccess: async (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["doctor-lab-results-full"] });
      toast.success("Lab result updated");

      if (vars.status === "completed") {
        const result = labResults?.find((r) => r.id === vars.id);
        if (result) {
          createNotification({
            user_id: result.patient_id,
            title: "Lab Results Available",
            message: `Your ${result.test_name} results are now available.`,
            type: "lab_result",
            link: "/portal",
          }).catch(() => {});

          // Generate AI summary in background
          generateLabSummary(vars.id).then(() => {
            queryClient.invalidateQueries({ queryKey: ["doctor-lab-results-full"] });
          }).catch(() => {});
        }
      }
      setEditingResult(null);
    },
    onError: (err: any) => toast.error(err.message || "Failed to update"),
  });

  const filtered = labResults?.filter((r) => {
    if (filter === "all") return true;
    return r.status === filter;
  }) || [];

  const pendingCount = labResults?.filter((r) => r.status === "pending").length || 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FlaskConical className="h-5 w-5" /> Lab Results
          {pendingCount > 0 && (
            <Badge variant="destructive" className="text-xs">{pendingCount} pending</Badge>
          )}
        </h2>
        <div className="flex gap-1">
          {(["all", "pending", "completed"] as const).map((f) => (
            <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" className="text-xs h-7"
              onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No lab results found</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <Card key={r.id} className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-center gap-4 py-3 px-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted shrink-0">
                  <FlaskConical className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{r.test_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(r as any).profiles?.full_name || "Patient"} · {format(new Date(r.created_at), "MMM d, yyyy")}
                    {r.test_category && ` · ${r.test_category}`}
                    {(r as any).type && (r as any).type !== "manual" && (
                      <span className="ml-1">· 📎 {(r as any).type}</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {r.result_value && (
                    <span className="text-sm font-mono">{r.result_value} {r.unit || ""}</span>
                  )}
                  <Badge variant={STATUS_BADGE[r.status] || "outline"}>{r.status}</Badge>
                  {r.status === "pending" && (
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
                      onClick={() => setEditingResult(r)}>
                      <CheckCircle className="h-3 w-3" /> Enter Results
                    </Button>
                  )}
                  {r.status === "completed" && (
                    <Button size="sm" variant="ghost" className="h-7 text-xs"
                      onClick={() => setEditingResult(r)}>
                      Edit
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {editingResult && (
        <EnterResultDialog
          result={editingResult}
          onClose={() => setEditingResult(null)}
          onSubmit={(values) => updateResult.mutate({ id: editingResult.id, ...values })}
          isPending={updateResult.isPending}
        />
      )}
    </div>
  );
}

function EnterResultDialog({
  result,
  onClose,
  onSubmit,
  isPending,
}: {
  result: any;
  onClose: () => void;
  onSubmit: (vals: {
    result_value: string; notes?: string; status: string;
    file_url?: string; file_type?: string; type?: string;
  }) => void;
  isPending: boolean;
}) {
  const [inputMethod, setInputMethod] = useState<"manual" | "upload" | "both">("manual");
  const [resultValue, setResultValue] = useState(result.result_value || "");
  const [notes, setNotes] = useState(result.notes || "");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>((result as any).file_url || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (f: File | null) => {
    if (!f) { setFile(null); setFilePreview(null); return; }
    const ext = f.name.split(".").pop()?.toLowerCase() || "";
    const allowed = ["pdf", "jpg", "jpeg", "png"];
    if (!allowed.includes(ext)) {
      toast.error("Only PDF, JPG, PNG files are allowed");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB");
      return;
    }
    setFile(f);
    if (ext !== "pdf") {
      setFilePreview(URL.createObjectURL(f));
    } else {
      setFilePreview("pdf");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFileChange(f);
  };

  const handleSubmit = async () => {
    if (inputMethod === "manual" && !resultValue.trim()) {
      toast.error("Please enter a result value");
      return;
    }
    if (inputMethod === "upload" && !file && !filePreview) {
      toast.error("Please upload a file");
      return;
    }

    let fileUrl = (result as any).file_url || undefined;
    let fileType = (result as any).file_type || undefined;

    if (file) {
      setUploading(true);
      try {
        const uploaded = await uploadLabFile(result.patient_id, result.id, file);
        fileUrl = uploaded.url;
        fileType = uploaded.fileType;
      } catch (err: any) {
        toast.error("File upload failed: " + (err.message || "Unknown error"));
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    let type = "manual";
    if (file || fileUrl) {
      type = resultValue.trim() ? "hybrid" : "uploaded";
    }

    onSubmit({
      result_value: resultValue.trim(),
      notes,
      status: "completed",
      file_url: fileUrl,
      file_type: fileType,
      type,
    });
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enter Lab Results</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p><strong>Test:</strong> {result.test_name}</p>
            {result.test_category && <p><strong>Category:</strong> {result.test_category}</p>}
            {result.reference_range && <p><strong>Reference:</strong> {result.reference_range} {result.unit || ""}</p>}
          </div>

          {/* Input method selector */}
          <div className="space-y-2">
            <Label>Input Method</Label>
            <div className="flex gap-2">
              {([
                { value: "manual", label: "Manual", icon: FileText },
                { value: "upload", label: "Upload", icon: Upload },
                { value: "both", label: "Both", icon: CheckCircle },
              ] as const).map(({ value, label, icon: Icon }) => (
                <Button
                  key={value}
                  variant={inputMethod === value ? "default" : "outline"}
                  size="sm"
                  className="flex-1 gap-1.5 text-xs"
                  onClick={() => setInputMethod(value)}
                >
                  <Icon className="h-3.5 w-3.5" />{label}
                </Button>
              ))}
            </div>
          </div>

          {/* Manual entry */}
          {(inputMethod === "manual" || inputMethod === "both") && (
            <div className="space-y-2">
              <Label>Result Value {inputMethod === "manual" && "*"}</Label>
              <Input
                placeholder={`e.g. 95 ${result.unit || ""}`}
                value={resultValue}
                onChange={(e) => setResultValue(e.target.value)}
              />
            </div>
          )}

          {/* File upload */}
          {(inputMethod === "upload" || inputMethod === "both") && (
            <div className="space-y-2">
              <Label>Upload Document</Label>
              <div
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                {filePreview && filePreview !== "pdf" ? (
                  <div className="relative">
                    <img src={filePreview} alt="Preview" className="max-h-40 mx-auto rounded" />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-0 right-0 h-6 w-6"
                      onClick={(e) => { e.stopPropagation(); handleFileChange(null); }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : filePreview === "pdf" || (file && file.name.endsWith(".pdf")) ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="h-8 w-8 text-red-500" />
                    <div className="text-left">
                      <p className="text-sm font-medium">{file?.name || "PDF uploaded"}</p>
                      <p className="text-xs text-muted-foreground">PDF document</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 ml-2"
                      onClick={(e) => { e.stopPropagation(); handleFileChange(null); }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Drag & drop or click to upload
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG (max 10MB)</p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              />
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea placeholder="Observations..." rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <p className="text-xs text-muted-foreground">
            💡 An AI summary will be generated automatically when results are saved.
          </p>

          <Button
            className="w-full"
            disabled={isPending || uploading}
            onClick={handleSubmit}
          >
            {isPending || uploading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{uploading ? "Uploading..." : "Saving..."}</>
            ) : (
              "Save & Notify Patient"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
