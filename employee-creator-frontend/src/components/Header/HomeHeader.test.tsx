import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HomeHeader from "./HomeHeader";

describe("HomeHeader", () => {
  it("renders the title and the count with its label", () => {
    render(<HomeHeader title="Directory" count={5} isLoading={false} />);
    expect(
      screen.getByRole("heading", { name: "Directory" }),
    ).toBeInTheDocument();
    expect(screen.getByText("5 employees")).toBeInTheDocument();
  });

  it("uses a custom count label", () => {
    render(
      <HomeHeader
        title="Departments"
        count={3}
        countLabel="departments"
        isLoading={false}
      />,
    );
    expect(screen.getByText("3 departments")).toBeInTheDocument();
  });

  it("hides the count while loading", () => {
    render(<HomeHeader title="Directory" count={5} isLoading />);
    expect(screen.queryByText("5 employees")).not.toBeInTheDocument();
  });
});
