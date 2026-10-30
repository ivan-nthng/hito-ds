import { createRef, useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Checkbox } from "../Checkbox/Checkbox";
import { Radio } from "../Radio/Radio";
import { Switch } from "../Switch/Switch";
import { Fieldset } from "../Fieldset/Fieldset";

describe("native choice controls", () => {
  it("submits native values, resets defaults and forwards the input ref", async () => {
    const ref = createRef<HTMLInputElement>();
    const { container } = render(
      <form>
        <Checkbox
          ref={ref}
          name="policy"
          value="accepted"
          label="Policy"
          defaultChecked
        />
        <Switch label="Updates" name="updates" />
        <button type="reset">Reset</button>
      </form>,
    );
    const user = userEvent.setup();
    expect(ref.current).toBe(screen.getByRole("checkbox", { name: "Policy" }));
    expect(new FormData(container.querySelector("form")!).get("policy")).toBe(
      "accepted",
    );
    await user.click(screen.getByText("Policy"));
    expect((ref.current as HTMLInputElement).checked).toBe(false);
    await user.click(screen.getByText("Updates"));
    expect(new FormData(container.querySelector("form")!).get("updates")).toBe(
      "on",
    );
    await user.click(screen.getByText("Reset"));
    expect((ref.current as HTMLInputElement).checked).toBe(true);
    expect((screen.getByRole("switch") as HTMLInputElement).checked).toBe(
      false,
    );
  });
  it("supports controlled state, label clicks and Space", async () => {
    function Example() {
      const [checked, setChecked] = useState(false);
      return (
        <Switch
          label="Pause"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
      );
    }
    render(<Example />);
    const user = userEvent.setup();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("switch"));
    await user.keyboard(" ");
    expect((screen.getByRole("switch") as HTMLInputElement).checked).toBe(true);
    await user.click(screen.getByText("Pause"));
    expect((screen.getByRole("switch") as HTMLInputElement).checked).toBe(
      false,
    );
  });
  it("projects mixed state on the native checkbox and clears on activation", async () => {
    const { rerender } = render(<Checkbox label="All zones" indeterminate />);
    expect(
      (screen.getByRole("checkbox") as HTMLInputElement).indeterminate,
    ).toBe(true);
    await userEvent.click(screen.getByRole("checkbox"));
    expect(
      (screen.getByRole("checkbox") as HTMLInputElement).indeterminate,
    ).toBe(false);
    rerender(<Checkbox label="All zones" indeterminate={false} />);
    expect(
      (screen.getByRole("checkbox") as HTMLInputElement).indeterminate,
    ).toBe(false);
  });
  it("inherits fieldset disabled state without intercepting native behavior", async () => {
    render(
      <Fieldset legend="Locked" disabled>
        <Checkbox label="Policy" defaultChecked />
        <Switch label="Alerts" defaultChecked />
        <Radio name="locked" label="Queue" defaultChecked />
      </Fieldset>,
    );
    for (const control of [
      screen.getByRole("checkbox"),
      screen.getByRole("switch"),
      screen.getByRole("radio"),
    ]) {
      expect(control.matches(":disabled")).toBe(true);
      await userEvent.click(control);
      expect((control as HTMLInputElement).checked).toBe(true);
    }
  });
  it("keeps radio selection exclusive and propagates group error descriptions", async () => {
    render(
      <Fieldset legend="Priority" error="Choose priority">
        {({ controlProps }) => (
          <>
            <Radio
              {...controlProps}
              name="priority"
              value="standard"
              label="Standard"
              description="Usual queue"
              defaultChecked
            />
            <Radio
              {...controlProps}
              name="priority"
              value="urgent"
              label="Urgent"
            />
          </>
        )}
      </Fieldset>,
    );
    await userEvent.click(screen.getByRole("radio", { name: "Urgent" }));
    expect(
      (screen.getByRole("radio", { name: "Standard" }) as HTMLInputElement)
        .checked,
    ).toBe(false);
    expect(
      (screen.getByRole("radio", { name: "Urgent" }) as HTMLInputElement)
        .checked,
    ).toBe(true);
    expect(
      (
        screen
          .getByRole("radio", { name: "Urgent" })
          .getAttribute("aria-describedby") ?? ""
      )
        .split(" ")
        .map((id) => document.getElementById(id)?.textContent)
        .join(" "),
    ).toBe("Choose priority");
    expect(
      (
        screen
          .getByRole("radio", { name: "Standard" })
          .getAttribute("aria-describedby") ?? ""
      )
        .split(" ")
        .map((id) => document.getElementById(id)?.textContent)
        .join(" "),
    ).toBe("Choose priority Usual queue");
  });
  it("preserves caller descriptions and native required validity", () => {
    render(
      <>
        <p id="hint">External hint</p>
        <Checkbox
          label="Consent"
          description="Required before continuing"
          aria-describedby="hint"
          required
        />
      </>,
    );
    const input = screen.getByRole("checkbox") as HTMLInputElement;
    expect(
      (input.getAttribute("aria-describedby") ?? "")
        .split(" ")
        .map((id) => document.getElementById(id)?.textContent)
        .join(" "),
    ).toBe("External hint Required before continuing");
    expect(input.checkValidity()).toBe(false);
    fireEvent.click(input);
    expect(input.checkValidity()).toBe(true);
  });
});
