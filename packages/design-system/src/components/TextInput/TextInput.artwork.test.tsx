import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { TextInput } from "./TextInput";

it.each(["sm", "md", "lg", "xl"] as const)("keeps %s leading artwork and prefix decorative beside one native input", size => {
  const ref = createRef<HTMLInputElement>();
  const { container } = render(<TextInput ref={ref} size={size} aria-label="Phone, Brazil +55" type="tel" inputMode="tel"
    leadingArtwork={{ src: "/flags/br.svg" }} prefix="+55" defaultValue="(48) 99999-9999" />);
  const input = screen.getByRole("textbox", { name: "Phone, Brazil +55" }) as HTMLInputElement;
  expect(ref.current).toBe(input); expect(input.value).toBe("(48) 99999-9999");
  expect(input.hasAttribute("leadingArtwork")).toBe(false);
  expect(container.querySelector("img")?.getAttribute("aria-hidden")).toBe("true");
  expect(container.querySelector("img")?.alt).toBe("");
  expect(screen.getByText("+55").getAttribute("aria-hidden")).toBe("true");
  expect(container.querySelectorAll("input,button,[tabindex]")).toHaveLength(1);
});
