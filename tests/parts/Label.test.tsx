import { render, screen } from "@testing-library/react";
import Label from "@parts/Label";

describe("Label", () => {
  it("renders with the correct text content", () => {
    const labelText = "Test label";
    render(<Label>{labelText}</Label>);

    const labelElement = screen.getByText(labelText);
    expect(labelElement).toBeInTheDocument();
  });

  it("applies the provided className", () => {
    const labelText = "Test label";
    const customClassName = "custom-class";
    render(<Label className={customClassName}>{labelText}</Label>);

    const labelElement = screen.getByText(labelText);
    expect(labelElement).toHaveClass("label");
    expect(labelElement).toHaveClass(customClassName);
  });
});
