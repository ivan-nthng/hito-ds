import { useRef, useState } from "react";
import { getStoryContent } from "../../storybook/story-content";
import { Button } from "../Button/Button";
import { TextInput } from "../TextInput/TextInput";
import type { MenuEntry } from "../Menu/Menu";
import { AccountTrigger } from "./AccountTrigger";
import styles from "./AccountTrigger.story.module.css";

const portrait = new URL("../../storybook/fixtures/avatar-portrait.jpg", import.meta.url).href;

export function accountCopy(profile: unknown) {
  const pt = getStoryContent(profile).lang === "pt-BR";
  return pt ? {
    locale: "pt", label: "Conta de Alex Silva", menu: "Menu da conta", language: "Idioma", theme: "Aparência",
    personal: "Dados pessoais", access: "Acesso e permissões", signout: "Sair",
    system: "Sistema", light: "Claro", dark: "Escuro", outside: "Anotação de exemplo", next: "Próxima ação",
  } : {
    locale: "en", label: "Alex Silva", menu: "Account menu", language: "Language", theme: "Appearance",
    personal: "Personal data", access: "Access & permissions", signout: "Sign out",
    system: "System", light: "Light", dark: "Dark", outside: "Example note", next: "Next action",
  };
}
export type AccountStoryArgs = { identity: "photo" | "initials" | "fallback"; openOnHover: boolean };

/** Local preview state only; applications own profile, options and persistence. */
export function AccountExample({ identity, openOnHover, profile, focusFixture = false }: AccountStoryArgs & { profile: unknown; focusFixture?: boolean }) {
  const [locale, setLocale] = useState(accountCopy(profile).locale);
  const copy = accountCopy(locale === "pt" ? "pt-long" : "en-short");
  const [theme, setTheme] = useState("system");
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const items: MenuEntry[] = [
    { id: "personal", label: copy.personal, icon: "general/user-filled", disabled: true },
    { id: "access", label: copy.access, icon: "general/lock", disabled: true },
    { id: "preferences", separator: true },
    { id: "language", label: copy.language, icon: "general/read", submenu: { label: copy.language, items: [
      { id: "en", label: "English", checked: locale === "en" },
      { id: "pt", label: "Português", checked: locale === "pt" },
    ] } },
    { id: "theme", label: copy.theme, icon: "controls/settings", submenu: { label: copy.theme, items: (["light", "dark", "system"] as const).map(id => ({
      id, label: copy[id], checked: theme === id,
    })) } },
    { id: "session", separator: true },
    { id: "signout", label: copy.signout, icon: "controls/leave" },
  ];
  return <section className={styles.example} lang={locale} data-account-example="" data-locale={locale}
    data-hito-color-scheme={theme === "system" ? undefined : theme}>
    {focusFixture ? <>
      <TextInput aria-label={copy.outside} size="md" />
      <Button variant="ghost" intent="neutral" size="md">{copy.next}</Button>
    </> : null}
    <div className={styles.header}>
      <AccountTrigger ref={trigger} label={copy.label} menuLabel={copy.menu} open={open} onOpenChange={setOpen}
        avatar={identity === "fallback" ? undefined : { initials: "AS", src: identity === "photo" ? portrait : undefined }}
        openOnHover={openOnHover} items={items}
        onAction={id => {
          if (id === "en" || id === "pt") setLocale(id);
          else if (id === "light" || id === "dark" || id === "system") setTheme(id);
        }} />
    </div>
  </section>;
}
