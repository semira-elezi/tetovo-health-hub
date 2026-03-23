import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, ExternalLink } from "lucide-react";
import { useTranslation, Language } from "@/lib/i18n";

export default function Footer() {
  const { language, setLanguage } = useTranslation();

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
              <span className="text-sm font-bold">Clinical Hospital Tetovo</span>
            </div>
            <p className="text-sm text-background/60 leading-relaxed">
              Public Health Institution — Tetovo, North Macedonia
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a
                href="https://www.facebook.com/KlinikaTetovo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-background/60 hover:text-background transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
              <a
                href="https://www.youtube.com/@clinicalhtetovo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-background/60 hover:text-background transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Column 2 — Information */}
          <div>
            <h4 className="mb-4 text-sm font-semibold">Information</h4>
            <div className="flex flex-col gap-2.5">
              {["About us", "Laws", "Management", "Administration"].map((item) => (
                <Link
                  key={item}
                  to="/about"
                  className="text-sm text-background/60 hover:text-background transition-colors"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          {/* Column 3 — Policies & Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold">Policies & Links</h4>
            <div className="flex flex-col gap-2.5">
              <Link to="/about" className="text-sm text-background/60 hover:text-background transition-colors">
                Rights and obligations of patients
              </Link>
              <a href="http://alodoktore.mk/" target="_blank" rel="noopener noreferrer" className="text-sm text-background/60 hover:text-background transition-colors">
                Alo Doktore
              </a>
              <a href="https://msc.gov.mk/" target="_blank" rel="noopener noreferrer" className="text-sm text-background/60 hover:text-background transition-colors">
                Medical Simulation Centre
              </a>
              <a href="https://vlada.mk/" target="_blank" rel="noopener noreferrer" className="text-sm text-background/60 hover:text-background transition-colors">
                Government of North Macedonia
              </a>
            </div>
          </div>

          {/* Column 4 — Contact */}
          <div>
            <h4 className="mb-4 text-sm font-semibold">Contact</h4>
            <div className="flex flex-col gap-3 text-sm text-background/60">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>st. 29 Noemvri bb, 1200 Tetovo</span>
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
          © 2025 Clinical Hospital Tetovo. All rights reserved. Powered by Optimus Solutions.
        </div>
      </div>
    </footer>
  );
}
