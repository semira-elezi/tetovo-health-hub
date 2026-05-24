import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useTranslation } from "@/lib/i18n";

export default function Terms() {
  const { language } = useTranslation();
  const t = {
    title: language === "mk" ? "Услови за користење" : language === "sq" ? "Termat e shërbimit" : "Terms of Service",
    intro: language === "mk"
      ? "Со пристапот и користењето на услугите на ЈЗУ Клиничка Болница Тетово ги прифаќате условите наведени подолу."
      : language === "sq"
      ? "Duke aksesuar dhe përdorur shërbimet e ISHP Spitali Klinik Tetovë, ju pranoni termat e listuara më poshtë."
      : "By accessing and using the services of PHI Clinical Hospital Tetovo, you accept the terms listed below.",
    sections: language === "mk" ? [
      { h: "1. Услуги", b: "Болницата нуди здравствени услуги во согласност со закон и медицински стандарди." },
      { h: "2. Пациентски обврски", b: "Пациентите треба да обезбедат точни информации и да следат медицински совети." },
      { h: "3. Закажување", b: "Терминот може да се откаже најмалку 2 часа однапред преку Пациентскиот портал." },
      { h: "4. Приватност", b: "Сите лични и медицински податоци се чуваат во согласност со ГДПР." },
      { h: "5. Одговорност", b: "Болницата не одговара за итни случаи надвор од 194 линија." },
    ] : language === "sq" ? [
      { h: "1. Shërbimet", b: "Spitali ofron shërbime shëndetësore në përputhje me ligjin dhe standardet mjekësore." },
      { h: "2. Detyrimet e pacientit", b: "Pacientët duhet të japin informacion të saktë dhe të ndjekin këshillat mjekësore." },
      { h: "3. Rezervimi", b: "Termini mund të anulohet të paktën 2 orë para përmes Portalit të Pacientit." },
      { h: "4. Privatësia", b: "Të gjitha të dhënat personale dhe mjekësore ruhen sipas GDPR." },
      { h: "5. Përgjegjësia", b: "Spitali nuk është përgjegjës për rastet urgjente jashtë linjës 194." },
    ] : [
      { h: "1. Services", b: "The hospital provides health services in accordance with the law and medical standards." },
      { h: "2. Patient obligations", b: "Patients must provide accurate information and follow medical advice." },
      { h: "3. Appointments", b: "Appointments can be cancelled at least 2 hours in advance via the Patient Portal." },
      { h: "4. Privacy", b: "All personal and medical data are stored in compliance with GDPR." },
      { h: "5. Liability", b: "The hospital is not liable for emergencies outside the 194 line." },
    ],
  };

  return (
    <Layout>
      <Breadcrumbs />
      <section className="container max-w-3xl py-10 prose prose-sm dark:prose-invert">
        <h1 className="text-2xl font-bold">{t.title}</h1>
        <p className="text-muted-foreground mt-2">{t.intro}</p>
        <div className="mt-8 space-y-6">
          {t.sections.map((s) => (
            <div key={s.h}>
              <h3 className="text-lg font-semibold">{s.h}</h3>
              <p className="text-muted-foreground">{s.b}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-12">© {new Date().getFullYear()} PHI Clinical Hospital Tetovo · Powered by Optimus Solutions</p>
      </section>
    </Layout>
  );
}
