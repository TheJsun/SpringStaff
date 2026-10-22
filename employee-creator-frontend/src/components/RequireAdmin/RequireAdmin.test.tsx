import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { RequireAdmin } from "./RequireAdmin";
import {
  renderWithProviders,
  makeAuth,
  adminUser,
  employeeUser,
} from "../../test/renderWithProviders";

function renderGuard(auth = makeAuth()) {
  return renderWithProviders(
    <Routes>
      <Route element={<RequireAdmin />}>
        <Route path="/audit-logs" element={<p>Admin content</p>} />
      </Route>
      <Route path="/" element={<p>Home page</p>} />
    </Routes>,
    { auth, route: "/audit-logs" },
  );
}

describe("RequireAdmin", () => {
  it("renders the outlet for an admin", () => {
    renderGuard(makeAuth({ user: adminUser }));
    expect(screen.getByText("Admin content")).toBeInTheDocument();
  });

  it("redirects a non-admin to home", () => {
    renderGuard(makeAuth({ user: employeeUser }));
    expect(screen.getByText("Home page")).toBeInTheDocument();
    expect(screen.queryByText("Admin content")).not.toBeInTheDocument();
  });
});
