import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import EmployeeCard from "./EmployeeCard";
import {
  renderWithProviders,
  makeAuth,
  adminUser,
  employeeUser,
} from "../../test/renderWithProviders";
import { mockEmployee } from "../../test/fixtures";

function renderCard(user = employeeUser) {
  return renderWithProviders(
    <EmployeeCard employee={mockEmployee} onDelete={vi.fn()} onEdit={vi.fn()} />,
    { auth: makeAuth({ user }) },
  );
}

describe("EmployeeCard", () => {
  it("renders the employee's full name and role", () => {
    renderCard();
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("Engineer")).toBeInTheDocument();
  });

  it("hides the actions menu for non-admins", () => {
    renderCard(employeeUser);
    expect(
      screen.queryByRole("button", { name: "Employee actions" }),
    ).not.toBeInTheDocument();
  });

  it("shows the actions menu for admins", () => {
    renderCard(adminUser);
    expect(
      screen.getByRole("button", { name: "Employee actions" }),
    ).toBeInTheDocument();
  });
});
