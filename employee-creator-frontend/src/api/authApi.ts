import { apiFetch } from "./http";

const BASE_URL = import.meta.env.VITE_API_URL;
const AUTH_BASE_URL = `${BASE_URL}/auth`;

export interface MeResponse {
  userId: number;
  email: string;
  role: "ADMIN" | "EMPLOYEE";
  employeeId: number | null;
}

export async function login(
  email: string,
  password: string,
): Promise<MeResponse> {
  const response = await apiFetch(`${AUTH_BASE_URL}/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (response.status === 401) {
    throw new Error("Invalid email or password");
  }
  if (!response.ok) {
    throw new Error("Login failed");
  }

  return response.json();
}

export async function getMe(): Promise<MeResponse | null> {
  const response = await apiFetch(`${BASE_URL}/me`, {
    credentials: "include",
  });
  if (response.status === 401) {
    return null;
  }
  if (!response.ok) {
    throw new Error("Could not check login status");
  }
  return response.json();
}

export async function logout(): Promise<void> {
  const response = await apiFetch(`${AUTH_BASE_URL}/logout`, {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Logout failed");
  }
}
