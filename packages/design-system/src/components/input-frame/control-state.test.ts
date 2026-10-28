import { describe, expect, it } from "vitest";
import { resolveControlState } from "./control-state";

describe("resolveControlState", () => {
  it("keeps invalid ahead of success", () => {
    expect(
      resolveControlState({
        ariaInvalid: "true",
        validationState: "success",
      }),
    ).toMatchObject({
      invalid: true,
      resolvedValidationState: "invalid",
    });
  });

  it("keeps disabled ahead of loading", () => {
    expect(
      resolveControlState({ disabled: true, loading: true }),
    ).toMatchObject({
      isLoading: false,
      isReadOnly: false,
    });
  });

  it("projects loading as read-only without hiding success", () => {
    expect(
      resolveControlState({ loading: true, validationState: "success" }),
    ).toMatchObject({
      isLoading: true,
      isReadOnly: true,
      resolvedValidationState: "success",
    });
  });
});
