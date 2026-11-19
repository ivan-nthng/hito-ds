import type { ThemeConfigBindings } from '@hito-ds/react/theme-config';
import type { FontCoverage } from '@hito-ds/react/fonts';
// Register only licensed application-owned faces. No fonts are downloaded by default.
// Add one row per actual face; variable faces declare their REAL weight range.
export const fontFaces: readonly {
  family: string; url: string; weight: string; coverage: FontCoverage;
}[] = [];
const registered = new Map<string, { face: FontFace; coverage: FontCoverage }>();
const ready: NonNullable<ThemeConfigBindings['fontReady']>['base'] = async ({ family, requirements, signal }) => {
  const entries = fontFaces.filter(item => item.family === family);
  if (!entries.length) return { ready: false, reason: 'No application-owned faces registered for this family.' };
  for (const item of entries) {
    const key = JSON.stringify(item);
    if (!registered.has(key)) {
      const face = new FontFace(item.family, `url(${JSON.stringify(item.url)})`, { weight: item.weight, style: 'normal' });
      document.fonts.add(face);
      registered.set(key, { face, coverage: item.coverage });
    }
  }
  const selected = entries.map(item => registered.get(JSON.stringify(item))!);
  for (const script of requirements.scripts) for (const weight of requirements.weights) {
    if (!selected.some(item => item.coverage.scripts.includes(script) && item.coverage.weights.includes(weight)))
      return { ready: false, reason: `Registered faces do not cover ${script}/${weight}.` };
  }
  if (requirements.tabularNumerals && !selected.every(item => item.coverage.tabularNumerals))
    return { ready: false, reason: 'Tabular numeral coverage is not declared.' };
  try {
    await Promise.all(selected.map(item => item.face.load()));
    return signal.aborted ? { ready: false, reason: 'Font request cancelled.' } : { ready: true };
  } catch { return { ready: false, reason: 'Registered font loading failed; fallback retained.' }; }
};
export const fontReady: ThemeConfigBindings['fontReady'] = { base: ready, display: ready, mono: ready };
