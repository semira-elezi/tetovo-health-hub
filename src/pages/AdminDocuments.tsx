import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Download, Trash2, Upload } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "documents", label: "Documents" },
  { value: "budget", label: "Budget" },
  { value: "quarterly_reports", label: "Quarterly Reports" },
  { value: "annual_financial_reports", label: "Annual Reports" },
  { value: "internal_job_listings", label: "Job Listings" },
  { value: "annual_procurement_plan", label: "Procurement Plan" },
  { value: "procurement_announcements", label: "Announcements" },
  { value: "patient_rights", label: "Patient Rights" },
];

export default function AdminDocuments() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tab, setTab] = useState("documents");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: "", category: "documents", file_url: "", description: "", published_at: new Date().toISOString(),
  });

  if (authLoading) return <Layout><div className="container py-20 text-center text-muted-foreground">Loading...</div></Layout>;
  if (!user || !isAdmin) return <Navigate to="/auth/login" replace />;

  const { data: documents, isLoading } = useQuery({
    queryKey: ["admin-procurement-docs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("procurement_documents").select("*").order("published_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from("public-documents").upload(fileName, file);
    if (error) { toast.error("Upload failed: " + error.message); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("public-documents").getPublicUrl(fileName);
    setForm(f => ({ ...f, file_url: urlData.publicUrl }));
    setUploading(false);
    toast.success("File uploaded!");
  };

  const handleSubmit = async () => {
    if (!form.title) { toast.error("Title is required"); return; }
    const { error } = await supabase.from("procurement_documents").insert({
      title: form.title,
      category: form.category as any,
      file_url: form.file_url || null,
      description: form.description || null,
      published_at: form.published_at,
    });
    if (error) toast.error("Failed: " + error.message);
    else {
      toast.success("Document added!");
      queryClient.invalidateQueries({ queryKey: ["admin-procurement-docs"] });
      setDialogOpen(false);
      setForm({ title: "", category: "documents", file_url: "", description: "", published_at: new Date().toISOString() });
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("procurement_documents").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else { toast.success("Deleted"); queryClient.invalidateQueries({ queryKey: ["admin-procurement-docs"] }); }
  };

  const filtered = documents?.filter(d => d.category === tab) || [];

  return (
    <Layout>
      <div className="container py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Public Documents</h1>
          <Button onClick={() => setDialogOpen(true)} className="gap-2"><Plus className="h-4 w-4" />Upload Document</Button>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="flex-wrap h-auto gap-1">
            {CATEGORIES.map(c => <TabsTrigger key={c.value} value={c.value} className="text-xs">{c.label}</TabsTrigger>)}
          </TabsList>

          <TabsContent value={tab} className="mt-6">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Download</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}><TableCell colSpan={4}><Skeleton className="h-5" /></TableCell></TableRow>
                    )) : filtered.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No documents</TableCell></TableRow>
                    ) : filtered.map(d => (
                      <TableRow key={d.id}>
                        <TableCell className="font-medium">{d.title}</TableCell>
                        <TableCell><Badge variant="outline">{d.published_at ? new Date(d.published_at).getFullYear() : "—"}</Badge></TableCell>
                        <TableCell>
                          {d.file_url ? <a href={d.file_url} target="_blank" rel="noopener noreferrer"><Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button></a> : "—"}
                        </TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader><AlertDialogTitle>Delete document?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(d.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Upload Document</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Title *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>File</Label>
                <div className="flex gap-2">
                  <Input value={form.file_url} onChange={e => setForm(f => ({ ...f, file_url: e.target.value }))} placeholder="File URL" className="flex-1" />
                  <Button variant="outline" size="icon" onClick={() => fileRef.current?.click()} disabled={uploading}>
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                <input ref={fileRef} type="file" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }} />
              </div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} /></div>
              <Button onClick={handleSubmit} disabled={uploading} className="w-full">{uploading ? "Uploading..." : "Add Document"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
