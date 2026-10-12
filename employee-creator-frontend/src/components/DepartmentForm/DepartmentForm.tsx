import type { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "../Button/Button";
import {
  useCreateDepartment,
  useUpdateDepartment,
} from "../../hooks/useDepartments";
import { validateDepartmentName } from "../../services/department-services";
import { CreateDepartmentRequest } from "../../schemas/department-schema";
import type { DepartmentResponse } from "../../schemas/department-schema";
import type { EmployeeResponse } from "../../schemas/employee-schema";
import { getFullName } from "../../services/employee-profile";
import classes from "./DepartmentForm.module.scss";

interface DepartmentFormProps {
  mode: "create" | "edit";
  department?: DepartmentResponse;
  departments: DepartmentResponse[];
  employees: EmployeeResponse[];
  onSaved: () => void;
  onClose: () => void;
}

type DepartmentFormInput = z.input<typeof CreateDepartmentRequest>;

export default function DepartmentForm({
  mode,
  department,
  departments,
  employees,
  onSaved,
  onClose,
}: DepartmentFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<DepartmentFormInput, unknown, CreateDepartmentRequest>({
    resolver: zodResolver(CreateDepartmentRequest),
    defaultValues: {
      name: department?.name ?? "",
      description: department?.description ?? "",
      leadId: department?.lead ? String(department.lead.id) : "",
    },
  });

  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (data: CreateDepartmentRequest) => {
    const message = validateDepartmentName(
      data.name,
      departments,
      mode === "edit" ? department?.id : undefined,
    );
    if (message) {
      setError("name", { type: "duplicate", message });
      return;
    }
    const payload: CreateDepartmentRequest = {
      name: data.name.trim(),
      description: data.description?.trim() ?? "",
      leadId: data.leadId,
    };

    const onError = (error: Error) =>
      setError("name", { type: "server", message: error.message });

    if (mode === "create") {
      createMutation.mutate(payload, { onSuccess: onSaved, onError });
    } else if (department) {
      updateMutation.mutate(
        { id: department.id, data: payload },
        { onSuccess: onSaved, onError },
      );
    }
  };

  return (
    <form className={classes.form} onSubmit={handleSubmit(onSubmit)}>
      <div className={classes.fieldGroup}>
        <label className={classes.label} htmlFor="departmentName">
          Name
        </label>
        <input
          className={`${classes.field} ${errors.name ? classes["field--invalid"] : ""}`.trim()}
          id="departmentName"
          placeholder="e.g. Customer Success"
          autoFocus
          {...register("name")}
        />
        {errors.name && <p className={classes.error}>{errors.name.message}</p>}
      </div>

      <div className={classes.fieldGroup}>
        <label className={classes.label} htmlFor="departmentLead">
          Lead
        </label>
        <select
          className={classes.field}
          id="departmentLead"
          {...register("leadId")}
        >
          <option value="">No lead</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {getFullName(employee)}
            </option>
          ))}
        </select>
      </div>

      <div className={classes.fieldGroup}>
        <label className={classes.label} htmlFor="departmentDescription">
          Description <span className={classes.optional}>Optional</span>
        </label>
        <textarea
          className={`${classes.field} ${classes.textarea}`}
          id="departmentDescription"
          rows={3}
          placeholder="What this team looks after"
          {...register("description")}
        />
        {errors.description && (
          <p className={classes.error}>{errors.description.message}</p>
        )}
      </div>

      <div className={classes.actions}>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isPending}>
          {mode === "create"
            ? isPending
              ? "Creating..."
              : "Create department"
            : isPending
              ? "Saving..."
              : "Save"}
        </Button>
      </div>
    </form>
  );
}
