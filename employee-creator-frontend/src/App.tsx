import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage";
import CreateEmployeePage from "./pages/CreateEmployeePage/CreateEmployeePage";
import DepartmentsPage from "./pages/DepartmentsPage/DepartmentsPage";
import AuditLogPage from "./pages/AuditLogPage/AuditLogPage";
import { EmployeeDetailsPage } from "./pages/EmployeeDetailsPage/EmployeeDetailsPage";
import { LoginPage } from "./pages/LoginPage/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage/NotFoundPage";
import { RequireAuth } from "./components/RequireAuth/RequireAuth";
import { RequireAdmin } from "./components/RequireAdmin/RequireAdmin";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<RequireAuth />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/employees/:id" element={<EmployeeDetailsPage />} />
            <Route path="/departments" element={<DepartmentsPage />} />

            <Route element={<RequireAdmin />}>
              <Route path="/employees/new" element={<CreateEmployeePage />} />
              <Route
                path="/employees/edit/:id"
                element={<CreateEmployeePage />}
              />
              <Route path="/audit-logs" element={<AuditLogPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
