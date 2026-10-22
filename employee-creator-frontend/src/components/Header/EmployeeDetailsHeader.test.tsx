import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import EmployeeDetailsHeader from "./EmployeeDetailsHeader";
import {
  renderWithProviders,
  makeAuth,
  adminUser,
  employeeUser,
} from "../../test/renderWithProviders";
import { mockEmployee } from "../../test/fixtures";

function renderHeader(user = employeeUser) {
  return renderWithProviders(
    <EmployeeDetailsHeader
      employee={mockEmployee}
      onEdit={vi.fn()}
      onDelete={vi.fn()}
      isLoading={false}
    />,
    { auth: makeAuth({ user }) },
  );
}

describe("EmployeeDetailsHeader", () => {
  it("renders the employee name and subtitle", () => {
    renderHeader();
    expect(
      screen.getByRole("heading", { name: "Ada Lovelace" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Engineer/)).toBeInTheDocument();
  });

  it("shows admin-only actions for admins", () => {
    renderHeader(adminUser);
    expect(
      screen.getByRole("button", { name: "Edit profile" }),
    ).toBeInTheDocument();
  });

  it("hides admin-only actions from non-admins", () => {
    renderHeader(employeeUser);
    expect(
      screen.queryByRole("button", { name: "Edit profile" }),
    ).not.toBeInTheDocument();
  });
});
