import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, isNativePlatform, getNativeRedirectUrl } from "@/integrations/supabase/client";
import { useTranslation } from "@/contexts/LanguageContext";
import { Mail, Lock, Loader2, Phone } from "lucide-react";
import { Capacitor } from "@capacitor/core";

export default function Auth() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (mode === "signup") {
        const { error: authErr } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { phone },
            emailRedirectTo: isNativePlatform()
              ? getNativeRedirectUrl("google")
              : `${window.location.origin}/onboarding`,
          },
        });
        if (authErr) throw authErr;
        navigate("/onboarding");
      } else {
        const { error: authErr } = await supabase.auth.signInWithPassword({ email, password });
        if (authErr) throw authErr;
        navigate("/dashboard");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg.includes("Invalid login") ? t.error_generic : msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(provider: "google" | "apple") {
    setLoading(true);
    setError("");
    try {
      const { error: authErr } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: isNativePlatform()
            ? getNativeRedirectUrl(provider)
            : `${window.location.origin}/dashboard`,
          skipBrowserRedirect: isNativePlatform(),
        },
      });
      if (authErr) throw authErr;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">AI</div>
        </div>

        <header className="auth-header">
          <h1 className="auth-title">{t.app_name}</h1>
          <p className="auth-subtitle">
            {mode === "login" ? "Sign in to your account" : t.onboarding_subtitle}
          </p>
        </header>

        {error && <div className="auth-error" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form" autoComplete="on">
          <label className="auth-field">
            <Mail className="auth-field-icon" size={18} aria-hidden="true" />
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="auth-input"
            />
          </label>

          {mode === "signup" && (
            <label className="auth-field">
              <Phone className="auth-field-icon" size={18} aria-hidden="true" />
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder={t.onboarding_phone_placeholder}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="auth-input"
              />
            </label>
          )}

          <label className="auth-field">
            <Lock className="auth-field-icon" size={18} aria-hidden="true" />
            <input
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="auth-input"
            />
          </label>

          <button type="submit" disabled={loading} className="auth-submit">
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              mode === "login" ? "Sign In" : t.onboarding_complete_btn
            )}
          </button>
        </form>

        <div className="auth-oauth-divider">
          <span className="auth-oauth-line" />
          <span className="auth-oauth-text">OR</span>
          <span className="auth-oauth-line" />
        </div>

        <button
          type="button"
          onClick={() => handleOAuth("google")}
          disabled={loading}
          className="auth-oauth-btn"
        >
          <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continue with Google
        </button>

        {Capacitor?.isNativePlatform?.() && (
          <button
            type="button"
            onClick={() => handleOAuth("apple")}
            disabled={loading}
            className="auth-oauth-btn"
            style={{ marginTop: 10 }}
          >
            Continue with Apple
          </button>
        )}

        <div className="auth-links">
          <button type="button" className="auth-link">
            {mode === "login" ? "Forgot your password?" : ""}
          </button>
          <button
            type="button"
            className="auth-link"
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
          >
            {mode === "login" ? (
              <>Don't have an account? <span className="auth-link-highlight">Sign Up</span></>
            ) : (
              <>{t.back}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
