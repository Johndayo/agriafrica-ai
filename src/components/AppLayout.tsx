import { Outlet } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { useToast } from "@/hooks/useToast";

// ---------------------------------------------------------------------------
// AppLayout — Root layout shell for all authenticated screens
// ---------------------------------------------------------------------------
// Provides: bottom nav, toast overlay, and a scrollable content region.
// Uses Outlet for React Router layout routes.
// ---------------------------------------------------------------------------

export function AppLayout() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="app-layout">
      {/* Toast overlay — rendered above everything */}
      <div className="toast-overlay" aria-live="polite" aria-atomic="false">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast-item toast-${t.type}`}
            role="alert"
            onClick={() => removeToast(t.id)}
          >
            <span className="toast-message">{t.message}</span>
          </div>
        ))}
      </div>

      {/* Main scrollable content — padded for bottom nav + safe area */}
      <main className="app-main">
        <Outlet />
      </main>

      {/* Fixed bottom navigation */}
      <BottomNav />
    </div>
  );
}
