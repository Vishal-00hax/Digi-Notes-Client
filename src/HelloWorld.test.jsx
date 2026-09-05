import { render, screen, fireEvent } from "@testing-library/react";
import HelloWorld from "./HelloWorld";

describe("HelloWorld Component", () => {
  it("renders the initial text", () => {
    render(<HelloWorld />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("changes text to World when button is clicked", () => {
    render(<HelloWorld />);
    const button = screen.getByRole("button", { name: "Click Me" });

    fireEvent.click(button);

    expect(screen.getByText("World")).toBeInTheDocument();
  });
});
