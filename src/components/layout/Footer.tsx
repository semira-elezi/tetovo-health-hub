import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-xs font-bold text-primary-foreground">КБ</span>
              </div>
              <span className="font-semibold">Clinical Hospital Tetovo</span>
            </div>
            <p className="text-sm text-muted-foreground">{t("footer.address")}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-3 text-sm font-semibold">{t("nav.departments")}</h4>
            <div className="flex flex-col gap-2">
              <Link to="/departments" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {t("dept.cardiology")}
              </Link>
              <Link to="/departments" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {t("dept.emergency")}
              </Link>
              <Link to="/departments" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {t("dept.surgery")}
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-3 text-sm font-semibold">{t("contact.title")}</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" /> +389 44 334 100
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> info@kbt.mk
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> {t("footer.address")}
              </div>
            </div>
          </div>

          {/* Emergency */}
          <div>
            <h4 className="mb-3 text-sm font-semibold">{t("contact.emergencyLine")}</h4>
            <p className="text-2xl font-bold text-primary">194</p>
            <p className="mt-1 text-sm text-muted-foreground">24/7</p>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Clinical Hospital Tetovo. {t("footer.rights")}
        </div>
      </div>
    </footer>
  );
}
