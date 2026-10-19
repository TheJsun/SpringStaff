import { apiFetch } from "./http";
import type {
  CreateDepartmentRequest,
  DepartmentResponse,
} from "../schemas/department-schema";

const BASE_URL = import.meta.env.VITE_API_URL;
const DEPARTMENT_BASE_URL = `${BASE_URL}/departments`;

export const getAllDepartments = async () => {
  const response = await apiFetch(`${DEPARTMENT_BASE_URL}`, {
    credentials: "include",
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(
      errorBody?.message ?? `Failed to fetch departments: ${response.status}`,
    );
  }
  return (await response.json()) as DepartmentResponse[];
};

export const getDepartmentById = async (id: number) => {
  const response = await apiFetch(`${DEPARTMENT_BASE_URL}/${id}`, {
    credentials: "include",
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(
      errorBody?.message ?? `Failed to fetch department: ${response.status}`,
    );
  }
  return (await response.json()) as DepartmentResponse;
};

export const createDepartment = async (data: CreateDepartmentRequest) => {
  const response = await apiFetch(DEPARTMENT_BASE_URL, {
    method: "POST",
    body: JSON.stringify(data),
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(
      errorBody?.message ?? `Failed to fetch department: ${response.status}`,
    );
  }
  return (await response.json()) as DepartmentResponse;
};

export const deleteDepartment = async (id: number) => {
  const response = await apiFetch(`${DEPARTMENT_BASE_URL}/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(
      errorBody?.message ?? `Failed to delete department: ${response.status}`,
    );
  }
};

export const updateDepartment = async (
  id: number,
  data: CreateDepartmentRequest,
) => {
  const response = await apiFetch(`${DEPARTMENT_BASE_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(
      errorBody?.message ?? `Failed to update department: ${response.status}`,
    );
  }
  return (await response.json()) as DepartmentResponse;
};
