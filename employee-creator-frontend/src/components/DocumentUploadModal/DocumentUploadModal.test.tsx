import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DocumentUploadModal } from "./DocumentUploadModal";
import { renderWithProviders } from "../../test/renderWithProviders";

function makeFile() {
  return new File(["dummy"], "my-resume.pdf", { type: "application/pdf" });
}

describe("DocumentUploadModal", () => {
  it("renders inside a modal with the file name and a pre-filled name", () => {
    renderWithProviders(
      <DocumentUploadModal
        employeeId={1}
        file={makeFile()}
        onClose={vi.fn()}
        onUploaded={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("dialog", { name: "Add document" }),
    ).toBeInTheDocument();
    expect(screen.getByText("my-resume.pdf")).toBeInTheDocument();
    // defaultNameFromFileName("my-resume.pdf") => "My resume"
    expect(screen.getByLabelText("Name")).toHaveValue("My resume");
    expect(
      screen.getByRole("button", { name: "Upload" }),
    ).toBeInTheDocument();
  });

  it("calls onClose when Cancel is clicked", async () => {
    const onClose = vi.fn();
    renderWithProviders(
      <DocumentUploadModal
        employeeId={1}
        file={makeFile()}
        onClose={onClose}
        onUploaded={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
