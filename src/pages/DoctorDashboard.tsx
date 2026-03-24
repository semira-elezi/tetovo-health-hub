import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, FileText, Stethoscope } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";

export default function DoctorDashboard() {
  const { user, profile } = useAuth();

  // Get the doctor record linked to this user
  const { data: doctorRecord } = useQuery({
    queryKey: ["doctor-record", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doctors")
        .select("*, departments(name_en)")
        .eq("user_id", user!.id)
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: myAppointments } = useQuery({
    queryKey: ["doctor-appointments", doctorRecord?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*, departments(name_en)")
        .eq("doctor_id", doctorRecord!.id)
        .order("appointment_date", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: !!doctorRecord?.id,
  });

  const { data: myLabResults } = useQuery({
    queryKey: ["doctor-lab-results", doctorRecord?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lab_results")
        .select("*")
        .eq("doctor_id", doctorRecord!.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: !!doctorRecord?.id,
  });

  const todayAppointments = myAppointments?.filter(
    (a) => a.appointment_date === new Date().toISOString().split("T")[0]
  ) || [];

  return (
    <Layout>
      <div className="container py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome, {doctorRecord?.title || ""} {profile?.full_name || "Doctor"}
              {doctorRecord?.departments && ` · ${(doctorRecord as any).departments.name_en}`}
            </p>
          </div>
          <Badge variant="outline" className="gap-1.5 px-3 py-1.5">
            <Stethoscope className="h-3.5 w-3.5" />
            Doctor
          </Badge>
        </div>

        {!doctorRecord && (
          <Card className="mb-8 border-warning">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                Your account is not linked to a doctor record yet. Please contact an administrator to link your account.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{todayAppointments.length}</p>
                <p className="text-xs text-muted-foreground">Today's Appointments</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                <Users className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{myAppointments?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Total Appointments</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{myLabResults?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Lab Results</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="appointments">
          <TabsList>
            <TabsTrigger value="appointments">My Appointments</TabsTrigger>
            <TabsTrigger value="lab">Lab Results</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Appointments</CardTitle></CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!myAppointments?.length ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No appointments</TableCell></TableRow>
                    ) : (
                      myAppointments.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell>{a.appointment_date}</TableCell>
                          <TableCell>{a.start_time} - {a.end_time}</TableCell>
                          <TableCell>{(a as any).departments?.name_en || "—"}</TableCell>
                          <TableCell>{a.reason || "—"}</TableCell>
                          <TableCell>
                            <Badge variant={a.status === "confirmed" ? "default" : "secondary"}>{a.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lab" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Lab Results</CardTitle></CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Test</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!myLabResults?.length ? (
                      <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No lab results</TableCell></TableRow>
                    ) : (
                      myLabResults.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell>{new Date(r.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>{r.test_name}</TableCell>
                          <TableCell>{r.result_value || "Pending"} {r.unit || ""}</TableCell>
                          <TableCell>
                            <Badge variant={r.status === "completed" ? "default" : "secondary"}>{r.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
