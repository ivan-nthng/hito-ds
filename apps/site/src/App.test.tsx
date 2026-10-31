import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { App } from "./App";
it("saves locally, preserves edits through scheme switching, clears success on edit, and resets", async () => {
  const user = userEvent.setup(); render(<App />);
  const name = screen.getByRole("textbox", { name: "Workspace name" }) as HTMLInputElement;
  const summary = screen.getByRole("checkbox") as HTMLInputElement;
  await user.clear(name); await user.type(name, "Shared studio"); await user.click(summary);
  await user.click(screen.getByRole("button", { name: "Save changes" }));
  expect(screen.getByRole("status").textContent).toBe("Changes saved for this demo.");
  await user.click(screen.getByRole("button", { name: /mode$/ }));
  expect(name.value).toBe("Shared studio"); expect(summary.checked).toBe(false);
  fireEvent.change(name, { target: { value: "" } });
  expect(screen.getByRole("status").textContent).toBe("Demo only. Nothing is sent or stored.");
  await user.click(screen.getByRole("button", { name: "Save changes" }));
  expect(screen.getByRole("status").textContent).toBe("Changes saved for this demo.");
  await user.click(screen.getByRole("button", { name: "Reset" }));
  expect(name.value).toBe("Studio North"); expect(summary.checked).toBe(true);
  expect(screen.getByRole("status").textContent).toBe("Demo only. Nothing is sent or stored.");
});
it("exposes real navigation links and no service promotion", () => {
  render(<App />);
  expect(screen.getByRole("link", { name: "Explore Storybook" }).getAttribute("href")).toBe("/storybook/");
  expect(screen.getByRole("link", { name: "Open Figma" }).getAttribute("rel")).toContain("noopener");
  expect(screen.getAllByRole("heading", { level: 1 }).length).toBe(1);
  expect(document.body.textContent).not.toMatch(/Upwork|portfolio|pricing|implementation service/i);
});
