import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useCurrentEmployee } from "../../hooks/useCurrentEmployee";
import { useDropdownPanel } from "../../hooks/useDropdownPanel";
import { useIsAdmin } from "../../hooks/useIsAdmin";
import { EmployeeAvatar } from "../EmployeeAvatar/EmployeeAvatar";
import { Skeleton } from "../Skeleton/Skeleton";
import classes from "./Navbar.module.scss";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { data: employee, isLoading } = useCurrentEmployee();
  const isAdmin = useIsAdmin();
  const navigate = useNavigate();
  const { isOpen, setIsOpen, containerRef, triggerRef, panelRef, panelStyle } =
    useDropdownPanel({ align: "right" });

  if (!user) {
    return null;
  }

  const displayName = employee
    ? `${employee.firstName} ${employee.lastName}`
    : user.email;

  const avatarSource = employee ?? {
    firstName: user.email,
    lastName: "",
    email: user.email,
  };

  const handleProfile = () => {
    setIsOpen(false);
    navigate(`/employees/${user.employeeId}`);
  };

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <nav className={classes.navContainer}>
      <div className={classes.left}>
        <Link to="/" className={classes.brand}>
          SpringStaff
        </Link>
        <div className={classes.navLinks}>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? `${classes.navLink} ${classes.navLinkActive}` : classes.navLink
            }
          >
            Directory
          </NavLink>
          <NavLink
            to="/departments"
            className={({ isActive }) =>
              isActive ? `${classes.navLink} ${classes.navLinkActive}` : classes.navLink
            }
          >
            Departments
          </NavLink>
          {isAdmin && (
            <NavLink
              to="/audit-logs"
              className={({ isActive }) =>
                isActive ? `${classes.navLink} ${classes.navLinkActive}` : classes.navLink
              }
            >
              Audit log
            </NavLink>
          )}
        </div>
      </div>
      <div className={classes.user}>
        {isLoading ? (
          <Skeleton width="8em" height="1em" variant="light" />
        ) : (
          <div className={classes.menuContainer} ref={containerRef}>
            <button
              type="button"
              ref={triggerRef}
              className={classes.trigger}
              onClick={() => setIsOpen(!isOpen)}
              aria-haspopup="menu"
              aria-expanded={isOpen}
              aria-label={`Profile menu for ${displayName}`}
            >
              <EmployeeAvatar size="xsm" employee={avatarSource} />
              <span className={classes.name}>{displayName}</span>
              <svg
                className={
                  isOpen
                    ? `${classes.chevron} ${classes.chevronOpen}`
                    : classes.chevron
                }
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {isOpen && (
              <div
                className={classes.panel}
                ref={panelRef}
                style={panelStyle}
                role="menu"
                aria-label="Profile menu"
              >
                {user.employeeId != null && (
                  <button
                    type="button"
                    role="menuitem"
                    className={classes.menuItem}
                    onClick={handleProfile}
                  >
                    Profile
                  </button>
                )}
                <button
                  type="button"
                  role="menuitem"
                  className={`${classes.menuItem} ${classes.logout}`}
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
