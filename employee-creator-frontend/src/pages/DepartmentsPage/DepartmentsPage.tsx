import { useState } from "react";
import Button from "../../components/Button/Button";
import HomeHeader from "../../components/Header/HomeHeader";
import DepartmentList from "../../components/DepartmentList/DepartmentList";
import DepartmentCreateForm from "../../components/DepartmentCreateForm/DepartmentCreateForm";
import Pagination from "../../components/Pagination/Pagination";
import { useDepartments } from "../../hooks/useDepartments";
import { useEmployees } from "../../hooks/useEmployees";
import { countStaffByDepartment } from "../../services/department-services";
import classes from "./DepartmentsPage.module.scss";

// Fixed rather than measured with useFitRows: that hook reads
// --employee-row-height, and its viewport lock would clip a row that has grown
// into rename mode.
const PAGE_SIZE = 10;

const DepartmentsPage = () => {
  const {
    data: departments = [],
    isLoading,
    isError,
    error,
  } = useDepartments();

  // Staff counts come from the employee list rather than the API. The rows are
  // not blocked on it - the count cell shows a skeleton until it resolves.
  const { data: employees = [], isLoading: isCountsLoading } = useEmployees();

  const [isCreating, setIsCreating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const staffCounts = countStaffByDepartment(employees);

  const totalPages = Math.max(1, Math.ceil(departments.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const pageOfDepartments = departments.slice(
    startIndex,
    startIndex + PAGE_SIZE,
  );

  // New departments get the highest id and the API returns id order, so a new
  // one lands on the last page. Without this, creating from page 1 of several
  // would look like nothing happened. +1 covers the row the refetch hasn't
  // delivered yet.
  const handleCreated = () => {
    setIsCreating(false);
    setCurrentPage(Math.ceil((departments.length + 1) / PAGE_SIZE));
  };

  return (
    <main className={classes.departmentsPage}>
      <HomeHeader
        title="Departments"
        count={departments.length}
        countLabel={departments.length === 1 ? "department" : "departments"}
        isLoading={isLoading}
        action={
          !isCreating && (
            <Button variant="accent" onClick={() => setIsCreating(true)}>
              + New
            </Button>
          )
        }
      />
      <section className={classes.content}>
        <div className={classes.contentInner}>
          {isCreating && (
            <DepartmentCreateForm
              departments={departments}
              onCreated={handleCreated}
              onCancel={() => setIsCreating(false)}
            />
          )}
          <DepartmentList
            departments={pageOfDepartments}
            allDepartments={departments}
            staffCounts={staffCounts}
            isCountsLoading={isCountsLoading}
            isLoading={isLoading}
            isError={isError}
            error={error}
          />
        </div>
      </section>
      {/* Pagination renders "Page 1 of 1" rather than hiding itself, so it is
          only mounted once there are enough departments to page through. */}
      {departments.length > PAGE_SIZE && (
        <Pagination
          currentPage={safePage}
          totalItems={departments.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      )}
    </main>
  );
};

export default DepartmentsPage;
