import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { CreateDepartmentRequest } from "../schemas/department-schema";
import {
  createDepartment,
  deleteDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
} from "../api/departmentApi";

export function useDepartments() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: getAllDepartments,
  });
}

export function useDepartment(id: number) {
  return useQuery({
    queryKey: ["departments", id],
    queryFn: () => getDepartmentById(id),
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => {
      // Deliberately does not invalidate ["employees"] like the update does: a
      // successful DELETE proves no employee referenced this department, or the
      // backend would have thrown DepartmentInUseException (409) instead.
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateDepartmentRequest }) =>
      updateDepartment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      // EmployeeResponse embeds a copy of { department: { id, name } }, so a
      // rename leaves every cached employee holding the old name. HomePage
      // filters employees by department *name* while building its filter
      // options from the fresh department list, so without this the renamed
      // department matches nothing. The prefix also covers ["employees", id].
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}
