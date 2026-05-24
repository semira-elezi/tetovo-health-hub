import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, ExternalLink } from "lucide-react";
import { useTranslation, Language } from "@/lib/i18n";

export default function Footer() {
  const { language, setLanguage, t } = useTranslation();

  return (
    <footer className="bg-foreground text-background">
      <div className="container py-10 md:py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1 — Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/logo.svg" alt="Clinical Hospital Tetovo" className="h-10 w-10 bg-background/10 rounded-md p-0.5" width={40} height={40} />
              <span className="text-sm font-bold leading-tight">{t("footer.hospitalName")}</span>
            </div>
            <p className="text-sm text-background/60 leading-relaxed">
              {t("footer.institution")}
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a href="https://www.facebook.com/KlinikaTetovo" target="_blank" rel="noopener noreferrer" className="text-background/60 hover:text-background transition-colors">
                <ExternalLink className="h-4 w-4" />
              </a>
              <a href="https://www.youtube.com/@clinicalhtetovo" target="_blank" rel="noopener noreferrer" className="text-background/60 hover:text-background transition-colors">
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Column 2 — Information */}
          <div>
            <h4 className="mb-4 text-sm font-semibold">{t("footer.information")}</h4>
            <div className="flex flex-col gap-2.5">
              {[
                { label: t("footer.aboutUs"), to: "/about" },
                { label: t("publicInfo.title"), to: "/public-info" },
                { label: t("footer.management"), to: "/about" },
                { label: t("footer.administration"), to: "/about" },
              ].map((item) => (
                <Link key={item.label} to={item.to} className="text-sm text-background/60 hover:text-background transition-colors">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Column 3 — Policies & Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold">{t("footer.policies")}</h4>
            <div className="flex flex-col gap-2.5">
              <Link to="/public-info" className="text-sm text-background/60 hover:text-background transition-colors">{t("footer.patientRights")}</Link>
              <Link to="/faq" className="text-sm text-background/60 hover:text-background transition-colors">{language === "mk" ? "ЧПП" : language === "sq" ? "Pyetjet" : "FAQ"}</Link>
              <Link to="/working-hours" className="text-sm text-background/60 hover:text-background transition-colors">{language === "mk" ? "Работно време" : language === "sq" ? "Orari" : "Working Hours"}</Link>
              <Link to="/terms" className="text-sm text-background/60 hover:text-background transition-colors">{language === "mk" ? "Услови" : language === "sq" ? "Termat" : "Terms"}</Link>
              <a href="http://alodoktore.mk/" target="_blank" rel="noopener noreferrer" className="text-sm text-background/60 hover:text-background transition-colors">Alo Doktore</a>
            </div>
          </div>

          {/* Column 4 — Contact */}
          <div>
            <h4 className="mb-4 text-sm font-semibold">{t("footer.contact")}</h4>
            <div className="flex flex-col gap-3 text-sm text-background/60">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{language === "mk" ? "ул. 29 Ноември бб, 1200 Тетово" : language === "sq" ? "rr. 29 Nëntori bb, 1200 Tetovë" : "st. 29 Noemvri bb, 1200 Tetovo"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <span>+389 75 200 304</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <span>kbtetovo@zdravstvo.gov.mk</span>
              </div>
            </div>

            {/* Language switcher */}
            <div className="mt-5 flex items-center gap-1">
              {(["mk", "sq", "en"] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    language === lang
                      ? "bg-primary text-primary-foreground"
                      : "text-background/50 hover:text-background"
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-background/10 pt-5 text-center text-xs text-background/50">
          {t("footer.rights")}
        </div>
      </div>
    </footer>
  );
}
