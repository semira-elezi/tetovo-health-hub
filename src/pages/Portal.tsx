import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import AdminDashboard from "./AdminDashboard";
import DoctorDashboard from "./DoctorDashboard";
import PatientPortal from "./PatientPortal";

export default function Portal() {
  const { user, isAdmin, roles, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (isAdmin) {
    return <AdminDashboard />;
  }

  if (roles.includes("doctor")) {
    return <DoctorDashboard />;
  }

  return <PatientPortal />;
}
