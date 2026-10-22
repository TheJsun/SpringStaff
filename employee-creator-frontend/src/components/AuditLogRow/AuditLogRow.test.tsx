import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import AuditLogRow from "./AuditLogRow";
import { mockAuditLog } from "../../test/fixtures";

describe("AuditLogRow", () => {
  it("renders the entity, actor and type for a log entry", () => {
    render(<AuditLogRow log={mockAuditLog} />);
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("admin@example.com")).toBeInTheDocument();
    expect(screen.getByText(/Employee #1/)).toBeInTheDocument();
  });

  it("renders a changes toggle button", () => {
    render(<AuditLogRow log={mockAuditLog} />);
    expect(
      screen.getByRole("button", { name: "Show changes" }),
    ).toBeInTheDocument();
  });
});
