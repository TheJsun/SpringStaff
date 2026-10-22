import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DetailsSection } from "./DetailsSection";

describe("DetailsSection", () => {
  it("renders the title and each field label/value", () => {
    render(
      <DetailsSection
        title="Contact"
        fields={[
          { label: "Email", value: "ada@example.com" },
          { label: "Phone", value: "0400000000" },
        ]}
      />,
    );
    expect(
      screen.getByRole("heading", { name: "Contact" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("ada@example.com")).toBeInTheDocument();
    expect(screen.getByText("0400000000")).toBeInTheDocument();
  });

  it("hides values while loading", () => {
    render(
      <DetailsSection
        title="Contact"
        isLoading
        fields={[{ label: "Email", value: "ada@example.com" }]}
      />,
    );
    expect(screen.queryByText("ada@example.com")).not.toBeInTheDocument();
  });
});
