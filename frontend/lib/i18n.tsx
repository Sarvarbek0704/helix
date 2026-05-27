"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Lang = "en" | "uz";

const translations: Record<Lang, Record<string, string>> = {
  en: {
    "nav.dashboard": "Dashboard",
    "nav.patients": "Patients",
    "nav.doctors": "Doctors",
    "nav.appointments": "Appointments",
    "nav.medical_records": "Medical Records",
    "nav.vitals": "Vitals",
    "nav.prescriptions": "Prescriptions",
    "nav.lab": "Lab",
    "nav.billing": "Billing",
    "nav.insurance": "Insurance",
    "nav.medications": "Medications",
    "nav.departments": "Departments",
    "nav.notifications": "Notifications",
    "nav.settings": "Settings",
    "nav.users": "Users",
    "nav.schedule": "My Schedule",
    "nav.lab_orders": "Lab Orders",
    "nav.lab_results": "Lab Results",
    "nav.records": "Records",
    "nav.record_vitals": "Record Vitals",
    "nav.signout": "Sign out",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.create": "Create",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.search": "Search",
    "common.loading": "Loading...",
    "common.no_data": "No data found",
    "common.confirm": "Confirm",
    "common.back": "Back",
    "common.new": "New",
    "common.submit": "Submit",
    "common.close": "Close",
    "common.total": "Total",
    "common.status": "Status",
    "common.date": "Date",
    "common.doctor": "Doctor",
    "common.patient": "Patient",
    "common.role": "Role",
    "common.filter": "Filter",
    "common.all": "All",
    "common.actions": "Actions",
    "common.view": "View",
    "auth.login": "Sign In",
    "auth.logout": "Sign Out",
    "auth.register": "Register",
    "auth.email": "Email address",
    "auth.password": "Password",
    "auth.welcome": "Welcome to Helix",
    "auth.sign_in_desc": "Sign in to your account",
    "dashboard.title": "Dashboard",
    "dashboard.good_morning": "Good morning",
    "dashboard.good_afternoon": "Good afternoon",
    "dashboard.good_evening": "Good evening",
    "appt.book": "Book Appointment",
    "appt.confirm": "Confirm",
    "appt.cancel": "Cancel Appointment",
    "appt.complete": "Complete",
    "appt.start": "Start",
    "appt.reason": "Reason",
    "appt.status.pending": "Pending",
    "appt.status.confirmed": "Confirmed",
    "appt.status.in_progress": "In Progress",
    "appt.status.completed": "Completed",
    "appt.status.cancelled": "Cancelled",
    "appt.status.no_show": "No Show",
    "nav.workload": "Workload",
    "nav.audit": "Audit Logs",
    "demo.banner": "Demo account — read-only access. Register a real account to make changes.",
  },
  uz: {
    "nav.dashboard": "Bosh sahifa",
    "nav.patients": "Bemorlar",
    "nav.doctors": "Shifokorlar",
    "nav.appointments": "Uchrashuvlar",
    "nav.medical_records": "Tibbiy yozuvlar",
    "nav.vitals": "Vital ko'rsatkichlar",
    "nav.prescriptions": "Retseptlar",
    "nav.lab": "Laboratoriya",
    "nav.billing": "Hisob-faktura",
    "nav.insurance": "Sug'urta",
    "nav.medications": "Dorilar",
    "nav.departments": "Bo'limlar",
    "nav.notifications": "Bildirishnomalar",
    "nav.settings": "Sozlamalar",
    "nav.users": "Foydalanuvchilar",
    "nav.schedule": "Mening jadvalim",
    "nav.lab_orders": "Lab buyurtmalari",
    "nav.lab_results": "Lab natijalari",
    "nav.records": "Yozuvlar",
    "nav.record_vitals": "Vital o'lchash",
    "nav.signout": "Chiqish",
    "common.save": "Saqlash",
    "common.cancel": "Bekor qilish",
    "common.create": "Yaratish",
    "common.delete": "O'chirish",
    "common.edit": "Tahrirlash",
    "common.search": "Qidirish",
    "common.loading": "Yuklanmoqda...",
    "common.no_data": "Ma'lumot topilmadi",
    "common.confirm": "Tasdiqlash",
    "common.back": "Orqaga",
    "common.new": "Yangi",
    "common.submit": "Yuborish",
    "common.close": "Yopish",
    "common.total": "Jami",
    "common.status": "Holat",
    "common.date": "Sana",
    "common.doctor": "Shifokor",
    "common.patient": "Bemor",
    "common.role": "Rol",
    "common.filter": "Filtr",
    "common.all": "Barchasi",
    "common.actions": "Amallar",
    "common.view": "Ko'rish",
    "auth.login": "Kirish",
    "auth.logout": "Chiqish",
    "auth.register": "Ro'yxatdan o'tish",
    "auth.email": "Elektron pochta",
    "auth.password": "Parol",
    "auth.welcome": "Helix'ga xush kelibsiz",
    "auth.sign_in_desc": "Hisobingizga kiring",
    "dashboard.title": "Bosh sahifa",
    "dashboard.good_morning": "Xayrli tong",
    "dashboard.good_afternoon": "Xayrli kun",
    "dashboard.good_evening": "Xayrli kech",
    "appt.book": "Uchrashuv belgilash",
    "appt.confirm": "Tasdiqlash",
    "appt.cancel": "Uchrashuvni bekor qilish",
    "appt.complete": "Yakunlash",
    "appt.start": "Boshlash",
    "appt.reason": "Sabab",
    "appt.status.pending": "Kutilmoqda",
    "appt.status.confirmed": "Tasdiqlangan",
    "appt.status.in_progress": "Jarayonda",
    "appt.status.completed": "Yakunlangan",
    "appt.status.cancelled": "Bekor qilingan",
    "appt.status.no_show": "Kelmadi",
    "demo.banner": "Demo hisob — faqat ko'rish huquqi. O'zgartirish uchun ro'yxatdan o'ting.",
  },
};

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "uz",
  setLang: () => {},
  t: (k) => k,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("uz");

  useEffect(() => {
    const saved = localStorage.getItem("helix_lang") as Lang | null;
    if (saved === "en" || saved === "uz") setLangState(saved);
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("helix_lang", l);
  }

  function t(key: string): string {
    return translations[lang][key] ?? translations["en"][key] ?? key;
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useT() {
  return useContext(LanguageContext);
}
