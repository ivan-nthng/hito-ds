import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";
import { Icons } from "../Icons";

const meta = {
	title: "Components/Button",
	component: Button,
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component: `
# Button Component

A versatile button component that supports multiple styles, states, and icon placements.

## Usage

\`\`\`tsx
import { Button } from './Button';

// Basic usage
<Button>Click me</Button>

// With style
<Button style="primary">Primary Button</Button>

// With size
<Button size="lg">Large Button</Button>

// With icons
<Button left leftContent={<Icons.Plus />}>Add Item</Button>
\`\`\`
				`,
			},
		},
	},
	tags: ["autodocs"],
	argTypes: {
		style: {
			control: { type: "select" },
			options: ["primary", "secondary", "ghost", "plain", "link"],
			description: "The visual style of the button",
			table: {
				defaultValue: { summary: "primary" },
			},
		},
		state: {
			control: { type: "select" },
			options: ["default", "hover", "focused", "push", "disabled"],
			description: "The state of the button",
			table: {
				defaultValue: { summary: "default" },
			},
		},
		size: {
			control: { type: "select" },
			options: ["sm", "md", "lg", "xl"],
			description: "The size of the button",
			table: {
				defaultValue: { summary: "md" },
			},
		},
		feedback: {
			control: { type: "select" },
			options: ["default", "error", "success"],
			description: "The feedback state of the button",
			table: {
				defaultValue: { summary: "default" },
			},
		},
		left: {
			control: { type: "boolean" },
			description: "Show content on the left side",
			table: {
				type: { summary: "boolean" },
				defaultValue: { summary: "false" },
			},
		},
		right: {
			control: { type: "boolean" },
			description: "Show content on the right side",
			table: {
				type: { summary: "boolean" },
				defaultValue: { summary: "false" },
			},
		},
		leftContent: {
			control: { type: "select" },
			options: ["none", "plus", "check", "x", "arrowLeft"],
			mapping: {
				none: null,
				plus: <Icons.Plus className="w-4 h-4" />,
				check: <Icons.Check className="w-4 h-4" />,
				x: <Icons.X className="w-4 h-4" />,
				arrowLeft: <Icons.ArrowLeft className="w-4 h-4" />,
			},
			description: "Content to show on the left side",
		},
		rightContent: {
			control: { type: "select" },
			options: ["none", "plus", "check", "x", "arrowRight"],
			mapping: {
				none: null,
				plus: <Icons.Plus className="w-4 h-4" />,
				check: <Icons.Check className="w-4 h-4" />,
				x: <Icons.X className="w-4 h-4" />,
				arrowRight: <Icons.ArrowRight className="w-4 h-4" />,
			},
			description: "Content to show on the right side",
		},
		isLoading: {
			control: { type: "boolean" },
			description: "Whether the button is in a loading state",
			table: {
				type: { summary: "boolean" },
				defaultValue: { summary: "false" },
			},
		},
		onClick: {
			action: "clicked",
			description: "Callback fired when the button is clicked",
		},
	},
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof Button>;

// All Variants
export const AllVariants: Story = {
	render: () => (
		<div className="flex flex-col gap-4">
			<div className="flex gap-2">
				<Button>Default</Button>
				<Button style="primary">Primary</Button>
				<Button style="secondary">Secondary</Button>
				<Button style="ghost">Ghost</Button>
				<Button style="plain">Plain</Button>
				<Button style="link">Link</Button>
			</div>
			<div className="flex gap-2">
				<Button size="sm">Small</Button>
				<Button size="md">Medium</Button>
				<Button size="lg">Large</Button>
				<Button size="xl">Extra Large</Button>
			</div>
			<div className="flex gap-2">
				<Button state="hover">Hover</Button>
				<Button state="focused">Focused</Button>
				<Button state="push">Push</Button>
				<Button state="disabled">Disabled</Button>
				<Button isLoading>Loading</Button>
			</div>
			<div className="flex gap-2">
				<Button feedback="error">Error</Button>
				<Button feedback="success">Success</Button>
			</div>
			<div className="flex gap-2">
				<Button left leftContent={<Icons.Plus className="w-4 h-4" />}>
					Left Icon
				</Button>
				<Button right rightContent={<Icons.ArrowRight className="w-4 h-4" />}>
					Right Icon
				</Button>
				<Button left right leftContent={<Icons.Check className="w-4 h-4" />} rightContent={<Icons.ArrowRight className="w-4 h-4" />}>
					Both Icons
				</Button>
			</div>
		</div>
	),
};

// By State
export const DefaultState: Story = {
	args: {
		children: "Default Button",
		state: "default",
	},
};

export const HoverState: Story = {
	args: {
		children: "Hover Button",
		state: "hover",
	},
};

export const FocusedState: Story = {
	args: {
		children: "Focused Button",
		state: "focused",
	},
};

export const PushState: Story = {
	args: {
		children: "Push Button",
		state: "push",
	},
};

export const DisabledState: Story = {
	args: {
		children: "Disabled Button",
		state: "disabled",
	},
};

export const LoadingState: Story = {
	args: {
		children: "Loading Button",
		isLoading: true,
	},
};

// By Size
export const Small: Story = {
	args: {
		children: "Small Button",
		size: "sm",
	},
};

export const Medium: Story = {
	args: {
		children: "Medium Button",
		size: "md",
	},
};

export const Large: Story = {
	args: {
		children: "Large Button",
		size: "lg",
	},
};

export const ExtraLarge: Story = {
	args: {
		children: "Extra Large Button",
		size: "xl",
	},
};

// By Style
export const Primary: Story = {
	args: {
		children: "Primary Button",
		style: "primary",
	},
};

export const Secondary: Story = {
	args: {
		children: "Secondary Button",
		style: "secondary",
	},
};

export const Ghost: Story = {
	args: {
		children: "Ghost Button",
		style: "ghost",
	},
};

export const Plain: Story = {
	args: {
		children: "Plain Button",
		style: "plain",
	},
};

export const Link: Story = {
	args: {
		children: "Link Button",
		style: "link",
	},
};

// By Feedback
export const Error: Story = {
	args: {
		children: "Error Button",
		feedback: "error",
	},
};

export const Success: Story = {
	args: {
		children: "Success Button",
		feedback: "success",
	},
};

// By Icon
export const WithLeftIcon: Story = {
	args: {
		children: "Add Item",
		left: true,
		leftContent: <Icons.Plus className="w-4 h-4" />,
	},
};

export const WithRightIcon: Story = {
	args: {
		children: "Next Step",
		right: true,
		rightContent: <Icons.ArrowRight className="w-4 h-4" />,
	},
};

export const WithBothIcons: Story = {
	args: {
		children: "Both Icons",
		left: true,
		right: true,
		leftContent: <Icons.Check className="w-4 h-4" />,
		rightContent: <Icons.ArrowRight className="w-4 h-4" />,
	},
};
