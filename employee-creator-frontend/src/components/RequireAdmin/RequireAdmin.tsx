import { Navigate, Outlet } from "react-router-dom";
import { useIsAdmin } from "../../hooks/useIsAdmin";

export function RequireAdmin() {
  const isAdmin = useIsAdmin();

  // Nothing in the non-admin UI links to these routes, so arriving here means a
  // hand-typed URL or a stale bookmark. replace keeps the back button from
  // bouncing straight back into the redirect.
  if (!isAdmin) return <Navigate to="/" replace />;

  // Deliberately no wrapper element: RequireAuth's .container is a 100vh flex
  // column and the page <main> below has to stay a *direct* flex child of it
  // (it relies on flex: 1 / min-height: 0). A div here would collapse it.
  return <Outlet />;
}
