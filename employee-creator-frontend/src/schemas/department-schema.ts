import { z } from "zod";

export interface DepartmentLead {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  jobRole: string;
}

export interface DepartmentResponse {
  id: number;
  name: string;
  description: string | null;
  lead: DepartmentLead | null;
}

export const CreateDepartmentRequest = z.object({
  name: z
    .string()
    .min(1, "Department name is required")
    .max(50, "Department name must be 50 characters or fewer"),
  description: z
    .string()
    .max(255, "Description must be 255 characters or fewer")
    .optional(),

  leadId: z.preprocess(
    (value) => (value === "" || value == null ? null : Number(value)),
    z.number().int().positive().nullable(),
  ),
});

export type CreateDepartmentRequest = z.infer<typeof CreateDepartmentRequest>;
