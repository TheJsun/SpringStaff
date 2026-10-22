import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MenuDropdown } from "./MenuDropDown";
import { mockEmployee } from "../../test/fixtures";

describe("MenuDropdown", () => {
  it("disables the trigger when there is no employee", () => {
    render(<MenuDropdown onDelete={vi.fn()} />);
    expect(
      screen.getByRole("button", { name: "Employee actions" }),
    ).toBeDisabled();
  });

  it("opens the menu and fires onEdit / onDelete", async () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(
      <MenuDropdown
        employee={mockEmployee}
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Employee actions" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(onEdit).toHaveBeenCalledWith(mockEmployee);

    await userEvent.click(
      screen.getByRole("button", { name: "Employee actions" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(onDelete).toHaveBeenCalledWith(mockEmployee.id);
  });
});
