import { describe, it, expect, vi, beforeEach } from "vitest";

const { supabaseMock } = vi.hoisted(() => {
  const makeChain = (result: any = { data: [], error: null }): any => {
    const chain: any = {
      select: vi.fn(() => chain),
      insert: vi.fn(() => chain),
      update: vi.fn(() => chain),
      eq: vi.fn(() => chain),
      order: vi.fn(() => chain),
      limit: vi.fn(() => chain),
      single: vi.fn(() => Promise.resolve(result)),
      then: (cb: any) => Promise.resolve(result).then(cb),
    };
    return chain;
  };
  const storageBucket = {
    upload: vi.fn(() => Promise.resolve({ data: { path: "x" }, error: null })),
    getPublicUrl: vi.fn(() => ({ data: { publicUrl: "https://cdn.example/labs/test.pdf" } })),
  };
  return {
    supabaseMock: {
      from: vi.fn(() => makeChain()),
      storage: { from: vi.fn(() => storageBucket) },
      functions: {
        invoke: vi.fn(() =>
          Promise.resolve({ data: { summary: "Patient values within normal range." }, error: null })
        ),
      },
    },
  };
});

vi.mock("@/integrations/supabase/client", () => ({ supabase: supabaseMock }));

import { uploadLabFile, generateLabSummary } from "@/services/labService";

describe("labService", () => {
  beforeEach(() => {
    supabaseMock.storage.from.mockClear();
    supabaseMock.functions.invoke.mockClear();
  });

  it("uploads a PDF and returns public URL with pdf type", async () => {
    const file = new File(["data"], "result.pdf", { type: "application/pdf" });
    const res = await uploadLabFile("patient-1", "lab-1", file);
    expect(res.fileType).toBe("pdf");
    expect(res.url).toContain("cdn.example");
    expect(supabaseMock.storage.from).toHaveBeenCalledWith("lab-results");
  });

  it("uploads an image and returns image type", async () => {
    const file = new File(["data"], "scan.png", { type: "image/png" });
    const res = await uploadLabFile("p1", "l1", file);
    expect(res.fileType).toBe("image");
  });

  it("generates an AI summary via edge function", async () => {
    const summary = await generateLabSummary("lab-1");
    expect(summary).toMatch(/normal range/);
    expect(supabaseMock.functions.invoke).toHaveBeenCalledWith("lab-summary", {
      body: { lab_result_id: "lab-1" },
    });
  });

  it("falls back when function returns no summary", async () => {
    supabaseMock.functions.invoke.mockResolvedValueOnce({ data: {}, error: null });
    const summary = await generateLabSummary("lab-2");
    expect(summary).toMatch(/could not be generated/i);
  });

  it("throws when upload fails", async () => {
    supabaseMock.storage.from.mockReturnValueOnce({
      upload: vi.fn().mockResolvedValue({ error: new Error("boom") }),
      getPublicUrl: vi.fn(),
    } as any);
    const file = new File(["x"], "f.pdf", { type: "application/pdf" });
    await expect(uploadLabFile("p", "l", file)).rejects.toThrow("boom");
  });
});
