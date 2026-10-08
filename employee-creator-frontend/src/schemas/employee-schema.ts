import { z } from "zod";
import type { DepartmentResponse } from "./department-schema";

export const ContractType = z.enum(["PERMANENT", "CONTRACT"]);
export type ContractType = z.infer<typeof ContractType>;

export const EmploymentType = z.enum(["FULL_TIME", "PART_TIME"]);
export type EmploymentType = z.infer<typeof EmploymentType>;

export interface EmployeeResponse {
  id: number;
  firstName: string;
  lastName: string;
  middleName: string | null;
  email: string;
  phoneNumber: string;
  address: string;
  jobRole: string;
  department: DepartmentResponse;
  contractType: ContractType;
  startDate: string;
  finishDate: string | null;
  onGoing: boolean;
  employmentType: EmploymentType;
  hoursPerWeek: number;
}

export interface CreateEmployeeResponse {
  employee: EmployeeResponse;
  temporaryPassword: string;
}

export const CreateEmployeeRequest = z
  .object({
    firstName: z.string().trim().min(1, "First name is required").max(50),
    lastName: z.string().trim().min(1, "Last name is required").max(50),
    middleName: z
      .string()
      .trim()
      .max(50)
      .transform((v) => v || null),
    email: z
      .email("Invalid email")
      .min(1, "Email is required")
      .max(50, "Email must be 50 characters or fewer"),
    phoneNumber: z
      .string()
      .regex(/^\d{10}$/, "Must be a 10-digit phone number"),
    address: z.string().trim().min(1, "Address is required").max(100),
    jobRole: z.string().trim().min(1, "Job title is required").max(50),
    departmentId: z.coerce.number().positive("Please select a department"),
    contractType: ContractType,
    startDate: z.string().min(1, "Start date is required"),
    finishDate: z
      .string()
      .nullish()
      .transform((v) => v || null),
    onGoing: z.boolean(),
    employmentType: EmploymentType,
    hoursPerWeek: z.coerce
      .number()
      .int()
      .min(1, "Must be at least 1 hour")
      .max(168, "Must be 168 hours or fewer"),
  })
  .refine(
    (data) => {
      const hasFinishDate = !!data.finishDate;
      return data.onGoing !== hasFinishDate;
    },
    {
      message: "Select 'Ongoing' or provide a finish date",
      path: ["finishDate"],
    },
  )
  .refine(
    (data) => {
      if (!data.finishDate) return true;
      return new Date(data.finishDate) >= new Date(data.startDate);
    },
    {
      message: "Finish date cannot be earlier than start date",
      path: ["finishDate"],
    },
  );

export type CreateEmployeeRequest = z.infer<typeof CreateEmployeeRequest>;
export type CreateEmployeeInput = z.input<typeof CreateEmployeeRequest>;
export type CreateEmployeeOutput = z.output<typeof CreateEmployeeRequest>;
