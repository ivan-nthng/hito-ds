const normalize = (text: string) => text.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase();

export function findTypeaheadMatch(labels: readonly string[], typed: string, current: number) {
  const query = normalize(typed);
  const repeated = [...query].every(letter => letter === query[0]);
  const prefix = repeated ? query[0] : query;
  if (!prefix) return -1;
  const start = repeated ? current + 1 : Math.max(0, current);
  for (let offset = 0; offset < labels.length; offset++) {
    const index = (start + offset) % labels.length;
    if (normalize(labels[index]).startsWith(prefix)) return index;
  }
  return -1;
}
