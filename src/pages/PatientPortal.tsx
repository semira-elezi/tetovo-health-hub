import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, FileText, Download, User, Activity } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import Layout from "@/components/layout/Layout";

export default function PatientPortal() {
  const { t, language } = useTranslation();
  const [tab, setTab] = useState("overview");

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
                    <h2 className="text-xl font-bold">{t("portal.welcome")}, Patient</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {language === "mk" ? "Преглед на вашата здравствена картичка" : language === "sq" ? "Përmbledhje e kartelës suaj shëndetësore" : "Overview of your health record"}
                    </p>
                  </CardContent>
                </Card>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Card>
                    <CardHeader><CardTitle className="text-sm">{language === "mk" ? "Следен термин" : language === "sq" ? "Termini i ardhshëm" : "Next Appointment"}</CardTitle></CardHeader>
                    <CardContent>
                      <p className="text-lg font-semibold">2026-04-01 10:00</p>
                      <p className="text-sm text-muted-foreground">Dr. Arben Ismaili · {language === "mk" ? "Кардиологија" : language === "sq" ? "Kardiologji" : "Cardiology"}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle className="text-sm">{t("portal.labResults")}</CardTitle></CardHeader>
                    <CardContent>
                      <p className="text-lg font-semibold">{language === "mk" ? "Крвна слика" : language === "sq" ? "Analiza e gjakut" : "Blood Work"}</p>
                      <Badge variant="secondary" className="mt-1">{language === "mk" ? "Нормално" : language === "sq" ? "Normale" : "Normal"}</Badge>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {tab === "appointments" && (
              <Card>
                <CardHeader><CardTitle>{t("portal.appointments")}</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{language === "mk" ? "Датум" : language === "sq" ? "Data" : "Date"}</TableHead>
                        <TableHead>{language === "mk" ? "Доктор" : language === "sq" ? "Mjeku" : "Doctor"}</TableHead>
                        <TableHead>{language === "mk" ? "Одделение" : language === "sq" ? "Departamenti" : "Department"}</TableHead>
                        <TableHead>{language === "mk" ? "Статус" : language === "sq" ? "Statusi" : "Status"}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>2026-04-01</TableCell>
                        <TableCell>Dr. Arben Ismaili</TableCell>
                        <TableCell>{language === "mk" ? "Кардиологија" : language === "sq" ? "Kardiologji" : "Cardiology"}</TableCell>
                        <TableCell><Badge>{language === "mk" ? "Закажан" : language === "sq" ? "Planifikuar" : "Scheduled"}</Badge></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>2026-03-10</TableCell>
                        <TableCell>Dr. Elena Stojanova</TableCell>
                        <TableCell>{language === "mk" ? "Неврологија" : language === "sq" ? "Neurologji" : "Neurology"}</TableCell>
                        <TableCell><Badge variant="secondary">{language === "mk" ? "Завршен" : language === "sq" ? "Përfunduar" : "Completed"}</Badge></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {tab === "lab" && (
              <Card>
                <CardHeader><CardTitle>{t("portal.labResults")}</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{language === "mk" ? "Датум" : language === "sq" ? "Data" : "Date"}</TableHead>
                        <TableHead>{language === "mk" ? "Тест" : language === "sq" ? "Testi" : "Test"}</TableHead>
                        <TableHead>{language === "mk" ? "Резултат" : language === "sq" ? "Rezultati" : "Result"}</TableHead>
                        <TableHead>{language === "mk" ? "Статус" : language === "sq" ? "Statusi" : "Status"}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>2026-03-18</TableCell>
                        <TableCell>{language === "mk" ? "Крвна слика" : language === "sq" ? "Analiza e gjakut" : "Blood Work"}</TableCell>
                        <TableCell>RBC: 4.8, WBC: 7.2</TableCell>
                        <TableCell><Badge className="bg-success text-success-foreground">{language === "mk" ? "Нормално" : language === "sq" ? "Normale" : "Normal"}</Badge></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>2026-03-18</TableCell>
                        <TableCell>{language === "mk" ? "Гликемија" : language === "sq" ? "Glicemia" : "Blood Sugar"}</TableCell>
                        <TableCell>6.2 mmol/L</TableCell>
                        <TableCell><Badge className="bg-warning text-warning-foreground">{language === "mk" ? "Покачено" : language === "sq" ? "I rritur" : "Elevated"}</Badge></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {tab === "documents" && (
              <Card>
                <CardHeader><CardTitle>{t("portal.documents")}</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: language === "mk" ? "Отпусно писмо" : language === "sq" ? "Letra e lirimit" : "Discharge Summary", date: "2026-03-10" },
                      { name: language === "mk" ? "Рецепт" : language === "sq" ? "Receta" : "Prescription", date: "2026-03-10" },
                      { name: language === "mk" ? "Лабораториски извештај" : language === "sq" ? "Raporti laboratorik" : "Lab Report", date: "2026-03-18" },
                    ].map((doc) => (
                      <div key={doc.name} className="flex items-center justify-between rounded-lg border p-3">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm font-medium">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">{doc.date}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {tab === "profile" && (
              <Card>
                <CardHeader><CardTitle>{t("portal.profile")}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <Input placeholder={t("auth.fullName")} defaultValue="Patient Name" />
                  <Input placeholder={t("auth.phone")} defaultValue="+389 70 123 456" />
                  <Input type="email" placeholder={t("auth.email")} defaultValue="patient@email.com" />
                  <Input type="date" placeholder={t("auth.dob")} defaultValue="1990-01-15" />
                  <Input placeholder={language === "mk" ? "Крвна група" : language === "sq" ? "Grupi i gjakut" : "Blood Type"} defaultValue="A+" />
                  <Button>{language === "mk" ? "Зачувај" : language === "sq" ? "Ruaj" : "Save"}</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
