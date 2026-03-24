import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, AlertCircle, ExternalLink } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n";

export default function ContactPage() {
  const { t, language } = useTranslation();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(t("contact.messageSent"));
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <Layout>
      <div className="container py-16">
        <h1 className="text-3xl font-bold md:text-4xl">{t("contact.title")}</h1>
        <p className="mt-3 text-muted-foreground">{t("contact.subtitle")}</p>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <Card className="rounded-2xl border shadow-card">
              <CardContent className="flex items-start gap-4 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{t("contact.address")}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {language === "mk" ? "ул. 29 Ноември бб, 1200 Тетово, Северна Македонија" : language === "sq" ? "rr. 29 Nëntori bb, 1200 Tetovë, Maqedonia e Veriut" : "st. 29 Noemvri bb, 1200 Tetovo, North Macedonia"}
                  </p>
                  <a href="https://maps.app.goo.gl/sAVbfDznZ8d7CcgW6" target="_blank" rel="noopener noreferrer" className="mt-1 text-xs text-primary hover:underline inline-flex items-center gap-1">
                    {t("contact.openMaps")} <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border shadow-card">
              <CardContent className="flex items-start gap-4 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10">
                  <Phone className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{t("contact.phone")}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">+389 75 200 304</p>
                  <p className="text-xs text-muted-foreground">{t("contact.available24")}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border shadow-card">
              <CardContent className="flex items-start gap-4 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Email</p>
                  <p className="text-sm text-muted-foreground mt-0.5">kbtetovo@zdravstvo.gov.mk</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border shadow-card bg-destructive text-destructive-foreground">
              <CardContent className="flex items-start gap-4 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive-foreground/20">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{t("contact.emergencyLine")}</p>
                  <p className="text-lg font-bold mt-0.5">194 ({language === "mk" ? "Национална итна помош" : language === "sq" ? "Urgjenca Kombëtare" : "National Emergency"})</p>
                  <p className="text-xs opacity-80">{t("contact.available24h")}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border shadow-card">
              <CardHeader><CardTitle className="text-base">{t("contact.workingHours")}</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  {[
                    { dept: t("contact.emergency"), hours: "24/7" },
                    { dept: t("contact.outpatient"), hours: language === "mk" ? "Пон–Пет 07:00–15:00" : language === "sq" ? "Hën–Pre 07:00–15:00" : "Mon–Fri 07:00–15:00" },
                    { dept: t("contact.hospitalizations"), hours: language === "mk" ? "Пон–Пет 07:00–19:00" : language === "sq" ? "Hën–Pre 07:00–19:00" : "Mon–Fri 07:00–19:00" },
                    { dept: t("contact.pharmacy"), hours: language === "mk" ? "Пон–Пет 07:00–19:00" : language === "sq" ? "Hën–Pre 07:00–19:00" : "Mon–Fri 07:00–19:00" },
                  ].map((row) => (
                    <div key={row.dept} className="flex justify-between border-b pb-2 last:border-0 last:pb-0">
                      <span className="text-muted-foreground">{row.dept}</span>
                      <span className="font-medium">{row.hours}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="rounded-2xl border shadow-card">
              <CardHeader><CardTitle className="text-base">{t("contact.sendMessage")}</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input placeholder={t("contact.name")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="rounded-xl" />
                  <Input type="email" placeholder={t("contact.email")} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="rounded-xl" />
                  <Input placeholder={t("contact.subject")} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required className="rounded-xl" />
                  <Textarea placeholder={t("contact.message")} rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required className="rounded-xl" />
                  <Button type="submit" className="w-full rounded-full btn-press">{t("contact.send")}</Button>
                </form>
                <p className="mt-4 text-center text-xs text-muted-foreground">{t("contact.socialMedia")}</p>
                <div className="mt-2 flex items-center justify-center gap-3">
                  <a href="https://www.facebook.com/KlinikaTetovo" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">Facebook</a>
                  <a href="https://www.youtube.com/@clinicalhtetovo" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">YouTube</a>
                </div>
              </CardContent>
            </Card>

            <div className="relative rounded-2xl border bg-muted h-[400px] flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-8 w-8 text-muted-foreground mx-auto" />
                <a href="https://maps.app.goo.gl/sAVbfDznZ8d7CcgW6" target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                  {t("contact.openMaps")} <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
