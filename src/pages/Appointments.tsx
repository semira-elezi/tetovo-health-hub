import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Loader2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import Layout from "@/components/layout/Layout";
import { useDepartments } from "@/hooks/useDepartments";
import { useDoctors } from "@/hooks/useDoctors";
import { useCreateAppointment } from "@/hooks/useAppointments";
import { useAuth } from "@/hooks/useAuth";
import { createNotification } from "@/services/notificationService";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const timeSlots = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

export default function AppointmentsPage() {
  const { t, language } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [departmentSlug, setDepartmentSlug] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [confirmedId, setConfirmedId] = useState("");
  const { data: departments } = useDepartments();

  const selectedDept = departments?.find((d) => d.slug === departmentSlug);
  const { data: doctors, isLoading: doctorsLoading } = useDoctors(selectedDept?.id);
  const createAppointment = useCreateAppointment();

  const getName = (d: any) => {
    if (language === "mk") return d.name_mk || d.name_en;
    if (language === "sq") return d.name_sq || d.name_en;
    return d.name_en;
  };

  const selectedDoctor = doctors?.find((d) => d.id === doctorId);

  const handleConfirm = async () => {
    if (!user) {
      toast.error(language === "mk" ? "Најавете се прво" : language === "sq" ? "Kyçuni fillimisht" : "Please log in first");
      navigate("/login");
      return;
    }
    if (!selectedDept || !doctorId || !date || !time) return;

    const endHour = String(parseInt(time.split(":")[0]) + 1).padStart(2, "0");
    const endTime = `${endHour}:00`;

    try {
      const result = await createAppointment.mutateAsync({
        doctor_id: doctorId,
        department_id: selectedDept.id,
        appointment_date: date.toISOString().split("T")[0],
        start_time: time,
        end_time: endTime,
        reason: notes || undefined,
      });

      setConfirmedId(result.id.slice(0, 8).toUpperCase());

      // Notify the doctor
      if (selectedDoctor?.user_id) {
        await createNotification({
          user_id: selectedDoctor.user_id,
          title: "New Appointment Booked",
          message: `A patient booked an appointment on ${date.toLocaleDateString()} at ${time}`,
          type: "appointment",
          link: "/doctor/dashboard",
        }).catch(() => {});
      }

      setStep(5);
    } catch (err: any) {
      toast.error(err.message || "Failed to book appointment");
    }
  };

  if (step === 5) {
    const deptName = selectedDept ? getName(selectedDept) : departmentSlug;
    return (
      <Layout>
        <div className="container max-w-lg py-20 text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-success" />
          <h2 className="mt-4 text-2xl font-bold">{t("appointments.success")}</h2>
          <Card className="mt-6 text-left rounded-2xl border shadow-card">
            <CardContent className="pt-6 space-y-2 text-sm">
              <p><span className="font-medium">ID:</span> APT-{confirmedId}</p>
              <p><span className="font-medium">{t("portal.department")}:</span> {deptName}</p>
              <p><span className="font-medium">{t("portal.doctor")}:</span> {selectedDoctor?.full_name}</p>
              <p><span className="font-medium">{t("portal.date")}:</span> {date?.toLocaleDateString()} {time}</p>
            </CardContent>
          </Card>
          <Button className="mt-6 rounded-full" onClick={() => { setStep(1); setDepartmentSlug(""); setDoctorId(""); setDate(undefined); setTime(""); setNotes(""); }}>
            {language === "mk" ? "Нов термин" : language === "sq" ? "Termin i ri" : "New Appointment"}
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-2xl py-10">
        <h1 className="text-2xl font-bold">{t("appointments.title")}</h1>

        <div className="mt-6 flex gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={cn("h-1.5 flex-1 rounded-full", s <= step ? "bg-primary" : "bg-muted")} />
          ))}
        </div>

        <Card className="mt-6 rounded-2xl border shadow-card">
          <CardContent className="pt-6">
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="font-semibold">{t("appointments.selectDept")}</h3>
                <Select value={departmentSlug} onValueChange={(v) => { setDepartmentSlug(v); setDoctorId(""); }}>
                  <SelectTrigger><SelectValue placeholder={t("appointments.selectDept")} /></SelectTrigger>
                  <SelectContent>
                    {(departments || []).map((d) => (
                      <SelectItem key={d.slug} value={d.slug}>{getName(d)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button disabled={!departmentSlug} onClick={() => setStep(2)} className="w-full rounded-full">
                  {language === "mk" ? "Следно" : language === "sq" ? "Tjetër" : "Next"}
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="font-semibold">{t("appointments.selectDoctor")}</h3>
                {doctorsLoading ? (
                  <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                ) : (
                  <Select value={doctorId} onValueChange={setDoctorId}>
                    <SelectTrigger><SelectValue placeholder={t("appointments.selectDoctor")} /></SelectTrigger>
                    <SelectContent>
                      {(doctors || []).map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.title ? `${d.title} ` : ""}{d.full_name}{d.specialization ? ` — ${d.specialization}` : ""}
                        </SelectItem>
                      ))}
                      {doctors?.length === 0 && (
                        <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                          {language === "mk" ? "Нема доктори" : language === "sq" ? "Nuk ka mjekë" : "No doctors available"}
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1 rounded-full">{language === "mk" ? "Назад" : language === "sq" ? "Prapa" : "Back"}</Button>
                  <Button disabled={!doctorId} onClick={() => setStep(3)} className="flex-1 rounded-full">{language === "mk" ? "Следно" : language === "sq" ? "Tjetër" : "Next"}</Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h3 className="font-semibold">{t("appointments.selectDate")}</h3>
                <Calendar mode="single" selected={date} onSelect={setDate} disabled={(d) => d < new Date() || d.getDay() === 0} className="mx-auto pointer-events-auto" />
                {date && (
                  <div className="flex flex-wrap gap-2">
                    {timeSlots.map((slot) => (
                      <Badge key={slot} variant={time === slot ? "default" : "outline"} className="cursor-pointer rounded-full" onClick={() => setTime(slot)}>{slot}</Badge>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1 rounded-full">{language === "mk" ? "Назад" : language === "sq" ? "Prapa" : "Back"}</Button>
                  <Button disabled={!date || !time} onClick={() => setStep(4)} className="flex-1 rounded-full">{language === "mk" ? "Следно" : language === "sq" ? "Tjetër" : "Next"}</Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h3 className="font-semibold">{t("appointments.confirm")}</h3>
                <Input placeholder={t("auth.fullName")} value={name} onChange={(e) => setName(e.target.value)} required className="rounded-xl" />
                <Input placeholder={t("auth.phone")} value={phone} onChange={(e) => setPhone(e.target.value)} required className="rounded-xl" />
                <Textarea placeholder={t("appointments.notes")} value={notes} onChange={(e) => setNotes(e.target.value)} className="rounded-xl" />
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(3)} className="flex-1 rounded-full">{language === "mk" ? "Назад" : language === "sq" ? "Prapa" : "Back"}</Button>
                  <Button disabled={!name || !phone || createAppointment.isPending} onClick={handleConfirm} className="flex-1 rounded-full">
                    {createAppointment.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t("appointments.confirm")}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}