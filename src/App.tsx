import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n";
import { AuthProvider } from "@/hooks/useAuth";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import About from "./pages/About";
import Departments from "./pages/Departments";
import DepartmentDetail from "./pages/DepartmentDetail";
import News from "./pages/News";
import NewsDetail from "./pages/NewsDetail";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Portal from "./pages/Portal";
import NotFound from "./pages/NotFound";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminAppointments from "./pages/AdminAppointments";
import AdminFeedback from "./pages/AdminFeedback";
import AdminDocuments from "./pages/AdminDocuments";
import DoctorSchedule from "./pages/DoctorSchedule";
import PatientAppointments from "./pages/PatientAppointments";
import SymptomChecker from "./pages/SymptomChecker";
import Appointments from "./pages/Appointments";
import PublicInfo from "./pages/PublicInfo";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/departments" element={<Departments />} />
              <Route path="/departments/:slug" element={<DepartmentDetail />} />
              <Route path="/news" element={<News />} />
              <Route path="/news/:slug" element={<NewsDetail />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<Register />} />
              <Route path="/portal" element={<Portal />} />
              <Route path="/public-info" element={<PublicInfo />} />
              <Route path="/symptom-checker" element={<SymptomChecker />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/appointments" element={<AdminAppointments />} />
              <Route path="/admin/feedback" element={<AdminFeedback />} />
              <Route path="/admin/documents" element={<AdminDocuments />} />
              <Route path="/doctor/schedule" element={<DoctorSchedule />} />
              <Route path="/patient/appointments" element={<PatientAppointments />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </I18nProvider>
  </QueryClientProvider>
);

export default App;
