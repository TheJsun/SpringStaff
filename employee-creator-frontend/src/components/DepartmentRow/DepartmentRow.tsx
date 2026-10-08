import { useState } from "react";
import Button from "../Button/Button";
import { Skeleton } from "../Skeleton/Skeleton";
import {
  useDeleteDepartment,
  useUpdateDepartment,
} from "../../hooks/useDepartments";
import { validateDepartmentName } from "../../services/department-services";
import type { DepartmentResponse } from "../../schemas/department-schema";
import classes from "./DepartmentRow.module.scss";

interface DepartmentRowProps {
  department: DepartmentResponse;
  staffCount: number;
  isCountLoading: boolean;
  // Every department, not just the page being rendered: the duplicate-name
  // guard has to see names on other pages too.
  allDepartments: DepartmentResponse[];
}

export default function DepartmentRow({
  department,
  staffCount,
  isCountLoading,
  allDepartments,
}: DepartmentRowProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [name, setName] = useState(department.name);
  const [validationError, setValidationError] = useState<string | null>(null);

  // The mutations live on the row rather than the page (unlike the page-level
  // useEmployeeActions pattern) because a failed delete has to report inline on
  // the row that failed. A shared page-level mutation would mean tracking which
  // row its error belongs to by hand; per-row instances give row-scoped
  // isPending and error for free, and mutation hooks don't subscribe to query
  // data so they're cheap.
  const updateMutation = useUpdateDepartment();
  const deleteMutation = useDeleteDepartment();

  const startRenaming = () => {
    setName(department.name);
    setValidationError(null);
    // Drop a previous delete failure so it doesn't sit under a row the user has
    // moved on from. A repeat delete clears itself, since React Query flips
    // back to pending on a new mutate.
    deleteMutation.reset();
    setIsRenaming(true);
  };

  const handleCancel = () => {
    setIsRenaming(false);
    setValidationError(null);
    updateMutation.reset();
  };

  const handleSave = () => {
    const message = validateDepartmentName(name, allDepartments, department.id);
    if (message) {
      setValidationError(message);
      return;
    }
    setValidationError(null);

    const trimmed = name.trim();
    if (trimmed === department.name) {
      setIsRenaming(false);
      return;
    }

    // Always send the trimmed name - the schema doesn't trim, so " Sales "
    // would otherwise be stored with padding no duplicate check can match.
    updateMutation.mutate(
      { id: department.id, data: { name: trimmed } },
      { onSuccess: () => setIsRenaming(false) },
    );
  };

  // Deliberately matches on DepartmentInUseException's wording. The server's own
  // message is "Department with id = 2 is still in use", which would show the
  // user a database id, so it gets rewritten - but only when that really is the
  // failure, otherwise a 403 or a network error would read as an in-use error.
  const rawDeleteError = deleteMutation.error?.message;
  const isInUse = rawDeleteError?.includes("still in use") ?? false;

  let deleteErrorMessage = rawDeleteError;
  if (isInUse) {
    deleteErrorMessage =
      staffCount > 0
        ? `${department.name} still has ${staffCount} ${
            staffCount === 1 ? "employee" : "employees"
          }. Reassign them before deleting.`
        : `${department.name} still has employees assigned. Reassign them before deleting.`;
  }

  // Rendered in both branches rather than hoisted out of the conditional: grid
  // children have to stay in DOM order for the columns to line up.
  const staffCell = (
    <p className={classes.staff}>
      {isCountLoading ? <Skeleton width="3em" /> : staffCount}
    </p>
  );

  return (
    <article className={classes.departmentRow}>
      {isRenaming ? (
        <>
          <input
            className={
              `${classes.field} ${validationError ? classes["field--invalid"] : ""}`.trim()
            }
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-label={`Rename ${department.name}`}
            autoFocus
            onKeyDown={(event) => {
              if (event.key === "Enter") handleSave();
              if (event.key === "Escape") handleCancel();
            }}
          />
          {staffCell}
          <div className={classes.actions}>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Saving..." : "Save"}
            </Button>
            <Button variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
          {(validationError || updateMutation.isError) && (
            <p className={classes.rowError} role="alert">
              {validationError ?? updateMutation.error?.message}
            </p>
          )}
        </>
      ) : (
        <>
          <p className={classes.name}>{department.name}</p>
          {staffCell}
          <div className={classes.actions}>
            <Button variant="secondary" onClick={startRenaming}>
              Rename
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteMutation.mutate(department.id)}
              disabled={deleteMutation.isPending}
              title={
                staffCount > 0
                  ? "Departments with staff can't be deleted until they're reassigned"
                  : undefined
              }
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
          {deleteMutation.isError && (
            <p className={classes.rowError} role="alert">
              {deleteErrorMessage}
            </p>
          )}
        </>
      )}
    </article>
  );
}
