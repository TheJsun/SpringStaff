import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DepartmentForm from "./DepartmentForm";
import { renderWithProviders } from "../../test/renderWithProviders";
import { mockEmployee } from "../../test/fixtures";

describe("DepartmentForm", () => {
  it("renders the name, lead and description fields", () => {
    renderWithProviders(
      <DepartmentForm
        mode="create"
        departments={[]}
        employees={[mockEmployee]}
        onSaved={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Lead")).toBeInTheDocument();
    // The employee shows up as a selectable lead option.
    expect(
      screen.getByRole("option", { name: "Ada Lovelace" }),
    ).toBeInTheDocument();
  });

  it("calls onClose when Cancel is clicked", async () => {
    const onClose = vi.fn();
    renderWithProviders(
      <DepartmentForm
        mode="create"
        departments={[]}
        employees={[]}
        onSaved={vi.fn()}
        onClose={onClose}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
