import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Button } from "./Button";
import { Icons } from "../Icons";

describe("Button", () => {
	it("renders children correctly", () => {
		render(<Button>Click me</Button>);
		expect(screen.getByText("Click me")).toBeInTheDocument();
	});

	it("applies style classes correctly", () => {
		const { rerender } = render(<Button style="accent">Button</Button>);
		expect(screen.getByRole("button")).toHaveClass("bg-primary-600");

		rerender(<Button style="secondary">Button</Button>);
		expect(screen.getByRole("button")).toHaveClass("bg-gray-100");

		rerender(<Button style="error">Button</Button>);
		expect(screen.getByRole("button")).toHaveClass("bg-red-600");

		rerender(<Button style="success">Button</Button>);
		expect(screen.getByRole("button")).toHaveClass("bg-green-600");
	});

	it("applies state classes correctly", () => {
		const { rerender } = render(<Button state="default">Button</Button>);
		expect(screen.getByRole("button")).not.toHaveClass("hover:scale-105", "active:scale-95", "opacity-50");

		rerender(<Button state="hover">Button</Button>);
		expect(screen.getByRole("button")).toHaveClass("hover:scale-105");

		rerender(<Button state="active">Button</Button>);
		expect(screen.getByRole("button")).toHaveClass("active:scale-95");

		rerender(<Button state="disabled">Button</Button>);
		expect(screen.getByRole("button")).toHaveClass("opacity-50", "cursor-not-allowed", "pointer-events-none");
		expect(screen.getByRole("button")).toBeDisabled();
	});

	it("applies size classes correctly", () => {
		const { rerender } = render(<Button size="sm">Button</Button>);
		expect(screen.getByRole("button")).toHaveClass("px-3", "py-1.5", "text-sm");

		rerender(<Button size="md">Button</Button>);
		expect(screen.getByRole("button")).toHaveClass("px-4", "py-2", "text-base");

		rerender(<Button size="lg">Button</Button>);
		expect(screen.getByRole("button")).toHaveClass("px-6", "py-3", "text-lg");

		rerender(<Button size="xl">Button</Button>);
		expect(screen.getByRole("button")).toHaveClass("px-8", "py-4", "text-xl");
	});

	it("renders left content correctly", () => {
		const leftContent = <Icons.Plus data-testid="left-icon" />;
		render(
			<Button left leftContent={leftContent}>
				Button
			</Button>
		);
		expect(screen.getByTestId("left-icon")).toBeInTheDocument();
		expect(screen.getByTestId("left-icon").parentElement).toHaveClass("mr-2");
	});

	it("renders right content correctly", () => {
		const rightContent = <Icons.ArrowRight data-testid="right-icon" />;
		render(
			<Button right rightContent={rightContent}>
				Button
			</Button>
		);
		expect(screen.getByTestId("right-icon")).toBeInTheDocument();
		expect(screen.getByTestId("right-icon").parentElement).toHaveClass("ml-2");
	});

	it("handles loading state correctly", () => {
		render(<Button isLoading>Loading</Button>);
		expect(screen.getByRole("button")).toBeDisabled();
		expect(screen.getByText("Loading")).toBeInTheDocument();
		expect(document.querySelector("svg")).toBeInTheDocument();
	});

	it("calls onClick handler when clicked", () => {
		const handleClick = jest.fn();
		render(<Button onClick={handleClick}>Click me</Button>);

		fireEvent.click(screen.getByRole("button"));
		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it("does not call onClick handler when disabled or in disabled state", () => {
		const handleClick = jest.fn();
		const { rerender } = render(
			<Button disabled onClick={handleClick}>
				Click me
			</Button>
		);

		fireEvent.click(screen.getByRole("button"));
		expect(handleClick).not.toHaveBeenCalled();

		rerender(
			<Button state="disabled" onClick={handleClick}>
				Click me
			</Button>
		);
		fireEvent.click(screen.getByRole("button"));
		expect(handleClick).not.toHaveBeenCalled();
	});

	it("forwards ref correctly", () => {
		const ref = React.createRef<HTMLButtonElement>();
		render(<Button ref={ref}>Button</Button>);

		expect(ref.current).toBeInstanceOf(HTMLButtonElement);
	});

	it("merges custom className with default classes", () => {
		render(<Button className="custom-class">Button</Button>);
		expect(screen.getByRole("button")).toHaveClass("custom-class");
		expect(screen.getByRole("button")).toHaveClass("inline-flex", "items-center", "justify-center");
	});
});
