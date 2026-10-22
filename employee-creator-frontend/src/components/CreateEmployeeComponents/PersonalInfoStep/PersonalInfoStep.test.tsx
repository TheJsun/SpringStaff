import type { ReactNode } from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import PersonalInfoStep from "./PersonalInfoStep";

function FormHarness({ children }: { children: ReactNode }) {
  const methods = useForm();
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe("PersonalInfoStep", () => {
  it("renders the personal and contact fields", () => {
    render(
      <FormHarness>
        <PersonalInfoStep />
      </FormHarness>,
    );
    expect(screen.getByLabelText("First name")).toBeInTheDocument();
    expect(screen.getByLabelText("Last name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
    expect(screen.getByLabelText("Mobile number")).toBeInTheDocument();
    expect(screen.getByLabelText("Residential address")).toBeInTheDocument();
  });
});
