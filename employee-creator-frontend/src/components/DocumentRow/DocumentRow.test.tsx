import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DocumentRow } from "./DocumentRow";
import { renderWithProviders } from "../../test/renderWithProviders";
import { mockDocument } from "../../test/fixtures";

describe("DocumentRow", () => {
  it("renders the document name, file-type badge and a View link", () => {
    renderWithProviders(
      <DocumentRow employeeId={1} doc={mockDocument} isMine={false} />,
    );
    expect(screen.getByText("Contract")).toBeInTheDocument();
    expect(screen.getByText("PDF")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View" })).toBeInTheDocument();
  });

  it("reveals a Delete action from the document menu", async () => {
    renderWithProviders(
      <DocumentRow employeeId={1} doc={mockDocument} isMine />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Document actions" }),
    );
    expect(
      screen.getByRole("button", { name: "Delete" }),
    ).toBeInTheDocument();
  });
});
