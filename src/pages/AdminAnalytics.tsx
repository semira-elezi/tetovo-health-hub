import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Stethoscope, Clock, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { format, subDays, startOfDay, startOfWeek, startOfMonth, startOfYear } from "date-fns";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b", confirmed: "#3b82f6", completed: "#22c55e", cancelled: "#ef4444", no_show: "#6b7280",
};

type DateRange = "today" | "week" | "month" | "year";

export default function AdminAnalytics() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const [range, setRange] = useState<DateRange>("month");

  if (authLoading) return <Layout><div className="container py-20 text-center text-muted-foreground">Loading...</div></Layout>;
  if (!user || !isAdmin) return <Navigate to="/auth/login" replace />;

  const getStartDate = () => {
    const now = new Date();
    switch (range) {
      case "today": return format(startOfDay(now), "yyyy-MM-dd");
      case "week": return format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd");
      case "month": return format(startOfMonth(now), "yyyy-MM-dd");
      case "year": return format(startOfYear(now), "yyyy-MM-dd");
    }
  };

  const startDate = getStartDate();

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["analytics-appointments", startDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("id, appointment_date, start_time, status, patient_id, department_id, departments(name_en), doctor_id")
        .gte("appointment_date", startDate)
        .order("appointment_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: recentAppointments, isLoading: recentLoading } = useQuery({
    queryKey: ["analytics-recent"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("id, appointment_date, start_time, status, departments(name_en)")
        .order("created_at", { ascending: false })
        .limit(15);
      if (error) throw error;
      return data;
    },
  });

  const { data: doctorsCount } = useQuery({
    queryKey: ["analytics-doctors"],
    queryFn: async () => {
      const { count, error } = await supabase.from("doctors").select("id", { count: "exact", head: true }).eq("is_active", true);
      if (error) throw error;
      return count || 0;
    },
  });

  const totalAppointments = appointments?.length || 0;
  const activePatients = new Set(appointments?.map(a => a.patient_id)).size;
  const pendingCount = appointments?.filter(a => a.status === "pending").length || 0;

  // Line chart data
  const lineData = (() => {
    if (!appointments) return [];
    const grouped: Record<string, number> = {};
    appointments.forEach(a => {
      grouped[a.appointment_date] = (grouped[a.appointment_date] || 0) + 1;
    });
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({
      date: format(new Date(date), "MMM dd"),
      count,
    }));
  })();

  // Pie chart data
  const pieData = (() => {
    if (!appointments) return [];
    const grouped: Record<string, number> = {};
    appointments.forEach(a => {
      grouped[a.status] = (grouped[a.status] || 0) + 1;
    });
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  })();

  // Bar chart data
  const barData = (() => {
    if (!appointments) return [];
    const grouped: Record<string, number> = {};
    appointments.forEach(a => {
      const name = (a as any).departments?.name_en || "Unknown";
      grouped[name] = (grouped[name] || 0) + 1;
    });
    return Object.entries(grouped).sort(([, a], [, b]) => b - a).slice(0, 8).map(([name, count]) => ({ name, count }));
  })();

  const kpis = [
    { icon: Calendar, value: totalAppointments, label: "Total Appointments", borderColor: "border-l-blue-500" },
    { icon: Users, value: activePatients, label: "Active Patients", borderColor: "border-l-teal-500" },
    { icon: Stethoscope, value: doctorsCount || 0, label: "Doctors Available", borderColor: "border-l-green-500" },
    { icon: Clock, value: pendingCount, label: "Pending Appointments", borderColor: "border-l-amber-500" },
  ];

  return (
    <Layout>
      <div className="container py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
            <p className="text-sm text-muted-foreground">Hospital performance overview</p>
          </div>
          <div className="flex items-center gap-2">
            {(["today", "week", "month", "year"] as DateRange[]).map(r => (
              <Button key={r} variant={range === r ? "default" : "outline"} size="sm" onClick={() => setRange(r)} className="capitalize">
                {r === "week" ? "This Week" : r === "month" ? "This Month" : r === "year" ? "This Year" : "Today"}
              </Button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {kpis.map(kpi => (
            <Card key={kpi.label} className={`border-l-4 ${kpi.borderColor}`}>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <kpi.icon className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  {isLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-2xl font-bold">{kpi.value}</p>}
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <Card>
            <CardHeader><CardTitle className="text-base">Appointments Over Time</CardTitle></CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-[250px]" /> : lineData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-16">No data for selected period</p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 11 }} />
                    <YAxis className="text-xs" tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="hsl(204, 86%, 39%)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Appointments by Status</CardTitle></CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-[250px]" /> : pieData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-16">No data</p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "#6b7280"} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader><CardTitle className="text-base">Top Departments by Appointments</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-[250px]" /> : barData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-16">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData} layout="vertical" margin={{ left: 120 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={110} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(204, 86%, 39%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader><CardTitle className="text-base">Recent Activity</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Date/Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}><TableCell colSpan={3}><Skeleton className="h-5 w-full" /></TableCell></TableRow>
                  ))
                ) : !recentAppointments?.length ? (
                  <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No recent appointments</TableCell></TableRow>
                ) : (
                  recentAppointments.map(a => (
                    <TableRow key={a.id}>
                      <TableCell>{(a as any).departments?.name_en || "—"}</TableCell>
                      <TableCell className="text-sm">{a.appointment_date} {a.start_time}</TableCell>
                      <TableCell>
                        <Badge variant={a.status === "confirmed" ? "default" : a.status === "cancelled" ? "destructive" : "secondary"}>
                          {a.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
