import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "@/contexts/LanguageContext";
import { Home, Sparkles, BookOpen, Stethoscope, User } from "lucide-react";

interface NavItem {
  path: string;
  labelKey: string;
  icon: typeof Home;
}

const NAV_ITEMS: NavItem[] = [
  { path: "/dashboard", labelKey: "nav_home", icon: Home },
  { path: "/ask-ai", labelKey: "nav_ask_ai", icon: Sparkles },
  { path: "/learn", labelKey: "nav_knowledge", icon: BookOpen },
  { path: "/consult", labelKey: "nav_consult", icon: Stethoscope },
  { path: "/profile", labelKey: "nav_profile", icon: User },
];

export function BottomNav() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const labelMap: Record<string, string> = {
    nav_home: t.nav_home,
    nav_ask_ai: t.nav_ask_ai,
    nav_knowledge: t.nav_knowledge,
    nav_consult: t.nav_consult,
    nav_profile: t.nav_profile,
  };

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
      {NAV_ITEMS.map((item) => {
        const isActive = location.pathname.startsWith(item.path);
        const Icon = item.icon;
        const label = labelMap[item.labelKey] ?? item.labelKey;
        return (
          <button
            key={item.path}
            type="button"
            onClick={() => navigate(item.path)}
            className={`bottom-nav-item ${isActive ? "bottom-nav-item-active" : ""}`}
            aria-current={isActive ? "page" : undefined}
            aria-label={label}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} className="bottom-nav-icon" />
            <span className="bottom-nav-label">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
