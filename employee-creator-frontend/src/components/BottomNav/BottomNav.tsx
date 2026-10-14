import { NavLink } from "react-router-dom";
import { useIsAdmin } from "../../hooks/useIsAdmin";
import classes from "./BottomNav.module.scss";

export default function BottomNav() {
  const isAdmin = useIsAdmin();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? `${classes.link} ${classes.linkActive}` : classes.link;

  return (
    <nav className={classes.bottomNav} aria-label="Primary">
      <NavLink to="/" end className={linkClass}>
        Directory
      </NavLink>
      <NavLink to="/departments" className={linkClass}>
        Departments
      </NavLink>
      {isAdmin && (
        <NavLink to="/audit-logs" className={linkClass}>
          Audit log
        </NavLink>
      )}
    </nav>
  );
}
