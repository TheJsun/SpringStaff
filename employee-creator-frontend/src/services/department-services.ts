import { CreateDepartmentRequest } from "../schemas/department-schema";
import type { DepartmentResponse } from "../schemas/department-schema";
import type { EmployeeResponse } from "../schemas/employee-schema";

// Shared by the create form and the inline rename so the rule lives in one
// place. Returns null when the name is acceptable, otherwise the message to
// show the user.
//
// The duplicate check matters most on rename: PATCH /departments/{id} does NOT
// check for a name clash server-side (unlike POST, which does), and the name
// column has no unique constraint, so this is the only thing stopping two
// departments sharing a name. Case-insensitive to match MySQL's default
// case-insensitive collation, which is what the create endpoint compares with.
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

// Staff counts are derived client-side from the employee list rather than being
// returned by the API: the Directory has already warmed the ["employees"] cache
// by the time you reach the departments page, and GET /employees is not
// admin-gated. This stops working the day /api/employees is paginated, at which
// point the count belongs on DepartmentResponse instead.
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
