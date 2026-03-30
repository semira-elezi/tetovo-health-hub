import { supabase } from "@/integrations/supabase/client";

export async function uploadLabFile(
  patientId: string,
  labResultId: string,
  file: File
): Promise<{ url: string; fileType: "pdf" | "image" }> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  const isPdf = ext === "pdf";
  const fileType: "pdf" | "image" = isPdf ? "pdf" : "image";
  const path = `${patientId}/${labResultId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("lab-results")
    .upload(path, file, { contentType: file.type, upsert: true });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from("lab-results")
    .getPublicUrl(path);

  return { url: urlData.publicUrl, fileType };
}

export async function generateLabSummary(labResultId: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke("lab-summary", {
    body: { lab_result_id: labResultId },
  });

  if (error) throw error;
  return data?.summary || "Summary could not be generated.";
}

export async function downloadLabResultAsPdf(labResult: any): Promise<void> {
  // Generate a simple text-based printable page
  const w = window.open("", "_blank");
  if (!w) return;

  w.document.write(`
    <html><head><title>Lab Result - ${labResult.test_name}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 40px; max-width: 700px; margin: 0 auto; }
      h1 { font-size: 20px; border-bottom: 2px solid #333; padding-bottom: 8px; }
      table { width: 100%; border-collapse: collapse; margin: 20px 0; }
      th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
      th { background: #f5f5f5; }
      .disclaimer { margin-top: 30px; font-size: 11px; color: #888; border-top: 1px solid #ddd; padding-top: 10px; }
    </style></head><body>
    <h1>Lab Result Report</h1>
    <table>
      <tr><th>Test Name</th><td>${labResult.test_name}</td></tr>
      <tr><th>Category</th><td>${labResult.test_category || "—"}</td></tr>
      <tr><th>Result</th><td>${labResult.result_value || "—"} ${labResult.unit || ""}</td></tr>
      <tr><th>Reference Range</th><td>${labResult.reference_range || "—"}</td></tr>
      <tr><th>Status</th><td>${labResult.status}</td></tr>
      <tr><th>Date</th><td>${new Date(labResult.created_at).toLocaleDateString()}</td></tr>
      <tr><th>Notes</th><td>${labResult.notes || "—"}</td></tr>
    </table>
    ${labResult.summary ? `<h2>AI Summary</h2><p>${labResult.summary}</p><p class="disclaimer">⚠️ This summary is AI-generated and not a medical diagnosis.</p>` : ""}
    <p class="disclaimer">Clinical Hospital Tetovo · Generated ${new Date().toLocaleString()}</p>
    </body></html>
  `);
  w.document.close();
  w.print();
}
