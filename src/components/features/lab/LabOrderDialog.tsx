import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { FlaskConical, Loader2, Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { createNotification } from "@/services/notificationService";
import { toast } from "sonner";

const TEST_CATEGORIES = [
  "Blood Test", "Urine Test", "Imaging", "Biopsy",
  "Cardiac", "Hormonal", "Microbiology", "Other",
];

interface LabTest {
  test_name: string;
  test_category: string;
  reference_range: string;
  unit: string;
  notes: string;
}

const emptyTest = (): LabTest => ({
  test_name: "", test_category: "", reference_range: "", unit: "", notes: "",
});

export default function LabOrderDialog({
  appointment,
  doctorId,
  onClose,
  onSuccess,
}: {
  appointment: any;
  doctorId: string;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [tests, setTests] = useState<LabTest[]>([emptyTest()]);
  const [loading, setLoading] = useState(false);

  const addTest = () => setTests((t) => [...t, emptyTest()]);
  const removeTest = (i: number) => setTests((t) => t.filter((_, j) => j !== i));
  const updateTest = (i: number, field: keyof LabTest, value: string) =>
    setTests((t) => t.map((test, j) => (j === i ? { ...test, [field]: value } : test)));

  const handleSubmit = async () => {
    const valid = tests.filter((t) => t.test_name.trim());
    if (valid.length === 0) {
      toast.error("Add at least one test name");
      return;
    }
    setLoading(true);
    try {
      const rows = valid.map((t) => ({
        patient_id: appointment.patient_id,
        doctor_id: doctorId,
        appointment_id: appointment.id,
        test_name: t.test_name.trim(),
        test_category: t.test_category || null,
        reference_range: t.reference_range || null,
        unit: t.unit || null,
        notes: t.notes || null,
        status: "pending" as const,
      }));

      const { error } = await supabase.from("lab_results").insert(rows);
      if (error) throw error;

      // Notify patient
      await createNotification({
        user_id: appointment.patient_id,
        title: "Lab Tests Ordered",
        message: `Your doctor ordered ${valid.length} lab test(s). Results will be available soon.`,
        type: "lab_result",
        link: "/portal",
      }).catch(() => {});

      toast.success(`${valid.length} lab test(s) ordered`);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to order lab tests");
    }
    setLoading(false);
  };

  const patientName = (appointment as any).profiles?.full_name || "Patient";

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5" />
            Order Lab Tests
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Patient: <span className="font-medium text-foreground">{patientName}</span>
            {" · "}Date: <span className="font-medium text-foreground">{appointment.appointment_date}</span>
          </p>

          {tests.map((test, i) => (
            <Card key={i} className="p-3">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-medium text-muted-foreground">Test {i + 1}</p>
                {tests.length > 1 && (
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeTest(i)}>
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  className="col-span-2"
                  placeholder="Test name *"
                  value={test.test_name}
                  onChange={(e) => updateTest(i, "test_name", e.target.value)}
                />
                <Select value={test.test_category} onValueChange={(v) => updateTest(i, "test_category", v)}>
                  <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    {TEST_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input placeholder="Unit (e.g. mg/dL)" value={test.unit} onChange={(e) => updateTest(i, "unit", e.target.value)} />
                <Input
                  className="col-span-2"
                  placeholder="Reference range (e.g. 70-100)"
                  value={test.reference_range}
                  onChange={(e) => updateTest(i, "reference_range", e.target.value)}
                />
                <Textarea
                  className="col-span-2"
                  placeholder="Notes (optional)"
                  rows={2}
                  value={test.notes}
                  onChange={(e) => updateTest(i, "notes", e.target.value)}
                />
              </div>
            </Card>
          ))}

          <Button variant="outline" size="sm" onClick={addTest} className="w-full text-xs gap-1">
            <Plus className="h-3 w-3" /> Add Another Test
          </Button>

          <Button className="w-full" disabled={loading} onClick={handleSubmit}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Ordering...</> : `Order ${tests.filter(t => t.test_name.trim()).length} Test(s)`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
