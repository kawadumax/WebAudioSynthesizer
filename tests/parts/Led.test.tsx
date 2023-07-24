import { render, screen } from "@testing-library/react";
import Led from "@components/parts/Led";

it("should have the correct class when active", () => {
  const { container } = render(<Led className="test-led" isActive={true} />);
  const ledElement = container.querySelector(".test-led");
  expect(ledElement).toHaveClass("on");
});

it("should have the correct class when not active", () => {
  const { container } = render(<Led className="test-led" isActive={false} />);
  const ledElement = container.querySelector(".test-led");
  expect(ledElement).toHaveClass("off");
});
