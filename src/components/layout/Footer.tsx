import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, ArrowUpRight } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function Footer() {
  const { t, language } = useTranslation();

  return (
    <footer className="relative overflow-hidden border-t border-border/50">
      <div className="absolute inset-0 bg-gradient-to-b from-background to-muted/30" />
      <div className="container relative z-10 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary shadow-md">
                <span className="text-xs font-bold text-primary-foreground">SKT</span>
              </div>
              <span className="font-bold tracking-tight">
                {language === "sq" ? "Spitali Klinik Tetovë" : language === "en" ? "Clinical Hospital Tetovo" : "Клиничка Болница Тетово"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{t("footer.address")}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold">{t("nav.departments")}</h4>
            <div className="flex flex-col gap-2.5">
              {["cardiology", "emergency", "surgery"].map((dept) => (
                <Link
                  key={dept}
                  to="/departments"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center gap-1 group"
                >
                  {t(`dept.${dept}` as any)}
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-sm font-semibold">{t("contact.title")}</h4>
            <div className="flex flex-col gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Phone className="h-3.5 w-3.5 text-primary" />
                </div>
                +389 44 334 100
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Mail className="h-3.5 w-3.5 text-primary" />
                </div>
                info@kbt.mk
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                </div>
                {t("footer.address")}
              </div>
            </div>
          </div>

          {/* Emergency */}
          <div>
            <h4 className="mb-4 text-sm font-semibold">{t("contact.emergencyLine")}</h4>
            <div className="glass-card p-5 text-center">
              <p className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">194</p>
              <p className="mt-1 text-sm text-muted-foreground">24/7</p>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-border/50 pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {language === "sq" ? "Spitali Klinik Tetovë" : "Clinical Hospital Tetovo"}. {t("footer.rights")}
        </div>
      </div>
    </footer>
  );
}
