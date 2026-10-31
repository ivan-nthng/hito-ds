import { MediaBackdrop } from "@hito-ds/react";

/** Full-document paint; CSS anchors only the transparent zero-height composition origin. */
export function PageBackground() {
  return <div data-site-background=""><MediaBackdrop /></div>;
}
