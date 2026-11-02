import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, afterEach, vi, expect, it } from "vitest";
vi.mock("./soundcloud-player", () => ({
 playerUrl: "about:blank", trackUrl: "https://soundcloud.com/vanya-nichego/you-think-youre-stuck",
 loadSoundCloud: async () => Object.assign(() => {
  const handlers: Record<string, () => void> = {};
  return { bind: (name: string, fn: () => void) => { handlers[name] = fn; if (name === "READY") queueMicrotask(fn); }, unbind: (name: string) => { delete handlers[name]; }, play: () => handlers.PLAY?.(), pause: () => handlers.PAUSE?.(), seekTo: vi.fn() };
 }, { Events: Object.fromEntries(["READY","PLAY","PAUSE","FINISH","ERROR"].map(key => [key,key])) })
}));
import { App } from "./App";
beforeEach(() => {
 vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
 vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
});
afterEach(() => vi.unstubAllGlobals());
it("keeps media actions local, reversible and accessible", async () => {
 const user = userEvent.setup(); render(<App />);
 await waitFor(() => expect(screen.getByRole("button", {name:"Play"}).hasAttribute("disabled")).toBe(false));
 await user.click(screen.getByRole("button", {name:"Play"}));
 expect(screen.getByRole("button", {name:"Pause"}).getAttribute("aria-pressed")).toBe("true");
 expect(screen.getByRole("status").textContent).toContain("Audio playing.");
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
 expect(screen.getByRole("heading",{name:"You think you’re stuck"}).closest("[data-card]")?.getAttribute("data-hito-color-scheme")).toBe("light");
 expect(document.querySelectorAll("[data-media-object]").length).toBe(6);
});

it("omits the removed breadcrumb without changing headline or CTA text", () => { render(<App />); expect(screen.queryByRole("navigation",{name:"Breadcrumb"})).toBeNull();expect(screen.queryByText("Overview",{exact:true})).toBeNull();expect(screen.getByRole("heading",{name:"Structure. With feeling."})).toBeTruthy();expect(screen.getByRole("link",{name:"Explore Storybook"})).toBeTruthy();});
