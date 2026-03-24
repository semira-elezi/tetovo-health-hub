import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Plus, X, CalendarDays } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { toast } from "sonner";
import { format, addDays, startOfWeek, addWeeks, isToday } from "date-fns";

export default function DoctorSchedule() {
  const { user, roles, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [weekOffset, setWeekOffset] = useState(0);
  const [addSlotDay, setAddSlotDay] = useState<string | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);

  const isDoctor = roles.includes("doctor") || roles.includes("admin");
  if (authLoading) return <Layout><div className="container py-20 text-center text-muted-foreground">Loading...</div></Layout>;
  if (!user || !isDoctor) return <Navigate to="/auth/login" replace />;

  const { data: doctorRecord } = useQuery({
    queryKey: ["doctor-record", user.id],
    queryFn: async () => {
      const { data } = await supabase.from("doctors").select("id").eq("user_id", user.id).single();
      return data;
    },
  });

  const weekStart = startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const { data: slots, isLoading: slotsLoading } = useQuery({
    queryKey: ["doctor-slots", doctorRecord?.id, format(weekStart, "yyyy-MM-dd")],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("time_slots")
        .select("*")
        .eq("doctor_id", doctorRecord!.id)
        .gte("slot_date", format(weekDays[0], "yyyy-MM-dd"))
        .lte("slot_date", format(weekDays[6], "yyyy-MM-dd"))
        .order("start_time");
      if (error) throw error;
      return data;
    },
    enabled: !!doctorRecord?.id,
  });

  const { data: bookedSlotIds } = useQuery({
    queryKey: ["booked-slots", doctorRecord?.id, format(weekStart, "yyyy-MM-dd")],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("time_slot_id")
        .eq("doctor_id", doctorRecord!.id)
        .gte("appointment_date", format(weekDays[0], "yyyy-MM-dd"))
        .lte("appointment_date", format(weekDays[6], "yyyy-MM-dd"))
        .not("status", "in", "(cancelled,no_show)");
      if (error) throw error;
      return new Set(data?.map(a => a.time_slot_id).filter(Boolean));
    },
    enabled: !!doctorRecord?.id,
  });

  const deleteSlot = useMutation({
    mutationFn: async (slotId: string) => {
      const { error } = await supabase.from("time_slots").delete().eq("id", slotId);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["doctor-slots"] }); toast.success("Slot deleted"); },
    onError: () => toast.error("Failed to delete slot"),
  });

  const clearWeek = useMutation({
    mutationFn: async () => {
      if (!doctorRecord) return;
      const availableIds = slots?.filter(s => s.is_available && !bookedSlotIds?.has(s.id)).map(s => s.id) || [];
      if (availableIds.length === 0) { toast.info("No available slots to clear"); return; }
      const { error } = await supabase.from("time_slots").delete().in("id", availableIds);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["doctor-slots"] }); toast.success("Week cleared"); },
    onError: () => toast.error("Failed to clear week"),
  });

  return (
    <Layout>
      <div className="container py-10">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Schedule Manager</h1>
            <p className="text-sm text-muted-foreground">Manage your weekly time slots</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setBulkOpen(true)}>
              <CalendarDays className="h-4 w-4 mr-1.5" />Add Standard Week
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive">Clear Week</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear this week?</AlertDialogTitle>
                  <AlertDialogDescription>This will delete all available (not booked) slots for the current week.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => clearWeek.mutate()} disabled={clearWeek.isPending}>
                    {clearWeek.isPending ? "Clearing..." : "Clear"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Week nav */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => setWeekOffset(w => w - 1)}><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" onClick={() => setWeekOffset(0)}>Today</Button>
          <Button variant="ghost" size="icon" onClick={() => setWeekOffset(w => w + 1)}><ChevronRight className="h-4 w-4" /></Button>
          <span className="text-sm text-muted-foreground">
            {format(weekDays[0], "MMM dd")} – {format(weekDays[6], "MMM dd, yyyy")}
          </span>
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {weekDays.map(day => {
            const dateStr = format(day, "yyyy-MM-dd");
            const daySlots = slots?.filter(s => s.slot_date === dateStr) || [];
            return (
              <Card key={dateStr} className={isToday(day) ? "border-primary" : ""}>
                <CardHeader className="p-3 pb-1">
                  <CardTitle className="text-xs font-medium text-center">
                    {format(day, "EEE dd")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 space-y-1.5">
                  {slotsLoading ? (
                    <Skeleton className="h-20" />
                  ) : (
                    daySlots.map(slot => {
                      const isBooked = !slot.is_available || bookedSlotIds?.has(slot.id);
                      return (
                        <div key={slot.id} className={`flex items-center justify-between rounded-md px-2 py-1 text-xs ${isBooked ? "bg-muted" : "bg-green-50 dark:bg-green-950/20"}`}>
                          <div>
                            <span className="font-medium">{slot.start_time?.slice(0, 5)} – {slot.end_time?.slice(0, 5)}</span>
                            <Badge variant={isBooked ? "secondary" : "default"} className="ml-1.5 text-[10px] px-1 py-0">
                              {isBooked ? "Booked" : "Open"}
                            </Badge>
                          </div>
                          {!isBooked && (
                            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => deleteSlot.mutate(slot.id)}>
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      );
                    })
                  )}
                  <Button variant="ghost" size="sm" className="w-full text-xs h-7 text-primary" onClick={() => setAddSlotDay(dateStr)}>
                    <Plus className="h-3 w-3 mr-1" />Add
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Add Slot Dialog */}
        <AddSlotDialog
          open={!!addSlotDay}
          onClose={() => setAddSlotDay(null)}
          date={addSlotDay || ""}
          doctorId={doctorRecord?.id || ""}
          weekDays={weekDays.map(d => format(d, "yyyy-MM-dd"))}
        />

        {/* Bulk Add Dialog */}
        <BulkAddDialog
          open={bulkOpen}
          onClose={() => setBulkOpen(false)}
          doctorId={doctorRecord?.id || ""}
          weekDays={weekDays.map(d => format(d, "yyyy-MM-dd"))}
        />
      </div>
    </Layout>
  );
}

function AddSlotDialog({ open, onClose, date, doctorId, weekDays }: {
  open: boolean; onClose: () => void; date: string; doctorId: string; weekDays: string[];
}) {
  const queryClient = useQueryClient();
  const [startTime, setStartTime] = useState("09:00");
  const [duration, setDuration] = useState("30");
  const [repeatWeek, setRepeatWeek] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!doctorId || !date) return;
    setLoading(true);
    const [h, m] = startTime.split(":").map(Number);
    const endMin = h * 60 + m + parseInt(duration);
    const endTime = `${String(Math.floor(endMin / 60)).padStart(2, "0")}:${String(endMin % 60).padStart(2, "0")}`;

    const dates = repeatWeek ? weekDays : [date];
    const inserts = dates.map(d => ({
      doctor_id: doctorId, slot_date: d, start_time: startTime, end_time: endTime, is_available: true,
    }));

    const { error } = await supabase.from("time_slots").insert(inserts);
    setLoading(false);
    if (error) toast.error("Failed to add slot: " + error.message);
    else { toast.success("Slot(s) added!"); queryClient.invalidateQueries({ queryKey: ["doctor-slots"] }); onClose(); }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Add Time Slot</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>Date</Label><Input value={date} disabled /></div>
          <div className="space-y-2"><Label>Start Time</Label><Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} /></div>
          <div className="space-y-2">
            <Label>Duration</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 min</SelectItem>
                <SelectItem value="30">30 min</SelectItem>
                <SelectItem value="45">45 min</SelectItem>
                <SelectItem value="60">60 min</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={repeatWeek} onCheckedChange={v => setRepeatWeek(!!v)} id="repeat" />
            <label htmlFor="repeat" className="text-sm">Repeat for entire week</label>
          </div>
          <Button onClick={handleSubmit} disabled={loading} className="w-full">{loading ? "Adding..." : "Add Slot"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function BulkAddDialog({ open, onClose, doctorId, weekDays }: {
  open: boolean; onClose: () => void; doctorId: string; weekDays: string[];
}) {
  const queryClient = useQueryClient();
  const [workDays, setWorkDays] = useState([true, true, true, true, true, false, false]);
  const [start, setStart] = useState("08:00");
  const [end, setEnd] = useState("16:00");
  const [duration, setDuration] = useState("30");
  const [loading, setLoading] = useState(false);

  const toggleDay = (i: number) => setWorkDays(d => d.map((v, j) => j === i ? !v : v));

  const handleSubmit = async () => {
    if (!doctorId) return;
    setLoading(true);
    const dur = parseInt(duration);
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    const inserts: any[] = [];
    weekDays.forEach((date, i) => {
      if (!workDays[i]) return;
      for (let t = startMin; t + dur <= endMin; t += dur) {
        inserts.push({
          doctor_id: doctorId,
          slot_date: date,
          start_time: `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`,
          end_time: `${String(Math.floor((t + dur) / 60)).padStart(2, "0")}:${String((t + dur) % 60).padStart(2, "0")}`,
          is_available: true,
        });
      }
    });
    if (inserts.length === 0) { toast.info("No slots to add"); setLoading(false); return; }
    const { error } = await supabase.from("time_slots").insert(inserts);
    setLoading(false);
    if (error) toast.error("Failed: " + error.message);
    else { toast.success(`${inserts.length} slots created!`); queryClient.invalidateQueries({ queryKey: ["doctor-slots"] }); onClose(); }
  };

  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Add Standard Week</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Working Days</Label>
            <div className="flex gap-2 flex-wrap">
              {dayLabels.map((d, i) => (
                <Button key={d} variant={workDays[i] ? "default" : "outline"} size="sm" onClick={() => toggleDay(i)}>{d}</Button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Start</Label><Input type="time" value={start} onChange={e => setStart(e.target.value)} /></div>
            <div className="space-y-2"><Label>End</Label><Input type="time" value={end} onChange={e => setEnd(e.target.value)} /></div>
          </div>
          <div className="space-y-2">
            <Label>Slot Duration</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 min</SelectItem>
                <SelectItem value="30">30 min</SelectItem>
                <SelectItem value="45">45 min</SelectItem>
                <SelectItem value="60">60 min</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSubmit} disabled={loading} className="w-full">{loading ? "Creating..." : "Generate Slots"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
