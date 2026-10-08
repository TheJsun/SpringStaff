import { z } from "zod";

export interface DepartmentResponse {
  id: number;
  name: string;
}

export const CreateDepartmentRequest = z.object({
  name: z
    .string()
    .min(1, "Department name is required")
    .max(50, "Department name must be 50 characters or fewer"),
});

export type CreateDepartmentRequest = z.infer<typeof CreateDepartmentRequest>;
