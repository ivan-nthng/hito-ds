import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";
import { Icons } from "../Icons";

const meta = {
  title: "Components/Button/Interactive Playground",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg", "xl"],
      description: "Controls the size of the button",
      table: {
        type: { summary: "sm | md | lg | xl" },
        defaultValue: { summary: "md" },
      },
    },
    state: {
      control: { type: "select" },
      options: ["default", "hover", "focused", "push", "disabled", "loading"],
      description: "Manages button states",
      table: {
        type: {
          summary: "default | hover | focused | push | disabled | loading",
        },
        defaultValue: { summary: "default" },
      },
    },
    style: {
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
      description: "Changes button style",
      table: {
        type: {
          summary:
            "primary | secondary | ghost | plain | link | primary-icon | secondary-icon | ghost-icon | plain-icon",
        },
        defaultValue: { summary: "primary" },
      },
    },
    feedback: {
      control: { type: "select" },
      options: ["default", "error", "success"],
      description: "Allows feedback styling",
      table: {
        type: { summary: "default | error | success" },
        defaultValue: { summary: "default" },
      },
    },
    left: {
      control: "boolean",
      description: "Toggle left icon visibility",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: false },
      },
    },
    right: {
      control: "boolean",
      description: "Toggle right icon visibility",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: false },
      },
    },
    children: {
      control: "text",
      description: "Button text content",
      table: {
        type: { summary: "string" },
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof Button>;

export const Playground: Story = {
  args: {
    size: "md",
    state: "default",
    style: "primary",
    feedback: "default",
    left: false,
    right: false,
    children: "Button",
    leftContent: <Icons.ArrowLeft />,
    rightContent: <Icons.ArrowRight />,
  },
};

// Documentation examples
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">Extra Large</Button>
    </div>
  ),
};

export const Styles: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button style="primary">Primary</Button>
      <Button style="secondary">Secondary</Button>
      <Button style="ghost">Ghost</Button>
      <Button style="plain">Plain</Button>
      <Button style="link">Link</Button>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button state="default">Default</Button>
      <Button state="hover">Hover</Button>
      <Button state="focused">Focused</Button>
      <Button state="push">Push</Button>
      <Button state="disabled">Disabled</Button>
      <Button isLoading>Loading</Button>
    </div>
  ),
};

export const Feedback: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button feedback="default">Default</Button>
      <Button feedback="error">Error</Button>
      <Button feedback="success">Success</Button>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button left leftContent={<Icons.ArrowLeft />}>
        Left Icon
      </Button>
      <Button right rightContent={<Icons.ArrowRight />}>
        Right Icon
      </Button>
      <Button
        left
        right
        leftContent={<Icons.ArrowLeft />}
        rightContent={<Icons.ArrowRight />}
      >
        Both Icons
      </Button>
    </div>
  ),
};
