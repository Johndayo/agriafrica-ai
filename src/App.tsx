import { lazy, Suspense, useState, useEffect, Component, type ReactNode, type ErrorInfo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useAppStore } from "@/store/useAppStore";
import { supabase, initializeNativeAuth } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { DashboardSkeleton } from "@/components/SkeletonLoader";

// ---------------------------------------------------------------------------
// Lazy-loaded pages — code-split for fast initial bundle
// ---------------------------------------------------------------------------
const Auth = lazy(() => import("@/pages/Auth"));
const Onboarding = lazy(() => import("@/pages/Onboarding"));
const HomePage = lazy(() => import("@/pages/HomePage"));
const AskAI = lazy(() => import("@/pages/AskAI"));
const Learn = lazy(() => import("@/pages/Learn"));
const Consult = lazy(() => import("@/pages/Consult"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const Settings = lazy(() => import("@/pages/Settings"));

// Placeholder pages for routes not yet implemented
const Placeholder = ({ title }: { title: string }) => (
  <div className="page-container" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
    <p style={{ color: "var(--text-muted)", fontSize: 16 }}>{title}</p>
  </div>
);

// ---------------------------------------------------------------------------
// Query client — singleton, stable reference
// ---------------------------------------------------------------------------
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// ---------------------------------------------------------------------------
// Suspense boundary with skeleton fallback
// ---------------------------------------------------------------------------
function PageLoader() {
  return (
    <div className="page-container">
      <DashboardSkeleton />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Error boundary — catches rendering crashes per route
// ---------------------------------------------------------------------------
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="page-container flex flex-col items-center justify-center gap-4 p-6 text-center">
            <p className="text-lg font-semibold text-[#1A1A2E]">Something went wrong</p>
            <p className="text-sm text-gray-500">{this.state.error?.message}</p>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, error: null })}
              className="h-12 px-6 bg-[#00A600] hover:bg-[#009400] text-white rounded-xl font-semibold text-sm transition-all min-h-[48px]"
            >
              Try Again
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// Auth state hook — reads session from Supabase
// ---------------------------------------------------------------------------
function useAuthSession() {
  const [session, setSession] = useState<{
    user: { id: string; email?: string } | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { session, loading, isAuthenticated: !!session?.user };
}

// ---------------------------------------------------------------------------
// Route guards
// ---------------------------------------------------------------------------

// AuthGuard: Redirects to /auth if not authenticated
function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuthSession();

  if (loading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/auth" replace />;

  return <>{children}</>;
}

// OnboardingGuard: Forces /onboarding if onboarding incomplete
function OnboardingGuard({ children }: { children: ReactNode }) {
  const onboarding_complete = useAppStore((s) => s.onboarding_complete);
  const location = useLocation();

  // Allow access to /onboarding itself to prevent redirect loops
  if (location.pathname === "/onboarding") return <>{children}</>;

  if (!onboarding_complete) return <Navigate to="/onboarding" replace />;

  return <>{children}</>;
}

// PublicGuard: Redirects authenticated users away from auth pages
function PublicGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuthSession();
  const onboarding_complete = useAppStore((s) => s.onboarding_complete);

  if (loading) return <PageLoader />;
  if (isAuthenticated) {
    return <Navigate to={onboarding_complete ? "/dashboard" : "/onboarding"} replace />;
  }

  return <>{children}</>;
}

// ---------------------------------------------------------------------------
// Push notification bootstrap — registers FCM token on native platforms
// ---------------------------------------------------------------------------
function usePushNotifications() {
  useEffect(() => {
    let cancelled = false;

    async function registerPush() {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (!Capacitor.isNativePlatform()) return;

        const { PushNotifications } = await import("@capacitor/push-notifications");

        // Request permission
        const permission = await PushNotifications.requestPermissions();
        if (permission.receive !== "granted") return;

        // Register for push
        await PushNotifications.register();

        // Listen for registration token
        PushNotifications.addListener("registration", async (token: { value: string }) => {
          if (cancelled) return;
          console.log("[Push] FCM token:", token.value);

          // Persist token to Supabase
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from("user_fcm_tokens").upsert(
              { user_id: user.id, fcm_token: token.value },
              { onConflict: "user_id" }
            );
          }
        });

        // Listen for push notifications received in foreground
        PushNotifications.addListener("pushNotificationReceived", (notification: { title?: string }) => {
          console.log("[Push] Foreground notification:", notification.title);
        });

        // Listen for notification tap (open deep link or navigate)
        PushNotifications.addListener("pushNotificationActionPerformed", (action: { notification: { data?: Record<string, unknown> } }) => {
          console.log("[Push] Notification tapped:", action.notification.data);
        });
      } catch (err) {
        // Non-fatal — web or missing plugin
        console.debug("[Push] Registration skipped:", err);
      }
    }

    registerPush();
    return () => { cancelled = true; };
  }, []);
}

// ---------------------------------------------------------------------------
// App — Root component with provider hierarchy
// ---------------------------------------------------------------------------
export default function App() {
  // Bootstrap native auth (deep-link listener) on mount
  useEffect(() => {
    let cleanup: (() => Promise<void>) | null = null;
    initializeNativeAuth().then((fn) => { cleanup = fn; });
    return () => { cleanup?.(); };
  }, []);

  // Bootstrap push notifications
  usePushNotifications();

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* ---- Public auth routes ---- */}
                <Route
                  path="/auth"
                  element={
                    <ErrorBoundary>
                      <PublicGuard>
                        <Auth />
                      </PublicGuard>
                    </ErrorBoundary>
                  }
                />
                <Route path="/forgot-password" element={<Placeholder title="Forgot Password" />} />
                <Route path="/reset-password" element={<Placeholder title="Reset Password" />} />

                {/* ---- Onboarding (authenticated, pre-setup) ---- */}
                <Route
                  path="/onboarding"
                  element={
                    <ErrorBoundary>
                      <AuthGuard>
                        <Onboarding />
                      </AuthGuard>
                    </ErrorBoundary>
                  }
                />

                {/* ---- Authenticated app shell ---- */}
                <Route
                  path="/"
                  element={
                    <ErrorBoundary>
                      <AuthGuard>
                        <OnboardingGuard>
                          <AppLayout />
                        </OnboardingGuard>
                      </AuthGuard>
                    </ErrorBoundary>
                  }
                >
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<HomePage />} />
                  <Route path="ask-ai" element={<AskAI />} />
                  <Route path="learn" element={<Learn />} />
                  <Route path="knowledge" element={<Learn />} />
                  <Route path="knowledge/:slug" element={<Placeholder title="Article Detail" />} />
                  <Route path="consult" element={<Consult />} />
                  <Route path="market" element={<Placeholder title="Market Prices" />} />
                  <Route path="community" element={<Placeholder title="Community" />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="profile" element={<Placeholder title="Profile" />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="weather" element={<Placeholder title="Weather" />} />
                </Route>

                {/* ---- Catch-all redirect ---- */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </BrowserRouter>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
