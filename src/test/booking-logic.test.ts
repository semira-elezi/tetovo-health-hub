import { describe, it, expect } from "vitest";

/**
 * End-to-end logic tests for the appointment booking availability system.
 * Mirrors the filtering applied in src/pages/Appointments.tsx
 * and the SQL function get_taken_slots() which excludes
 * cancelled / no_show appointments.
 */

const ALL_SLOTS = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

function computeAvailable(allSlots: string[], taken: string[]) {
  return allSlots.filter((s) => !taken.includes(s));
}

function deriveEndTime(start: string) {
  const endHour = String(parseInt(start.split(":")[0]) + 1).padStart(2, "0");
  return `${endHour}:00`;
}

function isTakenForRpc(appt: { status: string; doctor_id: string; date: string }, doctorId: string, date: string) {
  return (
    appt.doctor_id === doctorId &&
    appt.date === date &&
    !["cancelled", "no_show"].includes(appt.status)
  );
}

describe("Booking availability", () => {
  it("filters out taken slots", () => {
    const taken = ["09:00", "13:00"];
    expect(computeAvailable(ALL_SLOTS, taken)).toEqual([
      "08:00", "10:00", "11:00", "14:00", "15:00", "16:00",
    ]);
  });

  it("returns all slots when none taken", () => {
    expect(computeAvailable(ALL_SLOTS, [])).toHaveLength(ALL_SLOTS.length);
  });

  it("returns empty when all booked", () => {
    expect(computeAvailable(ALL_SLOTS, ALL_SLOTS)).toEqual([]);
  });

  it("end time is start + 1 hour", () => {
    expect(deriveEndTime("08:00")).toBe("09:00");
    expect(deriveEndTime("15:00")).toBe("16:00");
  });

  it("excludes cancelled / no_show appointments from taken set", () => {
    const appts = [
      { status: "pending", doctor_id: "d1", date: "2026-06-01" },
      { status: "cancelled", doctor_id: "d1", date: "2026-06-01" },
      { status: "no_show", doctor_id: "d1", date: "2026-06-01" },
      { status: "confirmed", doctor_id: "d1", date: "2026-06-01" },
      { status: "pending", doctor_id: "d2", date: "2026-06-01" }, // other doctor
    ];
    const taken = appts.filter((a) => isTakenForRpc(a, "d1", "2026-06-01"));
    expect(taken).toHaveLength(2);
  });
});

describe("Lab result status colors", () => {
  function statusColor(status: string) {
    if (status === "normal") return "green";
    if (status === "warning") return "yellow";
    if (status === "abnormal" || status === "critical") return "red";
    return "gray";
  }

  it("maps statuses correctly", () => {
    expect(statusColor("normal")).toBe("green");
    expect(statusColor("warning")).toBe("yellow");
    expect(statusColor("abnormal")).toBe("red");
    expect(statusColor("critical")).toBe("red");
    expect(statusColor("pending")).toBe("gray");
  });
});
