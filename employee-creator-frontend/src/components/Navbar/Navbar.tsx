import { useEffect, type KeyboardEvent } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useCurrentEmployee } from "../../hooks/useCurrentEmployee";
import { useDropdownPanel } from "../../hooks/useDropdownPanel";
import { useIsAdmin } from "../../hooks/useIsAdmin";
import { EmployeeAvatar } from "../EmployeeAvatar/EmployeeAvatar";
import { Skeleton } from "../Skeleton/Skeleton";
import Logo from "../Logo/Logo";
import classes from "./Navbar.module.scss";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { data: employee, isLoading } = useCurrentEmployee();
  const isAdmin = useIsAdmin();
  const navigate = useNavigate();
  const { isOpen, setIsOpen, containerRef, triggerRef, panelRef, panelStyle } =
    useDropdownPanel({ align: "right" });

  useEffect(() => {
    if (!isOpen) return;
    const frame = requestAnimationFrame(() => {
      const first = panelRef.current?.querySelector<HTMLElement>(
        '[role="menuitem"]'
      );
      first?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [isOpen, panelRef]);

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

  const handlePanelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
      return;
    }

    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;

    event.preventDefault();
    const items = Array.from(
      panelRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []
    );
    if (items.length === 0) return;

    const currentIndex = items.indexOf(document.activeElement as HTMLElement);
    const delta = event.key === "ArrowDown" ? 1 : -1;
    const nextIndex =
      (currentIndex + delta + items.length) % items.length;
    items[nextIndex]?.focus();
  };

  return (
    <nav className={classes.navContainer}>
      <div className={classes.left}>
        <Link to="/" className={classes.brand}>
          <Logo tone="light" />
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
                onKeyDown={handlePanelKeyDown}
              >
                <div className={classes.panelHeader}>
                  <div className={classes.panelName}>{displayName}</div>
                  <div className={classes.panelEmail}>{user.email}</div>
                </div>
                {user.employeeId != null && (
                  <button
                    type="button"
                    role="menuitem"
                    className={classes.menuItem}
                    onClick={handleProfile}
                  >
                    <svg
                      aria-hidden="true"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span>My profile</span>
                  </button>
                )}
                <button
                  type="button"
                  role="menuitem"
                  className={`${classes.menuItem} ${classes.logout}`}
                  onClick={handleLogout}
                >
                  <svg
                    aria-hidden="true"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
