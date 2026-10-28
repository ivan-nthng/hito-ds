import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { FoundationStoryPage, FoundationSpecimen, FoundationSpecimenGrid } from "../../foundations/FoundationStoryLayout";
import { getStoryContent, resolveStoryContentProfile } from "../../storybook/story-content";
import { Text } from "../Text/Text";
import { Avatar, avatarSizes, avatarShapes, type AvatarSize, type AvatarShape } from "./Avatar";
import styles from "./Avatar.stories.module.css";

const portrait = new URL("../../storybook/fixtures/avatar-portrait.jpg", import.meta.url).href;
const brokenPhoto = "data:image/png;base64,broken";
type StoryArgs = { size: AvatarSize; shape: AvatarShape; content: "photo" | "initials" | "icon" | "company"; editable: boolean; disabled: boolean; editPresentation: "adaptive" | "persistent-strip" };
function copy(profile: unknown) {
  const { lang } = getStoryContent(resolveStoryContentProfile(profile));
  const name = resolveStoryContentProfile(profile).endsWith("long") ? "Alexandre da Silva Oliveira" : "Alex Silva";
  return { lang, name, edit: lang === "en" ? "Edit" : "Editar", action: lang === "en" ? `Edit profile photo for ${name}` : `Editar foto de perfil de ${name}` };
}

function Example({ size, shape, content, editable, disabled, editPresentation, profile }: StoryArgs & { profile: unknown }) {
  const text = copy(profile);
  const [count, setCount] = useState(0);
  const editing = editable && size !== "xs";
  const props = { shape, src: content === "photo" ? portrait : undefined, initials: content === "photo" || content === "initials" ? "AS" : undefined,
    fallbackIcon: content === "company" ? "map/store" as const : undefined, fallbackIconTone: content === "company" ? "muted" as const : undefined };
  return <div className={styles.example} lang={text.lang}>
    {editing ? <Avatar {...props} {...(editPresentation === "persistent-strip" && size !== "sm" ? { size, editPresentation } : { size, editPresentation: "adaptive" })} disabled={disabled} label={text.action} editLabel={text.edit} onEdit={() => setCount(value => value + 1)} />
      : <Avatar {...props} size={size} decorative />}
    <Text as="span" variant="body-sm">{text.name}</Text>
    <span role="status" className={styles.status} data-edit-count={count}>{count ? `${text.edit} · ${count}` : ""}</span>
  </div>;
}

const meta = {
  id: "data-avatar", title: "Components/Collections/Avatar", tags: ["test"],
  parameters: { layout: "fullscreen", controls: { include: ["size", "shape", "content", "editable", "editPresentation", "disabled"] } },
  args: { size: "md", shape: "rounded", content: "photo", editable: true, disabled: false, editPresentation: "adaptive" },
  argTypes: {
    size: { control: "select", options: avatarSizes },
    shape: { control: "inline-radio", options: avatarShapes },
    content: { control: "inline-radio", options: ["photo", "initials", "icon", "company"], description: "Fixture only. Avatar derives its content from src, initials and an optional shared fallback glyph." },
    editable: { control: "boolean", if: { arg: "size", neq: "xs" }, description: "Optional edit access. XS is always passive; the application owns the editing flow." },
    editPresentation: { control: "inline-radio", options: ["adaptive", "persistent-strip"], if: { arg: "editable" }, description: "MD/LG can keep a bottom text strip visible on every pointer type. SM retains its adaptive icon-only presentation." },
    disabled: { control: "boolean", if: { arg: "editable" }, description: "Disables the native edit button while retaining the mounted image." },
  },
  render: (args, { globals }) => <FoundationStoryPage title="Avatar" description="Identity from a photo, initials or user icon. Edit access is optional; use the toolbar for language and theme.">
    <Example key={`${args.size}-${args.editable}-${globals.storyContentProfile}`} {...args} profile={globals.storyContentProfile} />
  </FoundationStoryPage>,
} satisfies Meta<StoryArgs>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  tags: ["context-matrix"],
  parameters: {
    figma: {
      label: "Avatar in Figma",
      url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8917-51",
    },
  },
  play: async ({ canvasElement, args, globals }) => {
    const canvas = within(canvasElement);
    if (args.content === "photo") {
      await waitFor(() => expect(canvasElement.querySelector("img")).toHaveAttribute("data-loaded", "true"));
      await expect(getComputedStyle(canvasElement.querySelector("img")!.nextElementSibling!).visibility).toBe("hidden");
    }
    const text = copy(globals.storyContentProfile);
    if (args.editable && args.size !== "xs") {
      const button = canvas.getByRole("button", { name: text.action });
      await expect(button).toBeVisible();
      await expect(getComputedStyle(button).overflow).toBe("visible");
      await expect(canvas.queryByRole("img")).toBeNull();
    } else {
      await expect(canvasElement.querySelector("[data-avatar]")).toHaveAttribute("aria-hidden", "true");
      await expect(canvas.queryByRole("img")).toBeNull();
      await expect(canvas.queryByRole("button")).toBeNull();
    }
  },
};

export const Editing: Story = {
  tags: ["context-matrix", "!dev", "!autodocs"],
  args: { size: "md", content: "initials", editable: true },
  parameters: { controls: { disable: true } },
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: copy(globals.storyContentProfile).action });
    await userEvent.click(canvasElement);
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("status")).toHaveAttribute("data-edit-count", "1");
    await userEvent.keyboard(" ");
    await expect(canvas.getByRole("status")).toHaveAttribute("data-edit-count", "2");
    await userEvent.click(button);
    await expect(canvas.getByRole("status")).toHaveAttribute("data-edit-count", "3");
  },
};

export const PersistentStrip: Story = {
  tags: ["context-matrix", "!dev", "!autodocs"],
  args: { size: "lg", content: "company", editable: true, editPresentation: "persistent-strip" },
  parameters: { controls: { disable: true } },
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: copy(globals.storyContentProfile).action });
    const visual = button.querySelector<HTMLElement>("[data-avatar-visual]")!;
    const overlay = visual.lastElementChild as HTMLElement;
    await expect(visual.getBoundingClientRect().width).toBe(160);
    await expect(overlay.getBoundingClientRect().height).toBe(36);
    await expect(overlay.getBoundingClientRect().bottom).toBe(visual.getBoundingClientRect().bottom);
    await expect(getComputedStyle(overlay).opacity).toBe("1");
    await expect(overlay.querySelector('[data-icon-name="controls/edit"]')).not.toBeVisible();
    await expect(getComputedStyle(button).overflow).toBe("visible");
    await userEvent.click(canvasElement);
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard("{Enter} ");
    await expect(canvas.getByRole("status")).toHaveAttribute("data-edit-count", "2");
  },
};

/** Regression matrix is test evidence, not another browsing page or Controls presentation. */
export const GeometryAndFallbacks: Story = {
  tags: ["context-matrix", "!dev", "!autodocs"],
  parameters: {
    controls: { disable: true },
    figma: {
      label: "Avatar overview in Figma",
      url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8917-211",
    },
  },
  render: (_, { globals }) => {
    const text = copy(globals.storyContentProfile);
    return <FoundationStoryPage title="Avatar geometry and fallback" description="Fixed frames retain their shape and name through fallback.">
      <FoundationSpecimenGrid minItemWidth="compact">
        {avatarSizes.flatMap(size => avatarShapes.map(shape => <FoundationSpecimen key={`${size}-${shape}`} label={`${size} · ${shape}`}>
          <Avatar size={size} shape={shape} label={text.name} src={brokenPhoto} initials="É👩🏽‍💻" />
        </FoundationSpecimen>))}
        <FoundationSpecimen label="User icon"><Avatar label={text.name} src={brokenPhoto} /></FoundationSpecimen>
        {avatarSizes.flatMap(size => avatarShapes.map(shape => <FoundationSpecimen key={`company-${size}-${shape}`} label={`Company · ${size} · ${shape}`}>
          <Avatar size={size} shape={shape} label="Casa Verde" src={brokenPhoto} fallbackIcon="map/store" fallbackIconTone="muted" />
        </FoundationSpecimen>))}
        <FoundationSpecimen label="Decorative"><Avatar decorative initials="AS" /></FoundationSpecimen>
      </FoundationSpecimenGrid>
    </FoundationStoryPage>;
  },
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(canvasElement.querySelectorAll("img")).toHaveLength(0));
    const dimensions = { xs: 24, sm: 40, md: 80, lg: 160 };
    const radii = { xs: 4, sm: 8, md: 12, lg: 24 };
    for (const avatar of canvasElement.querySelectorAll<HTMLElement>("[data-avatar]")) {
      const size = avatar.dataset.size as AvatarSize;
      const frame = avatar.querySelector<HTMLElement>("[data-avatar-visual]")!;
      const rect = frame.getBoundingClientRect();
      await expect(rect.width).toBe(dimensions[size]);
      await expect(rect.height).toBe(dimensions[size]);
      await expect(getComputedStyle(frame).borderRadius).toBe(avatar.dataset.shape === "circle" ? "9999px" : `${radii[size]}px`);
      await expect(avatar.querySelector("button, [tabindex]")).toBeNull();
      const icon = avatar.querySelector<HTMLElement>('[data-icon-name="map/store"]');
      if (icon) {
        const artwork = { xs: 16, sm: 20, md: 32, lg: 64 };
        await expect(icon.getBoundingClientRect().width).toBe(artwork[size]);
        await expect(icon.getBoundingClientRect().height).toBe(artwork[size]);
        await expect(icon).toHaveAttribute("data-tone", "muted");
      }
    }
    await expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth);
  },
};
