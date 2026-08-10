import { createClient, type Session } from "@supabase/supabase-js";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";

// ---------------------------------------------------------------------------
// Environment variables — safe fallbacks for boot without env config
// ---------------------------------------------------------------------------
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';

// ---------------------------------------------------------------------------
// Deep-link token extraction
// ---------------------------------------------------------------------------
// The native OAuth flow redirects to agriafrica://login-callback with tokens
// delivered either as query parameters or hash fragment, depending on the
// identity provider. We handle both formats defensively.
interface DeepLinkTokens {
  access_token: string;
  refresh_token: string;
}

function extractTokensFromUrl(url: string): DeepLinkTokens | null {
  try {
    const parsed = new URL(url);

    // 1. Try query parameters first (?access_token=...&refresh_token=...)
    let accessToken = parsed.searchParams.get("access_token");
    let refreshToken = parsed.searchParams.get("refresh_token");

    // 2. Fall back to hash fragment (#access_token=...&refresh_token=...)
    if (!accessToken || !refreshToken) {
      const hash = parsed.hash.replace(/^#\/?/, "");
      const hashParams = new URLSearchParams(hash);
      accessToken = accessToken ?? hashParams.get("access_token");
      refreshToken = refreshToken ?? hashParams.get("refresh_token");
    }

    // 3. Also handle fragment-encoded JSON (some IdPs use # {...})
    if (!accessToken || !refreshToken) {
      const rawHash = parsed.hash.slice(1);
      try {
        const jsonPayload = JSON.parse(
          decodeURIComponent(rawHash.startsWith("{") ? rawHash : "")
        );
        accessToken = accessToken ?? jsonPayload?.access_token ?? null;
        refreshToken = refreshToken ?? jsonPayload?.refresh_token ?? null;
      } catch {
        // Not JSON-encoded — ignore
      }
    }

    if (accessToken && refreshToken) {
      return { access_token: accessToken, refresh_token: refreshToken };
    }
  } catch {
    // Malformed URL — ignore silently
  }
  return null;
}

// ---------------------------------------------------------------------------
// Capacitor-aware storage adapter
// ---------------------------------------------------------------------------
// On native platforms, Capacitor polyfills localStorage to the Preferences
// plugin. We wrap it in try/catch to handle quota and serialization errors
// that can occur on low-memory devices.
function createCapacitorStorage() {
  return {
    getItem: (key: string): Promise<string | null> => {
      try {
        return Promise.resolve(localStorage.getItem(key));
      } catch {
        return Promise.resolve(null);
      }
    },
    setItem: (key: string, value: string): Promise<void> => {
      try {
        localStorage.setItem(key, value);
      } catch {
        // Storage full — silently degrade (session won't persist across restarts)
      }
      return Promise.resolve();
    },
    removeItem: (key: string): Promise<void> => {
      try {
        localStorage.removeItem(key);
      } catch {
        // Ignore cleanup errors
      }
      return Promise.resolve();
    },
  };
}

// ---------------------------------------------------------------------------
// Build the Supabase client
// ---------------------------------------------------------------------------
function buildSupabaseClient() {
  const isNative = Capacitor.isNativePlatform();

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      // Native: manual token management via deep links — disable auto-refresh
      // to avoid race conditions with Capacitor's URL interception.
      // Web: standard PKCE flow with automatic token refresh.
      autoRefreshToken: !isNative,
      persistSession: true,
      detectSessionInUrl: !isNative,

      // On native, use our custom adapter. On web, Supabase defaults to
      // window.localStorage which is fine.
      ...(isNative ? { storage: createCapacitorStorage() } : {}),
    },

    // Global request options — reasonable defaults for mobile networks
    global: {
      headers: {
        "X-Client-Info": `agriafrica-mobile/${isNative ? "capacitor" : "web"}`,
      },
    },
  });
}

export const supabase = buildSupabaseClient();

// ---------------------------------------------------------------------------
// Native deep-link bootstrap
// ---------------------------------------------------------------------------
// Call once at app startup (in main.tsx). Registers a listener for
// appUrlOpen events that intercepts agriafrica:// deep links carrying
// OAuth tokens, then restores the Supabase session without relying on
// window.location (which doesn't work in Capacitor native context).
//
// Returns a cleanup function for testing — in production the listener
// lives for the entire app lifetime.
let deepLinkListenerHandle: { remove: () => Promise<void> } | null = null;

export async function initializeNativeAuth(): Promise<() => Promise<void>> {
  if (!Capacitor.isNativePlatform()) {
    return async () => {};
  }

  try {
    // Remove any existing listener to prevent duplicates on hot reload
    if (deepLinkListenerHandle) {
      await deepLinkListenerHandle.remove();
      deepLinkListenerHandle = null;
    }

    deepLinkListenerHandle = await App.addListener(
      "appUrlOpen",
      async (event) => {
        console.log("[Supabase] Deep link received:", event.url);

        const tokens = extractTokensFromUrl(event.url);
        if (!tokens) {
          console.warn("[Supabase] Deep link URL has no tokens:", event.url);
          return;
        }

        try {
          const { data, error } = await supabase.auth.setSession({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
          });

          if (error) {
            console.error(
              "[Supabase] Session restore failed:",
              error.message
            );
            return;
          }

          const user = data.session?.user;
          console.log(
            "[Supabase] Native session restored for",
            user?.email ?? user?.id ?? "unknown user"
          );
        } catch (err) {
          console.error("[Supabase] Unexpected session restore error:", err);
        }
      }
    );

    console.log("[Supabase] Deep link listener registered");
  } catch (err) {
    console.error("[Supabase] Native auth init failed:", err);
  }

  // Return cleanup function
  return async () => {
    if (deepLinkListenerHandle) {
      await deepLinkListenerHandle.remove();
      deepLinkListenerHandle = null;
    }
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build the OAuth redirect URL for native Capacitor flow */
export function getNativeRedirectUrl(
  _provider: "google" | "apple" | "facebook"
): string {
  const scheme = "agriafrica";
  return `${scheme}://login-callback`;
}

/** Check if running as a native mobile app (Capacitor) */
export function isNativePlatform(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

/** Get the current session or null (convenience wrapper) */
export async function getCurrentSession(): Promise<Session | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch {
    return null;
  }
}
