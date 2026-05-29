import { useState } from "react";
import { Droplet, Heart, ShieldCheck, Clock, Phone, MapPin, CheckCircle2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslation } from "@/lib/i18n";
import { useBloodStock } from "@/hooks/useBloodStock";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "unknown"] as const;

function levelStyle(level: string) {
  switch (level) {
    case "critical":
      return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30";
    case "low":
      return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30";
    default:
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
  }
}

export default function BloodDonation() {
  const { language } = useTranslation();
  const { data: stock } = useBloodStock();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    blood_type: "unknown" as (typeof BLOOD_TYPES)[number],
    date_of_birth: "",
    city: "",
    preferred_date: "",
    notes: "",
    consent_contact: true,
  });

  const T = {
    title: { mk: "Дарувајте крв, спасете живот", sq: "Dhuro Gjak, Shpëto Jetë", en: "Donate Blood, Save Lives" },
    sub: {
      mk: "Едно дарување може да спаси до три животи.",
      sq: "Një dhurim mund të shpëtojë deri në tre jetë.",
      en: "One donation can save up to three lives.",
    },
    stockTitle: { mk: "Тековни залихи", sq: "Stoku Aktual", en: "Current Stock Levels" },
    formTitle: { mk: "Регистрирајте се како дарител", sq: "Regjistrohu si Dhurues", en: "Register as a Donor" },
    name: { mk: "Име и презиме", sq: "Emri i plotë", en: "Full Name" },
    phone: { mk: "Телефон", sq: "Telefoni", en: "Phone" },
    email: { mk: "Е-пошта", sq: "Email", en: "Email" },
    bloodType: { mk: "Крвна група", sq: "Grupi i gjakut", en: "Blood Type" },
    dob: { mk: "Датум на раѓање", sq: "Data e lindjes", en: "Date of Birth" },
    city: { mk: "Град", sq: "Qyteti", en: "City" },
    pref: { mk: "Преферирана дата", sq: "Data e preferuar", en: "Preferred Date" },
    notes: { mk: "Забелешки", sq: "Shënime", en: "Notes" },
    consent: {
      mk: "Се согласувам да бидам контактиран/а",
      sq: "Pranoj të kontaktohem",
      en: "I consent to being contacted",
    },
    submit: { mk: "Поднесете", sq: "Dërgo", en: "Submit" },
    thanks: {
      mk: "Ви благодариме! Ќе ве контактираме наскоро.",
      sq: "Faleminderit! Do t'ju kontaktojmë së shpejti.",
      en: "Thank you! We will contact you soon.",
    },
  } as const;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.full_name || !form.phone) {
      toast.error(language === "sq" ? "Plotësoni emrin dhe telefonin" : "Name and phone required");
      return;
    }
    setSubmitting(true);
    const payload = {
      ...form,
      email: form.email || null,
      date_of_birth: form.date_of_birth || null,
      preferred_date: form.preferred_date || null,
      city: form.city || null,
      notes: form.notes || null,
    };
    const { error } = await supabase.from("blood_donation_requests").insert(payload);
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSubmitted(true);
    toast.success(T.thanks[language]);
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-red-900 via-red-800 to-rose-900 text-white">
        <div className="container py-14 md:py-20 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              <Droplet className="h-3.5 w-3.5" />
              {language === "sq" ? "Dhurim Gjaku" : language === "mk" ? "Дарување Крв" : "Blood Donation"}
            </div>
            <h1 className="mt-4 text-3xl md:text-5xl font-extrabold leading-tight">{T.title[language]}</h1>
            <p className="mt-4 text-base md:text-lg text-white/85 max-w-xl">{T.sub[language]}</p>

            <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
              {[
                { Icon: Heart, n: "3", l: language === "sq" ? "jetë" : language === "mk" ? "животи" : "lives" },
                { Icon: Clock, n: "45min", l: language === "sq" ? "kohëzgjatje" : language === "mk" ? "време" : "duration" },
                { Icon: ShieldCheck, n: "100%", l: language === "sq" ? "i sigurt" : language === "mk" ? "безбедно" : "safe" },
              ].map((s, i) => (
                <div key={i} className="rounded-xl bg-white/10 backdrop-blur p-3 text-center">
                  <s.Icon className="h-5 w-5 mx-auto mb-1" />
                  <p className="text-lg font-extrabold">{s.n}</p>
                  <p className="text-[10px] uppercase tracking-wider text-white/70">{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stock card */}
          <div className="rounded-2xl border border-white/15 bg-white/[0.08] backdrop-blur-md p-5 shadow-2xl">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Droplet className="h-4 w-4" /> {T.stockTitle[language]}
            </h2>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {(stock || []).map((s) => (
                <div
                  key={s.id}
                  className={`rounded-xl border px-2 py-3 text-center ${levelStyle(s.level)} bg-white/95`}
                >
                  <p className="text-lg font-extrabold">{s.blood_type}</p>
                  <p className="text-[10px] uppercase tracking-wider mt-0.5">{s.level}</p>
                  <p className="text-[10px] mt-0.5 opacity-70">{s.units}u</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[11px] text-white/60 italic">
              * {language === "sq" ? "Niveli kritik = nevojë urgjente" : language === "mk" ? "Критично = итна потреба" : "Critical = urgent need"}
            </p>
          </div>
        </div>
      </section>

      {/* Form + Info */}
      <section className="py-12 md:py-16">
        <div className="container grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 surface p-6 md:p-8">
            <h2 className="text-xl font-bold mb-1">{T.formTitle[language]}</h2>
            <p className="text-sm text-muted-foreground mb-6">
              {language === "sq"
                ? "Ekipi ynë do t'ju kontaktojë për të caktuar terminin."
                : language === "mk"
                ? "Нашиот тим ќе ве контактира за термин."
                : "Our team will contact you to schedule a time."}
            </p>

            {submitted ? (
              <div className="rounded-xl border bg-emerald-500/5 border-emerald-500/30 p-6 text-center">
                <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-500" />
                <p className="mt-3 font-semibold">{T.thanks[language]}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label>{T.name[language]} *</Label>
                  <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
                </div>
                <div>
                  <Label>{T.phone[language]} *</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                </div>
                <div>
                  <Label>{T.email[language]}</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <Label>{T.bloodType[language]}</Label>
                  <Select value={form.blood_type} onValueChange={(v) => setForm({ ...form, blood_type: v as any })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {BLOOD_TYPES.map((bt) => (
                        <SelectItem key={bt} value={bt}>{bt === "unknown" ? (language === "sq" ? "Nuk e di" : language === "mk" ? "Не знам" : "Don't know") : bt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{T.dob[language]}</Label>
                  <Input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} />
                </div>
                <div>
                  <Label>{T.city[language]}</Label>
                  <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                </div>
                <div>
                  <Label>{T.pref[language]}</Label>
                  <Input type="date" value={form.preferred_date} onChange={(e) => setForm({ ...form, preferred_date: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <Label>{T.notes[language]}</Label>
                  <Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>
                <div className="sm:col-span-2 flex items-center gap-2">
                  <Checkbox
                    id="consent"
                    checked={form.consent_contact}
                    onCheckedChange={(c) => setForm({ ...form, consent_contact: !!c })}
                  />
                  <Label htmlFor="consent" className="text-sm font-normal cursor-pointer">{T.consent[language]}</Label>
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                    {submitting ? "..." : T.submit[language]}
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Eligibility & contact */}
          <aside className="lg:col-span-2 space-y-4">
            <div className="surface p-6">
              <h3 className="font-semibold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-accent" />
                {language === "sq" ? "Kushtet e Dhurimit" : language === "mk" ? "Услови за дарување" : "Eligibility"}
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {(language === "sq"
                  ? ["Mosha 18–65 vjeç", "Pesha mbi 50 kg", "Shëndet i mirë", "Pa medikamente aktive", "I/E ushqyer dhe i/e pushuar"]
                  : language === "mk"
                  ? ["Возраст 18–65", "Тежина над 50 кг", "Добра здравствена состојба", "Без активни лекови", "Јаден/а и одморен/а"]
                  : ["Age 18–65", "Weight over 50 kg", "Good general health", "No active medication", "Well-fed and rested"]
                ).map((t, i) => (
                  <li key={i} className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /> {t}</li>
                ))}
              </ul>
            </div>

            <div className="surface p-6">
              <h3 className="font-semibold">
                {language === "sq" ? "Na Kontakto" : language === "mk" ? "Контакт" : "Contact Us"}
              </h3>
              <div className="mt-3 space-y-2 text-sm">
                <a href="tel:+38975200304" className="flex items-center gap-2 text-foreground/80 hover:text-primary">
                  <Phone className="h-4 w-4" /> +389 75 200 304
                </a>
                <p className="flex items-start gap-2 text-foreground/80">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                  {language === "sq" ? "Spitali Klinik, Tetovë" : language === "mk" ? "Клиничка Болница, Тетово" : "Clinical Hospital, Tetovo"}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </Layout>
  );
}
