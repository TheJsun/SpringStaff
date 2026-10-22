import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { DocumentsPanel } from "./DocumentsPanel";
import {
  renderWithProviders,
  makeAuth,
  adminUser,
} from "../../test/renderWithProviders";
import { mockDocument } from "../../test/fixtures";
import { useDocuments } from "../../hooks/useDocuments";

vi.mock("../../hooks/useDocuments", () => ({
  useDocuments: vi.fn(),
  useDeleteDocument: () => ({ isPending: false, mutate: vi.fn() }),
}));

const useDocumentsMock = vi.mocked(useDocuments);

describe("DocumentsPanel", () => {
  beforeEach(() => {
    useDocumentsMock.mockReset();
  });

  it("always offers the dropzone browse control", () => {
    useDocumentsMock.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useDocuments>);

    renderWithProviders(<DocumentsPanel employeeId={1} />, {
      auth: makeAuth({ user: adminUser }),
    });
    expect(screen.getByRole("button", { name: "browse" })).toBeInTheDocument();
    expect(screen.getByText("No documents yet.")).toBeInTheDocument();
  });

  it("renders a row for each document", () => {
    useDocumentsMock.mockReturnValue({
      data: [mockDocument],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useDocuments>);

    renderWithProviders(<DocumentsPanel employeeId={1} />, {
      auth: makeAuth({ user: adminUser }),
    });
    expect(screen.getByText("Contract")).toBeInTheDocument();
  });
});
