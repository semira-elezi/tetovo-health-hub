import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, FileText, Download, User, Activity, Clock, FlaskConical } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import PatientTimeline from "@/components/features/timeline/PatientTimeline";
import PatientLabResults from "@/components/features/lab/PatientLabResults";

export default function PatientPortal() {
  const { t, language } = useTranslation();
  const { user, profile } = useAuth();
  const [tab, setTab] = useState("overview");

  const [profileForm, setProfileForm] = useState<{
    full_name: string; phone: string; date_of_birth: string; gender: string; address: string;
  } | null>(null);

  const initForm = () => {
    if (profile && !profileForm) {
      setProfileForm({
        full_name: profile.full_name || "", phone: profile.phone || "",
        date_of_birth: profile.date_of_birth || "", gender: profile.gender || "", address: profile.address || "",
      });
    }
  };

  const { data: appointments, isLoading: aptsLoading } = useQuery({
    queryKey: ["patient-appointments", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("appointments")
        .select("*, doctors(full_name, title), departments(name_en, name_mk, name_sq)")
        .eq("patient_id", user!.id).order("appointment_date", { ascending: false });
      if (error) throw error; return data;
    },
    enabled: !!user?.id,
  });

  const { data: labResults, isLoading: labLoading } = useQuery({
    queryKey: ["patient-lab-results", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("lab_results")
        .select("*, doctors(full_name)").eq("patient_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error; return data;
    },
    enabled: !!user?.id,
  });

  const { data: documents, isLoading: docsLoading } = useQuery({
    queryKey: ["patient-documents", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("documents")
        .select("*, doctors(full_name)").eq("patient_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error; return data;
    },
    enabled: !!user?.id,
  });

  const { data: prescriptions } = useQuery({
    queryKey: ["patient-prescriptions", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("prescriptions")
        .select("*, doctors(full_name)").eq("patient_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error; return data;
    },
    enabled: !!user?.id,
  });

  const nextAppointment = appointments?.find((a) => a.status === "pending" || a.status === "confirmed");
  const latestLab = labResults?.[0];

  const getDeptName = (dept: any) => {
    if (!dept) return "—";
    if (language === "mk") return dept.name_mk || dept.name_en;
    if (language === "sq") return dept.name_sq || dept.name_en;
    return dept.name_en;
  };

  const handleSaveProfile = async () => {
    if (!user || !profileForm) return;
    const { error } = await supabase.from("profiles").update({
      full_name: profileForm.full_name, phone: profileForm.phone,
      date_of_birth: profileForm.date_of_birth || null, gender: profileForm.gender || null, address: profileForm.address || null,
    }).eq("id", user.id);
    if (error) toast.error(language === "mk" ? "Грешка при зачувување" : language === "sq" ? "Gabim gjatë ruajtjes" : "Failed to save profile");
    else toast.success(t("portal.save") + " ✓");
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline", confirmed: "default", completed: "secondary", cancelled: "destructive", no_show: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  if (tab === "profile") initForm();

  const tabs = [
    { key: "overview", icon: Activity, label: t("portal.overview") },
    { key: "timeline", icon: Clock, label: language === "mk" ? "Временска линија" : language === "sq" ? "Kronologjia" : "Timeline" },
    { key: "appointments", icon: Calendar, label: t("portal.appointments") },
    { key: "lab", icon: FileText, label: t("portal.labResults") },
    { key: "documents", icon: Download, label: t("portal.documents") },
    { key: "profile", icon: User, label: t("portal.profile") },
  ];

  return (
    <Layout>
      <div className="container py-6 md:py-10">
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          {/* Desktop sidebar */}
          <div className="hidden lg:block space-y-1">
            {tabs.map((item) => (
              <Button key={item.key} variant={tab === item.key ? "secondary" : "ghost"} className="w-full justify-start gap-2" onClick={() => setTab(item.key)}>
                <item.icon className="h-4 w-4" />{item.label}
              </Button>
            ))}
          </div>

          {/* Mobile bottom nav handled via horizontal scroll tabs */}
          <div className="flex gap-1 overflow-x-auto pb-2 lg:hidden -mx-1 px-1">
            {tabs.map((item) => (
              <Button
                key={item.key}
                variant={tab === item.key ? "default" : "outline"}
                size="sm"
                className="shrink-0 gap-1.5 text-xs"
                onClick={() => setTab(item.key)}
              >
                <item.icon className="h-3.5 w-3.5" />{item.label}
              </Button>
            ))}
          </div>

          <div>
            {tab === "overview" && (
              <div className="space-y-4">
                <Card><CardContent className="pt-6">
                  <h2 className="text-xl font-bold">{t("portal.welcome")}, {profile?.full_name || user?.email}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{t("portal.healthOverview")}</p>
                </CardContent></Card>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Card><CardHeader><CardTitle className="text-sm">{t("portal.nextAppointment")}</CardTitle></CardHeader>
                    <CardContent>{nextAppointment ? (<><p className="text-lg font-semibold">{nextAppointment.appointment_date} {nextAppointment.start_time}</p><p className="text-sm text-muted-foreground">{(nextAppointment as any).doctors?.title || ""} {(nextAppointment as any).doctors?.full_name} · {getDeptName((nextAppointment as any).departments)}</p></>) : (<p className="text-sm text-muted-foreground">{t("portal.noAppointments")}</p>)}</CardContent></Card>
                  <Card><CardHeader><CardTitle className="text-sm">{t("portal.labResults")}</CardTitle></CardHeader>
                    <CardContent>{latestLab ? (<><p className="text-lg font-semibold">{latestLab.test_name}</p><Badge variant="secondary" className="mt-1">{latestLab.status}</Badge></>) : (<p className="text-sm text-muted-foreground">{t("portal.noLabResults")}</p>)}</CardContent></Card>
                </div>
                {prescriptions && prescriptions.filter((p) => p.status === "active").length > 0 && (
                  <Card><CardHeader><CardTitle className="text-sm">{t("portal.activePrescriptions")}</CardTitle></CardHeader>
                    <CardContent><div className="space-y-2">{prescriptions.filter((p) => p.status === "active").map((p) => (
                      <div key={p.id} className="flex items-center justify-between text-sm"><span className="font-medium">{p.medication_name}</span><span className="text-muted-foreground">{p.dosage} · {p.frequency}</span></div>
                    ))}</div></CardContent></Card>
                )}
              </div>
            )}

            {tab === "timeline" && (
              <Card>
                <CardHeader>
                  <CardTitle>{language === "mk" ? "Медицинска временска линија" : language === "sq" ? "Kronologjia mjekësore" : "Medical Timeline"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <PatientTimeline />
                </CardContent>
              </Card>
            )}

            {tab === "appointments" && (
              <Card><CardHeader><CardTitle>{t("portal.appointments")}</CardTitle></CardHeader>
                <CardContent>{aptsLoading ? (<p className="text-sm text-muted-foreground py-4 text-center">{t("common.loading")}</p>) : !appointments?.length ? (<p className="text-sm text-muted-foreground py-4 text-center">{t("portal.noAppointmentsFound")}</p>) : (
                  <>
                    {/* Desktop table */}
                    <div className="hidden md:block">
                      <Table><TableHeader><TableRow><TableHead>{t("portal.date")}</TableHead><TableHead>{t("portal.time")}</TableHead><TableHead>{t("portal.doctor")}</TableHead><TableHead>{t("portal.department")}</TableHead><TableHead>{t("portal.status")}</TableHead></TableRow></TableHeader>
                        <TableBody>{appointments.map((a) => (<TableRow key={a.id}><TableCell>{a.appointment_date}</TableCell><TableCell>{a.start_time} - {a.end_time}</TableCell><TableCell>{(a as any).doctors?.title || ""} {(a as any).doctors?.full_name || "—"}</TableCell><TableCell>{getDeptName((a as any).departments)}</TableCell><TableCell>{getStatusBadge(a.status)}</TableCell></TableRow>))}</TableBody></Table>
                    </div>
                    {/* Mobile cards */}
                    <div className="space-y-3 md:hidden">
                      {appointments.map((a) => (
                        <div key={a.id} className="rounded-xl border p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold">{a.appointment_date}</span>
                            {getStatusBadge(a.status)}
                          </div>
                          <p className="text-sm">{(a as any).doctors?.title || ""} {(a as any).doctors?.full_name || "—"}</p>
                          <p className="text-xs text-muted-foreground">{getDeptName((a as any).departments)} · {a.start_time} - {a.end_time}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}</CardContent></Card>
            )}

            {tab === "lab" && (
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FlaskConical className="h-5 w-5" /> {t("portal.labResults")}
                </h2>
                <PatientLabResults />
              </div>
            )}

            {tab === "documents" && (
              <Card><CardHeader><CardTitle>{t("portal.documents")}</CardTitle></CardHeader>
                <CardContent>{docsLoading ? (<p className="text-sm text-muted-foreground py-4 text-center">{t("common.loading")}</p>) : !documents?.length ? (<p className="text-sm text-muted-foreground py-4 text-center">{t("portal.noDocuments")}</p>) : (
                  <div className="space-y-3">{documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between rounded-xl border p-4">
                      <div className="flex items-center gap-3"><FileText className="h-5 w-5 text-primary" /><div><p className="text-sm font-medium">{doc.title}</p><p className="text-xs text-muted-foreground">{new Date(doc.created_at).toLocaleDateString()} · {doc.category.replace("_", " ")}</p></div></div>
                      {doc.file_url && (<a href={doc.file_url} target="_blank" rel="noopener noreferrer"><Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button></a>)}
                    </div>
                  ))}</div>
                )}</CardContent></Card>
            )}

            {tab === "profile" && (
              <Card><CardHeader><CardTitle>{t("portal.profile")}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2"><label className="text-sm font-medium">{t("auth.fullName")}</label><Input value={profileForm?.full_name || ""} onChange={(e) => setProfileForm((f) => f ? { ...f, full_name: e.target.value } : f)} /></div>
                  <div className="space-y-2"><label className="text-sm font-medium">Email</label><Input value={user?.email || ""} disabled className="bg-muted" /></div>
                  <div className="space-y-2"><label className="text-sm font-medium">{t("auth.phone")}</label><Input value={profileForm?.phone || ""} onChange={(e) => setProfileForm((f) => f ? { ...f, phone: e.target.value } : f)} /></div>
                  <div className="space-y-2"><label className="text-sm font-medium">{t("auth.dob")}</label><Input type="date" value={profileForm?.date_of_birth || ""} onChange={(e) => setProfileForm((f) => f ? { ...f, date_of_birth: e.target.value } : f)} /></div>
                  <div className="space-y-2"><label className="text-sm font-medium">{t("portal.gender")}</label><Input value={profileForm?.gender || ""} onChange={(e) => setProfileForm((f) => f ? { ...f, gender: e.target.value } : f)} placeholder="M/F" /></div>
                  <div className="space-y-2"><label className="text-sm font-medium">{t("portal.addressLabel")}</label><Input value={profileForm?.address || ""} onChange={(e) => setProfileForm((f) => f ? { ...f, address: e.target.value } : f)} /></div>
                  <Button onClick={handleSaveProfile}>{t("portal.save")}</Button>
                </CardContent></Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
