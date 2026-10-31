import { useLayoutEffect, useRef } from "react";
import { MediaBackdrop } from "@hito-ds/react";

/** Ordinary document paint: never a native fixed/sticky viewport-constrained layer. */
export function PageBackground() {
  const carrier = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const anchor = carrier.current?.querySelector<HTMLElement>("[data-media-anchor]");
    if (!anchor) return;
    const viewport = window.visualViewport;
    let lastOffset: number | undefined;
    function sync() {
      const offset = window.scrollY + (viewport?.offsetTop ?? 0);
      if (anchor && offset !== lastOffset) {
        anchor.style.transform = `translate3d(0, ${offset}px, 0)`;
        lastOffset = offset;
      }
    }
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync, { passive: true });
    viewport?.addEventListener("scroll", sync, { passive: true });
    viewport?.addEventListener("resize", sync, { passive: true });
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      viewport?.removeEventListener("scroll", sync);
      viewport?.removeEventListener("resize", sync);
    };
  }, []);
  return <div ref={carrier} data-site-background=""><MediaBackdrop /></div>;
}
