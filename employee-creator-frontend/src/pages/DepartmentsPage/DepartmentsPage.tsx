import { useState } from "react";
import Button from "../../components/Button/Button";
import HomeHeader from "../../components/Header/HomeHeader";
import DepartmentList from "../../components/DepartmentList/DepartmentList";
import DepartmentForm from "../../components/DepartmentForm/DepartmentForm";
import Modal from "../../components/Modal/Modal";
import Pagination from "../../components/Pagination/Pagination";
import { useDepartments } from "../../hooks/useDepartments";
import { useEmployees } from "../../hooks/useEmployees";
import { useIsAdmin } from "../../hooks/useIsAdmin";
import { countStaffByDepartment } from "../../services/department-services";
import type { DepartmentResponse } from "../../schemas/department-schema";
import classes from "./DepartmentsPage.module.scss";

const PAGE_SIZE = 10;

type ModalState =
  | { mode: "create" }
  | { mode: "edit"; department: DepartmentResponse }
  | null;

const DepartmentsPage = () => {
  const {
    data: departments = [],
    isLoading,
    isError,
    error,
  } = useDepartments();

  const { data: employees = [], isLoading: isCountsLoading } = useEmployees();

  const isAdmin = useIsAdmin();
  const [modal, setModal] = useState<ModalState>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const staffCounts = countStaffByDepartment(employees);

  const totalPages = Math.max(1, Math.ceil(departments.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const pageOfDepartments = departments.slice(
    startIndex,
    startIndex + PAGE_SIZE,
  );

  const handleSaved = () => {
    if (modal?.mode === "create") {
      setCurrentPage(Math.ceil((departments.length + 1) / PAGE_SIZE));
    }
    setModal(null);
  };

  return (
    <main className={classes.departmentsPage}>
      <HomeHeader
        title="Departments"
        count={departments.length}
        countLabel={departments.length === 1 ? "department" : "departments"}
        isLoading={isLoading}
        action={
          isAdmin ? (
            <Button
              variant="accent"
              onClick={() => setModal({ mode: "create" })}
            >
              New department
            </Button>
          ) : undefined
        }
      />
      <section className={classes.content}>
        <div className={classes.contentInner}>
          <DepartmentList
            departments={pageOfDepartments}
            allDepartments={departments}
            staffCounts={staffCounts}
            isCountsLoading={isCountsLoading}
            isLoading={isLoading}
            isError={isError}
            error={error}
            isAdmin={isAdmin}
            onEdit={(department) => setModal({ mode: "edit", department })}
          />
        </div>
      </section>
      {departments.length > PAGE_SIZE && (
        <Pagination
          currentPage={safePage}
          totalItems={departments.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      )}

      {modal && (
        <Modal
          title={modal.mode === "create" ? "New department" : "Edit department"}
          onClose={() => setModal(null)}
        >
          <DepartmentForm
            mode={modal.mode}
            department={modal.mode === "edit" ? modal.department : undefined}
            departments={departments}
            employees={employees}
            onSaved={handleSaved}
            onClose={() => setModal(null)}
          />
        </Modal>
      )}
    </main>
  );
};

export default DepartmentsPage;
