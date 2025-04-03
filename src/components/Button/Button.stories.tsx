import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";
import { Icons } from "../Icons";

const meta: Meta<typeof Button> = {
  title: "Components/Button/Interactive Playground",
  component: Button,
  parameters: {
    layout: "centered",
    controls: { sort: "requiredFirst" },
  },
  argTypes: {
    // Size
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg", "xl"],
      description: "Sets the size of the button.",
      table: {
        category: "Size",
      },
    },

    // State
    state: {
      control: { type: "select" },
      options: ["default", "hover", "focused", "push", "disabled"],
      description: "Defines the current state of the button.",
      table: {
        category: "State",
      },
    },

    // Variant
    variant: {
      control: { type: "select" },
      options: [
        "primary",
        "secondary",
        "ghost",
        "plain",
        "link",
        "primary-icon",
        "secondary-icon",
        "ghost-icon",
        "plain-icon",
      ],
      description: "Specifies the variant of the button.",
      table: {
        category: "Variant",
      },
    },

    // Feedback
    feedback: {
      control: { type: "select" },
      options: ["default", "error", "success"],
      description: "Sets feedback styling for the button.",
      table: {
        category: "Feedback",
      },
    },

    // Icons
    leftIcon: {
      control: "boolean",
      description: "Toggle visibility of the left icon.",
      table: {
        category: "Icons",
      },
    },
    rightIcon: {
      control: "boolean",
      description: "Toggle visibility of the right icon.",
      table: {
        category: "Icons",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// Interactive Playground
export const Playground: Story = {
  args: {
    children: "Button",
    size: "md",
    state: "default",
    variant: "primary",
    feedback: "default",
    leftIcon: false,
    rightIcon: false,
  },
  render: (args) => (
    <Button
      {...args}
      leftIcon={args.leftIcon ? <Icons.Plus size={16} /> : undefined}
      rightIcon={args.rightIcon ? <Icons.X size={16} /> : undefined}
    />
  ),
};

// Size Examples
export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <Button size="sm">Small button</Button>
      <Button size="md">Medium button</Button>
      <Button size="lg">Large button</Button>
      <Button size="xl">Extra large button</Button>
    </div>
  ),
};

// Variant Examples
export const Variants: Story = {
  render: () => (
    <div className="space-y-4">
      <Button variant="primary">Primary button</Button>
      <Button variant="secondary">Secondary button</Button>
      <Button variant="ghost">Ghost button</Button>
      <Button variant="plain">Plain button</Button>
      <Button variant="link">Link button</Button>
      <Button variant="primary-icon">
        <Icons.Plus size={16} />
      </Button>
      <Button variant="secondary-icon">
        <Icons.Plus size={16} />
      </Button>
      <Button variant="ghost-icon">
        <Icons.Plus size={16} />
      </Button>
      <Button variant="plain-icon">
        <Icons.Plus size={16} />
      </Button>
    </div>
  ),
};

// State Examples
export const States: Story = {
  render: () => (
    <div className="space-y-4">
      <Button state="default">Default state</Button>
      <Button state="hover">Hover state</Button>
      <Button state="focused">Focused state</Button>
      <Button state="push">Push state</Button>
      <Button state="disabled">Disabled state</Button>
    </div>
  ),
};

// Feedback Examples
export const Feedback: Story = {
  render: () => (
    <div className="space-y-4">
      <Button feedback="default">Default feedback</Button>
      <Button feedback="error">Error feedback</Button>
      <Button feedback="success">Success feedback</Button>
    </div>
  ),
};

// Icon Examples
export const WithIcons: Story = {
  render: () => (
    <div className="space-y-4">
      <Button leftIcon={<Icons.Plus size={16} />}>With left icon</Button>
      <Button rightIcon={<Icons.X size={16} />}>With right icon</Button>
      <Button
        leftIcon={<Icons.Plus size={16} />}
        rightIcon={<Icons.X size={16} />}
      >
        With both icons
      </Button>
    </div>
  ),
};
