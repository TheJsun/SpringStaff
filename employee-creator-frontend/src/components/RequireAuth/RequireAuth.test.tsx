import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { RequireAuth } from "./RequireAuth";
import {
  renderWithProviders,
  makeAuth,
  employeeUser,
} from "../../test/renderWithProviders";

vi.mock("../../hooks/useCurrentEmployee", () => ({
  useCurrentEmployee: () => ({ data: undefined, isLoading: false }),
}));

function renderGuard(auth = makeAuth()) {
  return renderWithProviders(
    <Routes>
      <Route element={<RequireAuth />}>
        <Route path="/" element={<p>Protected content</p>} />
      </Route>
      <Route path="/login" element={<p>Login page</p>} />
    </Routes>,
    { auth },
  );
}

describe("RequireAuth", () => {
  it("renders the protected outlet when a user is signed in", () => {
    renderGuard(makeAuth({ user: employeeUser }));
    expect(screen.getByText("Protected content")).toBeInTheDocument();
  });

  it("redirects to /login when there is no user", () => {
    renderGuard(makeAuth({ user: null }));
    expect(screen.getByText("Login page")).toBeInTheDocument();
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("renders nothing while auth is still loading", () => {
    renderGuard(makeAuth({ user: null, loading: true }));
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
    expect(screen.queryByText("Login page")).not.toBeInTheDocument();
  });
});
