import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  LayoutDashboard, Calendar, FileText, FlaskConical, Pill, Settings as SettingsIcon,
  HeartPulse, Bell, Upload, ShieldCheck, Plus, MapPin, Download, ChevronRight, Clock,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import PortalShell, { PortalNavItem } from "@/components/portal/PortalShell";
import StatusPill from "@/components/portal/StatusPill";
import PatientTimeline from "@/components/features/timeline/PatientTimeline";
import PatientLabResults from "@/components/features/lab/PatientLabResults";
import PatientHealthProfile from "@/components/features/patient/PatientHealthProfile";
import PatientHealthMetrics from "@/components/features/patient/PatientHealthMetrics";
import PatientMedicationReminders from "@/components/features/patient/PatientMedicationReminders";
import PatientDocumentUpload from "@/components/features/patient/PatientDocumentUpload";
import { exportAppointmentsPDF } from "@/lib/pdfExport";

export default function PatientPortal() {
  const { t, language } = useTranslation();
  const { user, profile } = useAuth();
  const [tab, setTab] = useState("dashboard");
  const [profileForm, setProfileForm] = useState<any>(null);

  useEffect(() => {
    if (profile && !profileForm) {
      setProfileForm({
        full_name: profile.full_name || "", phone: profile.phone || "",
        date_of_birth: profile.date_of_birth || "", gender: profile.gender || "", address: profile.address || "",
      });
    }
  }, [profile, profileForm]);

  const { data: appointments } = useQuery({
    queryKey: ["patient-appointments", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("appointments")
        .select("*, doctors(full_name, title), departments(name_en, name_mk, name_sq)")
        .eq("patient_id", user!.id).order("appointment_date", { ascending: false });
      if (error) throw error; return data;
    },
    enabled: !!user?.id,
  });

  const { data: latestLabs } = useQuery({
    queryKey: ["patient-latest-labs", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("lab_results").select("*").eq("patient_id", user!.id).order("created_at", { ascending: false }).limit(2);
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: prescriptions } = useQuery({
    queryKey: ["patient-prescriptions", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("prescriptions").select("*").eq("patient_id", user!.id).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user?.id,
  });

  const nextAppointment = appointments?.find(a => a.status === "pending" || a.status === "confirmed");
  const activePrescriptions = prescriptions?.filter(p => p.status === "active") || [];
  const getDeptName = (dept: any) => !dept ? "—" : language === "mk" ? (dept.name_mk || dept.name_en) : language === "sq" ? (dept.name_sq || dept.name_en) : dept.name_en;
  const firstName = profile?.full_name?.split(" ")[0] || (user?.email?.split("@")[0] ?? "");
  const fullName = profile?.full_name || user?.email || "";
  const patientId = "PHI-" + (user?.id?.slice(0, 6).toUpperCase() || "------");

  const nav: PortalNavItem[] = [
    { key: "dashboard", icon: LayoutDashboard, label: t("portal.overview") || "Dashboard", uppercase: true },
    { key: "appointments", icon: Calendar, label: language === "sq" ? "Termini" : language === "mk" ? "Термини" : "Schedules", uppercase: true },
    { key: "timeline", icon: FileText, label: language === "sq" ? "Dosja Mjekësore" : language === "mk" ? "Медицински записи" : "Medical Records", uppercase: true },
    { key: "lab", icon: FlaskConical, label: language === "sq" ? "Laboratori" : language === "mk" ? "Лаборатории" : "Labs", uppercase: true },
    { key: "meds", icon: Pill, label: language === "sq" ? "Receta" : language === "mk" ? "Рецепти" : "Prescriptions", uppercase: true },
    { key: "metrics", icon: HeartPulse, label: language === "sq" ? "Shëndeti" : language === "mk" ? "Здравје" : "Health", uppercase: true },
    { key: "uploads", icon: Upload, label: language === "sq" ? "Dokumentet" : language === "mk" ? "Документи" : "Documents", uppercase: true },
    { key: "health-profile", icon: ShieldCheck, label: language === "sq" ? "Profili" : language === "mk" ? "Профил" : "Health Profile", uppercase: true },
    { key: "settings", icon: SettingsIcon, label: language === "sq" ? "Cilësimet" : language === "mk" ? "Поставки" : "Settings", uppercase: true },
  ];

  const handleSaveProfile = async () => {
    if (!user || !profileForm) return;
    const { error } = await supabase.from("profiles").update({
      full_name: profileForm.full_name, phone: profileForm.phone,
      date_of_birth: profileForm.date_of_birth || null, gender: profileForm.gender || null, address: profileForm.address || null,
      blood_type: profileForm.blood_type || null,
    }).eq("id", user.id);
    if (error) toast.error("Failed to save"); else toast.success(t("portal.save") + " ✓");
  };

  const titles: Record<string, string> = {
    dashboard: `${t("portal.welcome") || "Welcome"}, ${firstName}`,
    appointments: language === "sq" ? "Terminet e Mia" : language === "mk" ? "Мои Термини" : "My Appointments",
    timeline: language === "sq" ? "Dosja Mjekësore" : language === "mk" ? "Медицински записи" : "Medical Records",
    lab: language === "sq" ? "Rezultatet e Laboratorit" : language === "mk" ? "Резултати од лабораторија" : "Lab Results",
    meds: language === "sq" ? "Recetat" : language === "mk" ? "Рецепти" : "Prescriptions",
    metrics: language === "sq" ? "Metrikat e Shëndetit" : language === "mk" ? "Здравствени метрики" : "Health Metrics",
    uploads: language === "sq" ? "Dokumentet e Mia" : language === "mk" ? "Мои документи" : "My Documents",
    "health-profile": language === "sq" ? "Profili Shëndetësor" : language === "mk" ? "Здравствен профил" : "Health Profile",
    settings: language === "sq" ? "Cilësimet" : language === "mk" ? "Поставки" : "Settings",
  };

  const subtitle = tab === "dashboard"
    ? <>Dobrodošli · Welcome · ID: {patientId}</>
    : null;

  const headerAction = (
    <Button asChild className="gap-2 h-10 rounded-lg">
      <Link to="/appointments">
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline uppercase tracking-wider text-xs">Book Appointment</span>
      </Link>
    </Button>
  );

  return (
    <PortalShell
      role="patient"
      brandTitle="PHI Tetovo"
      userBadge={{ name: fullName, subtitle: "PATIENT PORTAL", avatarUrl: profile?.avatar_url }}
      nav={nav}
      activeKey={tab}
      onNavChange={setTab}
      pageTitle={titles[tab] || ""}
      pageSubtitle={subtitle}
      headerAction={headerAction}
    >
      {tab === "dashboard" && (
        <div className="space-y-5">
          {/* Top grid: Next appt + location + lab results */}
          <div className="grid gap-5 lg:grid-cols-3">
            {/* Next Appointment */}
            <div className="lg:col-span-2 rounded-2xl border border-border/70 bg-card overflow-hidden">
              <div className="grid md:grid-cols-[1fr_180px]">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3 text-primary">
                    <Calendar className="h-4 w-4" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Next Appointment</span>
                  </div>
                  {nextAppointment ? (
                    <>
                      <h3 className="text-xl font-bold text-foreground">
                        {(nextAppointment as any).reason || getDeptName((nextAppointment as any).departments)}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {(nextAppointment as any).notes || "Your scheduled medical consultation."}
                      </p>
                      <div className="grid grid-cols-2 gap-3 mt-5">
                        <div className="rounded-xl bg-muted/50 p-3">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Date & Time</p>
                          <p className="text-sm font-semibold mt-1">{nextAppointment.appointment_date}</p>
                          <p className="text-sm font-semibold">{nextAppointment.start_time?.slice(0, 5)}</p>
                        </div>
                        <div className="rounded-xl bg-muted/50 p-3">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Physician</p>
                          <p className="text-sm font-semibold mt-1">
                            {(nextAppointment as any).doctors?.title} {(nextAppointment as any).doctors?.full_name || "—"}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-5 mt-5 text-xs font-semibold uppercase tracking-wider">
                        <button className="text-primary hover:underline">Reschedule</button>
                        <button className="text-destructive hover:underline">Cancel</button>
                      </div>
                    </>
                  ) : (
                    <div className="py-6">
                      <p className="text-sm text-muted-foreground mb-4">{t("portal.noAppointments") || "No upcoming appointments"}</p>
                      <Button asChild size="sm"><Link to="/appointments">Book Now</Link></Button>
                    </div>
                  )}
                </div>
                <div className="hidden md:flex flex-col items-center justify-center bg-primary/5 dark:bg-primary/10 p-5 text-center border-l border-border/60">
                  <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center mb-3">
                    <MapPin className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">Wing B, Floor 2</p>
                  <p className="text-[11px] text-muted-foreground mt-1">Sektori i Kardiologjisë</p>
                </div>
              </div>
            </div>

            {/* Lab Results */}
            <div className="rounded-2xl border border-border/70 bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-primary">
                  <FlaskConical className="h-4 w-4" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider">Latest Lab Results</span>
                </div>
                <button onClick={() => setTab("lab")} className="text-[11px] font-semibold uppercase tracking-wider text-primary hover:underline">
                  View All
                </button>
              </div>
              <div className="space-y-2">
                {latestLabs?.length ? latestLabs.map(lab => (
                  <button key={lab.id} onClick={() => setTab("lab")} className="w-full text-left rounded-xl border border-border/60 p-3 hover:border-primary/40 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{lab.test_name}</p>
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5">
                          {new Date(lab.created_at).toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" })}
                        </p>
                      </div>
                      <StatusPill status={lab.status} />
                    </div>
                  </button>
                )) : (
                  <p className="text-sm text-muted-foreground py-4 text-center">{t("portal.noLabResults") || "No lab results yet"}</p>
                )}
              </div>
              {latestLabs && latestLabs.length > 0 && (
                <div className="mt-4 rounded-xl bg-muted/50 p-3">
                  <p className="text-xs italic text-muted-foreground leading-relaxed">
                    "Primary metabolic markers reviewed. Follow your physician's guidance for next steps."
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom grid: Prescriptions + Timeline */}
          <div className="grid gap-5 lg:grid-cols-[1fr_1.5fr]">
            <div className="rounded-2xl border border-border/70 bg-card p-6">
              <div className="flex items-center gap-2 mb-4 text-primary">
                <Pill className="h-4 w-4" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">Active Prescriptions</span>
              </div>
              <div className="space-y-3">
                {activePrescriptions.length ? activePrescriptions.slice(0, 4).map(p => (
                  <div key={p.id} className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Pill className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{p.medication_name} {p.dosage}</p>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5">
                        {p.frequency || "As prescribed"}
                      </p>
                    </div>
                  </div>
                )) : <p className="text-sm text-muted-foreground py-4 text-center">No active prescriptions</p>}
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card p-6">
              <div className="flex items-center gap-2 mb-4 text-primary">
                <Clock className="h-4 w-4" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">Health Journey</span>
              </div>
              <div className="space-y-4">
                {(appointments?.slice(0, 3) || []).map((a, i) => (
                  <div key={a.id} className="flex gap-4">
                    <div className="flex flex-col items-center pt-1">
                      <div className={`h-2.5 w-2.5 rounded-full ${i === 0 ? "bg-primary" : "bg-muted-foreground/40"}`} />
                      {i < 2 && <div className="w-px flex-1 bg-border my-1" />}
                    </div>
                    <div className="flex-1 pb-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {new Date(a.appointment_date).toLocaleDateString(undefined, { month: "long", day: "2-digit", year: "numeric" })}
                      </p>
                      <p className="text-sm font-semibold mt-0.5">{(a as any).reason || "Consultation"}</p>
                      <p className="text-xs text-muted-foreground">
                        {(a as any).doctors?.full_name || "—"} · {getDeptName((a as any).departments)}
                      </p>
                    </div>
                  </div>
                ))}
                {(!appointments || appointments.length === 0) && (
                  <p className="text-sm text-muted-foreground py-4 text-center">No journey entries yet</p>
                )}
              </div>
            </div>
          </div>

          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/80 leading-relaxed pt-4 border-t border-border/60">
            AI Disclaimer: Health summaries and automated insights are generated for informational purposes
            and should not replace clinical judgment. Always consult with your doctor at PHI Hospital Tetovo
            before making medical decisions based on portal data.
          </p>
        </div>
      )}

      {tab === "appointments" && (
        <Card className="rounded-2xl border-border/70">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{titles.appointments}</CardTitle>
            <Button size="sm" variant="outline" onClick={() => appointments && exportAppointmentsPDF(appointments)}>
              <Download className="h-3.5 w-3.5 mr-1.5" />Export PDF
            </Button>
          </CardHeader>
          <CardContent>
            {!appointments?.length ? (
              <p className="text-sm text-muted-foreground py-6 text-center">{t("portal.noAppointmentsFound") || "No appointments found"}</p>
            ) : (
              <>
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("portal.date") || "Date"}</TableHead>
                        <TableHead>{t("portal.time") || "Time"}</TableHead>
                        <TableHead>{t("portal.doctor") || "Doctor"}</TableHead>
                        <TableHead>{t("portal.department") || "Department"}</TableHead>
                        <TableHead>{t("portal.status") || "Status"}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointments.map(a => (
                        <TableRow key={a.id}>
                          <TableCell className="font-medium">{a.appointment_date}</TableCell>
                          <TableCell>{a.start_time?.slice(0, 5)}</TableCell>
                          <TableCell>{(a as any).doctors?.title} {(a as any).doctors?.full_name || "—"}</TableCell>
                          <TableCell>{getDeptName((a as any).departments)}</TableCell>
                          <TableCell><StatusPill status={a.status} /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="space-y-3 md:hidden">
                  {appointments.map(a => (
                    <div key={a.id} className="rounded-xl border border-border/70 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">{a.appointment_date}</span>
                        <StatusPill status={a.status} />
                      </div>
                      <p className="text-sm">{(a as any).doctors?.full_name || "—"}</p>
                      <p className="text-xs text-muted-foreground">{getDeptName((a as any).departments)} · {a.start_time?.slice(0, 5)}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {tab === "timeline" && (
        <Card className="rounded-2xl border-border/70"><CardContent className="pt-6"><PatientTimeline /></CardContent></Card>
      )}
      {tab === "lab" && <PatientLabResults />}
      {tab === "meds" && (
        <Card className="rounded-2xl border-border/70">
          <CardHeader><CardTitle>{titles.meds}</CardTitle></CardHeader>
          <CardContent>
            {prescriptions?.length ? (
              <div className="space-y-3">
                {prescriptions.map(p => (
                  <div key={p.id} className="flex items-center justify-between rounded-xl border border-border/60 p-4">
                    <div>
                      <p className="font-semibold">{p.medication_name} {p.dosage}</p>
                      <p className="text-xs text-muted-foreground">{p.frequency} · {p.duration || "—"}</p>
                    </div>
                    <StatusPill status={p.status} />
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground text-center py-6">No prescriptions</p>}
          </CardContent>
        </Card>
      )}
      {tab === "metrics" && <PatientHealthMetrics />}
      {tab === "uploads" && <PatientDocumentUpload />}
      {tab === "health-profile" && <PatientHealthProfile />}
      {tab === "settings" && profileForm && (
        <Card className="rounded-2xl border-border/70 max-w-2xl">
          <CardHeader><CardTitle>{titles.settings}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><label className="text-sm font-medium">{t("auth.fullName") || "Full Name"}</label><Input value={profileForm.full_name} onChange={e => setProfileForm((f: any) => ({ ...f, full_name: e.target.value }))} /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Email</label><Input value={user?.email || ""} disabled className="bg-muted" /></div>
            <div className="space-y-2"><label className="text-sm font-medium">{t("auth.phone") || "Phone"}</label><Input value={profileForm.phone} onChange={e => setProfileForm((f: any) => ({ ...f, phone: e.target.value }))} /></div>
            <div className="space-y-2"><label className="text-sm font-medium">{t("auth.dob") || "Date of Birth"}</label><Input type="date" value={profileForm.date_of_birth} onChange={e => setProfileForm((f: any) => ({ ...f, date_of_birth: e.target.value }))} /></div>
            <div className="space-y-2"><label className="text-sm font-medium">{t("portal.gender") || "Gender"}</label><Input value={profileForm.gender} onChange={e => setProfileForm((f: any) => ({ ...f, gender: e.target.value }))} placeholder="M/F" /></div>
            <div className="space-y-2"><label className="text-sm font-medium">{t("portal.addressLabel") || "Address"}</label><Input value={profileForm.address} onChange={e => setProfileForm((f: any) => ({ ...f, address: e.target.value }))} /></div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Blood Type</label>
              <select
                value={profileForm.blood_type || ""}
                onChange={e => setProfileForm((f: any) => ({ ...f, blood_type: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Unknown / prefer not to say</option>
                {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <p className="text-xs text-muted-foreground">Helps the hospital notify you when your blood type is urgently needed.</p>
            </div>
            <Button onClick={handleSaveProfile}>{t("portal.save") || "Save"}</Button>
          </CardContent>
        </Card>
      )}
    </PortalShell>
  );
}
