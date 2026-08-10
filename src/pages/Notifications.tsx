import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/contexts/LanguageContext";
import { ArrowLeft, Bell } from "lucide-react";

export default function Notifications() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="page-container notifications-page">
      <div className="notifications-header">
        <button type="button" onClick={() => navigate(-1)} className="notifications-back" aria-label={t.back}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="notifications-title">{t.profile_notifications}</h1>
      </div>

      <div className="notifications-empty">
        <Bell className="notifications-empty-icon" size={64} />
        <p className="notifications-empty-text">No notifications yet.</p>
      </div>
    </div>
  );
}
