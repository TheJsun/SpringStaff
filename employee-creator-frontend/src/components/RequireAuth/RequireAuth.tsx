import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import BottomNav from "../BottomNav/BottomNav";
import Navbar from "../Navbar/Navbar";
import classes from "./RequireAuth.module.scss";

export function RequireAuth() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className={classes.container}>
      <Navbar />
      <Outlet />
      <BottomNav />
    </div>
  );
}
