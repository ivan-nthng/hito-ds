import { describe, expect, it } from "vitest";
import { legacyBookmark } from "./legacy-bookmark";
describe("legacy Storybook bookmarks", () => {
  it("keeps a fixed destination and only permitted Storybook values", () => {
    const result = legacyBookmark("?path=/story/actions-button--default&globals=colorScheme:dark&args=size:lg&redirect=https://example.com");
    const url = new URL(result!, "https://hito.test");
    expect(url.origin).toBe("https://hito.test");
    expect(url.pathname).toBe("/storybook/");
    expect(url.searchParams.get("path")).toBe("/story/actions-button--default");
    expect(url.searchParams.get("globals")).toBe("colorScheme:dark");
    expect(url.searchParams.get("args")).toBe("size:lg");
    expect(url.searchParams.has("redirect")).toBe(false);
    expect(legacyBookmark("?path=/docs/actions-button--docs")).not.toBeNull();
  });
  it.each(["", "?path=//evil.test", "?path=https://evil.test", "?path=javascript:alert(1)", "?path=/story/../secret", "?path=/story/%2f%2fevil.test", "?path=/story/good--default&path=/story/other--default", "?path=/assets/missing.js"])("rejects unsafe/ambiguous or unrelated query %s", query => {
    expect(legacyBookmark(query)).toBeNull();
  });
});
