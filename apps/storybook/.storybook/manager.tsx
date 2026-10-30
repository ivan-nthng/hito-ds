import React from "react";
import { create } from "storybook/theming";
addons.setConfig({ layoutCustomisations: { showPanel: (state, defaultValue) => state.storyId === "hito-welcome--overview" ? false : defaultValue }, theme: create({ base: "light", brandTitle: "Hito DS", brandUrl: "?path=/story/hito-welcome--overview", brandImage: "./hito-wordmark.svg", colorPrimary: "#111827", colorSecondary: "#375dcc" }) });
import { Button } from "storybook/internal/components";
import { addons, types, useParameter } from "storybook/manager-api";

type FigmaReference = {
  label: string;
  url: string;
};

function FigmaLink() {
  const reference = useParameter<FigmaReference | undefined>("figma");

  if (!reference || !reference.url.startsWith("https://www.figma.com/")) return null;

  return (
    <Button
      asChild
      variant="ghost"
      size="small"
      ariaLabel={`${reference.label} (opens in a new tab)`}
    >
      <a href={reference.url} target="_blank" rel="noopener noreferrer">
        Figma
      </a>
    </Button>
  );
}

addons.register("hito/figma-reference", () => {
  addons.add("hito/figma-reference/link", {
    type: types.TOOL,
    title: "Figma",
    match: ({ viewMode }) => viewMode === "story" || viewMode === "docs",
    render: FigmaLink,
  });
});
