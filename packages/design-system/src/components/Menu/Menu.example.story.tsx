import { useRef, useState } from "react";
import { Button } from "../Button/Button";
import { Text } from "../Text/Text";
import { getStoryContent } from "../../storybook/story-content";
import { Menu, type MenuEntry, type MenuProps } from "./Menu";
import styles from "./Menu.story.module.css";

export function menuCopy(profile: unknown) {
  const pt = getStoryContent(profile).lang === "pt-BR";
  return {
    more: pt ? "Mais ações" : "More actions", edit: pt ? "Editar os detalhes deste exemplo" : "Edit details",
    duplicate: pt ? "Duplicar" : "Duplicate", unavailable: pt ? "Exportar — indisponível neste exemplo" : "Export — unavailable in this example",
    remove: pt ? "Remover do exemplo" : "Remove from example", next: pt ? "Próxima ação" : "Next action",
    previous: pt ? "Ação anterior" : "Previous action", performed: pt ? "Ação demonstrada:" : "Demo action:",
    extra: pt ? "Ação adicional com nome longo para conferir a quebra de linha" : "Additional command with a longer label to check wrapping",
    language: pt ? "Idioma" : "Language", appearance: pt ? "Aparência" : "Appearance",
    light: pt ? "Claro" : "Light", dark: pt ? "Escuro" : "Dark", system: pt ? "Sistema" : "System",
  };
}
const hubArtwork = new URL("../../../assets/hub-soft-3d/png-64/hub-navigation.png", import.meta.url).href;
const clientArtwork = new URL("../../../assets/hub-soft-3d/png-64/hub-client.png", import.meta.url).href;
const designArtwork = new URL("../../../assets/hub-soft-3d/png-64/hub-design-system.png", import.meta.url).href;
export type MenuStoryArgs = { scenario: "commands" | "all-disabled" | "long-menu" | "submenus" | "artwork"; anchor: "start" | "end"; size?: MenuProps["size"] };
export function MenuExample({ scenario, anchor, size = "sm", profile, hold = false, removeOnAction = false, delayTabClose = false }: MenuStoryArgs & { profile: unknown; hold?: boolean; removeOnAction?: boolean; delayTabClose?: boolean }) {
  const copy = menuCopy(profile);
  const [open, setOpen] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [result, setResult] = useState("");
  const [count, setCount] = useState(0);
  const [language, setLanguage] = useState("en");
  const [appearance, setAppearance] = useState("system");
  const nextRef = useRef<HTMLButtonElement>(null);
  const commands: MenuEntry[] = scenario === "artwork" ? [
    { id: "hub", label: "Hub", artwork: { src: hubArtwork } },
    { id: "client", label: "Client", artwork: { src: clientArtwork }, disabled: true },
    { id: "language", label: copy.language, icon: "general/check", submenu: { label: copy.language, items: [
      { id: "design", label: "Design System", artwork: { src: designArtwork } },
      { id: "plain", label: copy.duplicate },
    ] } },
  ] : scenario === "submenus" ? [
    { id: "language", label: copy.language, submenu: { label: copy.language, items: [
      { id: "en", label: "English", checked: language === "en" }, { id: "pt", label: "Português", checked: language === "pt" },
    ] } },
    { id: "appearance", label: copy.appearance, submenu: { label: copy.appearance, items: (["light", "dark", "system"] as const).map(id => ({ id, label: copy[id], checked: appearance === id })) } },
  ] : [
    { id: "edit", label: copy.edit, icon: "controls/edit" },
    { id: "duplicate", label: copy.duplicate, icon: "controls/copy" },
    { id: "export", label: copy.unavailable, icon: "general/download", disabled: true },
    ...(scenario === "long-menu" ? Array.from({ length: 18 }, (_, index) => ({ id: `extra-${index}`, label: `${copy.extra} ${index + 1}` })) : []),
    { id: "divider", separator: true },
    { id: "remove", label: copy.remove, icon: "controls/delete", intent: "destructive" },
  ];
  return <div className={styles.example}>
    <Button size="sm" variant="ghost" intent="neutral">{copy.previous}</Button>
    <div className={styles.stage} data-edge={anchor}>
      <Menu label={copy.more} open={open} size={size} className={styles.panel} returnFocusRef={removeOnAction ? nextRef : undefined}
        onOpenChange={(next, reason) => {
          if (delayTabClose && reason === "tab") setTimeout(() => setOpen(next), 100);
          else if (!hold || next || reason !== "action") setOpen(next);
        }}
        trigger={<Button hidden={removed} size={size} variant="secondary" intent="neutral" icon="controls/more" aria-label={copy.more} />}
        items={scenario === "all-disabled" ? commands.map(item => "separator" in item ? item : { ...item, disabled: true }) : commands}
        onAction={id => {
          if (id === "en" || id === "pt") setLanguage(id);
          if (id === "light" || id === "dark" || id === "system") setAppearance(id);
          setCount(previous => previous + 1);
          const command = commands.find(item => item.id === id);
          setResult(`${copy.performed} ${command && "label" in command ? command.label : id}`);
          if (removeOnAction) setRemoved(true);
        }} />
    </div>
    <Button ref={nextRef} size="sm" variant="ghost" intent="neutral">{copy.next}</Button>
    <Text variant="body-sm" role="status">{result}</Text>
    {hold ? <output aria-label="Command count">{count}</output> : null}
  </div>;
}
