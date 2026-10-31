import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, afterEach, vi, expect, it } from "vitest";
import { App } from "./App";
beforeEach(() => {
 vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
 vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
});
afterEach(() => vi.unstubAllGlobals());
it("keeps media actions local, reversible and accessible", async () => {
 const user = userEvent.setup(); render(<App />);
 await user.click(screen.getByRole("button", {name:"Play"}));
 expect(screen.getByRole("button", {name:"Pause"}).getAttribute("aria-pressed")).toBe("true");
 expect(screen.getByRole("status").textContent).toContain("No audio is streamed");
 await user.click(screen.getByRole("button", {name:"Pause"}));
 await user.click(screen.getByRole("button", {name:"Save Session"}));
 expect(screen.getByRole("button", {name:"Session saved"}).getAttribute("aria-pressed")).toBe("true");
 await user.click(screen.getByRole("button", {name:"Session saved"}));
 expect(screen.getByRole("button", {name:"Save Session"}).getAttribute("aria-pressed")).toBe("false");
 const tracklist=screen.getByRole("button",{name:"View Tracklist"});
 expect(document.getElementById(tracklist.getAttribute("aria-controls")!)?.hidden).toBe(true);
 await user.click(tracklist); expect(tracklist.getAttribute("aria-expanded")).toBe("true");
 expect(document.getElementById(tracklist.getAttribute("aria-controls")!)?.hidden).toBe(false);
 await user.click(tracklist); expect(tracklist.getAttribute("aria-expanded")).toBe("false");
});
it("uses real destinations, scoped schemes and one primary heading", () => {
 render(<App />);
 expect(screen.getByRole("link", {name:"Explore Storybook"}).getAttribute("href")).toBe("/storybook/");
 expect(screen.getByRole("link", {name:"Figma"}).getAttribute("rel")).toContain("noopener");
 expect(screen.getAllByRole("heading",{level:1}).length).toBe(1);
 expect(screen.getByRole("heading",{name:"Soft Signals"}).closest("[data-card]")?.getAttribute("data-hito-color-scheme")).toBe("light");
 expect(document.querySelectorAll("[data-media-object]").length).toBe(6);
});
