import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import Layout from "@/components/layout/Layout";

export default function RegisterPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", phone: "", dob: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Supabase auth
  };

  return (
    <Layout>
      <div className="flex min-h-[60vh] items-center justify-center py-10">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>{t("auth.register")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input placeholder={t("auth.fullName")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <Input type="email" placeholder={t("auth.email")} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              <Input placeholder={t("auth.phone")} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <Input type="date" placeholder={t("auth.dob")} value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
              <Input type="password" placeholder={t("auth.password")} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              <Input type="password" placeholder={t("auth.confirmPassword")} value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
              <Button type="submit" className="w-full">{t("auth.register")}</Button>
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
