import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SortDropdown from "./SortDropdown";

const options = [
  { value: "name", label: "Name" },
  { value: "started", label: "Start date" },
];

describe("SortDropdown", () => {
  it("shows the selected option's label on the trigger", () => {
    render(
      <SortDropdown options={options} value="name" onChange={vi.fn()} />,
    );
    expect(screen.getByText("Name")).toBeInTheDocument();
  });

  it("opens the listbox and reports the chosen value", async () => {
    const onChange = vi.fn();
    render(
      <SortDropdown options={options} value="name" onChange={onChange} />,
    );

    await userEvent.click(screen.getByRole("button"));
    await userEvent.click(screen.getByRole("option", { name: "Start date" }));

    expect(onChange).toHaveBeenCalledWith("started");
  });
});
