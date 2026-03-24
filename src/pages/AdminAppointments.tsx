import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { toast } from "sonner";
import { format } from "date-fns";

const STATUS_BADGE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline", confirmed: "default", in_progress: "secondary", completed: "default", cancelled: "destructive", no_show: "destructive",
};

const PAGE_SIZE = 20;

export default function AdminAppointments() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  if (authLoading) return <Layout><div className="container py-20 text-center text-muted-foreground">Loading...</div></Layout>;
  if (!user || !isAdmin) return <Navigate to="/auth/login" replace />;

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("departments").select("id, name_en").order("name_en");
      if (error) throw error;
      return data;
    },
  });

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["admin-all-appointments", statusFilter, deptFilter, search, page],
    queryFn: async () => {
      let q = supabase
        .from("appointments")
        .select("*, doctors(full_name), departments(name_en)", { count: "exact" })
        .order("appointment_date", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
      if (statusFilter !== "all") q = q.eq("status", statusFilter as any);
      if (deptFilter !== "all") q = q.eq("department_id", deptFilter);
      const { data, error, count } = await q;
      if (error) throw error;
      return { data, count };
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("appointments").update({ status: status as any }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-all-appointments"] }); toast.success("Status updated"); },
    onError: () => toast.error("Failed to update status"),
  });

  const totalPages = Math.ceil((appointments?.count || 0) / PAGE_SIZE);

  const getActions = (a: any) => {
    const actions: { label: string; status: string; variant: "default" | "destructive" | "outline" }[] = [];
    switch (a.status) {
      case "pending":
        actions.push({ label: "Confirm", status: "confirmed", variant: "default" });
        actions.push({ label: "Cancel", status: "cancelled", variant: "destructive" });
        break;
      case "confirmed":
        actions.push({ label: "In Progress", status: "in_progress", variant: "default" });
        actions.push({ label: "Cancel", status: "cancelled", variant: "destructive" });
        actions.push({ label: "No Show", status: "no_show", variant: "outline" });
        break;
      case "in_progress":
        actions.push({ label: "Complete", status: "completed", variant: "default" });
        break;
    }
    return actions;
  };

  return (
    <Layout>
      <div className="container py-10">
        <h1 className="text-2xl font-bold mb-6">Manage Appointments</h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(0); }}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {["pending", "confirmed", "in_progress", "completed", "cancelled", "no_show"].map(s => (
                <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={deptFilter} onValueChange={v => { setDeptFilter(v); setPage(0); }}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments?.map(d => <SelectItem key={d.id} value={d.id}>{d.name_en}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input placeholder="Search..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} className="max-w-xs" />
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Date/Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-5" /></TableCell></TableRow>
                )) : !appointments?.data?.length ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No appointments found</TableCell></TableRow>
                ) : appointments.data.map(a => (
                  <TableRow key={a.id}>
                    <TableCell>{(a as any).departments?.name_en || "—"}</TableCell>
                    <TableCell>{(a as any).doctors?.full_name || "—"}</TableCell>
                    <TableCell className="text-sm">{a.appointment_date} {a.start_time}</TableCell>
                    <TableCell><Badge variant={STATUS_BADGE[a.status] || "secondary"}>{a.status.replace("_", " ")}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {getActions(a).map(action => (
                          action.status === "cancelled" || action.status === "no_show" ? (
                            <AlertDialog key={action.label}>
                              <AlertDialogTrigger asChild>
                                <Button variant={action.variant} size="sm" className="text-xs h-7">{action.label}</Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirm {action.label}</AlertDialogTitle>
                                  <AlertDialogDescription>Are you sure you want to mark this appointment as {action.status.replace("_", " ")}?</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => updateStatus.mutate({ id: a.id, status: action.status })}>Confirm</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          ) : (
                            <Button key={action.label} variant={action.variant} size="sm" className="text-xs h-7"
                              onClick={() => updateStatus.mutate({ id: a.id, status: action.status })} disabled={updateStatus.isPending}>
                              {action.label}
                            </Button>
                          )
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-4">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
            <span className="text-sm text-muted-foreground">Page {page + 1} of {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
