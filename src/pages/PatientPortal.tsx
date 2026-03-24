import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, FileText, Download, User, Activity } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";

export default function PatientPortal() {
  const { t, language } = useTranslation();
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("overview");

  // Profile form state
  const [profileForm, setProfileForm] = useState<{
    full_name: string;
    phone: string;
    date_of_birth: string;
    gender: string;
    address: string;
  } | null>(null);

  // Initialize form when profile loads
  const initForm = () => {
    if (profile && !profileForm) {
      setProfileForm({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        date_of_birth: profile.date_of_birth || "",
        gender: profile.gender || "",
        address: profile.address || "",
      });
    }
  };

  // Appointments
  const { data: appointments, isLoading: aptsLoading } = useQuery({
    queryKey: ["patient-appointments", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*, doctors(full_name, title), departments(name_en, name_mk, name_sq)")
        .eq("patient_id", user!.id)
        .order("appointment_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Lab results
  const { data: labResults, isLoading: labLoading } = useQuery({
    queryKey: ["patient-lab-results", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lab_results")
        .select("*, doctors(full_name)")
        .eq("patient_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Documents
  const { data: documents, isLoading: docsLoading } = useQuery({
    queryKey: ["patient-documents", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*, doctors(full_name)")
        .eq("patient_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Prescriptions
  const { data: prescriptions } = useQuery({
    queryKey: ["patient-prescriptions", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prescriptions")
        .select("*, doctors(full_name)")
        .eq("patient_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const nextAppointment = appointments?.find(
    (a) => a.status === "pending" || a.status === "confirmed"
  );

  const latestLab = labResults?.[0];

  const getDeptName = (dept: any) => {
    if (!dept) return "—";
    if (language === "mk") return dept.name_mk || dept.name_en;
    if (language === "sq") return dept.name_sq || dept.name_en;
    return dept.name_en;
  };

  const handleSaveProfile = async () => {
    if (!user || !profileForm) return;
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profileForm.full_name,
        phone: profileForm.phone,
        date_of_birth: profileForm.date_of_birth || null,
        gender: profileForm.gender || null,
        address: profileForm.address || null,
      })
      .eq("id", user.id);
    if (error) {
      toast.error("Failed to save profile");
    } else {
      toast.success("Profile updated");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      confirmed: "default",
      completed: "secondary",
      cancelled: "destructive",
      no_show: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  // Init profile form
  if (tab === "profile") initForm();

  return (
    <Layout>
      <div className="container py-10">
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          {/* Sidebar */}
          <div className="space-y-1">
            {[
              { key: "overview", icon: Activity, label: t("portal.overview") },
              { key: "appointments", icon: Calendar, label: t("portal.appointments") },
              { key: "lab", icon: FileText, label: t("portal.labResults") },
              { key: "documents", icon: Download, label: t("portal.documents") },
              { key: "profile", icon: User, label: t("portal.profile") },
            ].map((item) => (
              <Button
                key={item.key}
                variant={tab === item.key ? "secondary" : "ghost"}
                className="w-full justify-start gap-2"
                onClick={() => setTab(item.key)}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </div>

          {/* Content */}
          <div>
            {tab === "overview" && (
              <div className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-bold">
                      {t("portal.welcome")}, {profile?.full_name || user?.email}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {language === "mk"
                        ? "Преглед на вашата здравствена картичка"
                        : language === "sq"
                        ? "Përmbledhje e kartelës suaj shëndetësore"
                        : "Overview of your health record"}
                    </p>
                  </CardContent>
                </Card>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">
                        {language === "mk" ? "Следен термин" : language === "sq" ? "Termini i ardhshëm" : "Next Appointment"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {nextAppointment ? (
                        <>
                          <p className="text-lg font-semibold">
                            {nextAppointment.appointment_date} {nextAppointment.start_time}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {(nextAppointment as any).doctors?.title || ""}{" "}
                            {(nextAppointment as any).doctors?.full_name} ·{" "}
                            {getDeptName((nextAppointment as any).departments)}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {language === "mk" ? "Нема закажани термини" : language === "sq" ? "Nuk ka termine" : "No upcoming appointments"}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">{t("portal.labResults")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {latestLab ? (
                        <>
                          <p className="text-lg font-semibold">{latestLab.test_name}</p>
                          <Badge variant="secondary" className="mt-1">{latestLab.status}</Badge>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {language === "mk" ? "Нема резултати" : language === "sq" ? "Nuk ka rezultate" : "No lab results"}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
                {/* Active prescriptions summary */}
                {prescriptions && prescriptions.filter((p) => p.status === "active").length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">
                        {language === "mk" ? "Активни рецепти" : language === "sq" ? "Recetat aktive" : "Active Prescriptions"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {prescriptions.filter((p) => p.status === "active").map((p) => (
                          <div key={p.id} className="flex items-center justify-between text-sm">
                            <span className="font-medium">{p.medication_name}</span>
                            <span className="text-muted-foreground">{p.dosage} · {p.frequency}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {tab === "appointments" && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("portal.appointments")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {aptsLoading ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">Loading...</p>
                  ) : !appointments?.length ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      {language === "mk" ? "Нема термини" : language === "sq" ? "Nuk ka termine" : "No appointments found"}
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{language === "mk" ? "Датум" : language === "sq" ? "Data" : "Date"}</TableHead>
                          <TableHead>{language === "mk" ? "Време" : language === "sq" ? "Ora" : "Time"}</TableHead>
                          <TableHead>{language === "mk" ? "Доктор" : language === "sq" ? "Mjeku" : "Doctor"}</TableHead>
                          <TableHead>{language === "mk" ? "Одделение" : language === "sq" ? "Departamenti" : "Department"}</TableHead>
                          <TableHead>{language === "mk" ? "Статус" : language === "sq" ? "Statusi" : "Status"}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {appointments.map((a) => (
                          <TableRow key={a.id}>
                            <TableCell>{a.appointment_date}</TableCell>
                            <TableCell>{a.start_time} - {a.end_time}</TableCell>
                            <TableCell>
                              {(a as any).doctors?.title || ""} {(a as any).doctors?.full_name || "—"}
                            </TableCell>
                            <TableCell>{getDeptName((a as any).departments)}</TableCell>
                            <TableCell>{getStatusBadge(a.status)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            )}

            {tab === "lab" && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("portal.labResults")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {labLoading ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">Loading...</p>
                  ) : !labResults?.length ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      {language === "mk" ? "Нема резултати" : language === "sq" ? "Nuk ka rezultate" : "No lab results found"}
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{language === "mk" ? "Датум" : language === "sq" ? "Data" : "Date"}</TableHead>
                          <TableHead>{language === "mk" ? "Тест" : language === "sq" ? "Testi" : "Test"}</TableHead>
                          <TableHead>{language === "mk" ? "Резултат" : language === "sq" ? "Rezultati" : "Result"}</TableHead>
                          <TableHead>{language === "mk" ? "Референтна вредност" : language === "sq" ? "Vlera referente" : "Reference"}</TableHead>
                          <TableHead>{language === "mk" ? "Статус" : language === "sq" ? "Statusi" : "Status"}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {labResults.map((r) => (
                          <TableRow key={r.id}>
                            <TableCell>{new Date(r.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>{r.test_name}</TableCell>
                            <TableCell>{r.result_value || "—"} {r.unit || ""}</TableCell>
                            <TableCell>{r.reference_range || "—"}</TableCell>
                            <TableCell>
                              <Badge variant={r.status === "completed" ? "default" : "secondary"}>
                                {r.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            )}

            {tab === "documents" && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("portal.documents")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {docsLoading ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">Loading...</p>
                  ) : !documents?.length ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      {language === "mk" ? "Нема документи" : language === "sq" ? "Nuk ka dokumente" : "No documents found"}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between rounded-lg border p-3">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm font-medium">{doc.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(doc.created_at).toLocaleDateString()} · {doc.category.replace("_", " ")}
                              </p>
                            </div>
                          </div>
                          {doc.file_url && (
                            <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="icon">
                                <Download className="h-4 w-4" />
                              </Button>
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {tab === "profile" && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("portal.profile")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("auth.fullName")}</label>
                    <Input
                      value={profileForm?.full_name || ""}
                      onChange={(e) => setProfileForm((f) => f ? { ...f, full_name: e.target.value } : f)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input value={user?.email || ""} disabled className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("auth.phone")}</label>
                    <Input
                      value={profileForm?.phone || ""}
                      onChange={(e) => setProfileForm((f) => f ? { ...f, phone: e.target.value } : f)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("auth.dob")}</label>
                    <Input
                      type="date"
                      value={profileForm?.date_of_birth || ""}
                      onChange={(e) => setProfileForm((f) => f ? { ...f, date_of_birth: e.target.value } : f)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {language === "mk" ? "Пол" : language === "sq" ? "Gjinia" : "Gender"}
                    </label>
                    <Input
                      value={profileForm?.gender || ""}
                      onChange={(e) => setProfileForm((f) => f ? { ...f, gender: e.target.value } : f)}
                      placeholder={language === "mk" ? "М/Ж" : language === "sq" ? "M/F" : "M/F"}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {language === "mk" ? "Адреса" : language === "sq" ? "Adresa" : "Address"}
                    </label>
                    <Input
                      value={profileForm?.address || ""}
                      onChange={(e) => setProfileForm((f) => f ? { ...f, address: e.target.value } : f)}
                    />
                  </div>
                  <Button onClick={handleSaveProfile}>
                    {language === "mk" ? "Зачувај" : language === "sq" ? "Ruaj" : "Save"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
