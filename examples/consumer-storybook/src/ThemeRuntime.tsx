import { useEffect, useState, type ReactNode } from 'react';
import { createThemeConfigController, type ThemeConfigSnapshot } from '@hito-ds/react/theme-config';
import { themeConfig } from './theme-config';
import { fontReady } from './font-registration';
export function ThemeRuntime({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<ThemeConfigSnapshot>();
  useEffect(() => {
    const controller = createThemeConfigController(document.documentElement, { fontReady }, { onChange: setSnapshot });
    void controller.apply(themeConfig);
    return () => controller.dispose();
  }, [themeConfig]);
  return <><output aria-label="Theme configuration status" data-theme-status={snapshot?.primary.status}>
    {snapshot ? `Primary: ${snapshot.primary.status}; base font: ${snapshot.fonts.base.status}` : 'Applying theme'}
  </output>{children}</>;
}
