import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Pagination from "./Pagination";

describe("Pagination", () => {
  it("shows the current page and total pages", () => {
    render(
      <Pagination
        currentPage={1}
        totalItems={25}
        pageSize={10}
        onPageChange={vi.fn()}
      />,
    );
    expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
  });

  it("disables Previous on the first page", () => {
    render(
      <Pagination
        currentPage={1}
        totalItems={25}
        pageSize={10}
        onPageChange={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
  });

  it("requests the next page when Next is clicked", async () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        currentPage={1}
        totalItems={25}
        pageSize={10}
        onPageChange={onPageChange}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
