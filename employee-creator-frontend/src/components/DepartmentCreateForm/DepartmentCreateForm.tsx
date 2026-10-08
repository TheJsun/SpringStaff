import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "../Button/Button";
import { useCreateDepartment } from "../../hooks/useDepartments";
import { validateDepartmentName } from "../../services/department-services";
import { CreateDepartmentRequest } from "../../schemas/department-schema";
import type { DepartmentResponse } from "../../schemas/department-schema";
import classes from "./DepartmentCreateForm.module.scss";

interface DepartmentCreateFormProps {
  departments: DepartmentResponse[];
  // Split so the page can react to a create without also reacting to a cancel
  // (it jumps to the page the new department landed on).
  onCreated: () => void;
  onCancel: () => void;
}

export default function DepartmentCreateForm({
  departments,
  onCreated,
  onCancel,
}: DepartmentCreateFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CreateDepartmentRequest>({
    resolver: zodResolver(CreateDepartmentRequest),
    defaultValues: { name: "" },
  });

  const createMutation = useCreateDepartment();

  const onSubmit = (data: CreateDepartmentRequest) => {
    // react-hook-form ignores register() validate rules once a resolver is
    // supplied, so the duplicate guard runs here. The server's own 409 is
    // funnelled into the same field error below, giving one code path for
    // "this name was rejected".
    const message = validateDepartmentName(data.name, departments);
    if (message) {
      setError("name", { type: "duplicate", message });
      return;
    }

    createMutation.mutate(
      { name: data.name.trim() },
      {
        onSuccess: onCreated,
        onError: (error) =>
          setError("name", { type: "server", message: error.message }),
      },
    );
  };

  return (
    <form className={classes.createForm} onSubmit={handleSubmit(onSubmit)}>
      <div className={classes.fieldGroup}>
        <label className={classes.label} htmlFor="departmentName">
          Department name
        </label>
        <input
          className={
            `${classes.field} ${errors.name ? classes["field--invalid"] : ""}`.trim()
          }
          id="departmentName"
          autoFocus
          {...register("name")}
        />
        {errors.name && <p className={classes.error}>{errors.name.message}</p>}
      </div>

      <div className={classes.actions}>
        <Button
          type="submit"
          variant="primary"
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? "Creating..." : "Create"}
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
