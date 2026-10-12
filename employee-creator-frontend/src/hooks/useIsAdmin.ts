import { useAuth } from "../context/useAuth";

// Mirrors what the backend actually enforces: @PreAuthorize("hasRole('ADMIN')")
// sits on department create/update/delete and employee create/update/delete,
// so anything the UI offers outside that set would 403 for an EMPLOYEE.
//
// No loading branch: every consumer renders inside RequireAuth, which returns
// null while loading and redirects when there is no user.
export function useIsAdmin(): boolean {
  const { user } = useAuth();
  return user?.role === "ADMIN";
}
