import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import EmployeeList from "./EmployeeList";
import {
  renderWithProviders,
  makeAuth,
  employeeUser,
} from "../../test/renderWithProviders";
import { mockEmployee } from "../../test/fixtures";

const baseProps = {
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  isError: false,
  error: null,
};

describe("EmployeeList", () => {
  it("renders a card per employee", () => {
    renderWithProviders(
      <EmployeeList {...baseProps} employees={[mockEmployee]} isLoading={false} />,
      { auth: makeAuth({ user: employeeUser }) },
    );
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
  });

  it("shows an empty message when there are no employees", () => {
    renderWithProviders(
      <EmployeeList {...baseProps} employees={[]} isLoading={false} />,
      { auth: makeAuth({ user: employeeUser }) },
    );
    expect(
      screen.getByText("No employees registered, add one above."),
    ).toBeInTheDocument();
  });

  it("shows a loading message", () => {
    renderWithProviders(
      <EmployeeList {...baseProps} employees={[]} isLoading />,
      { auth: makeAuth({ user: employeeUser }) },
    );
    expect(screen.getByText("Loading employees...")).toBeInTheDocument();
  });
});
