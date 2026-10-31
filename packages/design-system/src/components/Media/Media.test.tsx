import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { Dot, Live, MediaActionLink, RoundPlayButton } from "./Media";
it("preserves link/button semantics and decorative status punctuation", () => {
 const {container}=render(<><MediaActionLink href="/storybook/">Explore</MediaActionLink><RoundPlayButton aria-label="Play session" /><Dot /><Live /></>);
 expect(screen.getByRole("link").getAttribute("href")).toBe("/storybook/");
 expect(screen.getByRole("button",{name:"Play session"}).getAttribute("data-size")).toBe("xl");
 expect(container.querySelector("[data-live-dot]")?.getAttribute("aria-hidden")).toBe("true");
 expect(screen.getByText("Live")).toBeTruthy();
});
