import { useId, useState } from "react";
import { Avatar, Button, Checkbox, Chip, Combobox, Menu, Select, StatusBadge, Tag, Text, Tooltip } from "../components";
import { Table, TableBody, TableCaption, TableCell, TableHeader, TableHeaderCell, TableHeaderContent, TableRow, type TableDensity } from "../components/Table/Table";
import { getTableCopy } from "./table.story";
import { toggleVisibleSelection, visibleSelectionState } from "./table-selection.story";
import styles from "./table.story.module.css";

function recipeCopy(profile: unknown) {
  const table = getTableCopy(profile);
  const pt = table.lang !== "en";
  return {
    ...table,
    category: pt ? "Categoria" : "Category",
    preference: pt ? "Preferência" : "Preference",
    featured: pt ? "Em destaque" : "Featured",
    standard: pt ? "Padrão" : "Standard",
    settings: pt ? "Configurações da coluna" : "Column settings",
    info: pt ? "Informações da coluna" : "Column information",
    columnOptions: pt ? "Opções da coluna Nome" : "Name column options",
    sortName: pt ? "Ordenar por nome" : "Sort by name",
    ascending: pt ? "Ordenar A–Z" : "Sort A–Z",
    descending: pt ? "Ordenar Z–A" : "Sort Z–A",
    assign: pt ? "Atribuir" : "Assign",
    editRow: pt ? "Editar" : "Edit",
    moreRow: pt ? "Mais ações" : "More actions",
    chooseStatus: pt ? "Escolher status" : "Choose status",
    chooseOwner: pt ? "Escolher responsável" : "Choose owner",
    clearOwner: pt ? "Limpar responsável" : "Clear owner",
    closeOptions: pt ? "Fechar opções" : "Close options",
    noOwners: pt ? "Nenhum responsável" : "No owners",
    actionFeedback: pt ? "Ação de demonstração" : "Demo action",
  };
}

/** Existing Table, Menu and Button anatomy; row commands remain local demo feedback. */
export function TableBasicRecipes({ density, profile }: { density: TableDensity; profile: unknown }) {
  const copy = recipeCopy(profile);
  const captionId = useId();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sort, setSort] = useState<"none" | "ascending" | "descending">("none");
  const [feedback, setFeedback] = useState("");
  const records = [
    { id: "SA-104", name: copy.names[0], amount: 1280, status: copy.statuses[0] },
    { id: "SA-103", name: copy.names[1], amount: 845.5, status: copy.statuses[1] },
    { id: "SA-102", name: copy.names[2], amount: 320, status: copy.statuses[2] },
  ];
  if (sort !== "none") records.sort((a, b) => a.name.localeCompare(b.name, copy.locale) * (sort === "ascending" ? 1 : -1));
  return <div className={styles.example} lang={copy.lang}>
    <Table density={density} aria-labelledby={captionId}>
      <TableCaption id={captionId}>{copy.caption}</TableCaption>
      <TableHeader><TableRow>
        <TableHeaderCell content="control" aria-sort={sort}><TableHeaderContent density={density}
          trailingIcon="arrows/compact/up-down" actionLabel={`${copy.name}: ${copy.sortName}`} onAction={() => setSort(sort === "none" ? "ascending" : sort === "ascending" ? "descending" : "none")}
          help={<Tooltip content={copy.info} trigger={<Button size="sm" variant="ghost" intent="neutral" icon="controls/help" aria-label={`${copy.name}: ${copy.info}`} onClick={() => setFeedback(copy.info)} />} />}>{copy.name}</TableHeaderContent></TableHeaderCell>
        <TableHeaderCell content="control" align="center"><TableHeaderContent density={density}
          help={<Tooltip content={copy.info} trigger={<Button size="sm" variant="ghost" intent="neutral" icon="controls/help" aria-label={`${copy.status}: ${copy.info}`} onClick={() => setFeedback(copy.info)} />} />}>{copy.status}</TableHeaderContent></TableHeaderCell>
        <TableHeaderCell content="control" align="end"><TableHeaderContent density={density} leadingIcon="controls/settings"
          actionLabel={`${copy.amount}: ${copy.settings}`} onAction={() => setFeedback(copy.settings)}>{copy.amount}</TableHeaderContent></TableHeaderCell>
        <TableHeaderCell content="control"><TableHeaderContent density={density} help={<Menu label={copy.columnOptions} open={menuOpen} onOpenChange={setMenuOpen} size="sm"
          items={[{ id: "ascending", label: copy.ascending, icon: "arrows/compact/up" }, { id: "descending", label: copy.descending, icon: "arrows/compact/down" }]}
          onAction={id => setSort(id === "ascending" ? "ascending" : "descending")}
          trigger={<Button size="sm" variant="ghost" intent="neutral" icon="controls/more" aria-label={copy.columnOptions} />} />}>{copy.actions}</TableHeaderContent></TableHeaderCell>
      </TableRow></TableHeader>
      <TableBody>{records.map(row => <TableRow key={row.id} data-record-id={row.id}>
        <TableHeaderCell scope="row"><Text variant="ui-md">{row.name}</Text></TableHeaderCell>
        <TableCell content="rich" align="center"><StatusBadge size="sm" label={row.status} intent={row.id === "SA-104" ? "success" : row.id === "SA-103" ? "info" : "neutral"} icon={row.id === "SA-104" ? "general/status-check-circle" : row.id === "SA-103" ? "general/info-filled" : "general/status-dashed-circle"} /></TableCell>
        <TableCell numeric>{new Intl.NumberFormat(copy.locale, { style: "currency", currency: "BRL" }).format(row.amount)}</TableCell>
        <TableCell content="control"><div className={styles.cellActions}>
          <Button size={density === "compact" ? "sm" : "md"} variant="ghost" intent="neutral" onClick={() => setFeedback(`${copy.view}: ${row.name}`)}><Text as="span" variant="ui-md">{copy.view}</Text></Button>
          <Button size={density === "compact" ? "sm" : "md"} variant="ghost" intent="neutral" icon="general/info-filled" aria-label={`${copy.info}: ${row.name}`} onClick={() => setFeedback(`${copy.info}: ${row.name}`)} />
        </div></TableCell>
      </TableRow>)}</TableBody>
    </Table>
    <Text as="span" variant="body-sm" role="status" className={styles.muted}>{feedback ? `${copy.actionFeedback}: ${feedback}` : ""}</Text>
  </div>;
}

/** Select, Combobox, selection and explicit icon actions stay with the synthetic consumer. */
export function TableInteractiveRecipes({ density, profile }: { density: TableDensity; profile: unknown }) {
  const copy = recipeCopy(profile);
  const captionId = useId();
  const rows = [
    { id: "SA-104", name: copy.names[0] },
    { id: "SA-103", name: copy.names[1] },
  ];
  const visibleIds = rows.map(row => row.id);
  const [selected, setSelected] = useState<string[]>([]);
  const headerSelection = visibleSelectionState(selected, visibleIds);
  const [statuses, setStatuses] = useState<Record<string, string>>({ "SA-104": "ready", "SA-103": "review" });
  const [owners, setOwners] = useState<Record<string, string>>({ "SA-104": "marina", "SA-103": "alex" });
  const [feedback, setFeedback] = useState("");
  const statusOptions = [{ value: "ready", label: copy.statuses[0] }, { value: "review", label: copy.statuses[1] }, { value: "draft", label: copy.statuses[2] }];
  const ownerOptions = [{ value: "marina", label: "Marina Costa" }, { value: "alex", label: "Alex Silva" }, { value: "joao", label: "João Santos" }];
  return <div className={styles.example} lang={copy.lang}>
    <Table density={density} aria-labelledby={captionId}>
      <TableCaption id={captionId}>{copy.caption}</TableCaption>
      <TableHeader><TableRow>
        <TableHeaderCell content="control"><Checkbox size={density === "compact" ? "sm" : "base"} label={null} aria-label={copy.selectVisible} checked={headerSelection.checked} indeterminate={headerSelection.indeterminate} onChange={() => setSelected(current => toggleVisibleSelection(current, visibleIds, !visibleSelectionState(current, visibleIds).checked))} /></TableHeaderCell>
        <TableHeaderCell>{copy.name}</TableHeaderCell><TableHeaderCell>{copy.status}</TableHeaderCell><TableHeaderCell>{copy.owner}</TableHeaderCell><TableHeaderCell>{copy.actions}</TableHeaderCell>
      </TableRow></TableHeader>
      <TableBody>{rows.map((row, index) => <TableRow key={row.id} data-record-id={row.id} selected={selected.includes(row.id)}>
        <TableCell content="control"><Checkbox size={density === "compact" ? "sm" : "base"} label={null} aria-label={`${copy.select} ${row.name}`} checked={selected.includes(row.id)} onChange={event => setSelected(current => event.target.checked ? [...new Set([...current, row.id])] : current.filter(id => id !== row.id))} /></TableCell>
        <TableHeaderCell scope="row">{row.name}</TableHeaderCell>
        <TableCell content="control"><Select size={density === "compact" ? "sm" : "md"} appearance="ghost" width="hug" label={`${copy.status}: ${row.name}`} closeLabel={copy.closeOptions} options={statusOptions} value={statuses[row.id]} onValueChange={value => setStatuses(current => ({ ...current, [row.id]: value }))} /></TableCell>
        <TableCell content="control"><Combobox size={density === "compact" ? "sm" : "md"} appearance="ghost" width="hug" label={`${copy.owner}: ${row.name}`} clearLabel={copy.clearOwner} closeLabel={copy.closeOptions} emptyLabel={copy.noOwners} options={ownerOptions} value={owners[row.id]} onValueChange={value => setOwners(current => ({ ...current, [row.id]: value }))} /></TableCell>
        <TableCell content="control"><div className={styles.cellActions}>
          <Button size={density === "compact" ? "sm" : "md"} variant="ghost" intent="neutral" icon="controls/edit" aria-label={`${copy.editRow}: ${row.name}`} onClick={() => setFeedback(`${copy.editRow}: ${row.name}`)} />
          {index ? <Button size={density === "compact" ? "sm" : "md"} variant="ghost" intent="neutral" icon="controls/more" aria-label={`${copy.moreRow}: ${row.name}`} onClick={() => setFeedback(`${copy.moreRow}: ${row.name}`)} /> : null}
        </div></TableCell>
      </TableRow>)}</TableBody>
    </Table>
    <Text as="span" variant="body-sm" role="status" className={styles.muted}>{feedback ? `${copy.actionFeedback}: ${feedback}` : ""}</Text>
  </div>;
}

/** Passive Tag and interactive Chip illustrate different rich-cell semantics. */
export function TableRichRecipes({ density, profile }: { density: TableDensity; profile: unknown }) {
  const copy = recipeCopy(profile);
  const captionId = useId();
  const [featured, setFeatured] = useState<string[]>(["SA-104"]);
  const rows = [
    { id: "SA-104", name: copy.names[0], owner: "Marina Costa", initials: "MC", status: copy.statuses[0] },
    { id: "SA-103", name: copy.names[1], owner: "Alex Silva", initials: "AS", status: copy.statuses[1] },
  ];
  return <Table density={density} aria-labelledby={captionId} lang={copy.lang}>
    <TableCaption id={captionId}>{copy.caption}</TableCaption>
    <TableHeader><TableRow><TableHeaderCell>{copy.name}</TableHeaderCell><TableHeaderCell>{copy.owner}</TableHeaderCell><TableHeaderCell>{copy.status}</TableHeaderCell><TableHeaderCell>{copy.category}</TableHeaderCell><TableHeaderCell>{copy.preference}</TableHeaderCell></TableRow></TableHeader>
    <TableBody>{rows.map((row, index) => <TableRow key={row.id} data-record-id={row.id}>
      <TableHeaderCell id={`${captionId}-${row.id}`} scope="row">{row.name}</TableHeaderCell>
      <TableCell content="rich"><span className={styles.entity}><Avatar size="xs" decorative initials={row.initials} /><Text as="span" variant="ui-md">{row.owner}</Text></span></TableCell>
      <TableCell content="rich"><StatusBadge size="sm" variant="soft" label={row.status} intent={index ? "info" : "success"} icon={index ? "general/info-filled" : "general/status-check-circle"} /></TableCell>
      <TableCell content="rich"><Tag size="sm" label={index ? copy.standard : copy.featured} /></TableCell>
      <TableCell content="control"><Chip size="sm" behavior="selectable" label={copy.featured} aria-describedby={`${captionId}-${row.id}`} selected={featured.includes(row.id)} onSelectedChange={next => setFeatured(current => next ? [...new Set([...current, row.id])] : current.filter(id => id !== row.id))} /></TableCell>
    </TableRow>)}</TableBody>
  </Table>;
}
