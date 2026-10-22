import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateEmployeeHeader from "./CreateEmployeeHeader";
import { renderWithProviders } from "../../test/renderWithProviders";

describe("CreateEmployeeHeader", () => {
  it("renders the title", () => {
    renderWithProviders(<CreateEmployeeHeader title="New employee" />);
    expect(
      screen.getByRole("heading", { name: "New employee" }),
    ).toBeInTheDocument();
  });

  it("calls the provided onBack handler", async () => {
    const onBack = vi.fn();
    renderWithProviders(
      <CreateEmployeeHeader title="New employee" onBack={onBack} />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Back" }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
