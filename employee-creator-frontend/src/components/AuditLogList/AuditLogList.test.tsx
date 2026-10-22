import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import AuditLogList from "./AuditLogList";
import { mockAuditLog } from "../../test/fixtures";

describe("AuditLogList", () => {
  it("renders a row per log entry", () => {
    render(
      <AuditLogList
        logs={[mockAuditLog]}
        isLoading={false}
        isError={false}
        error={null}
      />,
    );
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
  });

  it("shows an empty message when there are no logs", () => {
    render(
      <AuditLogList logs={[]} isLoading={false} isError={false} error={null} />,
    );
    expect(screen.getByText("No audit entries yet.")).toBeInTheDocument();
  });

  it("shows a loading message", () => {
    render(
      <AuditLogList logs={[]} isLoading isError={false} error={null} />,
    );
    expect(screen.getByText("Loading audit logs...")).toBeInTheDocument();
  });
});
