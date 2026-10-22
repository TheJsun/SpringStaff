import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StepNavigation from "./StepNavigation";
import { renderWithProviders } from "../../../test/renderWithProviders";

describe("StepNavigation", () => {
  it("shows Next on step 1 and calls onNext", async () => {
    const onNext = vi.fn();
    renderWithProviders(
      <StepNavigation
        currentStep={1}
        onNext={onNext}
        onBack={vi.fn()}
        mode="create"
        isPending={false}
      />,
    );

    const next = screen.getByRole("button", { name: "Next" });
    await userEvent.click(next);
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it("shows Back / Cancel / Save on step 2", () => {
    renderWithProviders(
      <StepNavigation
        currentStep={2}
        onNext={vi.fn()}
        onBack={vi.fn()}
        mode="create"
        isPending={false}
      />,
    );
    expect(screen.getByRole("button", { name: "Back" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("disables submit and shows a pending label while saving", () => {
    renderWithProviders(
      <StepNavigation
        currentStep={2}
        onNext={vi.fn()}
        onBack={vi.fn()}
        mode="edit"
        isPending
      />,
    );
    expect(screen.getByRole("button", { name: "Saving..." })).toBeDisabled();
  });
});
