import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Table, TableBody, TableCaption, TableCell, TableHeader, TableHeaderCell, TableHeaderContent, TableRow } from "./Table";
import { Button } from "../Button/Button";

describe("Table", () => {
  it("preserves native structure, refs and cell associations inside a named scroll region", () => {
    const tableRef = createRef<HTMLTableElement>();
    const cellRef = createRef<HTMLTableCellElement>();
    const { container } = render(<Table ref={tableRef} aria-labelledby="caption" density="comfortable" data-native="table">
      <TableCaption id="caption">Records</TableCaption>
      <TableHeader><TableRow><TableHeaderCell id="name">Name</TableHeaderCell><TableHeaderCell id="amount" align="end" aria-sort="ascending">Amount</TableHeaderCell></TableRow></TableHeader>
      <TableBody><TableRow><TableHeaderCell scope="row" id="row-a">Record A</TableHeaderCell><TableCell ref={cellRef} headers="amount row-a" numeric colSpan={2} rowSpan={1}>1280</TableCell></TableRow></TableBody>
    </Table>);
    expect(tableRef.current).toBe(screen.getByRole("table", { name: "Records" }));
    expect(tableRef.current?.getAttribute("data-native")).toBe("table");
    const region = screen.getByRole("region", { name: "Records" });
    expect(region.tabIndex).toBe(0);
    expect(region.getAttribute("data-density")).toBe("comfortable");
    expect(cellRef.current?.tagName).toBe("TD");
    expect(cellRef.current?.getAttribute("headers")).toBe("amount row-a");
    expect(cellRef.current?.getAttribute("colspan")).toBe("2");
    expect(cellRef.current?.getAttribute("data-align")).toBe("end");
    expect(screen.getByRole("columnheader", { name: "Amount" }).getAttribute("scope")).toBe("col");
    expect(container.querySelector("tr[tabindex], tr[role], [role=grid]")).toBeNull();
  });

  it("leaves selection and actions to native controls without making the row interactive", () => {
    const action = vi.fn();
    const { rerender } = render(<Table aria-label="Records"><TableBody><TableRow selected highlightOnHover><TableCell><button onClick={action}>Open</button></TableCell></TableRow></TableBody></Table>);
    fireEvent.click(screen.getByRole("cell"));
    expect(action).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button"));
    expect(action).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("row").getAttribute("data-selected")).toBe("true");
    rerender(<Table aria-label="Records"><TableBody><TableRow><TableCell>Plain</TableCell></TableRow></TableBody></Table>);
    expect(screen.getByRole("row").hasAttribute("data-selected")).toBe(false);
    expect(screen.getByRole("row").hasAttribute("data-highlight")).toBe(false);
  });

  it.each(["compact", "comfortable"] as const)("keeps %s header help independent from its native action", density => {
    const sort = vi.fn(), help = vi.fn();
    const { container } = render(<Table density={density} aria-label="Records"><TableHeader><TableRow>
      <TableHeaderCell content="control" aria-sort="none"><TableHeaderContent density={density} leadingIcon="general/assets" trailingIcon="arrows/compact/up-down"
        onAction={sort} actionLabel="Sort name" help={<Button variant="ghost" intent="neutral" size="sm" icon="controls/help" aria-label="About name" onClick={help} />}>Name</TableHeaderContent></TableHeaderCell>
    </TableRow></TableHeader></Table>);
    fireEvent.click(screen.getByRole("button", { name: "About name" }));
    expect(help).toHaveBeenCalledOnce(); expect(sort).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Sort name" })); expect(sort).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("columnheader")); expect(sort).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Sort name" }).dataset.size).toBe(density === "compact" ? "sm" : "md");
    expect(container.querySelector("button button")).toBeNull();
    expect(container.querySelectorAll('[data-icon-name="arrows/compact/up-down"]')).toHaveLength(1);
  });

  it("omits absent header icons/help/action and preserves explicit native cell content modes", () => {
    const { container } = render(<Table aria-label="Records"><TableHeader><TableRow>
      <TableHeaderCell content="control" align="end"><TableHeaderContent density="compact">Name</TableHeaderContent></TableHeaderCell>
    </TableRow></TableHeader><TableBody><TableRow><TableCell content="rich">Ready</TableCell><TableCell content="control"><Button variant="ghost" intent="neutral">Open</Button></TableCell></TableRow></TableBody></Table>);
    expect(screen.getByRole("columnheader").dataset.align).toBe("end");
    expect(screen.getByRole("columnheader").querySelector("button,[data-icon-name],[tabindex]")).toBeNull();
    expect(container.querySelectorAll("td")[0].dataset.content).toBe("rich");
    expect(container.querySelectorAll("td")[1].dataset.content).toBe("control");
  });
});
