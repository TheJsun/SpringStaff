import { apiFetch } from "./http";
import type {
  CreateEmployeeRequest,
  CreateEmployeeResponse,
  EmployeeResponse,
} from "../schemas/employee-schema";

const BASE_URL = import.meta.env.VITE_API_URL;
const EMPLOYEE_BASE_URL = `${BASE_URL}/employees`;

export const getAllEmployees = async () => {
  const response = await apiFetch(EMPLOYEE_BASE_URL, {
    credentials: "include",
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(
      errorBody?.message ?? `Failed to fetch employees: ${response.status}`,
    );
  }
  return (await response.json()) as EmployeeResponse[];
};

export const getEmployeeById = async (id: number) => {
  const response = await apiFetch(`${EMPLOYEE_BASE_URL}/${id}`, {
    credentials: "include",
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(
      errorBody?.message ?? `Failed to fetch employee: ${response.status}`,
    );
  }
  return (await response.json()) as EmployeeResponse;
};

export const createEmployee = async (data: CreateEmployeeRequest) => {
  const response = await apiFetch(EMPLOYEE_BASE_URL, {
    method: "POST",
    body: JSON.stringify(data),
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(
      errorBody?.message ?? `Failed to create employee: ${response.status}`,
    );
  }
  return (await response.json()) as CreateEmployeeResponse;
};

export const deleteEmployee = async (id: number) => {
  const response = await apiFetch(`${EMPLOYEE_BASE_URL}/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(
      errorBody?.message ?? `Failed to delete employee: ${response.status} `,
    );
  }
};

export const updateEmployee = async (
  id: number,
  data: CreateEmployeeRequest,
) => {
  const response = await apiFetch(`${EMPLOYEE_BASE_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(
      errorBody?.message ?? `Failed to update employee: ${response.status}`,
    );
  }
  return (await response.json()) as EmployeeResponse;
};
