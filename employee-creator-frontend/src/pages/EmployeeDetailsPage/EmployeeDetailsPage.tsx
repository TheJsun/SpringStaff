import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEmployee } from "../../hooks/useEmployees";
import { useAuth } from "../../context/useAuth";
import { useIsAdmin } from "../../hooks/useIsAdmin";
import EmployeeDetailsHeader from "../../components/Header/EmployeeDetailsHeader";
import classes from "./EmployeeDetailsPage.module.scss";
import { useEmployeeActions } from "../../hooks/useEmployeeActions";
import { DetailsSection } from "../../components/DetailsSection/DetailsSection";
import { Tabs } from "../../components/Tabs/Tabs";
import { DocumentsPanel } from "../../components/DocumentsPanel/DocumentsPanel";
import {
  formatContractType,
  formatEmploymentType,
  formatStartDate,
} from "../../services/employee-profile";

export function EmployeeDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const employeeId = id ? Number(id) : undefined;
  const { data: employee, isLoading, isError } = useEmployee(employeeId!);
  const { handleDelete, handleEdit, isDeleting, isDeleteError } =
    useEmployeeActions();

  const { user } = useAuth();
  const isAdmin = useIsAdmin();
  const canSeeDocuments =
    employeeId !== undefined &&
    (isAdmin || user?.employeeId === employeeId);

  const [activeTab, setActiveTab] = useState("details");

  const handleDeleteAndRedirect = (employeeId: number) => {
    handleDelete(employeeId, () => navigate("/"));
  };

  const contactPlaceholderFields = [
    { label: "Work email", value: "" },
    { label: "Mobile", value: "" },
    { label: "Address", value: "" },
  ];

  const employmentPlaceholderFields = [
    { label: "Job Title", value: "" },
    { label: "Department", value: "" },
    { label: "Employment", value: "" },
    { label: "Contract", value: "" },
    { label: "Term", value: "" },
    { label: "Hours per week", value: "" },
  ];

  const tabs = [
    { id: "details", label: "Details" },
    { id: "documents", label: "Documents", disabled: !canSeeDocuments },
  ];

  const renderDetails = () => {
    if (!employee) {
      return (
        <>
          <DetailsSection
            title="Contact"
            fields={contactPlaceholderFields}
            isLoading
          />
          <DetailsSection
            title="Employment"
            fields={employmentPlaceholderFields}
            isLoading
          />
        </>
      );
    }

    const contactFields = [
      { label: "Work email", value: employee.email },
      { label: "Mobile", value: employee.phoneNumber },
      { label: "Address", value: employee.address },
    ];

    const term = employee.onGoing
      ? `${formatStartDate(employee.startDate)} - Ongoing`
      : employee.finishDate
        ? `${formatStartDate(employee.startDate)} - ${formatStartDate(employee.finishDate)}`
        : formatStartDate(employee.startDate);

    const employmentFields = [
      {
        label: "Job Title",
        value: employee.jobRole === "" ? "Unspecified" : employee.jobRole,
      },
      {
        label: "Department",
        value: employee.department.name,
      },
      {
        label: "Employment",
        value: `${formatEmploymentType(employee.employmentType)}`,
      },
      { label: "Contract", value: formatContractType(employee.contractType) },
      { label: "Term", value: term },
      {
        label: "Hours per week",
        value: `${employee.hoursPerWeek} hours per week`,
      },
    ];

    return (
      <>
        <DetailsSection title="Contact" fields={contactFields} />
        <DetailsSection title="Employment" fields={employmentFields} />
      </>
    );
  };

  const renderBody = () => {
    if (isError) {
      return <p className={classes.loadingMessage}>Could not load employee.</p>;
    }

    const showDocuments = activeTab === "documents" && canSeeDocuments;

    return (
      <>
        <section className={classes.pageContainer}>
          <section className={classes.detailsContainer}>
            <Tabs
              tabs={tabs}
              activeTabId={activeTab}
              onTabChange={setActiveTab}
            />
            {showDocuments ? (
              <DocumentsPanel employeeId={employeeId!} />
            ) : (
              renderDetails()
            )}
          </section>
        </section>

        {isDeleting && <p>Deleting employee...</p>}
        {isDeleteError && (
          <p className={classes.errorMessage}>
            Failed to delete employee. Please try again.
          </p>
        )}
      </>
    );
  };

  return (
    <main>
      <EmployeeDetailsHeader
        employee={employee}
        onEdit={handleEdit}
        isLoading={isLoading}
        onDelete={handleDeleteAndRedirect}
      />
      {renderBody()}
    </main>
  );
}
