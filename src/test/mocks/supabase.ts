import { vi } from "vitest";

// Chainable query mock builder
export function createQueryBuilder(result: { data?: any; error?: any } = { data: null, error: null }) {
  const chain: any = {
    select: vi.fn(() => chain),
    insert: vi.fn(() => chain),
    update: vi.fn(() => chain),
    delete: vi.fn(() => chain),
    upsert: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    neq: vi.fn(() => chain),
    in: vi.fn(() => chain),
    order: vi.fn(() => chain),
    limit: vi.fn(() => chain),
    single: vi.fn(() => Promise.resolve(result)),
    maybeSingle: vi.fn(() => Promise.resolve(result)),
    then: (cb: any) => Promise.resolve(result).then(cb),
  };
  return chain;
}

export function createSupabaseMock(overrides: Partial<{
  fromResult: any;
  rpcResult: any;
  authUser: any;
  storageUploadResult: any;
  storagePublicUrl: string;
  functionsResult: any;
}> = {}) {
  const fromResult = overrides.fromResult ?? { data: [], error: null };
  const rpcResult = overrides.rpcResult ?? { data: [], error: null };

  return {
    from: vi.fn(() => createQueryBuilder(fromResult)),
    rpc: vi.fn(() => Promise.resolve(rpcResult)),
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: overrides.authUser ? { user: overrides.authUser } : null } })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signInWithPassword: vi.fn(() => Promise.resolve({ data: {}, error: null })),
      signUp: vi.fn(() => Promise.resolve({ data: { user: { id: "u1" } }, error: null })),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => Promise.resolve(overrides.storageUploadResult ?? { data: { path: "x" }, error: null })),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: overrides.storagePublicUrl ?? "https://cdn/x.pdf" } })),
      })),
    },
    functions: {
      invoke: vi.fn(() => Promise.resolve(overrides.functionsResult ?? { data: { summary: "AI summary" }, error: null })),
    },
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
      unsubscribe: vi.fn(),
    })),
    removeChannel: vi.fn(),
  };
}
