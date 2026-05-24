import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const HOSPITAL = "PHI Clinical Hospital Tetovo";

function header(doc: jsPDF, title: string) {
  doc.setFontSize(16);
  doc.setTextColor(30, 58, 138);
  doc.text(HOSPITAL, 14, 16);
  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);
  doc.text(title, 14, 24);
  doc.setDrawColor(220);
  doc.line(14, 28, 196, 28);
}

function footer(doc: jsPDF) {
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(140);
    doc.text(`Generated ${new Date().toLocaleString()} · ${HOSPITAL}`, 14, 290);
    doc.text(`Page ${i} of ${pages}`, 180, 290);
  }
}

export function exportAppointmentsPDF(appointments: any[]) {
  const doc = new jsPDF();
  header(doc, "My Appointments");
  autoTable(doc, {
    startY: 34,
    head: [["Date", "Time", "Doctor", "Department", "Status"]],
    body: appointments.map((a) => [
      a.appointment_date,
      `${a.start_time} - ${a.end_time}`,
      `${a.doctors?.title || ""} ${a.doctors?.full_name || "—"}`.trim(),
      a.departments?.name_en || "—",
      a.status,
    ]),
    headStyles: { fillColor: [30, 58, 138] },
    styles: { fontSize: 9 },
  });
  footer(doc);
  doc.save(`appointments-${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function exportLabResultsPDF(results: any[]) {
  const doc = new jsPDF();
  header(doc, "Lab Results");
  autoTable(doc, {
    startY: 34,
    head: [["Date", "Test", "Result", "Unit", "Reference", "Status"]],
    body: results.map((r) => [
      new Date(r.created_at).toLocaleDateString(),
      r.test_name,
      r.result_value || "—",
      r.unit || "—",
      r.reference_range || "—",
      r.status,
    ]),
    headStyles: { fillColor: [30, 58, 138] },
    styles: { fontSize: 9 },
  });
  footer(doc);
  doc.save(`lab-results-${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function exportPrescriptionPDF(p: any) {
  const doc = new jsPDF();
  header(doc, "Prescription");
  doc.setFontSize(11);
  doc.setTextColor(20);
  let y = 40;
  doc.text(`Patient: ${p.patient_name || "—"}`, 14, y); y += 7;
  doc.text(`Prescribing Doctor: ${p.doctors?.full_name || "—"}`, 14, y); y += 7;
  doc.text(`Date: ${new Date(p.created_at).toLocaleDateString()}`, 14, y); y += 10;
  doc.setFontSize(13);
  doc.text("Medication", 14, y); y += 6;
  doc.setFontSize(11);
  doc.text(`Name: ${p.medication_name}`, 14, y); y += 7;
  doc.text(`Dosage: ${p.dosage || "—"}`, 14, y); y += 7;
  doc.text(`Frequency: ${p.frequency || "—"}`, 14, y); y += 7;
  doc.text(`Duration: ${p.duration || "—"}`, 14, y); y += 7;
  if (p.notes) { doc.text(`Notes: ${p.notes}`, 14, y); y += 7; }
  footer(doc);
  doc.save(`prescription-${p.id.slice(0, 8)}.pdf`);
}
