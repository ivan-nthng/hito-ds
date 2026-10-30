import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Skeleton } from "./Skeleton";

describe("Skeleton", () => {
  it("keeps composed placeholders out of the accessibility tree and preserves one busy owner", () => {
    const { container } = render(<section aria-label="Carregando conteúdo" aria-busy="true"><Skeleton /><Skeleton shape="block" /><Skeleton shape="circle" /></section>);
    expect(screen.getByRole("region", { name: "Carregando conteúdo" }).getAttribute("aria-busy")).toBe("true");
    expect(container.querySelectorAll("[aria-busy]")).toHaveLength(1);
    expect(container.querySelectorAll("[aria-live], [role=status], [role=progressbar]")).toHaveLength(0);
    for (const shape of container.querySelectorAll("[data-skeleton]")) {
      expect(shape.getAttribute("aria-hidden")).toBe("true");
      expect(shape.textContent).toBe("");
      expect(shape.hasAttribute("tabindex")).toBe(false);
    }
  });
});
