import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/layout/Layout";
import { toast } from "sonner";

export default function LoginPage() {
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Logged in successfully!");
      navigate("/");
    }
  };

  return (
    <Layout>
      <div className="flex min-h-[60vh] items-center justify-center py-10">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>{t("auth.login")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input type="email" placeholder={t("auth.email")} value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input type="password" placeholder={t("auth.password")} value={password} onChange={(e) => setPassword(e.target.value)} required />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "..." : t("auth.login")}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              <Link to="#" className="text-primary hover:underline">{t("auth.forgotPassword")}</Link>
            </div>
            <div className="mt-2 text-center text-sm text-muted-foreground">
              {t("auth.noAccount")}{" "}
              <Link to="/auth/register" className="text-primary hover:underline">{t("auth.register")}</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
