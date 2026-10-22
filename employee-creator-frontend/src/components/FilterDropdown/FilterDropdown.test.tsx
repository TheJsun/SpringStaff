import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FilterDropdown from "./FilterDropdown";

const options = [
  { value: "1", label: "Engineering", count: 4 },
  { value: "2", label: "Design", count: 2 },
];

describe("FilterDropdown", () => {
  it("shows the label when nothing is selected", () => {
    render(
      <FilterDropdown
        label="Department"
        allLabel="All departments"
        options={options}
        value=""
        onChange={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Department" }),
    ).toBeInTheDocument();
  });

  it("opens the listbox with an 'all' row plus each option and reports the choice", async () => {
    const onChange = vi.fn();
    render(
      <FilterDropdown
        label="Department"
        allLabel="All departments"
        options={options}
        value=""
        onChange={onChange}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Department" }));
    expect(screen.getByRole("option", { name: /All departments/ })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("option", { name: /Engineering/ }));

    expect(onChange).toHaveBeenCalledWith("1");
  });

  it("can be disabled", () => {
    render(
      <FilterDropdown
        label="Department"
        allLabel="All departments"
        options={options}
        value=""
        onChange={vi.fn()}
        disabled
      />,
    );
    expect(screen.getByRole("button", { name: "Department" })).toBeDisabled();
  });
});
