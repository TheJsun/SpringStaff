import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmployeeAvatar } from "./EmployeeAvatar";

describe("EmployeeAvatar", () => {
  it("renders the uppercase initials from first and last name", () => {
    render(
      <EmployeeAvatar
        size="sm"
        employee={{
          firstName: "ada",
          lastName: "lovelace",
          email: "ada@example.com",
        }}
      />,
    );
    expect(screen.getByText("AL")).toBeInTheDocument();
  });
});
