import type { ReactNode } from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import EmploymentDetailsStep from "./EmploymentDetailsStep";
import { mockDepartment } from "../../../test/fixtures";

function FormHarness({ children }: { children: ReactNode }) {
  const methods = useForm();
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe("EmploymentDetailsStep", () => {
  it("renders the job, department and contract fields", () => {
    render(
      <FormHarness>
        <EmploymentDetailsStep departments={[mockDepartment]} />
      </FormHarness>,
    );
    expect(screen.getByLabelText("Job Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Department")).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Engineering" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: "Permanent" }),
    ).toBeInTheDocument();
  });
});
