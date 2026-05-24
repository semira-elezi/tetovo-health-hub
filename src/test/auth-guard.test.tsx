import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const navigateSpy = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return { ...actual, useNavigate: () => navigateSpy };
});

const authState = { user: null as any, isLoading: false };
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => authState,
  AuthProvider: ({ children }: any) => children,
}));

vi.mock("@/hooks/useDepartments", () => ({ useDepartments: () => ({ data: [] }) }));
vi.mock("@/hooks/useDoctors", () => ({ useDoctors: () => ({ data: [], isLoading: false }) }));
vi.mock("@/hooks/useAppointments", () => ({
  useCreateAppointment: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock("@/services/notificationService", () => ({ createNotification: vi.fn() }));
vi.mock("@/lib/i18n", () => ({
  useTranslation: () => ({ t: (k: string) => k, language: "en" }),
}));
vi.mock("@/components/layout/Layout", () => ({
  default: ({ children }: any) => <div>{children}</div>,
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { rpc: vi.fn(() => Promise.resolve({ data: [], error: null })) },
}));

import AppointmentsPage from "@/pages/Appointments";

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<AppointmentsPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("Appointments auth guard", () => {
  beforeEach(() => {
    navigateSpy.mockClear();
    authState.user = null;
    authState.isLoading = false;
  });

  it("redirects unauthenticated users to login with redirect param", async () => {
    renderPage();
    await waitFor(() => {
      expect(navigateSpy).toHaveBeenCalledWith(
        "/auth/login?redirect=/appointments",
        { replace: true }
      );
    });
  });

  it("does not redirect while auth is loading", async () => {
    authState.isLoading = true;
    renderPage();
    await new Promise((r) => setTimeout(r, 30));
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it("does not redirect when user is logged in", async () => {
    authState.user = { id: "user-1", email: "p@x.com" };
    renderPage();
    await new Promise((r) => setTimeout(r, 30));
    expect(navigateSpy).not.toHaveBeenCalled();
  });
});
