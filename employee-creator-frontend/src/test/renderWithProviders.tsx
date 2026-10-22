import type { ReactElement, ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import {
  AuthContext,
  type AuthContextValue,
} from "../context/authContextValue";
import type { MeResponse } from "../api/authApi";

export const adminUser: MeResponse = {
  userId: 1,
  email: "admin@example.com",
  role: "ADMIN",
  employeeId: 10,
};

export const employeeUser: MeResponse = {
  userId: 2,
  email: "worker@example.com",
  role: "EMPLOYEE",
  employeeId: 20,
};

export function makeAuth(
  overrides: Partial<AuthContextValue> = {},
): AuthContextValue {
  return {
    user: null,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
    ...overrides,
  };
}

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

interface ProviderOptions extends Omit<RenderOptions, "wrapper"> {
  auth?: AuthContextValue;
  route?: string;
  queryClient?: QueryClient;
}

export function renderWithProviders(
  ui: ReactElement,
  options: ProviderOptions = {},
) {
  const {
    auth = makeAuth(),
    route = "/",
    queryClient = makeQueryClient(),
    ...renderOptions
  } = options;

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={auth}>
          <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}
