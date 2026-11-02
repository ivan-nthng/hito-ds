import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { RoundControl, RoundPlayButton } from "./Media";
it("keeps the native action/ref independent from numerical progress", async () => {
 const ref=createRef<HTMLButtonElement>(), click=vi.fn(), user=userEvent.setup();
 const {rerender}=render(<RoundPlayButton ref={ref} aria-label="Play track" progress={{value:83,max:208,valueText:"1:23 of 3:28",label:"Playback progress"}} onClick={click} />);
 expect(ref.current).toBe(screen.getByRole("button",{name:"Play track"}));expect(ref.current?.dataset.size).toBe("xl");expect(ref.current?.dataset.intent).toBe("accent");
 const progress=screen.getByRole("progressbar",{name:"Playback progress"});expect(progress.getAttribute("value")).toBe("83");expect(progress.getAttribute("max")).toBe("208");expect(progress.getAttribute("aria-valuetext")).toBe("1:23 of 3:28");
 ref.current!.focus();await user.keyboard(" ");expect(click).toHaveBeenCalledTimes(1);
 rerender(<RoundPlayButton ref={ref} aria-label="Pause track" playing disabled value="legacy-form-value" />);expect(ref.current?.value).toBe("legacy-form-value");expect(screen.queryByRole("progressbar")).toBeNull();await user.click(ref.current!);expect(click).toHaveBeenCalledTimes(1);
});
it("preserves generic native busy/disabled behavior and rejects misleading progress", async () => {
 const click=vi.fn();render(<RoundControl icon="controls/play" aria-label="Working" loading onClick={click} />);await userEvent.click(screen.getByRole("button",{name:"Working"}));expect(click).not.toHaveBeenCalled();expect(screen.getByRole("button").getAttribute("aria-busy")).toBe("true");
 const error=vi.spyOn(console,"error").mockImplementation(()=>{});
 for(const props of [{value:NaN},{value:-1},{value:101},{value:0,max:0},{value:0,max:Infinity},{value:0,valueText:""}]) expect(()=>render(<RoundControl icon="controls/play" aria-label="Invalid" progress={{valueText:"0%",...props}} />)).toThrow(/finite/);
 error.mockRestore();
});

it("submits the native form value independently of numerical progress", async () => {
 const values: Array<FormDataEntryValue | null> = [];
 const {rerender}=render(<form onSubmit={event=>{event.preventDefault();values.push(new FormData(event.currentTarget,(event.nativeEvent as SubmitEvent).submitter).get("action"));}}><RoundPlayButton type="submit" name="action" value="play" width="full" aria-label="Submit play" progress={{value:50,valueText:"Half complete"}} /></form>);
 await userEvent.click(screen.getByRole("button",{name:"Submit play"}));expect(values).toEqual(["play"]);expect(screen.getByRole("button").getAttribute("data-width")).toBe("full");expect(screen.getByRole("progressbar").getAttribute("value")).toBe("50");
 rerender(<RoundPlayButton type="submit" name="action" value={7} width="content" aria-label="Numeric native value" />);expect((screen.getByRole("button") as HTMLButtonElement).value).toBe("7");expect(screen.queryByRole("progressbar")).toBeNull();
});
