import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/layout/Layout";
import { toast } from "sonner";

export default function RegisterPage() {
  const { t, language } = useTranslation();
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", phone: "", dob: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error(language === "mk" ? "Лозинката мора да има најмалку 6 карактери" : language === "sq" ? "Fjalëkalimi duhet të ketë të paktën 6 karaktere" : "Password must be at least 6 characters");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error(language === "mk" ? "Лозинките не се совпаѓаат" : language === "sq" ? "Fjalëkalimet nuk përputhen" : "Passwords do not match");
      return;
    }
    setLoading(true);
    const { error } = await signUp(form.email, form.password, {
      fullName: form.name,
      phone: form.phone,
      dateOfBirth: form.dob,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(language === "mk" ? "Профилот е креиран! Најавете се." : language === "sq" ? "Llogaria u krijua! Hyni tani." : "Account created successfully!");
      navigate("/");
    }
  };

  return (
    <Layout>
      <div className="flex min-h-[60vh] items-center justify-center py-10">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>{t("auth.register")}</CardTitle>
            <CardDescription>
              {language === "mk" ? "Регистрирајте се како пациент" : language === "sq" ? "Regjistrohuni si pacient" : "Register as a patient"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>{t("auth.fullName")} *</Label>
                <Input placeholder={t("auth.fullName")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>{t("auth.email")} *</Label>
                <Input type="email" placeholder={t("auth.email")} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>{t("auth.phone")}</Label>
                <Input placeholder="+389 7X XXX XXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t("auth.dob")}</Label>
                <Input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t("auth.password")} *</Label>
                <Input type="password" placeholder={t("auth.password")} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>{t("auth.confirmPassword")} *</Label>
                <Input type="password" placeholder={t("auth.confirmPassword")} value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "..." : t("auth.register")}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              {t("auth.hasAccount")}{" "}
              <Link to="/auth/login" className="text-primary hover:underline">{t("auth.login")}</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
