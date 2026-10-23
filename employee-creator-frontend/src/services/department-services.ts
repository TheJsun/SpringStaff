import { CreateDepartmentRequest } from "../schemas/department-schema";
import type { DepartmentResponse } from "../schemas/department-schema";
import type { EmployeeResponse } from "../schemas/employee-schema";

export function validateDepartmentName(
  name: string,
  departments: DepartmentResponse[],
  excludeId?: number,
): string | null {
  const trimmed = name.trim();

  const parsed = CreateDepartmentRequest.safeParse({ name: trimmed });
  if (!parsed.success) {
    return parsed.error.issues[0].message;
  }

  const clash = departments.some(
    (d) =>
      d.id !== excludeId &&
      d.name.trim().toLowerCase() === trimmed.toLowerCase(),
  );

  return clash ? "A department with that name already exists" : null;
}
export function countStaffByDepartment(
  employees: EmployeeResponse[],
): Map<number, number> {
  const counts = new Map<number, number>();

  for (const employee of employees) {
    const id = employee.department?.id;
    if (id == null) continue;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  return counts;
}
