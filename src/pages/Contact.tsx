import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, AlertTriangle } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import Layout from "@/components/layout/Layout";
import { toast } from "sonner";

export default function ContactPage() {
  const { t, language } = useTranslation();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(language === "mk" ? "Пораката е испратена!" : language === "sq" ? "Mesazhi u dërgua!" : "Message sent!");
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <Layout>
      <div className="container py-10">
        <h1 className="text-3xl font-bold">{t("contact.title")}</h1>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Info Cards */}
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: MapPin, title: language === "mk" ? "Адреса" : language === "sq" ? "Adresa" : "Address", value: t("footer.address") },
                { icon: Phone, title: t("contact.phone"), value: "+389 44 334 100" },
                { icon: Mail, title: t("contact.email"), value: "info@kbt.mk" },
                { icon: AlertTriangle, title: t("contact.emergencyLine"), value: "194" },
              ].map((item) => (
                <Card key={item.title}>
                  <CardContent className="flex items-start gap-3 pt-6">
                    <item.icon className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Map placeholder */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex h-48 items-center justify-center rounded-lg bg-accent text-sm text-muted-foreground">
                  <MapPin className="mr-2 h-4 w-4" />
                  <a href="https://maps.google.com/?q=Clinical+Hospital+Tetovo" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {language === "mk" ? "Отвори во Maps" : language === "sq" ? "Hap në Maps" : "Open in Maps"}
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Working Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("contact.workingHours")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {[
                    { dept: language === "mk" ? "Амбуланта" : language === "sq" ? "Ambulanca" : "Outpatient", hours: "07:00 - 20:00" },
                    { dept: language === "mk" ? "Итна помош" : language === "sq" ? "Urgjenca" : "Emergency", hours: "24/7" },
                    { dept: language === "mk" ? "Лабораторија" : language === "sq" ? "Laboratori" : "Laboratory", hours: "07:00 - 15:00" },
                    { dept: language === "mk" ? "Администрација" : language === "sq" ? "Administrata" : "Administration", hours: "08:00 - 16:00" },
                  ].map((row) => (
                    <div key={row.dept} className="flex justify-between">
                      <span className="text-muted-foreground">{row.dept}</span>
                      <span className="font-medium">{row.hours}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("contact.send")} {language === "mk" ? "порака" : language === "sq" ? "mesazh" : "a message"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input placeholder={t("contact.name")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                <Input type="email" placeholder={t("contact.email")} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                <Input placeholder={t("contact.subject")} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
                <Textarea placeholder={t("contact.message")} rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
                <Button type="submit" className="w-full">{t("contact.send")}</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
