import { createRoot } from 'react-dom/client';
import { Example } from './Example';
import { ThemeRuntime } from './ThemeRuntime';
import './global.css';
createRoot(document.getElementById('root')!).render(<ThemeRuntime><Example /></ThemeRuntime>);
