import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/contexts/LanguageContext";
import { useAppStore } from "@/store/useAppStore";
import { type Language, languageLabels } from "@/lib/translations";
import { ArrowLeft, Globe, Bell, Moon, Info } from "lucide-react";

interface ToggleProps {
  active: boolean;
  onToggle: () => void;
}

function Toggle({ active, onToggle }: ToggleProps) {
  return (
    <button type="button" onClick={onToggle} className={`settings-toggle ${active ? "settings-toggle-active" : ""}`}>
      <div className="settings-toggle-knob" />
    </button>
  );
}

const languageOptions: Language[] = ["en", "ha", "yo", "sw", "fr", "ig", "pcm", "am", "zu"];

export default function Settings() {
  const { t, language, setLanguage: setContextLanguage } = useTranslation();
  const navigate = useNavigate();
  const darkMode = useAppStore((s) => s.dark_mode);
  const setDarkMode = useAppStore((s) => s.setDarkMode);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [dailyTips, setDailyTips] = useState(true);
  const [consultUpdates, setConsultUpdates] = useState(true);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value as Language;
    setContextLanguage(lang);
  };

  return (
    <div className="page-container settings-page">
      <div className="settings-header">
        <button type="button" onClick={() => navigate(-1)} className="settings-back" aria-label={t.back}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="settings-title">{t.profile_edit}</h1>
      </div>

      {/* Language */}
      <div className="settings-group">
        <div className="settings-item">
          <div className="settings-item-left">
            <div className="settings-item-icon"><Globe size={20} /></div>
            <div>
              <div className="settings-item-label">{t.profile_language_setting}</div>
            </div>
          </div>
          <select
            value={language}
            onChange={handleLanguageChange}
            className="settings-select"
          >
            {languageOptions.map((lang) => (
              <option key={lang} value={lang}>{languageLabels[lang]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Notifications */}
      <div className="settings-group">
        <div className="settings-item">
          <div className="settings-item-left">
            <div className="settings-item-icon"><Bell size={20} /></div>
            <div className="settings-item-label">{t.profile_notifications}</div>
          </div>
        </div>
        <div className="settings-item">
          <div className="settings-item-left">
            <div className="settings-item-sublabel" style={{ marginLeft: 40 }}>{t.settings_push_notifications}</div>
          </div>
          <Toggle active={pushEnabled} onToggle={() => setPushEnabled(!pushEnabled)} />
        </div>
        <div className="settings-item">
          <div className="settings-item-left">
            <div className="settings-item-sublabel" style={{ marginLeft: 40 }}>{t.settings_daily_tips}</div>
          </div>
          <Toggle active={dailyTips} onToggle={() => setDailyTips(!dailyTips)} />
        </div>
        <div className="settings-item">
          <div className="settings-item-left">
            <div className="settings-item-sublabel" style={{ marginLeft: 40 }}>{t.settings_consult_updates}</div>
          </div>
          <Toggle active={consultUpdates} onToggle={() => setConsultUpdates(!consultUpdates)} />
        </div>
      </div>

      {/* Appearance */}
      <div className="settings-group">
        <div className="settings-item">
          <div className="settings-item-left">
            <div className="settings-item-icon"><Moon size={20} /></div>
            <div className="settings-item-label">{t.settings_appearance}</div>
          </div>
        </div>
        <div className="settings-item">
          <div className="settings-item-left">
            <div className="settings-item-sublabel" style={{ marginLeft: 40 }}>{t.settings_dark_mode}</div>
          </div>
          <Toggle active={darkMode} onToggle={() => setDarkMode(!darkMode)} />
        </div>
      </div>

      {/* About */}
      <div className="settings-group">
        <div className="settings-item">
          <div className="settings-item-left">
            <div className="settings-item-icon"><Info size={20} /></div>
            <div className="settings-item-label">{t.settings_about}</div>
          </div>
        </div>
        <div className="settings-about">
          <p className="settings-about-name">{t.app_name} v1.0.0</p>
          <p className="settings-about-desc">{t.settings_about_desc}</p>
        </div>
      </div>
    </div>
  );
}
