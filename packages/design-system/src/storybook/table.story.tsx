import { useId, useState } from "react";
import { Avatar, Button, Checkbox, InlineEdit, Link, ProgressBar, Spinner, StatusBadge, Text } from "../components";
import { Table, TableBody, TableCaption, TableCell, TableHeader, TableHeaderCell, TableHeaderContent, TableRow, type TableDensity } from "../components/Table/Table";
import { getStoryContent, resolveStoryContentProfile } from "./story-content";
import { toggleVisibleSelection, visibleSelectionState } from "./table-selection.story";
import styles from "./table.story.module.css";

export type TableExampleArgs = { density: TableDensity; rowHighlight: boolean; selection: boolean; editableComments: boolean };
export type TableExampleState = "data" | "loading" | "empty" | "error";

export function getTableCopy(profile: unknown) {
  const resolved = resolveStoryContentProfile(profile);
  const { lang } = getStoryContent(resolved);
  const pt = lang !== "en";
  const long = resolved.endsWith("long");
  return {
    lang, long, locale: pt ? "pt-BR" : "en-US",
    caption: pt ? "Registros de exemplo" : "Sample records",
    name: pt ? "Nome" : "Name", owner: pt ? "Responsável" : "Owner", status: "Status",
    comment: pt ? "Comentário" : "Comment", date: pt ? "Atualizado" : "Updated", amount: pt ? "Valor" : "Amount",
    actions: pt ? "Ações" : "Actions", select: pt ? "Selecionar" : "Select", selected: pt ? "selecionados" : "selected",
    selectVisible: pt ? "Selecionar registros visíveis" : "Select visible records",
    view: pt ? "Ver detalhes" : "View details", close: pt ? "Fechar detalhes" : "Close details",
    sort: pt ? "Atualizado: ordenar por data" : "Updated: sort by date",
    scroll: pt ? "Role para ver todas as colunas." : "Scroll to see all columns.",
    add: pt ? "Adicionar comentário" : "Add comment", edit: pt ? "Editar comentário" : "Edit comment",
    save: pt ? "Salvar" : "Save", cancel: pt ? "Cancelar" : "Cancel", clear: pt ? "Limpar comentário" : "Clear comment",
    saved: pt ? "Comentário salvo" : "Comment saved", saving: pt ? "Salvando comentário" : "Saving comment",
    failed: pt ? "Não foi possível salvar o comentário." : "The comment could not be saved.",
    loading: pt ? "Carregando registros…" : "Loading records…", empty: pt ? "Nenhum registro" : "No records yet",
    error: pt ? "Não foi possível carregar os registros." : "Records could not be loaded.", retry: pt ? "Tentar novamente" : "Try again",
    hint: pt ? "Clique no comentário para editar. Ctrl / ⌘ + Enter salva; Esc cancela. As alterações ficam nesta demonstração." : "Click a comment to edit. Ctrl / ⌘ + Enter saves; Esc cancels. Changes stay in this demonstration.",
    names: pt ? long ? ["Materiais e referências para o novo estúdio de criação", "Catálogo sazonal de produtos e apresentações da equipe", "Planejamento semanal de atividades e responsabilidades"] : ["Materiais do estúdio", "Catálogo sazonal", "Planejamento semanal"] : long ? ["Materials and references for the new creative studio", "Seasonal product catalogue and team presentations", "Weekly planning for activities and responsibilities"] : ["Studio materials", "Seasonal catalogue", "Weekly planning"],
    comments: [pt ? long ? "Mantenha as imagens de referência junto com a apresentação final para a revisão de toda a equipe." : "Pronto para revisão." : long ? "Keep the reference images together with the final presentation for the whole team to review." : "Ready for review.", pt ? "Revisar a imagem da capa.\nManter os arquivos originais." : "Check the cover image.\nKeep the original files.", ""],
    statuses: pt ? ["Pronto", "Em análise", "Rascunho"] : ["Ready", "In review", "Draft"],
    contact: pt ? "Contato" : "Contact", unavailable: pt ? "Não informado" : "Not provided",
    progress: pt ? "Progresso" : "Progress", steps: pt ? "Etapas concluídas" : "Completed steps", of: pt ? "de" : "of",
  };
}

type Copy = ReturnType<typeof getTableCopy>;
export function commentActionName(value: string, name: string, copy: Copy) {
  return value ? `${copy.edit}: ${name}. ${value}`.replace(/\s+/g, " ") : `${copy.add}: ${name}`;
}
type CommentProps = { value: string; name: string; copy: Copy; onCommit: (value: string) => void | Promise<void> };

/** Cell-specific copy only; InlineEdit owns geometry, controls and editing behavior. */
export function TableComment({ value, name, copy, onCommit }: CommentProps) {
  return <InlineEdit
    data-comment=""
    kind="body"
    bodySize="md"
    multiline
    width="hug"
    label={`${copy.comment}: ${name}`}
    editLabel={commentActionName(value, name, copy)}
    emptyActionLabel={copy.add}
    emptyValueLabel={copy.add}
    clearLabel={copy.clear}
    saveLabel={copy.save}
    cancelLabel={copy.cancel}
    savedLabel={copy.saved}
    savingLabel={copy.saving}
    commitErrorMessage={copy.failed}
    showSaveAction
    showCancelAction
    value={value}
    onCommit={onCommit}
  />;
}

export function TableExample({ density, rowHighlight, selection, editableComments, profile, state = "data", rejectCommit = false }: TableExampleArgs & { profile: unknown; state?: TableExampleState; rejectCommit?: boolean }) {
  const copy = getTableCopy(profile);
  const captionId = useId();
  const hintId = useId();
  const detailsId = useId();
  const [sort, setSort] = useState<"none" | "ascending" | "descending">("none");
  const [selected, setSelected] = useState<string[]>([]);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [details, setDetails] = useState<string | null>(null);
  const [retried, setRetried] = useState(false);
  const currentState = state === "error" && retried ? "data" : state;
  const rows = [
    { id: "SA-104", name: copy.names[0], owner: "Marina Costa", initials: "MC", date: "2026-09-16", amount: 1280, index: 0 },
    { id: "SA-103", name: copy.names[1], owner: "Alex Silva", initials: "AS", date: "2026-09-15", amount: 845.5, index: 1 },
    { id: "SA-102", name: copy.names[2], owner: "João Santos", initials: "JS", date: "2026-09-14", amount: 320, index: 2 },
  ];
  if (sort !== "none") rows.sort((a, b) => a.date.localeCompare(b.date) * (sort === "ascending" ? 1 : -1));
  const visibleIds = currentState === "data" ? rows.map(row => row.id) : [];
  const headerSelection = visibleSelectionState(selected, visibleIds);
  return <div className={styles.example} lang={copy.lang}>
    <Table density={density} aria-labelledby={captionId} aria-describedby={hintId} aria-busy={currentState === "loading"}>
      <TableCaption id={captionId}>{copy.caption}</TableCaption>
      <TableHeader><TableRow>
        {selection ? <TableHeaderCell content="control"><Checkbox size={density === "compact" ? "sm" : "base"} label={null} aria-label={copy.selectVisible} disabled={!visibleIds.length} checked={headerSelection.checked} indeterminate={headerSelection.indeterminate} onChange={() => setSelected(current => toggleVisibleSelection(current, visibleIds, !visibleSelectionState(current, visibleIds).checked))} /></TableHeaderCell> : null}
        <TableHeaderCell>{copy.name}</TableHeaderCell><TableHeaderCell>{copy.owner}</TableHeaderCell><TableHeaderCell>{copy.status}</TableHeaderCell>
        <TableHeaderCell>{copy.comment}</TableHeaderCell>
        <TableHeaderCell content="control" aria-sort={sort}><TableHeaderContent density={density} actionLabel={copy.sort}
          trailingIcon="arrows/compact/up-down" onAction={() => setSort(sort === "none" ? "ascending" : sort === "ascending" ? "descending" : "none")}>
          {copy.date}
        </TableHeaderContent></TableHeaderCell>
        <TableHeaderCell align="end">{copy.amount}</TableHeaderCell><TableHeaderCell><span className={styles.srOnly}>{copy.actions}</span></TableHeaderCell>
      </TableRow></TableHeader>
      <TableBody>{currentState !== "data" ? <TableRow><TableCell colSpan={selection ? 8 : 7}>
        <div className={styles.state} role={currentState === "error" ? "alert" : "status"}>
          <div className={styles.entity}>{currentState === "loading" ? <Spinner size="sm" /> : null}<Text variant="body-sm">{copy[currentState]}</Text></div>
          {currentState === "error" ? <Button variant="secondary" intent="neutral" size="sm" onClick={() => setRetried(true)}>{copy.retry}</Button> : null}
        </div>
      </TableCell></TableRow> : rows.map(row => {
        const key = `${resolveStoryContentProfile(profile)}:${row.id}`;
        const comment = comments[key] ?? copy.comments[row.index];
        return <TableRow key={row.id} data-record-id={row.id} highlightOnHover={rowHighlight} selected={selection && selected.includes(row.id)}>
          {selection ? <TableCell content="control"><Checkbox size={density === "compact" ? "sm" : "base"} label={null} aria-label={`${copy.select} ${row.name}`} checked={selected.includes(row.id)} onChange={event => setSelected(current => event.target.checked ? [...current, row.id] : current.filter(id => id !== row.id))} /></TableCell> : null}
          <TableHeaderCell scope="row"><div className={styles.name}><Link size="sm" href={`#${detailsId}`} onClick={() => setDetails(row.name)}>{row.name}</Link><Text as="span" variant="body-sm" className={styles.muted}>{row.id}</Text></div></TableHeaderCell>
          <TableCell content="rich"><span className={styles.entity}><Avatar size="xs" decorative initials={row.initials} /><Text as="span" variant="body-sm" className={styles.owner}>{row.owner}</Text></span></TableCell>
          <TableCell content="rich"><span className={styles.status}><StatusBadge size="sm" variant="soft" label={copy.statuses[row.index]} intent={row.index === 0 ? "success" : row.index === 1 ? "info" : "neutral"} icon={row.index === 0 ? "general/status-check-circle" : row.index === 1 ? "general/info-filled" : "general/status-dashed-circle"} /></span></TableCell>
          <TableCell><div className={styles.commentColumn}>{editableComments ? <TableComment key={key} value={comment} name={row.name} copy={copy} onCommit={async value => {
            if (rejectCommit) throw new Error(copy.failed);
            setComments(current => ({ ...current, [key]: value }));
          }} /> : <Text variant="body-sm" className={styles.commentText}>{comment || copy.unavailable}</Text>}</div></TableCell>
          <TableCell><Text as="span" variant="data-sm" className={styles.nowrap}><time dateTime={row.date}>{new Intl.DateTimeFormat(copy.locale, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${row.date}T12:00:00Z`))}</time></Text></TableCell>
          <TableCell numeric>{new Intl.NumberFormat(copy.locale, { style: "currency", currency: "BRL" }).format(row.amount)}</TableCell>
          <TableCell content="control"><Button className={styles.nowrap} variant="ghost" intent="neutral" size={density === "compact" ? "sm" : "md"} aria-label={`${copy.view}: ${row.name}`} aria-controls={detailsId} onClick={() => setDetails(row.name)}><Text as="span" variant="ui-md">{copy.view}</Text></Button></TableCell>
        </TableRow>;
      })}</TableBody>
    </Table>
    <div className={styles.footer}><Text as="span" variant="body-sm" aria-live="polite">{selection ? `${selected.length} ${copy.selected}` : null}</Text><Text as="span" variant="body-sm" id={hintId} className={styles.muted}>{copy.scroll}</Text></div>
    {editableComments ? <Text variant="body-sm" className={styles.muted}>{copy.hint}</Text> : null}
    <div id={detailsId} aria-live="polite">{details ? <div className={styles.actions}><Text variant="body-sm">{details}</Text><Button variant="ghost" intent="neutral" size="sm" icon="controls/close-s" aria-label={copy.close} onClick={() => setDetails(null)} /></div> : null}</div>
  </div>;
}

export function TableCellPatterns({ density, profile }: { density: TableDensity; profile: unknown }) {
  const copy = getTableCopy(profile);
  const id = useId();
  return <Table density={density} aria-labelledby={id} lang={copy.lang}>
    <TableCaption id={id}>{copy.contact}</TableCaption>
    <TableHeader><TableRow><TableHeaderCell>{copy.name}</TableHeaderCell><TableHeaderCell>{copy.contact}</TableHeaderCell><TableHeaderCell>{copy.progress}</TableHeaderCell><TableHeaderCell align="end">{copy.amount}</TableHeaderCell></TableRow></TableHeader>
    <TableBody><TableRow><TableHeaderCell scope="row"><div className={styles.stack}><Text variant="body-sm">Marina Costa</Text><Text variant="body-sm" className={styles.muted}>{copy.long ? "Equipe de coordenação · Coordination team" : "MC-104"}</Text></div></TableHeaderCell><TableCell><div className={styles.stack}><Link size="sm" href="mailto:marina@example.com">marina@example.com</Link><Link size="sm" href="tel:+5511999990104">+55 11 99999 0104</Link></div></TableCell><TableCell><ProgressBar className={styles.progressColumn} label={copy.steps} value={3} max={5} valueText={`3 ${copy.of} 5`} /></TableCell><TableCell numeric>{new Intl.NumberFormat(copy.locale).format(1280)}</TableCell></TableRow>
    <TableRow><TableHeaderCell scope="row">Alex Silva</TableHeaderCell><TableCell><Text variant="body-sm" className={styles.muted}>{copy.unavailable}</Text></TableCell><TableCell><ProgressBar className={styles.progressColumn} label={copy.steps} value={0} max={5} valueText={`0 ${copy.of} 5`} /></TableCell><TableCell numeric>0</TableCell></TableRow></TableBody>
  </Table>;
}
