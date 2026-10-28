/** Selection belongs to the demo consumer. Only rows currently rendered on this page are in scope. */
export function visibleSelectionState(selected: readonly string[], visible: readonly string[]) {
  const selectedIds = new Set(selected);
  const selectedVisible = visible.filter(id => selectedIds.has(id)).length;
  return {
    checked: visible.length > 0 && selectedVisible === visible.length,
    indeterminate: selectedVisible > 0 && selectedVisible < visible.length,
  };
}

export function toggleVisibleSelection(selected: readonly string[], visible: readonly string[], select: boolean) {
  const visibleIds = new Set(visible);
  return select
    ? [...new Set([...selected, ...visible])]
    : selected.filter(id => !visibleIds.has(id));
}
