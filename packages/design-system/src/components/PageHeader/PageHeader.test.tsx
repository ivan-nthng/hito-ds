import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createRef } from "react";
import { Button } from "../Button/Button";
import { Link } from "../Link/Link";
import { PageHeader } from "./PageHeader";

describe("PageHeader and Link", () => {
  it("uses one page heading and preserves link navigation semantics", () => {
    render(
      <PageHeader
        actions={<Link href="/history">View history</Link>}
        description="Current work and exceptions"
        title="Operational queue"
      />,
    );

    expect(screen.getByRole("heading", { level: 1, name: "Operational queue" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "View history" }).getAttribute("href")).toBe("/history");
  });

  it("protects links that open a new browsing context", () => {
    render(<Link href="https://example.com" target="_blank">External reference</Link>);

    expect(screen.getByRole("link").getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("preserves native leading and action controls without owning navigation", () => {
    const back = vi.fn(), refresh = vi.fn(), ref = createRef<HTMLButtonElement>();
    render(<PageHeader size="compact" title="Overview" description="Current restaurant"
      leading={<Button ref={ref} variant="ghost" intent="neutral" icon="arrows/compact/left" aria-label="Back to overview" onClick={back} />}
      actions={<Button variant="soft" intent="neutral" onClick={refresh}>Refresh</Button>} />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    const leading = screen.getByRole("button", { name: "Back to overview" });
    expect(leading).toBe(ref.current); ref.current!.focus(); expect(document.activeElement).toBe(leading);
    fireEvent.click(leading); expect(back).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: "Refresh" })); expect(refresh).toHaveBeenCalledOnce();
    expect(leading.querySelectorAll("button, a")).toHaveLength(0);
  });

  it("omits optional controls and descriptions without adding empty focus targets", () => {
    const view = render(<PageHeader size="compact" title="Overview" />);
    expect(screen.getByRole("heading", { level: 1, name: "Overview" })).toBeTruthy();
    expect(view.container.querySelectorAll("button, a, p")).toHaveLength(0);
  });
});
