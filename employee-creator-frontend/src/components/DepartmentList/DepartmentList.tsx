import type { DepartmentResponse } from "../../schemas/department-schema";
import DepartmentRow from "../DepartmentRow/DepartmentRow";
import classes from "./DepartmentList.module.scss";

interface DepartmentListProps {
  // The current page, rendered as rows.
  departments: DepartmentResponse[];
  // Every department. Kept separate from the page slice because the rows'
  // duplicate-name guard has to see names that aren't on screen, and because
  // the empty state is about the whole list, not the current page.
  allDepartments: DepartmentResponse[];
  staffCounts: Map<number, number>;
  isCountsLoading: boolean;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export default function DepartmentList({
  departments,
  allDepartments,
  staffCounts,
  isCountsLoading,
  isLoading,
  isError,
  error,
}: DepartmentListProps) {
  return (
    <section className={classes.departmentListContainer}>
      <header className={classes.departmentListHeader}>
        <p>Department</p>
        <p className={classes.staff}>Staff</p>
        <p></p>
      </header>
      <div className={classes.departmentList}>
        {isLoading && (
          <p className={classes.loadingMessage}>Loading departments...</p>
        )}

        {isError && (
          <div>
            <p className={classes.errorMessage}>Failed to fetch departments.</p>
            <p className={classes.errorMessage}>{error?.message}</p>
          </div>
        )}

        {!isLoading && !isError && allDepartments.length === 0 && (
          <h4 className={classes.emptyListMessage}>
            No departments yet, add one above.
          </h4>
        )}

        {!isLoading &&
          !isError &&
          departments.map((dept) => (
            <DepartmentRow
              key={dept.id}
              department={dept}
              staffCount={staffCounts.get(dept.id) ?? 0}
              isCountLoading={isCountsLoading}
              allDepartments={allDepartments}
            />
          ))}
      </div>
    </section>
  );
}
