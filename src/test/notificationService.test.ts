import { describe, it, expect, vi, beforeEach } from "vitest";

const { supabaseMock, makeChain } = vi.hoisted(() => {
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
  return {
    makeChain,
    supabaseMock: { from: vi.fn(() => makeChain()) },
  };
});

vi.mock("@/integrations/supabase/client", () => ({ supabase: supabaseMock }));

import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  createNotification,
} from "@/services/notificationService";

describe("notificationService", () => {
  beforeEach(() => {
    supabaseMock.from.mockClear();
    supabaseMock.from.mockImplementation(() => makeChain());
  });

  it("fetches notifications for a user", async () => {
    const sample = [{ id: "n1", title: "Hi" }];
    supabaseMock.from.mockReturnValueOnce(makeChain({ data: sample, error: null }));
    const out = await fetchNotifications("user-1");
    expect(out).toEqual(sample);
    expect(supabaseMock.from).toHaveBeenCalledWith("notifications");
  });

  it("marks a single notification as read", async () => {
    await expect(markNotificationRead("n1")).resolves.toBeUndefined();
  });

  it("marks all notifications as read", async () => {
    await expect(markAllNotificationsRead("user-1")).resolves.toBeUndefined();
  });

  it("creates an appointment notification", async () => {
    await expect(
      createNotification({
        user_id: "doc-1",
        title: "New Appointment",
        message: "Patient X booked a slot",
        type: "appointment",
        link: "/doctor/dashboard",
      })
    ).resolves.toBeUndefined();
  });

  it("throws when insert errors", async () => {
    supabaseMock.from.mockReturnValueOnce(makeChain({ data: null, error: new Error("denied") }));
    await expect(createNotification({ user_id: "u", title: "t" })).rejects.toThrow("denied");
  });
});
