import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import Navbar from "./Navbar";
import {
  renderWithProviders,
  makeAuth,
  adminUser,
  employeeUser,
} from "../../test/renderWithProviders";

// The navbar looks up the signed-in user's employee record; stub it so the
// component renders without a network request.
vi.mock("../../hooks/useCurrentEmployee", () => ({
  useCurrentEmployee: () => ({ data: undefined, isLoading: false }),
}));

describe("Navbar", () => {
  it("renders nothing when there is no user", () => {
    const { container } = renderWithProviders(<Navbar />, {
      auth: makeAuth({ user: null }),
    });
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the nav links and falls back to the email as a display name", () => {
    renderWithProviders(<Navbar />, { auth: makeAuth({ user: employeeUser }) });
    expect(screen.getByRole("link", { name: "Directory" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Departments" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: `Profile menu for ${employeeUser.email}`,
      }),
    ).toBeInTheDocument();
  });

  it("shows the audit log link to admins", () => {
    renderWithProviders(<Navbar />, { auth: makeAuth({ user: adminUser }) });
    expect(
      screen.getByRole("link", { name: "Audit log" }),
    ).toBeInTheDocument();
  });
});
