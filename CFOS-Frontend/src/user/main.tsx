import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@user/app/App";
import { AppProviders } from "@user/app/providers";
import "@user/styles/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
);
