import type { EmployeeResponse } from "../schemas/employee-schema";
import type { DepartmentResponse } from "../schemas/department-schema";
import type { DocumentResponse } from "../schemas/document-schema";
import type { AuditLogResponse } from "../schemas/audit-schema";

export const mockDepartment: DepartmentResponse = {
  id: 1,
  name: "Engineering",
  description: "Builds the product",
  lead: null,
};

export const mockEmployee: EmployeeResponse = {
  id: 1,
  firstName: "Ada",
  lastName: "Lovelace",
  middleName: null,
  email: "ada@example.com",
  phoneNumber: "0400000000",
  address: "1 Test Street",
  jobRole: "Engineer",
  department: mockDepartment,
  contractType: "PERMANENT",
  startDate: "2023-01-15",
  finishDate: null,
  onGoing: true,
  employmentType: "FULL_TIME",
  hoursPerWeek: 38,
};

export const mockDocument: DocumentResponse = {
  id: 1,
  name: "Contract",
  fileName: "contract.pdf",
  contentType: "application/pdf",
  sizeBytes: 2048,
  uploadedAt: "2024-03-01T10:00:00Z",
  uploadedByUserId: 1,
  uploadedByName: "Ada Lovelace",
};

export const mockAuditLog: AuditLogResponse = {
  id: 1,
  actorEmail: "admin@example.com",
  action: "UPDATED",
  entityType: "Employee",
  entityId: 1,
  entityLabel: "Ada Lovelace",
  details: [
    { field: "jobRole", oldValue: "Engineer", newValue: "Senior Engineer" },
  ],
  createdAt: "2024-03-01T10:00:00Z",
};
