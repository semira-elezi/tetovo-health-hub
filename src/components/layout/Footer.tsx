import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, ExternalLink } from "lucide-react";
import { useTranslation, Language } from "@/lib/i18n";

export default function Footer() {
  const { language, setLanguage, t } = useTranslation();

  return (
    <footer className="bg-foreground text-background">
      <div className="container py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1 — Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M7 3h2v10H7V3z" fill="white" />
                  <path d="M3 7h10v2H3V7z" fill="white" />
                </svg>
              </div>
              <span className="text-sm font-bold">{t("footer.hospitalName")}</span>
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
                { label: t("footer.laws"), to: "/about" },
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
              <Link to="/about" className="text-sm text-background/60 hover:text-background transition-colors">
                {t("footer.patientRights")}
              </Link>
              <a href="http://alodoktore.mk/" target="_blank" rel="noopener noreferrer" className="text-sm text-background/60 hover:text-background transition-colors">
                Alo Doktore
              </a>
              <a href="https://msc.gov.mk/" target="_blank" rel="noopener noreferrer" className="text-sm text-background/60 hover:text-background transition-colors">
                {language === "mk" ? "Центар за медицинска симулација" : language === "sq" ? "Qendra e Simulimit Mjekësor" : "Medical Simulation Centre"}
              </a>
              <a href="https://vlada.mk/" target="_blank" rel="noopener noreferrer" className="text-sm text-background/60 hover:text-background transition-colors">
                {language === "mk" ? "Влада на Северна Македонија" : language === "sq" ? "Qeveria e Maqedonisë së Veriut" : "Government of North Macedonia"}
              </a>
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

        <div className="mt-12 border-t border-background/10 pt-6 text-center text-sm text-background/40">
          {t("footer.rights")}
        </div>
      </div>
    </footer>
  );
}
