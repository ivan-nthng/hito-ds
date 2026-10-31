import { createRoot } from "react-dom/client";
import "@hito-ds/react/tokens.css";
import "@hito-ds/react/base.css";
import "./fonts.css";
import { App } from "./App";
import { legacyBookmark } from "./legacy-bookmark";

const bookmark = legacyBookmark(window.location.search);
if (bookmark) window.location.replace(bookmark);
else createRoot(document.getElementById("root")!).render(<App />);
