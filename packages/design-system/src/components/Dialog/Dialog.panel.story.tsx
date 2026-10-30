import { useEffect, useRef, useState } from "react";
import { Button } from "../Button/Button";
import { Tag } from "../Tag/Tag";
import { Menu } from "../Menu/Menu";
import { Text } from "../Text/Text";
import { Dialog } from "./Dialog";

export function PanelExample() {
  const [open, setOpen] = useState(false), [nested, setNested] = useState(false), [mobile, setMobile] = useState(false), [menuOpen, setMenuOpen] = useState(false);
  const opener = useRef<HTMLButtonElement>(null), nestedOpener = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const media = matchMedia("(max-width: 63.999rem)"), update = () => setMobile(media.matches);
    update(); media.addEventListener("change", update); return () => media.removeEventListener("change", update);
  }, []);
  const size = mobile ? "lg" : "md";
  return <>
    <Button ref={opener} variant="primary" intent="neutral" onClick={() => setOpen(true)}>Open panel</Button>
    <Dialog open={open} presentation="side-panel" title="Details" returnFocusRef={opener} onDismiss={() => setOpen(false)}>
      <Dialog.Header closeLabel="Close panel" closeSize={size} titleAdornment={<Tag size="sm" label="Draft" />}
        actions={<Button size={size} variant="ghost" intent="neutral" icon="controls/more" aria-label="Panel actions" />} />
      <Dialog.Body>
        <Menu open={menuOpen} onOpenChange={setMenuOpen} label="Nested actions"
          trigger={<Button ref={nestedOpener} size={size} variant="secondary" intent="neutral">Nested actions</Button>}
          items={[{ id: "open", label: "Open nested dialog" }]} onAction={() => setNested(true)} />
        <Button size={size} variant="ghost" intent="neutral" onClick={() => { setOpen(false); requestAnimationFrame(() => setOpen(true)); }}>Reopen during exit</Button>
        {Array.from({ length: 20 }, (_, index) => <Text key={index}>Scrollable detail {index + 1}</Text>)}
      </Dialog.Body>
      <Dialog.Footer><Button size={size} variant="secondary" intent="neutral" onClick={() => setOpen(false)}>Done</Button></Dialog.Footer>
    </Dialog>
    <Dialog open={nested} title="Nested details" returnFocusRef={nestedOpener} onDismiss={() => setNested(false)}>
      <Dialog.Header closeLabel="Close nested dialog" /><Dialog.Body>Return to the same panel.</Dialog.Body>
    </Dialog>
  </>;
}
