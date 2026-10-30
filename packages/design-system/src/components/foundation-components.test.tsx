import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { List, ListItem, Separator, Surface, Text } from "./index";

describe("foundation components", () => {
  it("preserves structural and text semantics", () => {
    render(
      <Surface as="section" aria-labelledby="queue-title">
        <Text as="h2" id="queue-title" variant="heading-sm">
          Fila de pedidos
        </Text>
        <Separator />
        <List>
          <ListItem>
            <Text>Pedido em preparação</Text>
          </ListItem>
        </List>
      </Surface>,
    );

    expect(screen.getByRole("region", { name: "Fila de pedidos" })).toBeTruthy();
    expect(screen.getByRole("heading", { level: 2 })).toBeTruthy();
    expect(screen.getByRole("separator")).toBeTruthy();
    expect(screen.getByRole("list")).toBeTruthy();
    expect(screen.getByRole("listitem")).toBeTruthy();
  });

  it("keeps decorative separators out of the accessibility tree", () => {
    render(<Separator decorative data-testid="separator" />);

    expect(screen.queryByRole("separator")).toBeNull();
    expect(screen.getByTestId("separator").getAttribute("aria-hidden")).toBe("true");
  });

  it("keeps emphasis independent from a text metric role", () => {
    render(
      <Text data-testid="text" emphasis="bold" variant="body-sm">
        Important update
      </Text>,
    );

    expect(screen.getByTestId("text").className).toContain("bold");
  });
});
