import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar, Users, FileText, Stethoscope, Check, X, Clock, Play,
  CheckCircle, ChevronRight, Pill, User, Loader2
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createNotification } from "@/services/notificationService";
import { createPrescription } from "@/services/prescriptionService";
import Layout from "@/components/layout/Layout";
import { toast } from "sonner";
import { format, isToday, parseISO } from "date-fns";
import { Navigate, Link } from "react-router-dom";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  in_progress: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  no_show: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

export default function DoctorDashboard() {
  const { user, profile, roles, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [selectedApt, setSelectedApt] = useState<any>(null);
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: string; label: string } | null>(null);
  const [rescheduleApt, setRescheduleApt] = useState<any>(null);
  const [prescriptionApt, setPrescriptionApt] = useState<any>(null);
  const [filter, setFilter] = useState("all");

  const isDoctor = roles.includes("doctor") || roles.includes("admin");
  if (authLoading) return <Layout><div className="container py-20 text-center text-muted-foreground">Loading...</div></Layout>;
  if (!user || !isDoctor) return <Navigate to="/auth/login" replace />;

  const { data: doctorRecord } = useQuery({
    queryKey: ["doctor-record", user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doctors")
        .select("*, departments(name_en)")
        .eq("user_id", user.id)
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!user.id,
  });

  const { data: appointments, isLoading: aptsLoading } = useQuery({
    queryKey: ["doctor-appointments", doctorRecord?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*, departments(name_en), profiles!appointments_patient_id_fkey(full_name, phone)")
        .eq("doctor_id", doctorRecord!.id)
        .order("appointment_date", { ascending: true })
        .order("start_time", { ascending: true });
      if (error) {
        // fallback without profiles join
        const { data: d2, error: e2 } = await supabase
          .from("appointments")
          .select("*, departments(name_en)")
          .eq("doctor_id", doctorRecord!.id)
          .order("appointment_date", { ascending: true })
          .order("start_time", { ascending: true });
        if (e2) throw e2;
        return d2;
      }
      return data;
    },
    enabled: !!doctorRecord?.id,
  });

  const { data: labResults } = useQuery({
    queryKey: ["doctor-lab-results", doctorRecord?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lab_results")
        .select("*")
        .eq("doctor_id", doctorRecord!.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: !!doctorRecord?.id,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const updateData: any = { status };
      if (notes) updateData.notes = notes;
      const { error } = await supabase.from("appointments").update(updateData).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["doctor-appointments"] });
      toast.success(`Appointment ${vars.status}`);
      // Notify patient
      const apt = appointments?.find(a => a.id === vars.id);
      if (apt) {
        createNotification({
          user_id: apt.patient_id,
          title: `Appointment ${vars.status}`,
          message: `Your appointment on ${apt.appointment_date} at ${apt.start_time} has been ${vars.status}.`,
          type: "appointment",
          link: "/patient/appointments",
        }).catch(() => {});
      }
    },
    onError: (err: any) => toast.error(err.message || "Failed to update"),
  });

  const reschedule = useMutation({
    mutationFn: async ({ id, date, startTime, endTime }: { id: string; date: string; startTime: string; endTime: string }) => {
      const { error } = await supabase.from("appointments")
        .update({ appointment_date: date, start_time: startTime, end_time: endTime })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["doctor-appointments"] });
      toast.success("Appointment rescheduled");
      const apt = appointments?.find(a => a.id === vars.id);
      if (apt) {
        createNotification({
          user_id: apt.patient_id,
          title: "Appointment Rescheduled",
          message: `Your appointment has been moved to ${vars.date} at ${vars.startTime}.`,
          type: "appointment",
          link: "/patient/appointments",
        }).catch(() => {});
      }
    },
    onError: (err: any) => toast.error(err.message || "Failed to reschedule"),
  });

  const todayApts = appointments?.filter(a => a.appointment_date === format(new Date(), "yyyy-MM-dd")) || [];
  const pendingCount = appointments?.filter(a => a.status === "pending").length || 0;

  const filteredApts = appointments?.filter(a => {
    if (filter === "all") return true;
    if (filter === "today") return a.appointment_date === format(new Date(), "yyyy-MM-dd");
    return a.status === filter;
  }) || [];

  const getPatientName = (a: any) => (a as any).profiles?.full_name || "Patient";

  return (
    <Layout>
      <div className="container py-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome, {doctorRecord?.title || ""} {profile?.full_name || "Doctor"}
              {doctorRecord?.departments && ` · ${(doctorRecord as any).departments.name_en}`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/doctor/schedule"><Calendar className="h-4 w-4 mr-1.5" />Manage Schedule</Link>
            </Button>
            <Badge variant="outline" className="gap-1.5 px-3 py-1.5">
              <Stethoscope className="h-3.5 w-3.5" />Doctor
            </Badge>
          </div>
        </div>

        {!doctorRecord && (
          <Card className="mb-8 border-destructive">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                Your account is not linked to a doctor record yet. Please contact an administrator.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4 mb-8">
          <Card><CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10"><Calendar className="h-5 w-5 text-primary" /></div>
            <div><p className="text-2xl font-bold">{todayApts.length}</p><p className="text-xs text-muted-foreground">Today</p></div>
          </CardContent></Card>
          <Card><CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20"><Clock className="h-5 w-5 text-amber-600" /></div>
            <div><p className="text-2xl font-bold">{pendingCount}</p><p className="text-xs text-muted-foreground">Pending</p></div>
          </CardContent></Card>
          <Card><CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20"><Users className="h-5 w-5 text-green-600" /></div>
            <div><p className="text-2xl font-bold">{appointments?.length || 0}</p><p className="text-xs text-muted-foreground">Total</p></div>
          </CardContent></Card>
          <Card><CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10"><FileText className="h-5 w-5 text-primary" /></div>
            <div><p className="text-2xl font-bold">{labResults?.length || 0}</p><p className="text-xs text-muted-foreground">Lab Results</p></div>
          </CardContent></Card>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground mr-2">Filter:</span>
          {[
            { value: "all", label: "All" },
            { value: "today", label: "Today" },
            { value: "pending", label: "Pending" },
            { value: "confirmed", label: "Confirmed" },
            { value: "in_progress", label: "In Progress" },
            { value: "completed", label: "Completed" },
          ].map(f => (
            <Button key={f.value} variant={filter === f.value ? "default" : "outline"} size="sm"
              onClick={() => setFilter(f.value)} className="text-xs h-7">
              {f.label}
            </Button>
          ))}
        </div>

        {/* Appointment list */}
        <div className="space-y-2">
          {aptsLoading ? (
            Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)
          ) : filteredApts.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No appointments found</CardContent></Card>
          ) : (
            filteredApts.map(a => (
              <Card key={a.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedApt(a)}>
                <CardContent className="flex items-center gap-4 py-3 px-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted shrink-0">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{getPatientName(a)}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.appointment_date} · {a.start_time?.slice(0, 5)} – {a.end_time?.slice(0, 5)}
                      {(a as any).departments?.name_en && ` · ${(a as any).departments.name_en}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Inline quick actions */}
                    {a.status === "pending" && (
                      <>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:bg-green-50"
                          onClick={e => { e.stopPropagation(); setConfirmAction({ id: a.id, action: "confirmed", label: "Confirm" }); }}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:bg-red-50"
                          onClick={e => { e.stopPropagation(); setConfirmAction({ id: a.id, action: "cancelled", label: "Reject" }); }}>
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {a.status === "confirmed" && isToday(parseISO(a.appointment_date)) && (
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
                        onClick={e => { e.stopPropagation(); setConfirmAction({ id: a.id, action: "in_progress", label: "Check In" }); }}>
                        <Play className="h-3 w-3" />Check In
                      </Button>
                    )}
                    {a.status === "in_progress" && (
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-green-600"
                        onClick={e => { e.stopPropagation(); setConfirmAction({ id: a.id, action: "completed", label: "Check Out" }); }}>
                        <CheckCircle className="h-3 w-3" />Check Out
                      </Button>
                    )}
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_COLORS[a.status] || ""}`}>
                      {a.status.replace("_", " ")}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Detail Modal */}
        {selectedApt && (
          <AppointmentDetailModal
            appointment={selectedApt}
            onClose={() => setSelectedApt(null)}
            onAction={(action) => {
              setSelectedApt(null);
              if (action === "reschedule") setRescheduleApt(selectedApt);
              else if (action === "prescribe") setPrescriptionApt(selectedApt);
              else setConfirmAction({ id: selectedApt.id, action, label: action.replace("_", " ") });
            }}
          />
        )}

        {/* Confirm Action Dialog */}
        <AlertDialog open={!!confirmAction} onOpenChange={v => !v && setConfirmAction(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{confirmAction?.label} Appointment?</AlertDialogTitle>
              <AlertDialogDescription>
                {confirmAction?.action === "cancelled"
                  ? "This will cancel the appointment and notify the patient."
                  : confirmAction?.action === "completed"
                  ? "This will mark the appointment as completed. You can write a prescription afterwards."
                  : `This will ${confirmAction?.label?.toLowerCase()} the appointment.`
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction disabled={updateStatus.isPending} onClick={() => {
                if (confirmAction) {
                  updateStatus.mutate({ id: confirmAction.id, status: confirmAction.action });
                  // If completing, offer prescription
                  if (confirmAction.action === "completed") {
                    const apt = appointments?.find(a => a.id === confirmAction.id);
                    if (apt) setTimeout(() => setPrescriptionApt(apt), 500);
                  }
                  setConfirmAction(null);
                }
              }}>
                {updateStatus.isPending ? "Processing..." : confirmAction?.label}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Reschedule Dialog */}
        {rescheduleApt && (
          <RescheduleDialog
            appointment={rescheduleApt}
            onClose={() => setRescheduleApt(null)}
            onSubmit={(date, startTime, endTime) => {
              reschedule.mutate({ id: rescheduleApt.id, date, startTime, endTime });
              setRescheduleApt(null);
            }}
            isPending={reschedule.isPending}
          />
        )}

        {/* Prescription Dialog */}
        {prescriptionApt && doctorRecord && (
          <PrescriptionDialog
            appointment={prescriptionApt}
            doctorId={doctorRecord.id}
            onClose={() => setPrescriptionApt(null)}
          />
        )}
      </div>
    </Layout>
  );
}

/* ==================== Detail Modal ==================== */
function AppointmentDetailModal({ appointment: a, onClose, onAction }: {
  appointment: any; onClose: () => void;
  onAction: (action: string) => void;
}) {
  const patientName = (a as any).profiles?.full_name || "Patient";
  const patientPhone = (a as any).profiles?.phone || "—";

  return (
    <Dialog open onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Appointment Details
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[a.status]}`}>
              {a.status.replace("_", " ")}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-muted-foreground text-xs">Patient</p><p className="font-medium">{patientName}</p></div>
            <div><p className="text-muted-foreground text-xs">Phone</p><p className="font-medium">{patientPhone}</p></div>
            <div><p className="text-muted-foreground text-xs">Date</p><p className="font-medium">{a.appointment_date}</p></div>
            <div><p className="text-muted-foreground text-xs">Time</p><p className="font-medium">{a.start_time?.slice(0, 5)} – {a.end_time?.slice(0, 5)}</p></div>
            <div><p className="text-muted-foreground text-xs">Department</p><p className="font-medium">{(a as any).departments?.name_en || "—"}</p></div>
            <div><p className="text-muted-foreground text-xs">ID</p><p className="font-medium font-mono text-xs">{a.id.slice(0, 8)}</p></div>
          </div>

          {a.reason && (
            <div className="text-sm"><p className="text-muted-foreground text-xs mb-1">Reason</p><p>{a.reason}</p></div>
          )}
          {a.notes && (
            <div className="text-sm"><p className="text-muted-foreground text-xs mb-1">Notes</p><p>{a.notes}</p></div>
          )}

          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {a.status === "pending" && (
              <>
                <Button size="sm" className="gap-1" onClick={() => onAction("confirmed")}>
                  <Check className="h-3.5 w-3.5" />Confirm
                </Button>
                <Button size="sm" variant="destructive" className="gap-1" onClick={() => onAction("cancelled")}>
                  <X className="h-3.5 w-3.5" />Reject
                </Button>
                <Button size="sm" variant="outline" className="gap-1" onClick={() => onAction("reschedule")}>
                  <Clock className="h-3.5 w-3.5" />Reschedule
                </Button>
              </>
            )}
            {a.status === "confirmed" && (
              <>
                {isToday(parseISO(a.appointment_date)) && (
                  <Button size="sm" className="gap-1" onClick={() => onAction("in_progress")}>
                    <Play className="h-3.5 w-3.5" />Check In
                  </Button>
                )}
                <Button size="sm" variant="outline" className="gap-1" onClick={() => onAction("reschedule")}>
                  <Clock className="h-3.5 w-3.5" />Reschedule
                </Button>
                <Button size="sm" variant="destructive" className="gap-1" onClick={() => onAction("cancelled")}>
                  <X className="h-3.5 w-3.5" />Cancel
                </Button>
              </>
            )}
            {a.status === "in_progress" && (
              <Button size="sm" className="gap-1 bg-green-600 hover:bg-green-700" onClick={() => onAction("completed")}>
                <CheckCircle className="h-3.5 w-3.5" />Check Out
              </Button>
            )}
            {a.status === "completed" && (
              <Button size="sm" variant="outline" className="gap-1" onClick={() => onAction("prescribe")}>
                <Pill className="h-3.5 w-3.5" />Write Prescription
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ==================== Reschedule Dialog ==================== */
function RescheduleDialog({ appointment: a, onClose, onSubmit, isPending }: {
  appointment: any; onClose: () => void;
  onSubmit: (date: string, startTime: string, endTime: string) => void;
  isPending: boolean;
}) {
  const [date, setDate] = useState(a.appointment_date);
  const [startTime, setStartTime] = useState(a.start_time?.slice(0, 5) || "09:00");
  const [endTime, setEndTime] = useState(a.end_time?.slice(0, 5) || "10:00");

  return (
    <Dialog open onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Reschedule Appointment</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>New Date</Label><Input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Start</Label><Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} /></div>
            <div className="space-y-2"><Label>End</Label><Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} /></div>
          </div>
          <Button className="w-full" disabled={isPending || !date || !startTime || !endTime}
            onClick={() => onSubmit(date, startTime, endTime)}>
            {isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ==================== Prescription Dialog ==================== */
function PrescriptionDialog({ appointment: a, doctorId, onClose }: {
  appointment: any; doctorId: string; onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [medications, setMedications] = useState([{ name: "", dosage: "", frequency: "", duration: "" }]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const addMed = () => setMedications(m => [...m, { name: "", dosage: "", frequency: "", duration: "" }]);
  const updateMed = (i: number, field: string, value: string) =>
    setMedications(m => m.map((med, j) => j === i ? { ...med, [field]: value } : med));
  const removeMed = (i: number) => setMedications(m => m.filter((_, j) => j !== i));

  const handleSubmit = async () => {
    const validMeds = medications.filter(m => m.name.trim());
    if (validMeds.length === 0) { toast.error("Add at least one medication"); return; }
    setLoading(true);
    try {
      for (const med of validMeds) {
        await createPrescription({
          patient_id: a.patient_id,
          doctor_id: doctorId,
          appointment_id: a.id,
          medication_name: med.name,
          dosage: med.dosage || undefined,
          frequency: med.frequency || undefined,
          duration: med.duration || undefined,
          notes: notes || undefined,
        });
      }
      // Notify patient
      await createNotification({
        user_id: a.patient_id,
        title: "New Prescription",
        message: `Your doctor has issued ${validMeds.length} prescription(s) after your appointment.`,
        type: "system",
        link: "/portal",
      }).catch(() => {});

      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
      toast.success(`${validMeds.length} prescription(s) created`);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to create prescription");
    }
    setLoading(false);
  };

  return (
    <Dialog open onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />Write Prescription
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Patient: <span className="font-medium text-foreground">{(a as any).profiles?.full_name || "Patient"}</span>
            {" · "}Date: <span className="font-medium text-foreground">{a.appointment_date}</span>
          </div>

          {medications.map((med, i) => (
            <Card key={i} className="p-3">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-medium text-muted-foreground">Medication {i + 1}</p>
                {medications.length > 1 && (
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeMed(i)}>
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2">
                  <Input placeholder="Medication name *" value={med.name} onChange={e => updateMed(i, "name", e.target.value)} />
                </div>
                <Input placeholder="Dosage (e.g. 500mg)" value={med.dosage} onChange={e => updateMed(i, "dosage", e.target.value)} />
                <Input placeholder="Frequency (e.g. 2x/day)" value={med.frequency} onChange={e => updateMed(i, "frequency", e.target.value)} />
                <Input placeholder="Duration (e.g. 7 days)" className="col-span-2" value={med.duration} onChange={e => updateMed(i, "duration", e.target.value)} />
              </div>
            </Card>
          ))}

          <Button variant="outline" size="sm" onClick={addMed} className="w-full text-xs">
            + Add Another Medication
          </Button>

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional instructions..." rows={3} />
          </div>

          <Button className="w-full" disabled={loading} onClick={handleSubmit}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : "Create Prescription"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}