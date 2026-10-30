import { render, screen, fireEvent, act, within } from "@testing-library/react";
import { beforeAll, describe, it, expect, vi } from "vitest";
import { Field } from "../Field/Field";
import { Combobox } from "./Combobox";
const options = [{value:"sp",label:"São Paulo"},{value:"off",label:"Blocked",disabled:true},{value:"a",label:"Santa Maria",description:"Brazil"},{value:"b",label:"Santa Maria",description:"Portugal"}];
const base = {options,label:"City",clearLabel:"Clear",closeLabel:"Close",emptyLabel:"No results"};
beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  HTMLElement.prototype.showPopover = function () {
    this.style.display = "block";
  };
  HTMLElement.prototype.hidePopover = vi.fn();
});

const input = () => screen.getByRole("combobox") as HTMLInputElement;
const key = (key: string, rest = {}) => fireEvent.keyDown(input(), {key,...rest});
const type = (value: string) => fireEvent.change(input(), {target:{value}});
describe("Combobox", () => {
  it("keeps filtering and committed values label-based when the shared option carries trailing text", () => {
    const change = vi.fn(); const { container } = render(<form><Combobox {...base} name="city" defaultValue="sp" onValueChange={change} options={options.map(option => ({ ...option, trailingText: "R$65.00" }))} /></form>);
    expect(input().value).toBe("São Paulo");
    type("R$65.00"); expect(screen.getByRole("status").textContent).toBe("No results");
    type("sao"); expect(screen.getByRole("option", { name: "São Paulo R$65.00" })).toBeTruthy();
    type("Portugal"); key("Enter");
    expect(change).toHaveBeenCalledExactlyOnceWith("b"); expect(input().value).toBe("Santa Maria");
    expect(new FormData(container.querySelector("form")!).get("city")).toBe("b");
  });
  it("filters accents without committing text and commits a stable duplicate ID once", () => {
    const change=vi.fn(); render(<Combobox {...base} onValueChange={change}/>);
    type("sao"); expect(screen.getAllByRole("option")).toHaveLength(1); expect(change).not.toHaveBeenCalled();
    type("Santa"); key("ArrowDown"); key("Enter"); expect(change).toHaveBeenCalledExactlyOnceWith("b"); expect(input().value).toBe("Santa Maria");
  });
  it("cancels unmatched draft without changing selection", () => {
    const change=vi.fn(); render(<Combobox {...base} defaultValue="sp" onValueChange={change}/>);
    type("nothing"); expect(screen.getByRole("status").textContent).toBe("No results"); key("Enter"); expect(change).not.toHaveBeenCalled(); key("Escape"); expect(input().value).toBe("São Paulo");
  });
  it("clear explicitly emits empty once and preserves open or closed state", () => {
    const change=vi.fn(); render(<Combobox {...base} defaultValue="sp" onValueChange={change}/>);
    fireEvent.click(screen.getByRole("button",{name:"Clear"})); expect(change).toHaveBeenCalledExactlyOnceWith(""); expect(input().getAttribute("aria-expanded")).toBe("false");
    type("Santa"); fireEvent.click(screen.getByRole("button",{name:"Clear"})); expect(change).toHaveBeenCalledTimes(1); expect(input().getAttribute("aria-expanded")).toBe("true"); expect(screen.getAllByRole("option")).toHaveLength(4);
  });
  it("retains controlled truth when the parent rejects a change", () => {
    const change=vi.fn(); render(<Combobox {...base} value="sp" onValueChange={change}/>);
    type("Portugal");key("Enter");expect(change).toHaveBeenCalledExactlyOnceWith("b");expect(input().value).toBe("São Paulo");
  });
  it("ignores IME commit and preserves native text-navigation keys", () => {
    const change=vi.fn();render(<Combobox {...base} onValueChange={change}/>);type("Santa");
    const active=input().getAttribute("aria-activedescendant");key("Home");key("End");expect(input().getAttribute("aria-activedescendant")).toBe(active);key("Enter",{isComposing:true});expect(change).not.toHaveBeenCalled();key("Enter",{keyCode:229});expect(change).not.toHaveBeenCalled();
  });
  it("submits only the committed value and resets without an emission", async () => {
    const change=vi.fn();const {container}=render(<form><Combobox {...base} name="city" defaultValue="sp" required onValueChange={change}/></form>);const form=container.querySelector("form")!;
    type("Santa");expect(new FormData(form).get("city")).toBe("sp");key("Enter");expect(new FormData(form).get("city")).toBe("a");
    await act(async()=>form.reset());expect(input().value).toBe("São Paulo");expect(new FormData(form).get("city")).toBe("sp");expect(change).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button",{name:"Clear"}));expect(form.checkValidity()).toBe(false);expect(document.activeElement).toBe(input());
  });
  it.each(["disabled","readOnly","loading"] as const)("restricts %s", flag => {
    render(<Combobox {...base} defaultValue="sp" {...{[flag]:true}}/>);fireEvent.click(input());key("ArrowDown");expect(screen.queryByRole("listbox")).toBeNull();expect(screen.queryByRole("button",{name:"Clear"})).toBeNull();
  });
  it("skips disabled and dismisses on outside pointer/Tab", () => {
    render(<><Combobox {...base}/><button>Next</button></>);fireEvent.click(input());key("ArrowDown");expect(input().getAttribute("aria-activedescendant")).toContain("-a");key("Tab");expect(screen.queryByRole("listbox")).toBeNull();fireEvent.click(input());fireEvent.pointerDown(screen.getByRole("button",{name:"Next"}));expect(screen.queryByRole("listbox")).toBeNull();
  });
  it("does not open empty or all-disabled sources", () => {
    const {rerender}=render(<Combobox {...base} options={[]}/>);fireEvent.click(input());expect(screen.queryByRole("listbox")).toBeNull();rerender(<Combobox {...base} options={[options[1]]}/>);key("ArrowDown");expect(screen.queryByRole("listbox")).toBeNull();
  });
});

it("keeps Field error and hint inside the modal with unique local references", () => {
  const media = window.matchMedia;
  window.matchMedia = vi.fn(() => ({ matches:true, addEventListener:vi.fn(), removeEventListener:vi.fn() })) as unknown as typeof window.matchMedia;
  HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  HTMLDialogElement.prototype.close = function () { this.open = false; };
  const view = render(<Field label="City" describedBy="external-description" hint="Choose a known city" error="City is required">{({controlProps}) => <Combobox {...base} {...controlProps}/>}</Field>);
  try {
    fireEvent.click(input());
    const dialog = screen.getByRole("dialog");
    const search = within(dialog).getByRole("combobox");
    const error = within(dialog).getByText("City is required");
    const hint = within(dialog).getByText("Choose a known city");
    expect(search.getAttribute("aria-describedby")).toBe(`external-description ${error.id} ${hint.id}`);
    expect(search.getAttribute("aria-errormessage")).toBe(error.id);
    expect(document.querySelectorAll(`[id="${error.id}"]`)).toHaveLength(1);
  } finally { view.unmount(); window.matchMedia = media; }
});
