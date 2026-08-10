import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "@/contexts/LanguageContext";
import { DashboardSkeleton } from "@/components/SkeletonLoader";
import { Bell, Settings, Sparkles, Lightbulb, MessageCircle } from "lucide-react";

const RECENT_CONVERSATIONS = [
  "How do I control tomato blight?",
  "What fertilizer should I use for rice?",
  "Why are my maize leaves turning yellow?",
];

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const profile = useAppStore((s) => s.profile);
  const cachedArticles = useAppStore((s) => s.cached_articles);

  const greeting = useMemo(() => {
    const name = profile.full_name || "Farmer";
    return `${t.dashboard_greeting}, ${name}!`;
  }, [t.dashboard_greeting, profile.full_name]);

  const recentTip = useMemo(() => {
    const first = cachedArticles[0];
    if (first) {
      return { title: first.title || "Today's Farming Tip", body: first.body || "Rotate crops every season to prevent soil nutrient depletion." };
    }
    return { title: "Today's Farming Tip", body: "Rotate crops every season to prevent soil nutrient depletion." };
  }, [cachedArticles]);

  if (!profile.full_name && !profile.phone) {
    return (
      <div className="page-container">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header bar with logo and action icons */}
      <div className="home-header-bar">
        <div className="home-logo">
          <div className="home-logo-icon">AI</div>
          <span className="home-logo-text">AgriAfrica AI</span>
        </div>
        <div className="home-header-actions">
          <button
            type="button"
            onClick={() => navigate("/notifications")}
            className="home-header-btn"
            aria-label={t.profile_notifications}
          >
            <Bell size={18} />
          </button>
          <button
            type="button"
            onClick={() => navigate("/settings")}
            className="home-header-btn"
            aria-label={t.profile_edit}
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Welcome gradient banner */}
      <section className="home-welcome-banner">
        <div className="home-welcome-row">
          <div className="home-welcome-text">
            <h1>{greeting} 👋</h1>
            <p>What would you like to do today?</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate("/ask-ai")}
          className="home-ask-btn"
        >
          <Sparkles size={18} />
          Ask AI a Question
        </button>
      </section>

      {/* Today's Farming Tip */}
      <section className="home-card">
        <div className="home-card-header">
          <div className="home-card-icon" style={{ background: "#FFF3E0", color: "#F57C00" }}>
            <Lightbulb size={18} />
          </div>
          <h2 className="home-card-title">{recentTip.title}</h2>
        </div>
        <p className="home-card-text">
          {recentTip.body || "Rotate crops every season to prevent soil nutrient depletion."}
        </p>
      </section>

      {/* Recent Conversations */}
      <section className="home-card">
        <div className="home-card-header">
          <div className="home-card-icon" style={{ background: "var(--green-light)", color: "var(--green-primary)" }}>
            <MessageCircle size={18} />
          </div>
          <h2 className="home-card-title">Recent Conversations</h2>
        </div>
        <div className="home-conversation-list">
          {RECENT_CONVERSATIONS.map((conv, i) => (
            <button
              key={i}
              type="button"
              onClick={() => navigate("/ask-ai")}
              className="home-conversation-item"
            >
              <span className="home-conversation-text">{conv}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
