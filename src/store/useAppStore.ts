import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { type Language, defaultLanguage } from "@/lib/translations";

export interface UserProfile {
  full_name: string;
  phone: string;
  location: string;
  farm_size_hectares: number;
  crops_grown: string[];
}

export interface CachedArticle {
  id: string;
  title: string;
  body: string;
  category: string;
  saved_at: number;
}

interface AppState {
  profile: UserProfile;
  onboarding_complete: boolean;
  cached_articles: CachedArticle[];
  language: Language;
  notifications_enabled: boolean;
  dark_mode: boolean;

  setProfile: (profile: Partial<UserProfile>) => void;
  completeOnboarding: () => void;
  addCachedArticle: (article: CachedArticle) => void;
  removeCachedArticle: (id: string) => void;
  clearCachedArticles: () => void;
  setLanguage: (lang: Language) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setDarkMode: (enabled: boolean) => void;
}

const defaultProfile: UserProfile = {
  full_name: "",
  phone: "",
  location: "",
  farm_size_hectares: 0,
  crops_grown: [],
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      profile: defaultProfile,
      onboarding_complete: false,
      cached_articles: [],
      language: defaultLanguage,
      notifications_enabled: true,
      dark_mode: false,

      setProfile: (partial) =>
        set((state) => ({ profile: { ...state.profile, ...partial } })),

      completeOnboarding: () => set({ onboarding_complete: true }),

      addCachedArticle: (article) =>
        set((state) => ({
          cached_articles: [...state.cached_articles.filter((a) => a.id !== article.id), article],
        })),

      removeCachedArticle: (id) =>
        set((state) => ({
          cached_articles: state.cached_articles.filter((a) => a.id !== id),
        })),

      clearCachedArticles: () => set({ cached_articles: [] }),

      setLanguage: (lang) => set({ language: lang }),

      setNotificationsEnabled: (enabled) => set({ notifications_enabled: enabled }),

      setDarkMode: (enabled) => set({ dark_mode: enabled }),
    }),
    {
      name: "agriafrica-app-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
