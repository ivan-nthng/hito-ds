import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import Input from "./Input";
import { Icons } from "../Icons";

const meta: Meta<typeof Input> = {
  title: "Components/Input/Interactive Playground",
  component: Input,
  parameters: {
    layout: "centered",
    controls: { sort: "requiredFirst" },
  },
  argTypes: {
    // Size
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg", "xl"],
      description: "Sets the size of the input field.",
      table: {
        category: "Size",
      },
    },

    // State
    state: {
      control: { type: "select" },
      options: ["default", "hover", "focused", "push", "disabled"],
      description: "Defines the current state of the input field.",
      table: {
        category: "State",
      },
    },

    // Variant
    variant: {
      control: { type: "select" },
      options: ["primary", "secondary", "inline", "header"],
      description: "Specifies the variant of the input field.",
      table: {
        category: "Variant",
      },
    },

    // Feedback
    feedback: {
      control: { type: "select" },
      options: ["default", "error", "success"],
      description: "Sets feedback styling for the input field.",
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
type Story = StoryObj<typeof Input>;

// Interactive Playground
export const Playground: Story = {
  args: {
    size: "md",
    state: "default",
    variant: "primary",
    feedback: "default",
    leftIcon: false,
    rightIcon: false,
    placeholder: "Type here...",
  },
  render: (args) => (
    <div className="w-80">
      <Input
        {...args}
        leftIcon={args.leftIcon ? <Icons.Plus size={16} /> : undefined}
        rightIcon={args.rightIcon ? <Icons.X size={16} /> : undefined}
      />
    </div>
  ),
};

// Size Examples
export const Sizes: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <Input size="sm" placeholder="Small input" />
      <Input size="md" placeholder="Medium input" />
      <Input size="lg" placeholder="Large input" />
      <Input size="xl" placeholder="Extra large input" />
    </div>
  ),
};

// Variant Examples
export const Variants: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <Input variant="primary" placeholder="Primary variant" />
      <Input variant="secondary" placeholder="Secondary variant" />
      <Input variant="inline" placeholder="Inline variant" />
      <Input variant="header" placeholder="Header variant" />
    </div>
  ),
};

// State Examples
export const States: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <Input state="default" placeholder="Default state" />
      <Input state="hover" placeholder="Hover state" />
      <Input state="focused" placeholder="Focused state" />
      <Input state="push" placeholder="Push state" />
      <Input state="disabled" placeholder="Disabled state" disabled />
    </div>
  ),
};

// Feedback Examples
export const Feedback: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <Input feedback="default" placeholder="Default feedback" />
      <Input feedback="error" placeholder="Error feedback" />
      <Input feedback="success" placeholder="Success feedback" />
    </div>
  ),
};

// Icon Examples
export const WithIcons: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <Input leftIcon={<Icons.Plus size={16} />} placeholder="With left icon" />
      <Input rightIcon={<Icons.X size={16} />} placeholder="With right icon" />
      <Input
        leftIcon={<Icons.Plus size={16} />}
        rightIcon={<Icons.X size={16} />}
        placeholder="With both icons"
      />
    </div>
  ),
};
