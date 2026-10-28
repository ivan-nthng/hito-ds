"use client";

import { useEffect, useRef } from "react";
import styles from "./Message.module.css";

/** The mounted empty region is populated after paint so assistive technology observes an update. */
export function LiveRegion({ text, announcement }: { text: string; announcement: "off" | "polite" | "assertive" }) {
  const region = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const element = region.current;
    if (!element) return;
    if (announcement === "off") { element.textContent = ""; return; }
    const frame = requestAnimationFrame(() => { element.textContent = text; });
    return () => cancelAnimationFrame(frame);
  }, [text, announcement]);
  return <span ref={region} className={styles.live} aria-live={announcement} aria-atomic="true"/>;
}
