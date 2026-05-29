import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar, Users, FileText, Check, X, Clock, Play,
  CheckCircle, ChevronRight, Pill, Loader2, FlaskConical,
  LayoutDashboard, Settings as SettingsIcon, Plus, Filter, AlertCircle,
  FilePlus, FlaskRound, ClipboardList, BellRing,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createNotification } from "@/services/notificationService";
import { createPrescription } from "@/services/prescriptionService";
import LabOrderDialog from "@/components/features/lab/LabOrderDialog";
import LabResultsPanel from "@/components/features/lab/LabResultsPanel";
import { toast } from "sonner";
import { format, isToday, parseISO } from "date-fns";
import { Navigate, Link } from "react-router-dom";
import PortalShell, { PortalNavItem } from "@/components/portal/PortalShell";
import StatusPill from "@/components/portal/StatusPill";
import StatCard from "@/components/portal/StatCard";

export default function DoctorDashboard() {
  const { user, profile, roles, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [selectedApt, setSelectedApt] = useState<any>(null);
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: string; label: string } | null>(null);
  const [rescheduleApt, setRescheduleApt] = useState<any>(null);
  const [prescriptionApt, setPrescriptionApt] = useState<any>(null);
  const [labOrderApt, setLabOrderApt] = useState<any>(null);
  const [tab, setTab] = useState("dashboard");
  const [filter, setFilter] = useState("today");

  const isDoctor = roles.includes("doctor") || roles.includes("admin");

  const { data: doctorRecord } = useQuery({
    queryKey: ["doctor-record", user.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("doctors").select("*, departments(name_en)").eq("user_id", user.id).single();
      if (error) return null; return data;
    },
    enabled: !!user.id,
  });

  const { data: appointments, isLoading: aptsLoading } = useQuery({
    queryKey: ["doctor-appointments", doctorRecord?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("appointments")
        .select("*, departments(name_en), profiles!appointments_patient_id_fkey(full_name, phone)")
        .eq("doctor_id", doctorRecord!.id)
        .order("appointment_date", { ascending: true }).order("start_time", { ascending: true });
      if (error) {
        const { data: d2 } = await supabase.from("appointments").select("*, departments(name_en)").eq("doctor_id", doctorRecord!.id).order("appointment_date", { ascending: true }).order("start_time", { ascending: true });
        return d2;
      }
      return data;
    },
    enabled: !!doctorRecord?.id,
  });

  const { data: labResults } = useQuery({
    queryKey: ["doctor-lab-results", doctorRecord?.id],
    queryFn: async () => {
      const { data } = await supabase.from("lab_results").select("*").eq("doctor_id", doctorRecord!.id).order("created_at", { ascending: false }).limit(20);
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
      const apt = appointments?.find(a => a.id === vars.id);
      if (apt) {
        createNotification({
          user_id: apt.patient_id,
          title: `Appointment ${vars.status}`,
          message: `Your appointment on ${apt.appointment_date} at ${apt.start_time} has been ${vars.status}.`,
          type: "appointment", link: "/patient/appointments",
        }).catch(() => {});
      }
    },
    onError: (err: any) => toast.error(err.message || "Failed to update"),
  });

  const reschedule = useMutation({
    mutationFn: async ({ id, date, startTime, endTime }: { id: string; date: string; startTime: string; endTime: string }) => {
      const { error } = await supabase.from("appointments").update({ appointment_date: date, start_time: startTime, end_time: endTime }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["doctor-appointments"] });
      toast.success("Appointment rescheduled");
      const apt = appointments?.find(a => a.id === vars.id);
      if (apt) {
        createNotification({ user_id: apt.patient_id, title: "Appointment Rescheduled", message: `Your appointment has been moved to ${vars.date} at ${vars.startTime}.`, type: "appointment", link: "/patient/appointments" }).catch(() => {});
      }
    },
    onError: (err: any) => toast.error(err.message || "Failed to reschedule"),
  });

  const todayApts = appointments?.filter(a => a.appointment_date === format(new Date(), "yyyy-MM-dd")) || [];
  const pendingCount = appointments?.filter(a => a.status === "pending").length || 0;
  const completedCount = appointments?.filter(a => a.status === "completed").length || 0;
  const inProgressCount = appointments?.filter(a => a.status === "in_progress").length || 0;

  const filteredApts = appointments?.filter(a => {
    if (filter === "all") return true;
    if (filter === "today") return a.appointment_date === format(new Date(), "yyyy-MM-dd");
    return a.status === filter;
  }) || [];

  const getPatientName = (a: any) => (a as any).profiles?.full_name || "Patient";

  const nav: PortalNavItem[] = [
    { key: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { key: "patients", icon: Users, label: "Patients" },
    { key: "schedule", icon: Calendar, label: "Schedules" },
    { key: "records", icon: FileText, label: "Medical Records" },
    { key: "lab", icon: FlaskConical, label: "Lab Results" },
    { key: "settings", icon: SettingsIcon, label: "Settings" },
  ];

  const headerAction = (
    <Button asChild className="gap-2 h-10 rounded-lg">
      <Link to="/doctor/schedule">
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline uppercase tracking-wider text-xs">New Entry</span>
      </Link>
    </Button>
  );

  if (authLoading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>;
  if (!user || !isDoctor) return <Navigate to="/auth/login" replace />;

  return (
    <PortalShell
      role="doctor"
      brandTitle="PHI Hospital"
      brandSubtitle="Tetovo · Тетово · Tetovë"
      userBadge={{
        name: `${doctorRecord?.title || "Dr."} ${profile?.full_name || "Doctor"}`,
        subtitle: ((doctorRecord as any)?.departments?.name_en || "Clinical") + " Dept.",
        avatarUrl: profile?.avatar_url,
      }}
      nav={nav}
      activeKey={tab}
      onNavChange={setTab}
      pageTitle={tab === "dashboard" ? "Doctor Dashboard" : nav.find(n => n.key === tab)?.label || ""}
      pageSubtitle={tab === "dashboard" ? "Mirëmëngjes, Dr. " + (profile?.full_name?.split(" ").pop() || "") + " · Dobro utro · Good morning" : null}
      headerAction={headerAction}
    >
      {!doctorRecord && tab === "dashboard" && (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-4 mb-5">
          <p className="text-sm text-foreground">Your account is not linked to a doctor record yet. Please contact an administrator.</p>
        </div>
      )}

      {tab === "dashboard" && (
        <div className="space-y-5">
          {/* Stat cards */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={Users} label="Patients Seen" value={completedCount + inProgressCount}
              subtitle="Pacientë / Пациенти" tone="primary" badge={{ label: "+12%", tone: "primary" }} />
            <StatCard icon={ClipboardList} label="Pending Reports" value={String(pendingCount).padStart(2, "0")}
              subtitle="Raporte / Извештаи" tone="amber" badge={{ label: "Critical", tone: "amber" }} />
            <StatCard icon={FlaskRound} label="Lab Tests Today" value={String(labResults?.filter(l => l.created_at?.startsWith(format(new Date(), "yyyy-MM-dd"))).length || 0).padStart(2, "0")}
              subtitle="Analiza / Анализи" tone="primary" />
            <StatCard icon={AlertCircle} label="Emergency Alerts" value="02"
              subtitle="Urgjenca / Итни случаи" tone="red" />
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
            {/* Appointments table */}
            <div className="rounded-2xl border border-border/70 bg-card overflow-hidden">
              <div className="flex items-center justify-between p-5 bg-primary/5 dark:bg-primary/10">
                <h2 className="text-base font-bold text-primary">Today's Appointments</h2>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
              <div className="px-5 py-3 grid grid-cols-[80px_1fr_120px_100px] gap-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/60">
                <div>Time</div><div>Patient Name</div><div>Status</div><div className="text-right">Actions</div>
              </div>
              <div className="divide-y divide-border/60">
                {aptsLoading ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-5"><Skeleton className="h-10" /></div>
                )) : filteredApts.length === 0 ? (
                  <div className="p-10 text-center text-muted-foreground text-sm">No appointments scheduled</div>
                ) : filteredApts.slice(0, 6).map(a => (
                  <div key={a.id} className="px-5 py-4 grid grid-cols-[80px_1fr_120px_100px] gap-3 items-center hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setSelectedApt(a)}>
                    <div className="text-sm font-bold text-primary">{a.start_time?.slice(0, 5)}</div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{getPatientName(a)}</p>
                      <p className="text-xs text-muted-foreground truncate">{(a as any).reason || "Consultation"}</p>
                    </div>
                    <div><StatusPill status={a.status} /></div>
                    <div className="text-right">
                      <button className="text-xs font-semibold text-primary hover:underline" onClick={e => { e.stopPropagation(); setSelectedApt(a); }}>
                        {a.status === "pending" ? "Open Chart" : a.status === "in_progress" ? "Resume" : a.status === "completed" ? "View History" : "Details"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setFilter("all")} className="w-full text-center py-4 text-sm font-semibold text-primary border-t border-border/60 hover:bg-muted/30 transition-colors">
                View All Appointments
              </button>
            </div>

            {/* Right column: Quick Actions + Critical Alerts */}
            <div className="space-y-5">
              <div className="rounded-2xl border border-border/70 bg-card p-5">
                <h3 className="text-sm font-bold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  {[
                    { icon: FilePlus, title: "New E-Prescription", sub: "E-Receta / E-Рецепт", onClick: () => filteredApts[0] && setPrescriptionApt(filteredApts[0]) },
                    { icon: FlaskConical, title: "Order Lab Test", sub: "Analiza / Упат за анализа", onClick: () => filteredApts[0] && setLabOrderApt(filteredApts[0]) },
                    { icon: ClipboardList, title: "Referral Form", sub: "Udhëzim / Упатница", onClick: () => toast.info("Referral form coming soon") },
                  ].map(qa => (
                    <button key={qa.title} onClick={qa.onClick} className="w-full flex items-center gap-3 rounded-xl border border-border/60 p-3 hover:border-primary/40 hover:bg-muted/30 transition-colors text-left">
                      <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <qa.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{qa.title}</p>
                        <p className="text-[11px] text-muted-foreground">{qa.sub}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border/70 bg-card p-5">
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                  <BellRing className="h-4 w-4 text-destructive" />Critical Alerts
                </h3>
                <div className="space-y-3">
                  <div className="border-l-2 border-destructive pl-3">
                    <p className="text-sm font-semibold">Abnormal Lab Results: Patient #882</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Potassium level critically high (6.2 mEq/L)</p>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-destructive mt-1">12 mins ago</p>
                  </div>
                  <div className="border-l-2 border-amber-500 pl-3">
                    <p className="text-sm font-semibold">ER Consultation Request</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Cardiac review requested for Room 302</p>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mt-1">45 mins ago</p>
                  </div>
                </div>
                <button className="w-full text-center mt-4 pt-3 border-t border-border/60 text-sm font-semibold text-primary">
                  View All System Alerts
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "patients" && (
        <Card className="rounded-2xl border-border/70">
          <CardHeader><CardTitle>My Patients</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from(new Map((appointments || []).map(a => [(a as any).patient_id, a])).values()).slice(0, 20).map(a => (
                <div key={a.id} className="flex items-center justify-between rounded-xl border border-border/60 p-4">
                  <div>
                    <p className="font-semibold">{getPatientName(a)}</p>
                    <p className="text-xs text-muted-foreground">Last visit: {a.appointment_date}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setSelectedApt(a)}>View</Button>
                </div>
              ))}
              {!appointments?.length && <p className="text-center text-muted-foreground py-6 text-sm">No patients yet</p>}
            </div>
          </CardContent>
        </Card>
      )}

      {tab === "schedule" && (
        <Card className="rounded-2xl border-border/70">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>All Appointments</CardTitle>
            <div className="flex flex-wrap gap-1">
              {["today", "all", "pending", "confirmed", "in_progress", "completed"].map(f => (
                <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)} className="text-xs h-7 capitalize">
                  {f.replace("_", " ")}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredApts.map(a => (
                <div key={a.id} onClick={() => setSelectedApt(a)} className="flex items-center gap-3 rounded-xl border border-border/60 p-4 cursor-pointer hover:border-primary/40 transition-colors">
                  <div className="text-sm font-bold text-primary w-16">{a.start_time?.slice(0, 5)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{getPatientName(a)}</p>
                    <p className="text-xs text-muted-foreground">{a.appointment_date} · {(a as any).departments?.name_en}</p>
                  </div>
                  <StatusPill status={a.status} />
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
              {!filteredApts.length && <p className="text-center text-muted-foreground py-6 text-sm">No appointments</p>}
            </div>
          </CardContent>
        </Card>
      )}

      {tab === "records" && (
        <Card className="rounded-2xl border-border/70">
          <CardHeader><CardTitle>Medical Records</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-muted-foreground text-center py-6">Select a patient from Patients tab to view their records.</p></CardContent>
        </Card>
      )}

      {tab === "lab" && doctorRecord && <LabResultsPanel doctorId={doctorRecord.id} />}

      {tab === "settings" && (
        <Card className="rounded-2xl border-border/70 max-w-2xl">
          <CardHeader><CardTitle>Settings</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-muted-foreground">Account settings coming soon.</p></CardContent>
        </Card>
      )}

      {/* Detail Modal */}
      {selectedApt && (
        <AppointmentDetailModal
          appointment={selectedApt}
          onClose={() => setSelectedApt(null)}
          onAction={(action) => {
            setSelectedApt(null);
            if (action === "reschedule") setRescheduleApt(selectedApt);
            else if (action === "prescribe") setPrescriptionApt(selectedApt);
            else if (action === "lab_order") setLabOrderApt(selectedApt);
            else setConfirmAction({ id: selectedApt.id, action, label: action.replace("_", " ") });
          }}
        />
      )}

      <AlertDialog open={!!confirmAction} onOpenChange={v => !v && setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmAction?.label} Appointment?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.action === "cancelled" ? "This will cancel the appointment and notify the patient."
                : confirmAction?.action === "completed" ? "This will mark the appointment as completed."
                : `This will ${confirmAction?.label?.toLowerCase()} the appointment.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={updateStatus.isPending} onClick={() => {
              if (confirmAction) {
                updateStatus.mutate({ id: confirmAction.id, status: confirmAction.action });
                if (confirmAction.action === "completed") {
                  const apt = appointments?.find(a => a.id === confirmAction.id);
                  if (apt) setTimeout(() => setPrescriptionApt(apt), 500);
                }
                setConfirmAction(null);
              }
            }}>{updateStatus.isPending ? "Processing..." : confirmAction?.label}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {rescheduleApt && (
        <RescheduleDialog appointment={rescheduleApt} onClose={() => setRescheduleApt(null)}
          onSubmit={(date, startTime, endTime) => { reschedule.mutate({ id: rescheduleApt.id, date, startTime, endTime }); setRescheduleApt(null); }}
          isPending={reschedule.isPending} />
      )}

      {prescriptionApt && doctorRecord && (
        <PrescriptionDialog appointment={prescriptionApt} doctorId={doctorRecord.id} onClose={() => setPrescriptionApt(null)} />
      )}

      {labOrderApt && doctorRecord && (
        <LabOrderDialog appointment={labOrderApt} doctorId={doctorRecord.id}
          onClose={() => setLabOrderApt(null)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ["doctor-lab-results-full"] })} />
      )}
    </PortalShell>
  );
}

/* ==================== Detail Modal ==================== */
function AppointmentDetailModal({ appointment: a, onClose, onAction }: { appointment: any; onClose: () => void; onAction: (action: string) => void; }) {
  const patientName = (a as any).profiles?.full_name || "Patient";
  const patientPhone = (a as any).profiles?.phone || "—";
  return (
    <Dialog open onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">Appointment Details<StatusPill status={a.status} /></DialogTitle>
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
          {a.reason && <div className="text-sm"><p className="text-muted-foreground text-xs mb-1">Reason</p><p>{a.reason}</p></div>}
          {a.notes && <div className="text-sm"><p className="text-muted-foreground text-xs mb-1">Notes</p><p>{a.notes}</p></div>}
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {a.status === "pending" && (<>
              <Button size="sm" onClick={() => onAction("confirmed")}><Check className="h-3.5 w-3.5 mr-1" />Confirm</Button>
              <Button size="sm" variant="destructive" onClick={() => onAction("cancelled")}><X className="h-3.5 w-3.5 mr-1" />Reject</Button>
              <Button size="sm" variant="outline" onClick={() => onAction("reschedule")}><Clock className="h-3.5 w-3.5 mr-1" />Reschedule</Button>
            </>)}
            {a.status === "confirmed" && (<>
              {isToday(parseISO(a.appointment_date)) && <Button size="sm" onClick={() => onAction("in_progress")}><Play className="h-3.5 w-3.5 mr-1" />Check In</Button>}
              <Button size="sm" variant="outline" onClick={() => onAction("reschedule")}><Clock className="h-3.5 w-3.5 mr-1" />Reschedule</Button>
              <Button size="sm" variant="destructive" onClick={() => onAction("cancelled")}><X className="h-3.5 w-3.5 mr-1" />Cancel</Button>
            </>)}
            {a.status === "in_progress" && (<>
              <Button size="sm" onClick={() => onAction("completed")}><CheckCircle className="h-3.5 w-3.5 mr-1" />Check Out</Button>
              <Button size="sm" variant="outline" onClick={() => onAction("lab_order")}><FlaskConical className="h-3.5 w-3.5 mr-1" />Order Lab</Button>
            </>)}
            {a.status === "completed" && (<>
              <Button size="sm" variant="outline" onClick={() => onAction("prescribe")}><Pill className="h-3.5 w-3.5 mr-1" />Prescribe</Button>
              <Button size="sm" variant="outline" onClick={() => onAction("lab_order")}><FlaskConical className="h-3.5 w-3.5 mr-1" />Order Lab</Button>
            </>)}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RescheduleDialog({ appointment: a, onClose, onSubmit, isPending }: { appointment: any; onClose: () => void; onSubmit: (date: string, startTime: string, endTime: string) => void; isPending: boolean; }) {
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
          <Button className="w-full" disabled={isPending} onClick={() => onSubmit(date, startTime, endTime)}>
            {isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PrescriptionDialog({ appointment: a, doctorId, onClose }: { appointment: any; doctorId: string; onClose: () => void; }) {
  const queryClient = useQueryClient();
  const [medications, setMedications] = useState([{ name: "", dosage: "", frequency: "", duration: "" }]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const addMed = () => setMedications(m => [...m, { name: "", dosage: "", frequency: "", duration: "" }]);
  const updateMed = (i: number, field: string, value: string) => setMedications(m => m.map((med, j) => j === i ? { ...med, [field]: value } : med));
  const removeMed = (i: number) => setMedications(m => m.filter((_, j) => j !== i));
  const handleSubmit = async () => {
    const validMeds = medications.filter(m => m.name.trim());
    if (validMeds.length === 0) { toast.error("Add at least one medication"); return; }
    setLoading(true);
    try {
      for (const med of validMeds) {
        await createPrescription({ patient_id: a.patient_id, doctor_id: doctorId, appointment_id: a.id, medication_name: med.name, dosage: med.dosage || undefined, frequency: med.frequency || undefined, duration: med.duration || undefined, notes: notes || undefined });
      }
      await createNotification({ user_id: a.patient_id, title: "New Prescription", message: `Your doctor has issued ${validMeds.length} prescription(s).`, type: "system", link: "/portal" }).catch(() => {});
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
      toast.success(`${validMeds.length} prescription(s) created`);
      onClose();
    } catch (err: any) { toast.error(err.message || "Failed"); }
    setLoading(false);
  };
  return (
    <Dialog open onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Pill className="h-5 w-5" />Write Prescription</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">Patient: <span className="font-medium text-foreground">{(a as any).profiles?.full_name || "Patient"}</span></div>
          {medications.map((med, i) => (
            <Card key={i} className="p-3">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-medium text-muted-foreground">Medication {i + 1}</p>
                {medications.length > 1 && <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeMed(i)}><X className="h-3 w-3" /></Button>}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Medication name *" className="col-span-2" value={med.name} onChange={e => updateMed(i, "name", e.target.value)} />
                <Input placeholder="Dosage" value={med.dosage} onChange={e => updateMed(i, "dosage", e.target.value)} />
                <Input placeholder="Frequency" value={med.frequency} onChange={e => updateMed(i, "frequency", e.target.value)} />
                <Input placeholder="Duration" className="col-span-2" value={med.duration} onChange={e => updateMed(i, "duration", e.target.value)} />
              </div>
            </Card>
          ))}
          <Button variant="outline" size="sm" onClick={addMed} className="w-full text-xs">+ Add Medication</Button>
          <div className="space-y-2"><Label>Notes</Label><Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} /></div>
          <Button className="w-full" disabled={loading} onClick={handleSubmit}>{loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : "Create Prescription"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
