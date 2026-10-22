import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import BottomNav from "./BottomNav";
import {
  renderWithProviders,
  makeAuth,
  adminUser,
  employeeUser,
} from "../../test/renderWithProviders";

describe("BottomNav", () => {
  it("renders the primary navigation links", () => {
    renderWithProviders(<BottomNav />, {
      auth: makeAuth({ user: employeeUser }),
    });
    expect(screen.getByRole("link", { name: "Directory" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Departments" }),
    ).toBeInTheDocument();
  });

  it("hides the audit log link from non-admins", () => {
    renderWithProviders(<BottomNav />, {
      auth: makeAuth({ user: employeeUser }),
    });
    expect(
      screen.queryByRole("link", { name: "Audit log" }),
    ).not.toBeInTheDocument();
  });

  it("shows the audit log link to admins", () => {
    renderWithProviders(<BottomNav />, {
      auth: makeAuth({ user: adminUser }),
    });
    expect(
      screen.getByRole("link", { name: "Audit log" }),
    ).toBeInTheDocument();
  });
});
