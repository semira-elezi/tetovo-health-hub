import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { toast } from "sonner";

export default function AdminFeedback() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("all");
  const [respondTo, setRespondTo] = useState<any>(null);
  const [response, setResponse] = useState("");

  if (authLoading) return <Layout><div className="container py-20 text-center text-muted-foreground">Loading...</div></Layout>;
  if (!user || !isAdmin) return <Navigate to="/auth/login" replace />;

  const { data: feedback, isLoading } = useQuery({
    queryKey: ["admin-feedback"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feedback")
        .select("*, departments(name_en)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateFeedback = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { error } = await supabase.from("feedback").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-feedback"] }); toast.success("Updated"); },
    onError: () => toast.error("Failed to update"),
  });

  const handleRespond = () => {
    if (!respondTo || !response.trim()) return;
    updateFeedback.mutate({ id: respondTo.id, updates: { admin_response: response } });
    setRespondTo(null);
    setResponse("");
  };

  const filtered = feedback?.filter(f => {
    if (tab === "pending") return f.status === "pending";
    if (tab === "published") return f.is_published;
    if (tab === "rejected") return f.status === "rejected";
    return true;
  }) || [];

  const totalReviews = feedback?.length || 0;
  const avgRating = feedback?.length ? (feedback.reduce((s, f) => s + f.rating, 0) / feedback.length).toFixed(1) : "0";
  const pendingCount = feedback?.filter(f => f.status === "pending").length || 0;

  return (
    <Layout>
      <div className="container py-10">
        <h1 className="text-2xl font-bold mb-6">Feedback Management</h1>

        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-2xl font-bold">{totalReviews}</p>
              <p className="text-xs text-muted-foreground">Total Reviews</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-2xl font-bold">{avgRating} ★</p>
              <p className="text-xs text-muted-foreground">Average Rating</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">Pending Review</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="mt-6">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rating</TableHead>
                      <TableHead>Comment</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-5" /></TableCell></TableRow>
                    )) : filtered.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No feedback found</TableCell></TableRow>
                    ) : filtered.map(f => (
                      <TableRow key={f.id}>
                        <TableCell>
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`h-3.5 w-3.5 ${i < f.rating ? "fill-amber-400 text-amber-400" : "text-muted"}`} />
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{f.comment || "—"}</TableCell>
                        <TableCell>{(f as any).departments?.name_en || "—"}</TableCell>
                        <TableCell className="text-sm">{new Date(f.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={f.is_published ? "default" : f.status === "rejected" ? "destructive" : "secondary"}>
                            {f.is_published ? "Published" : f.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {!f.is_published && f.status !== "rejected" && (
                              <Button size="sm" variant="default" className="text-xs h-7"
                                onClick={() => updateFeedback.mutate({ id: f.id, updates: { is_published: true, status: "published" } })}>
                                Publish
                              </Button>
                            )}
                            {f.status !== "rejected" && (
                              <Button size="sm" variant="destructive" className="text-xs h-7"
                                onClick={() => updateFeedback.mutate({ id: f.id, updates: { is_published: false, status: "rejected" } })}>
                                Reject
                              </Button>
                            )}
                            <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => { setRespondTo(f); setResponse(f.admin_response || ""); }}>
                              <MessageSquare className="h-3 w-3 mr-1" />Respond
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={!!respondTo} onOpenChange={v => !v && setRespondTo(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Admin Response</DialogTitle></DialogHeader>
            <Textarea value={response} onChange={e => setResponse(e.target.value)} rows={4} placeholder="Write your response..." />
            <Button onClick={handleRespond} disabled={updateFeedback.isPending}>{updateFeedback.isPending ? "Saving..." : "Save Response"}</Button>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
