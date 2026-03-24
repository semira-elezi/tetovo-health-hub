import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type Language = "mk" | "sq" | "en";

const translations = {
  // Navbar
  "nav.home": { mk: "Почетна", sq: "Kryefaqja", en: "Home" },
  "nav.about": { mk: "За нас", sq: "Rreth nesh", en: "About" },
  "nav.departments": { mk: "Одделенија", sq: "Departamentet", en: "Departments" },
  "nav.appointments": { mk: "Термини", sq: "Terminet", en: "Appointments" },
  "nav.news": { mk: "Вести", sq: "Lajme", en: "News" },
  "nav.contact": { mk: "Контакт", sq: "Kontakt", en: "Contact" },
  "nav.login": { mk: "Најава", sq: "Hyrje", en: "Login" },
  "nav.portal": { mk: "Портал", sq: "Portali", en: "Portal" },
  "nav.logout": { mk: "Одјава", sq: "Dalje", en: "Logout" },

  // Hero
  "hero.badge": {
    mk: "Јавна здравствена установа — Тетово, Северна Македонија",
    sq: "Institucion Shëndetësor Publik — Tetovë, Maqedonia e Veriut",
    en: "Public Health Institution — Tetovo, North Macedonia",
  },
  "hero.title": {
    mk: "Пет децении доверлива медицинска грижа",
    sq: "Pesë dekada kujdes mjekësor i besuar",
    en: "Five Decades of Trusted Medical Care",
  },
  "hero.subtitle": {
    mk: "Служиме на 300,000 пациенти годишно од целиот регион со 31 специјализирани одделенија и модерни медицински стандарди.",
    sq: "Shërbejmë 300,000 pacientë në vit nga i gjithë rajoni me 31 departamente të specializuara dhe standarde moderne mjekësore.",
    en: "Serving 300,000 patients per year from across the entire region with 31 specialized departments and modern medical standards.",
  },
  "hero.cta.appointment": { mk: "Закажи термин", sq: "Rezervo termin", en: "Book Appointment" },
  "hero.cta.departments": { mk: "Истражи одделенија", sq: "Eksploro departamentet", en: "Explore Departments" },
  "hero.24emergency": { mk: "24/7 Итна помош", sq: "24/7 Urgjencë", en: "24/7 Emergency" },
  "hero.31depts": { mk: "31 Одделенија", sq: "31 Departamente", en: "31 Departments" },
  "hero.50years": { mk: "50+ Години искуство", sq: "50+ Vite përvojë", en: "50+ Years Experience" },
  "hero.patientsYear": { mk: "Пациенти годишно", sq: "Pacientë në vit", en: "Patients per year" },

  // Stats
  "stats.inspections": { mk: "Извршени прегледи и услуги", sq: "Inspektime & shërbime të kryera", en: "Inspections & services performed" },
  "stats.operations": { mk: "Операции дневно", sq: "Operacione ditore", en: "Operations performed daily" },
  "stats.outpatient": { mk: "Амбулантски прегледи дневно", sq: "Ekzaminime ambulantore ditore", en: "Outpatient examinations daily" },
  "stats.specializedDepts": { mk: "Специјализирани одделенија", sq: "Departamente të specializuara", en: "Specialized departments" },

  // Departments section
  "dept.ourDepartments": { mk: "Нашите одделенија", sq: "Departamentet tona", en: "Our Departments" },
  "dept.specializedCare": { mk: "Специјализирана грижа во 31 медицинско поле", sq: "Kujdes i specializuar në 31 fusha mjekësore", en: "Specialized care across 31 medical fields" },
  "dept.learnMore": { mk: "Повеќе", sq: "Më shumë", en: "Learn more" },
  "dept.viewDepartment": { mk: "Погледни одделение", sq: "Shiko departamentin", en: "View Department" },
  "dept.our31": { mk: "Нашите 31 одделенија", sq: "31 Departamentet tona", en: "Our 31 Departments" },

  // About section
  "about.badge": { mk: "За болницата", sq: "Rreth spitalit", en: "About the hospital" },
  "about.title": { mk: "Здравствена заштита по модерни медицински стандарди", sq: "Kujdes shëndetësor sipas standardeve moderne mjekësore", en: "Health care according to modern medical standards" },
  "about.description": {
    mk: "ЈЗУ Клиничка Болница Тетово е јавна здравствена установа со права, обврски и одговорности утврдени со закон, колективен договор, статут и други општи акти. Здравствената заштита е еден од важните елементи за зачувување и подобрување на здравјето, животната и работната средина на граѓаните, и значаен фактор за економскиот развој.",
    sq: "ISHP Spitali Klinik Tetovë është një institucion shëndetësor publik me të drejta, detyrime dhe përgjegjësi të përcaktuara me ligj, marrëveshje kolektive, statut dhe akte të tjera të përgjithshme. Kujdesi shëndetësor është një nga elementet e rëndësishme për ruajtjen dhe përmirësimin e shëndetit, mjedisit jetësor dhe të punës së qytetarëve, dhe një faktor i rëndësishëm për zhvillimin ekonomik.",
    en: "PHI Clinical Hospital Tetovo is a Public Health Institution with rights, obligations and responsibilities established by law, collective agreement, statute and other general acts. Health care is one of the important elements for preserving and improving the health, living and working environment of citizens, and a significant factor for economic development.",
  },
  "about.moreAbout": { mk: "Повеќе за болницата", sq: "Më shumë rreth spitalit", en: "More about the hospital" },
  "about.heroTitle": { mk: "За Клиничка Болница Тетово", sq: "Rreth Spitalit Klinik Tetovë", en: "About Clinical Hospital Tetovo" },
  "about.heroSubtitle": { mk: "Наследство на медицинска извонредност од 1974", sq: "Trashëgimi e përsosmërisë mjekësore që nga 1974", en: "A legacy of medical excellence since 1974" },
  "about.p1": {
    mk: "ЈЗУ Клиничка Болница Тетово е Јавна здравствена установа основана со закон со целосни права и обврски утврдени со колективен договор, статут и други општи акти.",
    sq: "ISHP Spitali Klinik Tetovë është një Institucion Shëndetësor Publik i themeluar me ligj me të drejta dhe detyrime të plota të përcaktuara me marrëveshjen kolektive, statutin dhe aktet e tjera të përgjithshme.",
    en: "PHI Clinical Hospital Tetovo is a Public Health Institution established by law with full rights and obligations set out by the collective agreement, statute, and other general acts.",
  },
  "about.p2": {
    mk: "Здравствената заштита во земјата е еден од важните елементи за зачувување и подобрување на здравјето на граѓаните. Го заштитува животниот стандард и социјалната сигурност, и е значаен фактор за економскиот развој.",
    sq: "Kujdesi shëndetësor në vend është një nga elementet e rëndësishme për ruajtjen dhe përmirësimin e shëndetit të qytetarëve. Ai mbron standardin e jetesës dhe sigurinë sociale, dhe është një faktor i rëndësishëm për zhvillimin ekonomik.",
    en: "Health care in a country is one of the important elements for preserving and improving the health of citizens. It protects the standard of living and social security, and is a significant factor for economic development.",
  },
  "about.p3": {
    mk: "Со 31 специјализирани одделенија и над 300,000 третирани пациенти годишно, ги служиме целиот северозападен регион на Северна Македонија, вклучувајќи ги Тетово, Гостивар, Кичево и околните општини.",
    sq: "Me 31 departamente të specializuara dhe mbi 300,000 pacientë të trajtuar në vit, ne shërbejmë të gjithë rajonin verilindor të Maqedonisë së Veriut, duke përfshirë Tetovën, Gostivarit, Kërçovën dhe komunat përreth.",
    en: "With 31 specialized departments and over 300,000 patients treated per year, we serve the entire northwestern region of North Macedonia, including Tetovo, Gostivar, Kičevo, and surrounding municipalities.",
  },
  "about.yearsService": { mk: "Години во служба", sq: "Vite në shërbim", en: "Years in service" },
  "about.departments": { mk: "Одделенија", sq: "Departamente", en: "Departments" },
  "about.patientsYear": { mk: "Пациенти годишно", sq: "Pacientë në vit", en: "Patients per year" },
  "about.emergencyCare": { mk: "Итна помош", sq: "Kujdes urgjent", en: "Emergency care" },
  "about.management": { mk: "Менаџмент на болницата", sq: "Menaxhimi i spitalit", en: "Hospital Management" },
  "about.director": { mk: "Директор на болница", sq: "Drejtor i spitalit", en: "Hospital Director" },
  "about.deputyMedical": { mk: "Заменик директор за медицински работи", sq: "Zëvendës drejtor për çështje mjekësore", en: "Deputy Director for Medical Affairs" },
  "about.deputyEconomic": { mk: "Заменик директор за економски работи", sq: "Zëvendës drejtor për çështje ekonomike", en: "Deputy Director for Economic Affairs" },
  "about.administration": { mk: "Администрација", sq: "Administrata", en: "Administration" },
  "about.aboutUs": { mk: "За нас", sq: "Rreth nesh", en: "About Us" },
  "about.laws": { mk: "Закони", sq: "Ligjet", en: "Laws" },

  // Public info
  "publicInfo.title": { mk: "Јавни информации", sq: "Informacione publike", en: "Public Information" },
  "publicInfo.description": {
    mk: "Во согласност со Законот за слободен пристап до информации од јавен карактер, се обезбедува отвореност во работењето на Болницата.",
    sq: "Në përputhje me Ligjin për Qasje të Lirë në Informacione Publike, sigurohet transparenca në funksionimin e Spitalit.",
    en: "In accordance with the Law on Free Access to Public Information, openness in the operation of the Hospital is ensured.",
  },
  "publicInfo.documents": { mk: "Документи", sq: "Dokumente", en: "Documents" },
  "publicInfo.budget": { mk: "Буџет", sq: "Buxheti", en: "Budget" },
  "publicInfo.quarterlyReports": { mk: "Квартални извештаи", sq: "Raportet tremujore", en: "Quarterly Reports" },
  "publicInfo.annualReports": { mk: "Годишни финансиски извештаи", sq: "Raportet financiare vjetore", en: "Annual Financial Reports" },
  "publicInfo.jobListings": { mk: "Интерни огласи за работа", sq: "Shpalljet e brendshme për punë", en: "Internal Job Listings" },
  "publicInfo.procurementPlan": { mk: "Годишен план за набавки", sq: "Plani vjetor i prokurimit", en: "Annual Procurement Plan" },
  "publicInfo.procurementAnnouncements": { mk: "Објави за набавки", sq: "Njoftimet e prokurimit", en: "Procurement Announcements" },
  "publicInfo.patientRights": { mk: "Права и обврски на пациенти", sq: "Të drejtat & detyrimet e pacientëve", en: "Patient Rights & Obligations" },

  // News
  "news.title": { mk: "Последни вести", sq: "Lajmet e fundit", en: "Latest News" },
  "news.readMore": { mk: "Прочитај повеќе", sq: "Lexo më shumë", en: "Read more" },
  "news.pageTitle": { mk: "Вести и објави", sq: "Lajme & Njoftime", en: "News & Announcements" },
  "news.all": { mk: "Сите", sq: "Të gjitha", en: "All" },
  "news.hospital": { mk: "Болнички вести", sq: "Lajme spitalore", en: "Hospital News" },
  "news.healthTips": { mk: "Здравствени совети", sq: "Këshilla shëndetësore", en: "Health Tips" },
  "news.events": { mk: "Настани", sq: "Ngjarje", en: "Events" },
  "news.search": { mk: "Пребарај вести...", sq: "Kërko lajme...", en: "Search news..." },

  // Partners
  "partners.title": { mk: "Наши партнери", sq: "Partnerët tanë", en: "Our Partners" },

  // Contact
  "contact.title": { mk: "Контактирајте нè", sq: "Na kontaktoni", en: "Contact Us" },
  "contact.subtitle": {
    mk: "Тука сме да помогнеме. Контактирајте нè по телефон, е-пошта или посетете нè лично.",
    sq: "Jemi këtu për t'ju ndihmuar. Na kontaktoni me telefon, email ose na vizitoni personalisht.",
    en: "We're here to help. Reach us by phone, email, or visit us in person.",
  },
  "contact.name": { mk: "Целосно име", sq: "Emri i plotë", en: "Full name" },
  "contact.email": { mk: "Е-пошта", sq: "Email", en: "Email" },
  "contact.subject": { mk: "Тема", sq: "Tema", en: "Subject" },
  "contact.message": { mk: "Порака", sq: "Mesazhi", en: "Message" },
  "contact.send": { mk: "Испрати порака", sq: "Dërgo mesazhin", en: "Send Message" },
  "contact.phone": { mk: "Телефон", sq: "Telefoni", en: "Phone" },
  "contact.address": { mk: "Адреса", sq: "Adresa", en: "Address" },
  "contact.emergencyLine": { mk: "Линија за итна помош", sq: "Linja e urgjencës", en: "Emergency Line" },
  "contact.available24": { mk: "Достапно 24/7 за итни случаи", sq: "Në dispozicion 24/7 për urgjenca", en: "Available 24/7 for emergencies" },
  "contact.available24h": { mk: "Достапно 24 часа", sq: "Në dispozicion 24 orë", en: "Available 24 hours" },
  "contact.workingHours": { mk: "Работно време", sq: "Orari i punës", en: "Working Hours" },
  "contact.sendMessage": { mk: "Испрати порака", sq: "Dërgo mesazhin", en: "Send a Message" },
  "contact.messageSent": { mk: "Пораката е испратена!", sq: "Mesazhi u dërgua!", en: "Message sent!" },
  "contact.socialMedia": { mk: "Или пронајдете нè на социјалните мрежи", sq: "Ose na gjeni në rrjetet sociale", en: "Or find us on social media" },
  "contact.openMaps": { mk: "Отвори во Google Maps", sq: "Hap në Google Maps", en: "Open in Google Maps" },
  "contact.emergency": { mk: "Итна помош", sq: "Urgjenca", en: "Emergency" },
  "contact.outpatient": { mk: "Амбуланти", sq: "Ambulancat", en: "Outpatient clinics" },
  "contact.hospitalizations": { mk: "Хоспитализации", sq: "Hospitalizimet", en: "Hospitalizations" },
  "contact.pharmacy": { mk: "Аптека", sq: "Farmacia", en: "Pharmacy" },

  // Auth
  "auth.login": { mk: "Најава", sq: "Hyrje", en: "Login" },
  "auth.register": { mk: "Регистрација", sq: "Regjistrim", en: "Register" },
  "auth.registerPatient": { mk: "Регистрирајте се како пациент", sq: "Regjistrohuni si pacient", en: "Register as a patient" },
  "auth.email": { mk: "Е-пошта", sq: "Email", en: "Email" },
  "auth.password": { mk: "Лозинка", sq: "Fjalëkalimi", en: "Password" },
  "auth.confirmPassword": { mk: "Потврди лозинка", sq: "Konfirmo fjalëkalimin", en: "Confirm Password" },
  "auth.fullName": { mk: "Целосно име", sq: "Emri i plotë", en: "Full Name" },
  "auth.phone": { mk: "Телефон", sq: "Telefoni", en: "Phone" },
  "auth.dob": { mk: "Датум на раѓање", sq: "Data e lindjes", en: "Date of Birth" },
  "auth.forgotPassword": { mk: "Заборавена лозинка?", sq: "Keni harruar fjalëkalimin?", en: "Forgot password?" },
  "auth.noAccount": { mk: "Немате профил?", sq: "Nuk keni llogari?", en: "Don't have an account?" },
  "auth.hasAccount": { mk: "Имате профил?", sq: "Keni llogari?", en: "Already have an account?" },
  "auth.loggedIn": { mk: "Успешна најава!", sq: "Hyrja me sukses!", en: "Logged in successfully!" },
  "auth.accountCreated": { mk: "Профилот е креиран!", sq: "Llogaria u krijua!", en: "Account created successfully!" },
  "auth.passwordMin": { mk: "Лозинката мора да има најмалку 6 карактери", sq: "Fjalëkalimi duhet të ketë të paktën 6 karaktere", en: "Password must be at least 6 characters" },
  "auth.passwordMismatch": { mk: "Лозинките не се совпаѓаат", sq: "Fjalëkalimet nuk përputhen", en: "Passwords do not match" },

  // Patient Portal
  "portal.overview": { mk: "Преглед", sq: "Përmbledhje", en: "Overview" },
  "portal.appointments": { mk: "Термини", sq: "Terminet", en: "Appointments" },
  "portal.labResults": { mk: "Лаб. резултати", sq: "Rezultatet lab.", en: "Lab Results" },
  "portal.documents": { mk: "Документи", sq: "Dokumente", en: "Documents" },
  "portal.profile": { mk: "Профил", sq: "Profili", en: "Profile" },
  "portal.welcome": { mk: "Добредојдовте", sq: "Mirësevini", en: "Welcome" },
  "portal.healthOverview": { mk: "Преглед на вашата здравствена картичка", sq: "Përmbledhje e kartelës suaj shëndetësore", en: "Overview of your health record" },
  "portal.nextAppointment": { mk: "Следен термин", sq: "Termini i ardhshëm", en: "Next Appointment" },
  "portal.noAppointments": { mk: "Нема закажани термини", sq: "Nuk ka termine", en: "No upcoming appointments" },
  "portal.noLabResults": { mk: "Нема резултати", sq: "Nuk ka rezultate", en: "No lab results" },
  "portal.noDocuments": { mk: "Нема документи", sq: "Nuk ka dokumente", en: "No documents found" },
  "portal.noAppointmentsFound": { mk: "Нема термини", sq: "Nuk ka termine", en: "No appointments found" },
  "portal.noLabResultsFound": { mk: "Нема резултати", sq: "Nuk ka rezultate", en: "No lab results found" },
  "portal.activePrescriptions": { mk: "Активни рецепти", sq: "Recetat aktive", en: "Active Prescriptions" },
  "portal.date": { mk: "Датум", sq: "Data", en: "Date" },
  "portal.time": { mk: "Време", sq: "Ora", en: "Time" },
  "portal.doctor": { mk: "Доктор", sq: "Mjeku", en: "Doctor" },
  "portal.department": { mk: "Одделение", sq: "Departamenti", en: "Department" },
  "portal.status": { mk: "Статус", sq: "Statusi", en: "Status" },
  "portal.test": { mk: "Тест", sq: "Testi", en: "Test" },
  "portal.result": { mk: "Резултат", sq: "Rezultati", en: "Result" },
  "portal.reference": { mk: "Референтна вредност", sq: "Vlera referente", en: "Reference" },
  "portal.gender": { mk: "Пол", sq: "Gjinia", en: "Gender" },
  "portal.addressLabel": { mk: "Адреса", sq: "Adresa", en: "Address" },
  "portal.save": { mk: "Зачувај", sq: "Ruaj", en: "Save" },

  // Departments page
  "departments.title": { mk: "Одделенија", sq: "Departamentet", en: "Departments" },
  "departments.search": { mk: "Пребарај одделенија...", sq: "Kërko departamente...", en: "Search departments..." },
  "departments.viewDept": { mk: "Погледни одделение", sq: "Shiko departamentin", en: "View Department" },
  "departments.all": { mk: "Сите", sq: "Të gjitha", en: "All" },

  // Symptom checker
  "symptom.title": {
    mk: "Не сте сигурни кое одделение ви треба?",
    sq: "Nuk jeni i sigurt cili departament ju nevojitet?",
    en: "Not sure which department you need?",
  },
  "symptom.cta": { mk: "Проверка на симптоми", sq: "Kontrollo simptomat", en: "Start Symptom Check" },
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
  "symptom.placeholder": { mk: "Опишете ги вашите симптоми...", sq: "Përshkruani simptomat tuaja...", en: "Describe your symptoms..." },

  // Footer
  "footer.hospitalName": { mk: "Клиничка Болница Тетово", sq: "Spitali Klinik Tetovë", en: "Clinical Hospital Tetovo" },
  "footer.institution": {
    mk: "Јавна здравствена установа — Тетово, Северна Македонија",
    sq: "Institucion Shëndetësor Publik — Tetovë, Maqedonia e Veriut",
    en: "Public Health Institution — Tetovo, North Macedonia",
  },
  "footer.information": { mk: "Информации", sq: "Informacione", en: "Information" },
  "footer.aboutUs": { mk: "За нас", sq: "Rreth nesh", en: "About us" },
  "footer.laws": { mk: "Закони", sq: "Ligjet", en: "Laws" },
  "footer.management": { mk: "Менаџмент", sq: "Menaxhimi", en: "Management" },
  "footer.administration": { mk: "Администрација", sq: "Administrata", en: "Administration" },
  "footer.policies": { mk: "Политики и линкови", sq: "Politikat & Linqet", en: "Policies & Links" },
  "footer.patientRights": { mk: "Права и обврски на пациенти", sq: "Të drejtat dhe detyrimet e pacientëve", en: "Rights and obligations of patients" },
  "footer.contact": { mk: "Контакт", sq: "Kontakt", en: "Contact" },
  "footer.rights": {
    mk: "© 2025 Клиничка Болница Тетово. Сите права задржани. Powered by Optimus Solutions.",
    sq: "© 2025 Spitali Klinik Tetovë. Të gjitha të drejtat e rezervuara. Powered by Optimus Solutions.",
    en: "© 2025 Clinical Hospital Tetovo. All rights reserved. Powered by Optimus Solutions.",
  },

  // Common
  "common.loading": { mk: "Вчитување...", sq: "Duke u ngarkuar...", en: "Loading..." },

  // ER Wait Times
  "er.title": { mk: "Време на чекање", sq: "Koha e pritjes", en: "Live Wait Times" },
  "er.emergency": { mk: "Итна помош", sq: "Urgjenca", en: "Emergency" },
  "er.outpatient": { mk: "Амбуланта", sq: "Ambulanca", en: "Outpatient" },
  "er.lab": { mk: "Лабораторија", sq: "Laboratori", en: "Laboratory" },
  "er.minutes": { mk: "минути", sq: "minuta", en: "minutes" },

  // Legacy keys kept for compatibility
  "hero.cta.departments.legacy": { mk: "Одделенија", sq: "Departamentet", en: "View Departments" },
  "dept.cardiology": { mk: "Кардиологија", sq: "Kardiologji", en: "Cardiology" },
  "dept.emergency": { mk: "Итна помош", sq: "Urgjenca", en: "Emergency" },
  "dept.surgery": { mk: "Хирургија", sq: "Kirurgji", en: "Surgery" },
  "dept.neurology": { mk: "Неврологија", sq: "Neurologji", en: "Neurology" },
  "dept.pediatrics": { mk: "Педијатрија", sq: "Pediatri", en: "Pediatrics" },
  "dept.gynecology": { mk: "Гинекологија", sq: "Gjinekologji", en: "Gynecology" },
  "dept.cardiology.desc": { mk: "Комплетна дијагностика и лекување на срцеви заболувања", sq: "Diagnostikim dhe trajtim i plotë i sëmundjeve të zemrës", en: "Complete diagnosis and treatment of heart diseases" },
  "dept.emergency.desc": { mk: "24/7 итна медицинска помош за сите пациенти", sq: "Ndihmë mjekësore urgjente 24/7 për të gjithë pacientët", en: "24/7 emergency medical care for all patients" },
  "dept.surgery.desc": { mk: "Современи хируршки процедури со врвна технологија", sq: "Procedura moderne kirurgjikale me teknologji të avancuar", en: "Modern surgical procedures with advanced technology" },
  "dept.neurology.desc": { mk: "Дијагностика и третман на невролошки состојби", sq: "Diagnostikim dhe trajtim i kushteve neurologjike", en: "Diagnosis and treatment of neurological conditions" },
  "dept.pediatrics.desc": { mk: "Специјализирана грижа за деца и новороденчиња", sq: "Kujdes i specializuar për fëmijë dhe të porsalindur", en: "Specialized care for children and newborns" },
  "dept.gynecology.desc": { mk: "Комплетна женска здравствена заштита", sq: "Kujdes i plotë shëndetësor për gratë", en: "Complete women's healthcare" },
  "dept.featured": { mk: "Истакнати одделенија", sq: "Departamentet kryesore", en: "Featured Departments" },
  "stats.patients": { mk: "пациенти/годишно", sq: "pacientë/vit", en: "patients/year" },
  "stats.departments": { mk: "одделенија", sq: "departamente", en: "departments" },
  "stats.years": { mk: "години искуство", sq: "vite përvojë", en: "years experience" },
  "stats.emergency": { mk: "итна помош", sq: "urgjencë", en: "emergency" },
  "footer.address": { mk: "ул. Дервиш Цара бб, 1200 Тетово", sq: "rr. Dervish Cara bb, 1200 Tetovë", en: "Dervish Cara St., 1200 Tetovo" },
  "departments.overview": { mk: "Преглед", sq: "Përmbledhje", en: "Overview" },
  "departments.doctors": { mk: "Доктори", sq: "Mjekët", en: "Doctors" },
  "departments.services": { mk: "Услуги", sq: "Shërbimet", en: "Services" },
  "appointments.title": { mk: "Закажи термин", sq: "Rezervo termin", en: "Book Appointment" },
  "appointments.selectDept": { mk: "Одберете одделение", sq: "Zgjidhni departamentin", en: "Select Department" },
  "appointments.selectDoctor": { mk: "Одберете доктор", sq: "Zgjidhni mjekun", en: "Select Doctor" },
  "appointments.selectDate": { mk: "Одберете датум", sq: "Zgjidhni datën", en: "Select Date" },
  "appointments.confirm": { mk: "Потврди", sq: "Konfirmo", en: "Confirm" },
  "appointments.success": { mk: "Успешно закажан термин!", sq: "Termini u rezervua me sukses!", en: "Appointment booked successfully!" },
  "appointments.notes": { mk: "Забелешки", sq: "Shënime", en: "Notes" },
  "appointments.upcoming": { mk: "Претстојни термини", sq: "Terminet e ardhshme", en: "Upcoming Appointments" },
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
    return (saved as Language) || "sq";
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
