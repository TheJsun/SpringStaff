import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tabs } from "./Tabs";

const tabs = [
  { id: "details", label: "Details" },
  { id: "documents", label: "Documents" },
];

describe("Tabs", () => {
  it("renders a tab button per entry and marks the active one", () => {
    render(<Tabs tabs={tabs} activeTabId="details" />);

    expect(screen.getByRole("tab", { name: "Details" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tab", { name: "Documents" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });

  it("calls onTabChange with the clicked tab id", async () => {
    const onTabChange = vi.fn();
    render(
      <Tabs tabs={tabs} activeTabId="details" onTabChange={onTabChange} />,
    );

    await userEvent.click(screen.getByRole("tab", { name: "Documents" }));

    expect(onTabChange).toHaveBeenCalledWith("documents");
  });
});
