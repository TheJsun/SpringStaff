import { useEffect, useRef, useState } from "react";
import { EmployeeAvatar } from "../EmployeeAvatar/EmployeeAvatar";
import { Skeleton } from "../Skeleton/Skeleton";
import { useDeleteDepartment } from "../../hooks/useDepartments";
import type { DepartmentResponse } from "../../schemas/department-schema";
import classes from "./DepartmentRow.module.scss";
import menuClasses from "../MenuDropDown/MenuDropDown.module.scss";

interface DepartmentRowProps {
  department: DepartmentResponse;
  staffCount: number;
  isCountLoading: boolean;
  isAdmin: boolean;
  onEdit: (department: DepartmentResponse) => void;
}

export default function DepartmentRow({
  department,
  staffCount,
  isCountLoading,
  isAdmin,
  onEdit,
}: DepartmentRowProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const deleteMutation = useDeleteDepartment();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  return (
    <article className={classes.departmentRow}>
      <div className={classes.department}>
        <p className={classes.name}>{department.name}</p>
        {department.description && (
          <p className={classes.description}>{department.description}</p>
        )}
      </div>

      <div className={classes.lead}>
        {department.lead ? (
          <>
            <EmployeeAvatar size="xsm" employee={department.lead} />
            <div className={classes.leadText}>
              <p className={classes.leadName}>
                {department.lead.firstName} {department.lead.lastName}
              </p>
              <p className={classes.leadRole}>{department.lead.jobRole}</p>
            </div>
          </>
        ) : (
          <p className={classes.noLead}>No lead</p>
        )}
      </div>

      <p className={classes.people}>
        {isCountLoading ? (
          <Skeleton width="4em" />
        ) : (
          `${staffCount} ${staffCount === 1 ? "person" : "people"}`
        )}
      </p>

      {isAdmin && (
        <div
          className={`${classes.actions} ${menuClasses.menuContainer}`}
          ref={menuRef}
        >
          <button
            type="button"
            className={menuClasses.menuTrigger}
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label={`Actions for ${department.name}`}
            aria-expanded={isMenuOpen}
          >
            ⋮
          </button>
          {isMenuOpen && (
            <div className={menuClasses.menuDropdown}>
              <button
                type="button"
                className={menuClasses.menuItem}
                onClick={() => {
                  setIsMenuOpen(false);
                  onEdit(department);
                }}
              >
                Edit
              </button>
              <button
                type="button"
                className={menuClasses.menuItem}
                onClick={() => {
                  setIsMenuOpen(false);
                  deleteMutation.mutate(department.id);
                }}
                disabled={deleteMutation.isPending}
                title={
                  staffCount > 0
                    ? "Departments with staff can't be deleted until they're reassigned"
                    : undefined
                }
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          )}
        </div>
      )}

      {deleteMutation.isError && (
        <p className={classes.rowError} role="alert">
          {deleteErrorMessage}
        </p>
      )}
    </article>
  );
}
