import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DepartmentRow from "./DepartmentRow";
import { renderWithProviders } from "../../test/renderWithProviders";
import { mockDepartment } from "../../test/fixtures";

describe("DepartmentRow", () => {
  it("renders the department name and staff count", () => {
    renderWithProviders(
      <DepartmentRow
        department={mockDepartment}
        staffCount={3}
        isCountLoading={false}
        isAdmin={false}
        onEdit={vi.fn()}
      />,
    );
    expect(screen.getByText("Engineering")).toBeInTheDocument();
    expect(screen.getByText("3 people")).toBeInTheDocument();
  });

  it("shows the actions trigger for admins and fires onEdit", async () => {
    const onEdit = vi.fn();
    renderWithProviders(
      <DepartmentRow
        department={mockDepartment}
        staffCount={0}
        isCountLoading={false}
        isAdmin
        onEdit={onEdit}
      />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Actions for Engineering" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Edit" }));

    expect(onEdit).toHaveBeenCalledWith(mockDepartment);
  });
});
