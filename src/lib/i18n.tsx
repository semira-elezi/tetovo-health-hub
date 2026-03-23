import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type Language = "mk" | "sq" | "en";

const translations = {
  // Navbar
  "nav.home": { mk: "Почетна", sq: "Kryefaqja", en: "Home" },
  "nav.departments": { mk: "Одделенија", sq: "Departamentet", en: "Departments" },
  "nav.appointments": { mk: "Термини", sq: "Terminet", en: "Appointments" },
  "nav.news": { mk: "Вести", sq: "Lajme", en: "News" },
  "nav.contact": { mk: "Контакт", sq: "Kontakt", en: "Contact" },
  "nav.login": { mk: "Најава", sq: "Hyrje", en: "Login" },
  "nav.portal": { mk: "Портал", sq: "Portali", en: "Portal" },
  "nav.logout": { mk: "Одјава", sq: "Dalje", en: "Logout" },

  // Hero
  "hero.title": {
    mk: "Клиничка Болница Тетово",
    sq: "Spitali Klinik Tetovë",
    en: "Clinical Hospital Tetovo",
  },
  "hero.subtitle": {
    mk: "Пет децении искуство",
    sq: "Pesë dekada përvojë",
    en: "Five Decades of Experience",
  },
  "hero.cta.appointment": {
    mk: "Закажи термин",
    sq: "Rezervo termin",
    en: "Book Appointment",
  },
  "hero.cta.departments": {
    mk: "Одделенија",
    sq: "Departamentet",
    en: "View Departments",
  },

  // Stats
  "stats.patients": { mk: "пациенти/годишно", sq: "pacientë/vit", en: "patients/year" },
  "stats.departments": { mk: "одделенија", sq: "departamente", en: "departments" },
  "stats.years": { mk: "години искуство", sq: "vite përvojë", en: "years experience" },
  "stats.emergency": { mk: "итна помош", sq: "urgjencë", en: "emergency" },

  // Departments
  "dept.cardiology": { mk: "Кардиологија", sq: "Kardiologji", en: "Cardiology" },
  "dept.emergency": { mk: "Итна помош", sq: "Urgjenca", en: "Emergency" },
  "dept.surgery": { mk: "Хирургија", sq: "Kirurgji", en: "Surgery" },
  "dept.neurology": { mk: "Неврологија", sq: "Neurologji", en: "Neurology" },
  "dept.pediatrics": { mk: "Педијатрија", sq: "Pediatri", en: "Pediatrics" },
  "dept.gynecology": { mk: "Гинекологија", sq: "Gjinekologji", en: "Gynecology" },
  "dept.cardiology.desc": {
    mk: "Комплетна дијагностика и лекување на срцеви заболувања",
    sq: "Diagnostikim dhe trajtim i plotë i sëmundjeve të zemrës",
    en: "Complete diagnosis and treatment of heart diseases",
  },
  "dept.emergency.desc": {
    mk: "24/7 итна медицинска помош за сите пациенти",
    sq: "Ndihmë mjekësore urgjente 24/7 për të gjithë pacientët",
    en: "24/7 emergency medical care for all patients",
  },
  "dept.surgery.desc": {
    mk: "Современи хируршки процедури со врвна технологија",
    sq: "Procedura moderne kirurgjikale me teknologji të avancuar",
    en: "Modern surgical procedures with advanced technology",
  },
  "dept.neurology.desc": {
    mk: "Дијагностика и третман на невролошки состојби",
    sq: "Diagnostikim dhe trajtim i kushteve neurologjike",
    en: "Diagnosis and treatment of neurological conditions",
  },
  "dept.pediatrics.desc": {
    mk: "Специјализирана грижа за деца и новороденчиња",
    sq: "Kujdes i specializuar për fëmijë dhe të porsalindur",
    en: "Specialized care for children and newborns",
  },
  "dept.gynecology.desc": {
    mk: "Комплетна женска здравствена заштита",
    sq: "Kujdes i plotë shëndetësor për gratë",
    en: "Complete women's healthcare",
  },
  "dept.learnMore": { mk: "Повеќе", sq: "Më shumë", en: "Learn more" },
  "dept.featured": { mk: "Истакнати одделенија", sq: "Departamentet kryesore", en: "Featured Departments" },

  // ER Wait Times
  "er.title": { mk: "Време на чекање", sq: "Koha e pritjes", en: "Live Wait Times" },
  "er.emergency": { mk: "Итна помош", sq: "Urgjenca", en: "Emergency" },
  "er.outpatient": { mk: "Амбуланта", sq: "Ambulanca", en: "Outpatient" },
  "er.lab": { mk: "Лабораторија", sq: "Laboratori", en: "Laboratory" },
  "er.minutes": { mk: "минути", sq: "minuta", en: "minutes" },

  // Symptom Checker
  "symptom.title": {
    mk: "Не сте сигурни кое одделение ви треба?",
    sq: "Nuk jeni i sigurt cili departament ju nevojitet?",
    en: "Not sure which department you need?",
  },
  "symptom.cta": {
    mk: "Проверка на симптоми",
    sq: "Kontrollo simptomat",
    en: "Start Symptom Check",
  },

  // News
  "news.title": { mk: "Последни вести", sq: "Lajmet e fundit", en: "Latest News" },
  "news.readMore": { mk: "Прочитај повеќе", sq: "Lexo më shumë", en: "Read more" },

  // Footer
  "footer.address": {
    mk: "ул. Дервиш Цара бб, 1200 Тетово",
    sq: "rr. Dervish Cara bb, 1200 Tetovë",
    en: "Dervish Cara St., 1200 Tetovo",
  },
  "footer.rights": {
    mk: "Сите права задржани",
    sq: "Të gjitha të drejtat e rezervuara",
    en: "All rights reserved",
  },

  // Contact
  "contact.title": { mk: "Контакт", sq: "Kontakt", en: "Contact Us" },
  "contact.name": { mk: "Име", sq: "Emri", en: "Name" },
  "contact.email": { mk: "Е-пошта", sq: "Email", en: "Email" },
  "contact.subject": { mk: "Тема", sq: "Tema", en: "Subject" },
  "contact.message": { mk: "Порака", sq: "Mesazhi", en: "Message" },
  "contact.send": { mk: "Испрати", sq: "Dërgo", en: "Send" },
  "contact.phone": { mk: "Телефон", sq: "Telefoni", en: "Phone" },
  "contact.emergencyLine": { mk: "Линија за итна помош", sq: "Linja e urgjencës", en: "Emergency Line" },
  "contact.workingHours": { mk: "Работно време", sq: "Orari i punës", en: "Working Hours" },

  // Auth
  "auth.login": { mk: "Најава", sq: "Hyrje", en: "Login" },
  "auth.register": { mk: "Регистрација", sq: "Regjistrim", en: "Register" },
  "auth.email": { mk: "Е-пошта", sq: "Email", en: "Email" },
  "auth.password": { mk: "Лозинка", sq: "Fjalëkalimi", en: "Password" },
  "auth.confirmPassword": { mk: "Потврди лозинка", sq: "Konfirmo fjalëkalimin", en: "Confirm Password" },
  "auth.fullName": { mk: "Целосно име", sq: "Emri i plotë", en: "Full Name" },
  "auth.phone": { mk: "Телефон", sq: "Telefoni", en: "Phone" },
  "auth.dob": { mk: "Датум на раѓање", sq: "Data e lindjes", en: "Date of Birth" },
  "auth.forgotPassword": { mk: "Заборавена лозинка?", sq: "Keni harruar fjalëkalimin?", en: "Forgot password?" },
  "auth.noAccount": { mk: "Немате профил?", sq: "Nuk keni llogari?", en: "Don't have an account?" },
  "auth.hasAccount": { mk: "Имате профил?", sq: "Keni llogari?", en: "Already have an account?" },

  // Patient Portal
  "portal.overview": { mk: "Преглед", sq: "Përmbledhje", en: "Overview" },
  "portal.appointments": { mk: "Термини", sq: "Terminet", en: "Appointments" },
  "portal.labResults": { mk: "Лаб. резултати", sq: "Rezultatet lab.", en: "Lab Results" },
  "portal.documents": { mk: "Документи", sq: "Dokumente", en: "Documents" },
  "portal.profile": { mk: "Профил", sq: "Profili", en: "Profile" },
  "portal.welcome": { mk: "Добредојдовте", sq: "Mirësevini", en: "Welcome" },

  // Symptom checker page
  "symptom.disclaimer": {
    mk: "Ова не е медицинска дијагноза. Консултирајте се со лекар.",
    sq: "Kjo nuk është diagnozë mjekësore. Konsultohuni me mjek.",
    en: "This is not a medical diagnosis. Please consult a doctor.",
  },
  "symptom.greeting": {
    mk: "Здраво! Ќе ви помогнам да го најдете вистинското одделение. Кои симптоми ги имате?",
    sq: "Përshëndetje! Do t'ju ndihmoj të gjeni departamentin e duhur. Çfarë simptomash keni?",
    en: "Hello! I'll help you find the right department. What symptoms are you experiencing?",
  },
  "symptom.placeholder": {
    mk: "Опишете ги вашите симптоми...",
    sq: "Përshkruani simptomat tuaja...",
    en: "Describe your symptoms...",
  },

  // Departments page
  "departments.title": { mk: "Одделенија", sq: "Departamentet", en: "Departments" },
  "departments.search": { mk: "Пребарај одделенија...", sq: "Kërko departamente...", en: "Search departments..." },
  "departments.viewDept": { mk: "Погледни одделение", sq: "Shiko departamentin", en: "View Department" },
  "departments.overview": { mk: "Преглед", sq: "Përmbledhje", en: "Overview" },
  "departments.doctors": { mk: "Доктори", sq: "Mjekët", en: "Doctors" },
  "departments.services": { mk: "Услуги", sq: "Shërbimet", en: "Services" },

  // Appointments
  "appointments.title": { mk: "Закажи термин", sq: "Rezervo termin", en: "Book Appointment" },
  "appointments.selectDept": { mk: "Одберете одделение", sq: "Zgjidhni departamentin", en: "Select Department" },
  "appointments.selectDoctor": { mk: "Одберете доктор", sq: "Zgjidhni mjekun", en: "Select Doctor" },
  "appointments.selectDate": { mk: "Одберете датум", sq: "Zgjidhni datën", en: "Select Date" },
  "appointments.confirm": { mk: "Потврди", sq: "Konfirmo", en: "Confirm" },
  "appointments.success": { mk: "Успешно закажан термин!", sq: "Termini u rezervua me sukses!", en: "Appointment booked successfully!" },
  "appointments.notes": { mk: "Забелешки", sq: "Shënime", en: "Notes" },
  "appointments.upcoming": { mk: "Претстојни термини", sq: "Terminet e ardhshme", en: "Upcoming Appointments" },

  // News page
  "news.all": { mk: "Сите", sq: "Të gjitha", en: "All" },
  "news.hospital": { mk: "Болнички вести", sq: "Lajme spitalore", en: "Hospital News" },
  "news.healthTips": { mk: "Здравствени совети", sq: "Këshilla shëndetësore", en: "Health Tips" },
  "news.events": { mk: "Настани", sq: "Ngjarje", en: "Events" },
  "news.search": { mk: "Пребарај вести...", sq: "Kërko lajme...", en: "Search news..." },
} as const;

type TranslationKey = keyof typeof translations;

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("hospital-lang");
    return (saved as Language) || "en";
  });

  const changeLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("hospital-lang", lang);
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      return translations[key]?.[language] || key;
    },
    [language]
  );

  return (
    <I18nContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useTranslation must be used within I18nProvider");
  return context;
}
