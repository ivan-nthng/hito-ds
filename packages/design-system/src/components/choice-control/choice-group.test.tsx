import { createRef, useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CheckboxGroup } from "../CheckboxGroup/CheckboxGroup";
import { RadioGroup } from "../RadioGroup/RadioGroup";

const options = [
  { value: "a", label: "Alpha", description: "First option" },
  { value: "b", label: "Beta" },
  { value: "c", label: "Locked", disabled: true },
];
const input = (name: string) => screen.getByLabelText(name) as HTMLInputElement;
describe("Choice groups", () => {
  it("submits multiple values and restores defaults without stale state after reset", async () => {
    const changed = vi.fn(),
      ref = createRef<HTMLFieldSetElement>();
    const { container } = render(
      <form>
        <CheckboxGroup
          ref={ref}
          legend="Updates"
          name="updates"
          options={options}
          defaultValue={["a"]}
          onValueChange={changed}
        />
        <button type="reset">Reset</button>
      </form>,
    );
    await userEvent.click(input("Beta"));
    expect(changed.mock.calls.at(-1)?.[0]).toEqual(["a", "b"]);
    expect(
      new FormData(container.querySelector("form")!).getAll("updates"),
    ).toEqual(["a", "b"]);
    await userEvent.click(screen.getByText("Reset"));
    expect(input("Alpha").checked).toBe(true);
    expect(input("Beta").checked).toBe(false);
    await userEvent.click(input("Alpha"));
    expect(changed.mock.calls.at(-1)?.[0]).toEqual([]);
    expect(ref.current).toBe(screen.getByRole("group"));
  });
  it("honors controlled CheckboxGroup proposals and keeps disabled selections", async () => {
    function Demo() {
      const [value, setValue] = useState(["c"]);
      return (
        <CheckboxGroup
          legend="Updates"
          name="updates"
          options={options}
          value={value}
          onValueChange={setValue}
        />
      );
    }
    render(<Demo />);
    await userEvent.click(input("Alpha"));
    expect(input("Alpha").checked).toBe(true);
    expect(input("Locked").checked).toBe(true);
    await userEvent.click(input("Alpha"));
    expect(input("Alpha").checked).toBe(false);
    expect(input("Locked").checked).toBe(true);
  });
  it("does not accept a controlled proposal until its parent updates", async () => {
    const change = vi.fn();
    render(
      <CheckboxGroup
        legend="Updates"
        name="updates"
        options={options}
        value={["a"]}
        onValueChange={change}
      />,
    );
    await userEvent.click(input("Beta"));
    expect(change.mock.calls[0][0]).toEqual(["a", "b"]);
    expect(input("Beta").checked).toBe(false);
  });
  it("keeps radios exclusive and resets their native default", async () => {
    const changed = vi.fn();
    const { container } = render(
      <form>
        <RadioGroup
          legend="Window"
          name="window"
          options={options}
          defaultValue="a"
          onValueChange={changed}
        />
        <button type="reset">Reset</button>
      </form>,
    );
    await userEvent.click(input("Beta"));
    expect(input("Alpha").checked).toBe(false);
    expect(changed.mock.calls[0][0]).toBe("b");
    expect(
      new FormData(container.querySelector("form")!).getAll("window"),
    ).toEqual(["b"]);
    await userEvent.click(screen.getByText("Reset"));
    expect(input("Alpha").checked).toBe(true);
    expect(input("Beta").checked).toBe(false);
  });
  it("accepts controlled RadioGroup updates", async () => {
    function Demo() {
      const [value, setValue] = useState("a");
      return (
        <RadioGroup
          legend="Window"
          name="window"
          options={options}
          value={value}
          onValueChange={setValue}
        />
      );
    }
    render(<Demo />);
    await userEvent.click(input("Beta"));
    expect(input("Beta").checked).toBe(true);
    expect(input("Alpha").checked).toBe(false);
  });
  it("forwards an external form association to each control", () => {
    render(
      <>
        <form id="external" />
        <CheckboxGroup
          legend="Updates"
          name="updates"
          form="external"
          options={options}
          defaultValue={["a", "b"]}
        />
        <RadioGroup
          legend="Window"
          name="window"
          form="external"
          options={options}
          defaultValue="b"
        />
      </>,
    );
    const data = new FormData(
      document.getElementById("external") as HTMLFormElement,
    );
    expect(data.getAll("updates")).toEqual(["a", "b"]);
    expect(data.get("window")).toBe("b");
  });
  it("inherits disabled and shares one error with every option, preserving own descriptions", () => {
    render(
      <CheckboxGroup
        legend="Updates"
        name="updates"
        options={options}
        disabled
        description="Group hint"
        error="Choose one"
        defaultValue={["a"]}
      />,
    );
    const group = screen.getByRole("group");
    expect(group.tagName).toBe("FIELDSET");
    expect(group.firstElementChild?.tagName).toBe("LEGEND");
    for (const el of screen.getAllByRole("checkbox")) {
      expect(el.matches(":disabled")).toBe(true);
      expect(el.getAttribute("aria-invalid")).toBe("true");
      const ids = el.getAttribute("aria-describedby")!.split(" ");
      expect(
        ids.map((id) => document.getElementById(id)?.textContent),
      ).toContain("Choose one");
    }
    expect(screen.getAllByText("Choose one")).toHaveLength(1);
    expect(input("Alpha").checked).toBe(true);
  });
  it("keeps card density independent of control size", () => {
    render(
      <RadioGroup
        legend="Window"
        name="window"
        options={options}
        appearance="card"
        cardSize="comfortable"
        controlSize="sm"
      />,
    );
    expect(screen.getByRole("group").dataset.size).toBe("comfortable");
    expect(input("Alpha").closest("label")?.dataset.size).toBe("sm");
  });
});
