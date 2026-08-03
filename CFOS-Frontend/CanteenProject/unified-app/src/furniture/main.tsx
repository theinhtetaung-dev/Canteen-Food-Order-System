import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@furniture/app/App";
import { AppProviders } from "@furniture/app/providers";
import "@furniture/styles/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
);
