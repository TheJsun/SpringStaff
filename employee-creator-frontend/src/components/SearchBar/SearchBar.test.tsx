import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchBar from "./SearchBar";

describe("SearchBar", () => {
  it("renders an input with the placeholder and current value", () => {
    render(
      <SearchBar placeholder="Search employees" value="ada" onChange={vi.fn()} />,
    );
    const input = screen.getByRole("textbox", { name: "Search employees" });
    expect(input).toHaveValue("ada");
  });

  it("calls onChange with the typed character", async () => {
    const onChange = vi.fn();
    render(
      <SearchBar placeholder="Search" value="" onChange={onChange} />,
    );

    await userEvent.type(screen.getByRole("textbox"), "a");

    expect(onChange).toHaveBeenCalledWith("a");
  });
});
