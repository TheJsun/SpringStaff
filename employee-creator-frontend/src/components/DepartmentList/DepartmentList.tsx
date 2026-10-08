import type { DepartmentResponse } from "../../schemas/department-schema";
import DepartmentRow from "../DepartmentRow/DepartmentRow";
import classes from "./DepartmentList.module.scss";

interface DepartmentListProps {
  departments: DepartmentResponse[];
  allDepartments: DepartmentResponse[];
  staffCounts: Map<number, number>;
  isCountsLoading: boolean;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isAdmin: boolean;
  onEdit: (department: DepartmentResponse) => void;
}

export default function DepartmentList({
  departments,
  allDepartments,
  staffCounts,
  isCountsLoading,
  isLoading,
  isError,
  error,
  isAdmin,
  onEdit,
}: DepartmentListProps) {
  return (
    <section className={classes.departmentListContainer}>
      <header className={classes.departmentListHeader}>
        <p>Department</p>
        <p className={classes.lead}>Lead</p>
        <p className={classes.people}>People</p>
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
          <h4 className={classes.emptyListMessage}>No departments yet.</h4>
        )}

        {!isLoading &&
          !isError &&
          departments.map((dept) => (
            <DepartmentRow
              key={dept.id}
              department={dept}
              staffCount={staffCounts.get(dept.id) ?? 0}
              isCountLoading={isCountsLoading}
              isAdmin={isAdmin}
              onEdit={onEdit}
            />
          ))}
      </div>
    </section>
  );
}
