import { Button } from "../Button/Button";
import { Text } from "../Text/Text";
import { getStoryContent } from "../../storybook/story-content";
import { Tooltip } from "./Tooltip";
import styles from "./Tooltip.story.module.css";

export function tooltipCopy(profile: unknown, long = false) {
  const pt = getStoryContent(profile).lang === "pt-BR";
  return {
    help: pt ? "Sobre as alterações" : "About changes",
    tip: pt ? "As alterações afetam apenas este exemplo. Nenhum dado real será atualizado ou compartilhado." : long ? "Changes apply only to this example. No real data will be updated or shared with anyone." : "Changes apply only to this example.",
    next: pt ? "Próxima ação" : "Next action",
  };
}
export type TooltipStoryArgs = { copy: "short" | "long"; anchor: "start" | "end" };
export function TooltipExample({ copy: copyLength, anchor, profile }: TooltipStoryArgs & { profile: unknown }) {
  const copy = tooltipCopy(profile, copyLength === "long");
  return <div className={styles.example}>
    <div className={styles.stage} data-edge={anchor}>
      <Tooltip content={copy.tip} trigger={<Button size="sm" variant="ghost" intent="neutral" leadingIcon="general/info-filled">{copy.help}</Button>} />
    </div>
    <Text variant="body-sm" className={styles.touchHelp} data-tooltip-support="">{copy.tip}</Text>
    <Button size="sm" variant="ghost" intent="neutral">{copy.next}</Button>
  </div>;
}
