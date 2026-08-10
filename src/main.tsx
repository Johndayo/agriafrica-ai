import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "@/App";
import { initializeNativeAuth } from "@/integrations/supabase/client";
import "@/styles/global.css";

// ---------------------------------------------------------------------------
// Body bootstrap — native mobile constraints
// ---------------------------------------------------------------------------
function bootstrapBody() {
  const body = document.body;
  body.style.backgroundColor = "#0A1128";
  body.style.color = "#FFFFFF";
  body.style.margin = "0";
  body.style.padding = "0";
  body.style.overflow = "hidden";
  body.style.position = "fixed";
  body.style.width = "100%";
  body.style.height = "100%";
  body.style.userSelect = "none";
  body.style.webkitUserSelect = "none";
  body.style.overscrollBehavior = "none";
  (body.style as unknown as Record<string, string>)["webkitOverflowScrolling"] = "touch";
}

// ---------------------------------------------------------------------------
// Root boot sequence
// ---------------------------------------------------------------------------
function boot() {
  // 1. Apply native mobile body constraints
  bootstrapBody();

  // 2. Register Capacitor deep-link interceptors
  initializeNativeAuth().catch((err) => {
    console.error("[Boot] Native auth init failed:", err);
  });

  // 3. Mount React app
  const root = document.getElementById("root");
  if (!root) {
    throw new Error("Root element #root not found in HTML");
  }

  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

// ---------------------------------------------------------------------------
// DOM ready guard
// ---------------------------------------------------------------------------
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
