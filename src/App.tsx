import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useAppStore } from "@/store/useAppStore";
import { AppLayout } from "@/components/AppLayout";
import { DashboardSkeleton } from "@/components/SkeletonLoader";
import { type ReactNode } from "react";

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
// Auth state hook — reads session from Supabase
// ---------------------------------------------------------------------------
// TEMPORARY: Mocked for local UI design testing (no Supabase connection needed).
// Restore original hook before production build.
function useAuthSession() {
  return {
    session: { user: { id: "mock-farmer-id", email: "test-farmer@agriafrica.ai" } },
    loading: false,
    isAuthenticated: true,
  };

  // --- ORIGINAL HOOK (restore before production) ---
  // const [session, setSession] = useState<{
  //   user: { id: string; email?: string } | null;
  // } | null>(null);
  // const [loading, setLoading] = useState(true);
  //
  // useEffect(() => {
  //   supabase.auth.getSession().then(({ data: { session: s } }) => {
  //     setSession(s);
  //     setLoading(false);
  //   });
  //
  //   const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
  //     setSession(s);
  //     setLoading(false);
  //   });
  //
  //   return () => subscription.unsubscribe();
  // }, []);
  //
  // return { session, loading, isAuthenticated: !!session?.user };
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
// App — Root component with provider hierarchy
// ---------------------------------------------------------------------------
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* ---- Public auth routes ---- */}
              <Route
                path="/auth"
                element={
                  <PublicGuard>
                    <Auth />
                  </PublicGuard>
                }
              />
              <Route path="/forgot-password" element={<Placeholder title="Forgot Password" />} />
              <Route path="/reset-password" element={<Placeholder title="Reset Password" />} />

              {/* ---- Onboarding (authenticated, pre-setup) ---- */}
              <Route
                path="/onboarding"
                element={
                  <AuthGuard>
                    <Onboarding />
                  </AuthGuard>
                }
              />

              {/* ---- Authenticated app shell ---- */}
              <Route
                path="/"
                element={
                  <AuthGuard>
                    <OnboardingGuard>
                      <AppLayout />
                    </OnboardingGuard>
                  </AuthGuard>
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
        </BrowserRouter>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
