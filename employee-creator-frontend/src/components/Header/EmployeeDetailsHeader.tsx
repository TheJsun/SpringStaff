import { Link } from "react-router-dom";
import Button from "../Button/Button";
import { EmployeeAvatar } from "../EmployeeAvatar/EmployeeAvatar";
import { MenuDropdown } from "../MenuDropDown/MenuDropDown";
import { Skeleton } from "../Skeleton/Skeleton";
import classes from "./EmployeeDetailsHeader.module.scss";
import btnClasses from "../Button/Button.module.scss";
import type { EmployeeResponse } from "../../schemas/employee-schema";
import { useIsAdmin } from "../../hooks/useIsAdmin";
import {
  formatContractType,
  formatEmploymentType,
  getFullName,
} from "../../services/employee-profile";

interface EmployeeDetailsHeaderProps {
  employee?: EmployeeResponse;
  onEdit: (employee: EmployeeResponse) => void;
  onDelete: (id: number) => void;
  isLoading: boolean;
}

export default function EmployeeDetailsHeader({
  employee,
  onEdit,
  onDelete,
  isLoading,
}: EmployeeDetailsHeaderProps) {
  const isAdmin = useIsAdmin();
  const fullName = employee ? getFullName(employee) : "";
  const subtitle = employee
    ? [
        employee.jobRole,
        employee.department?.name,
        `${formatEmploymentType(employee.employmentType)}, ${formatContractType(employee.contractType)}`,
      ]
        .filter(Boolean)
        .join(" · ")
    : "";

  return (
    <header className={classes.header}>
      <div className={classes.headerContent}>
        <nav aria-label="Breadcrumb" className={classes.breadcrumb}>
          <Link to="/">Directory</Link> /{" "}
          <span>{isLoading ? <Skeleton width="8em" /> : fullName}</span>
        </nav>
        <div className={classes.row}>
          <div className={classes.identity}>
            {isLoading || !employee ? (
              <Skeleton circle width="4em" height="4em" />
            ) : (
              <EmployeeAvatar size="md" employee={employee} />
            )}
            <div className={classes.identity__text}>
              <h1 className={classes.name}>
                {isLoading ? <Skeleton width="12em" /> : fullName}
              </h1>
              {isLoading ? (
                <Skeleton width="16em" />
              ) : (
                subtitle && <p className={classes.subtitle}>{subtitle}</p>
              )}
            </div>
          </div>
          <div className={classes.actions}>
            {isAdmin && (
              <Button
                variant="onDark"
                className={classes.actionButton}
                disabled={isLoading || !employee}
                onClick={() => employee && onEdit(employee)}
              >
                Edit profile
              </Button>
            )}
            <a
              href={employee ? `mailto:${employee.email}` : undefined}
              aria-disabled={isLoading || !employee}
              className={`${btnClasses.btn} ${classes.emailBtn} ${classes.actionButton}`}
            >
              Email
            </a>
            {isAdmin && (
              <MenuDropdown
                employee={employee}
                onDelete={onDelete}
                variant="dark"
                disabled={isLoading || !employee}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
