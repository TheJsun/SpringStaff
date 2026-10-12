import type { EmployeeResponse } from "../../schemas/employee-schema";
import classes from "./EmployeeCard.module.scss";
import { EmployeeAvatar } from "../EmployeeAvatar/EmployeeAvatar";
import { MenuDropdown } from "../MenuDropDown/MenuDropDown";
import { useNavigate } from "react-router-dom";
import { useIsAdmin } from "../../hooks/useIsAdmin";
import {
  formatContractType,
  formatEmploymentType,
  formatStartDate,
  getFullName,
} from "../../services/employee-profile";

interface EmployeeCardProps {
  employee: EmployeeResponse;
  onDelete: (id: number) => void;
  onEdit: (employee: EmployeeResponse) => void;
}

export default function EmployeeCard({
  employee,
  onDelete,
  onEdit,
}: EmployeeCardProps) {
  const navigate = useNavigate();
  const isAdmin = useIsAdmin();

  return (
    <article
      className={classes.employeeCard}
      onClick={() => navigate(`/employees/${employee.id}`)}
    >
      <div className={classes.employeeIdentity}>
        <EmployeeAvatar size="sm" employee={employee} />
        <div className={classes.employeeIdentity__text}>
          <p className={classes.employeeIdentity__name}>
            {getFullName(employee)}
          </p>
          <p className={classes.employeeIdentity__role}>{employee.jobRole}</p>
        </div>
      </div>

      <p className={classes.department}>{employee.department?.name ?? "—"}</p>
      <p className={classes.type}>
        {formatEmploymentType(employee.employmentType)}
      </p>
      <p className={classes.contract}>
        {formatContractType(employee.contractType)}
      </p>
      <p className={classes.started}>{formatStartDate(employee.startDate)}</p>
      {/* The trailing grid track stays either way, so a non-admin row keeps the
          same column alignment as the list header's placeholder cell. */}
      {isAdmin && (
        <MenuDropdown employee={employee} onDelete={onDelete} onEdit={onEdit} />
      )}
    </article>
  );
}
