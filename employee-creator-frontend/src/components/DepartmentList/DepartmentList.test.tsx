import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import DepartmentList from "./DepartmentList";
import { renderWithProviders } from "../../test/renderWithProviders";
import { mockDepartment } from "../../test/fixtures";

const baseProps = {
  staffCounts: new Map<number, number>([[mockDepartment.id, 2]]),
  isCountsLoading: false,
  isError: false,
  error: null,
  isAdmin: false,
  onEdit: vi.fn(),
};

describe("DepartmentList", () => {
  it("renders a row per department", () => {
    renderWithProviders(
      <DepartmentList
        {...baseProps}
        departments={[mockDepartment]}
        allDepartments={[mockDepartment]}
        isLoading={false}
      />,
    );
    expect(screen.getByText("Engineering")).toBeInTheDocument();
  });

  it("shows an empty message when there are no departments", () => {
    renderWithProviders(
      <DepartmentList
        {...baseProps}
        departments={[]}
        allDepartments={[]}
        isLoading={false}
      />,
    );
    expect(screen.getByText("No departments yet.")).toBeInTheDocument();
  });
});
