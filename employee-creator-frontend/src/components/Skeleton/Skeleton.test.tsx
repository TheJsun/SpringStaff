import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Skeleton } from "./Skeleton";

describe("Skeleton", () => {
  it("renders a placeholder element with the given dimensions", () => {
    const { container } = render(<Skeleton width="10em" height="2em" />);
    const span = container.querySelector("span");
    expect(span).not.toBeNull();
    expect(span).toHaveStyle({ width: "10em", height: "2em" });
  });
});
