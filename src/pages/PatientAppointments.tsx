import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Star, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { toast } from "sonner";
import { addDays, isAfter, parseISO } from "date-fns";

const STATUS_BADGE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline", confirmed: "default", in_progress: "secondary", completed: "default", cancelled: "destructive", no_show: "destructive",
};

export default function PatientAppointments() {
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [feedbackApt, setFeedbackApt] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState("");

  if (authLoading) return <Layout><div className="container py-20 text-center text-muted-foreground">Loading...</div></Layout>;
  if (!user) return <Navigate to="/auth/login" replace />;

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["patient-appointments", user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*, doctors(full_name, title, image_url), departments(name_en)")
        .eq("patient_id", user.id)
        .order("appointment_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const cancelMut = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { error } = await supabase.from("appointments").update({ status: "cancelled" as any, notes: reason }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["patient-appointments"] }); toast.success("Appointment cancelled"); },
    onError: () => toast.error("Failed to cancel"),
  });

  const upcoming = appointments?.filter(a => ["pending", "confirmed", "in_progress"].includes(a.status))
    .sort((a, b) => a.appointment_date.localeCompare(b.appointment_date)) || [];
  const past = appointments?.filter(a => ["completed", "cancelled", "no_show"].includes(a.status)) || [];

  const canCancel = (a: any) => {
    if (!["pending", "confirmed"].includes(a.status)) return false;
    return isAfter(parseISO(a.appointment_date), addDays(new Date(), 1));
  };

  return (
    <Layout>
      <div className="container py-10 max-w-3xl">
        <h1 className="text-2xl font-bold mb-6">My Appointments</h1>
        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-6 space-y-4">
            {isLoading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />) :
              upcoming.length === 0 ? <p className="text-center text-muted-foreground py-8">No upcoming appointments</p> :
              upcoming.map(a => (
                <Card key={a.id}>
                  <CardContent className="flex items-center gap-4 pt-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <User className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{(a as any).doctors?.title || ""} {(a as any).doctors?.full_name || "Doctor"}</p>
                      <p className="text-sm text-muted-foreground">{(a as any).departments?.name_en}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm">{a.appointment_date} · {a.start_time} – {a.end_time}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={STATUS_BADGE[a.status]}>{a.status}</Badge>
                      {canCancel(a) && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-destructive text-xs">Cancel</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
                              <AlertDialogDescription>Please provide a reason for cancellation.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <Textarea placeholder="Reason for cancellation..." value={cancelReason} onChange={e => setCancelReason(e.target.value)} />
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setCancelReason("")}>Back</AlertDialogCancel>
                              <AlertDialogAction
                                disabled={!cancelReason.trim() || cancelMut.isPending}
                                onClick={() => { cancelMut.mutate({ id: a.id, reason: cancelReason }); setCancelReason(""); }}
                              >
                                {cancelMut.isPending ? "Cancelling..." : "Confirm Cancel"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="past" className="mt-6 space-y-4">
            {isLoading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />) :
              past.length === 0 ? <p className="text-center text-muted-foreground py-8">No past appointments</p> :
              past.map(a => (
                <Card key={a.id}>
                  <CardContent className="flex items-center gap-4 pt-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <User className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{(a as any).doctors?.title || ""} {(a as any).doctors?.full_name || "Doctor"}</p>
                      <p className="text-sm text-muted-foreground">{(a as any).departments?.name_en} · {a.appointment_date}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={STATUS_BADGE[a.status]}>{a.status}</Badge>
                      {a.status === "completed" && (
                        <Button variant="outline" size="sm" className="text-xs" onClick={() => setFeedbackApt(a)}>
                          <Star className="h-3 w-3 mr-1" />Feedback
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
        </Tabs>

        {/* Feedback Modal */}
        {feedbackApt && (
          <FeedbackModal
            appointment={feedbackApt}
            onClose={() => setFeedbackApt(null)}
          />
        )}
      </div>
    </Layout>
  );
}

function FeedbackModal({ appointment, onClose }: { appointment: any; onClose: () => void }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) { toast.error("Please select a rating"); return; }
    setLoading(true);
    const { error } = await supabase.from("feedback").insert({
      patient_id: anonymous ? null : user!.id,
      department_id: appointment.department_id,
      rating,
      comment: comment || null,
      is_anonymous: anonymous,
    });
    setLoading(false);
    if (error) toast.error("Failed to submit feedback");
    else { toast.success("Thank you! Your feedback will appear after review."); onClose(); }
  };

  return (
    <Dialog open onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Leave Feedback</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Rating</Label>
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setRating(n)} className="p-1">
                  <Star className={`h-7 w-7 ${n <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Department</Label>
            <Input value={(appointment as any).departments?.name_en || ""} disabled />
          </div>
          <div className="space-y-2">
            <Label>Comment (optional)</Label>
            <Textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your experience..." rows={3} />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={anonymous} onCheckedChange={v => setAnonymous(!!v)} id="anon" />
            <label htmlFor="anon" className="text-sm">Submit anonymously</label>
          </div>
          <Button onClick={handleSubmit} disabled={loading} className="w-full">{loading ? "Submitting..." : "Submit Feedback"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
