import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import CreateEmployeeForm from "./CreateEmployeeForm";
import { renderWithProviders } from "../../../test/renderWithProviders";
import { mockDepartment } from "../../../test/fixtures";

describe("CreateEmployeeForm", () => {
  it("renders the personal-info step and the Next control first", () => {
    renderWithProviders(
      <CreateEmployeeForm
        mode="create"
        employeeId={undefined}
        initialData={undefined}
        departments={[mockDepartment]}
      />,
    );
    expect(screen.getByLabelText("First name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
  });
});
