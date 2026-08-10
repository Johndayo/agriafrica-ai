import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "@/contexts/LanguageContext";
import { CardSkeleton } from "@/components/SkeletonLoader";
import { BookOpen, Search, Bookmark, Wifi, WifiOff, Eye } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  read_time_minutes: number;
  cover_image_url: string | null;
  published_at: string;
  view_count: number;
}

type CategoryFilter = "all" | "crops" | "livestock" | "climate" | "business";

// ---------------------------------------------------------------------------
// Category config — maps filter keys to translation keys
// ---------------------------------------------------------------------------
const CATEGORIES: { key: CategoryFilter; labelKey: string }[] = [
  { key: "all", labelKey: "knowledge_category_all" },
  { key: "crops", labelKey: "knowledge_category_crops" },
  { key: "livestock", labelKey: "knowledge_category_livestock" },
  { key: "climate", labelKey: "knowledge_category_climate" },
  { key: "business", labelKey: "knowledge_category_business" },
];

// ---------------------------------------------------------------------------
// Single flat-batch fetch — eliminates N+1 query traps
// ---------------------------------------------------------------------------
// We select all published articles in one round-trip instead of fetching
// categories separately or loading articles one-by-one.
async function fetchArticles(): Promise<Article[]> {
  const { data, error } = await supabase
    .from("knowledge_articles")
    .select(
      "id, title, slug, excerpt, category, read_time_minutes, cover_image_url, published_at, view_count"
    )
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(50);

  if (error) throw error;
  return (data ?? []) as Article[];
}

// ---------------------------------------------------------------------------
// Learn — Knowledge Library page
// ---------------------------------------------------------------------------
export default function Learn() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const cachedArticles = useAppStore((s) => s.cached_articles);
  const addCachedArticle = useAppStore((s) => s.addCachedArticle);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // -----------------------------------------------------------------------
  // Network status — window online/offline events
  // -----------------------------------------------------------------------
  // When the device goes offline, we stop querying and display cached data.
  // When it comes back online, we invalidate the cache to refetch fresh data.
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [queryClient]);

  // -----------------------------------------------------------------------
  // TanStack Query — single flat-batch from public.knowledge_articles
  // -----------------------------------------------------------------------
  const { data: remoteArticles, isLoading, isError } = useQuery<Article[]>({
    queryKey: ["articles"],
    queryFn: fetchArticles,
    staleTime: 5 * 60 * 1000, // 5 minutes — articles don't change often
    retry: 2,
    enabled: isOnline,
  });

  // -----------------------------------------------------------------------
  // Sync remote articles → Zustand cached_articles for offline fallback
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!remoteArticles) return;
    for (const article of remoteArticles) {
      addCachedArticle({
        id: article.id,
        title: article.title,
        body: article.excerpt,
        category: article.category,
        saved_at: Date.now(),
      });
    }
  }, [remoteArticles, addCachedArticle]);

  // -----------------------------------------------------------------------
  // Display articles — remote if online, cached Zustand store if offline
  // -----------------------------------------------------------------------
  const displayArticles = useMemo(() => {
    if (isOnline && remoteArticles) return remoteArticles;

    // Offline fallback: map cached_articles from Zustand store to Article shape
    return cachedArticles.map((ca) => ({
      id: ca.id,
      title: ca.title,
      slug: ca.id,
      excerpt: ca.body,
      category: ca.category,
      read_time_minutes: 3,
      cover_image_url: null,
      published_at: new Date(ca.saved_at).toISOString(),
      view_count: 0,
    }));
  }, [isOnline, remoteArticles, cachedArticles]);

  // -----------------------------------------------------------------------
  // Filtered articles — single-pass category + search filter (no N+1)
  // -----------------------------------------------------------------------
  const filteredArticles = useMemo(() => {
    let result = displayArticles;

    if (activeCategory !== "all") {
      result = result.filter((a) => a.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q)
      );
    }

    return result;
  }, [displayArticles, activeCategory, searchQuery]);

  // -----------------------------------------------------------------------
  // Category label resolver — uses t() for all labels
  // -----------------------------------------------------------------------
  const getCategoryLabel = useCallback(
    (key: string) => {
      const map: Record<string, string> = {
        knowledge_category_all: t.knowledge_category_all,
        knowledge_category_crops: t.knowledge_category_crops,
        knowledge_category_livestock: t.knowledge_category_livestock,
        knowledge_category_climate: t.knowledge_category_climate,
        knowledge_category_business: t.knowledge_category_business,
      };
      return map[key] ?? key;
    },
    [t]
  );

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <div className="page-container">
      {/* Offline banner */}
      {!isOnline && (
        <div className="learn-offline-banner" role="alert">
          <WifiOff size={16} />
          <span>{t.learn_offline_banner}</span>
        </div>
      )}

      {/* Header with online/offline status badge */}
      <header className="learn-header">
        <h1 className="learn-title">{t.knowledge_title}</h1>
        {isOnline ? (
          <span className="learn-status learn-status-online">
            <Wifi size={14} /> {t.online}
          </span>
        ) : (
          <span className="learn-status learn-status-offline">
            <WifiOff size={14} /> {t.offline}
          </span>
        )}
      </header>

      {/* Search bar */}
      <div className="learn-search">
        <Search size={18} className="learn-search-icon" />
        <input
          type="search"
          inputMode="search"
          autoComplete="off"
          placeholder={t.knowledge_search_placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="learn-search-input"
          aria-label={t.search}
        />
      </div>

      {/* Category filter pills — 48px touch targets */}
      <div className="learn-categories" role="tablist">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            type="button"
            role="tab"
            aria-selected={activeCategory === cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`learn-category-pill ${
              activeCategory === cat.key ? "learn-category-pill-active" : ""
            }`}
            style={{ touchAction: "manipulation" }}
          >
            {getCategoryLabel(cat.labelKey)}
          </button>
        ))}
      </div>

      {/* Content area */}
      <section className="learn-content" aria-label={t.knowledge_title}>
        {isLoading ? (
          <div className="learn-skeleton-grid">
            {Array.from({ length: 4 }, (_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : isError && !isOnline ? (
          <div className="learn-offline-fallback">
            <Bookmark size={40} className="text-gray-400" />
            <p>{t.learn_saved_offline}</p>
            <p className="learn-offline-count">
              {cachedArticles.length} articles cached
            </p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="learn-empty">
            <BookOpen size={40} className="text-gray-400" />
            <p>{t.no_results}</p>
          </div>
        ) : (
          <div className="learn-articles-grid">
            {filteredArticles.map((article) => (
              <button
                key={article.id}
                type="button"
                onClick={() => navigate(`/knowledge/${article.slug}`)}
                className="learn-article-card"
                style={{ touchAction: "manipulation" }}
              >
                {/* Cover image or gradient placeholder */}
                <div className="learn-article-cover">
                  {article.cover_image_url ? (
                    <img
                      src={article.cover_image_url}
                      alt=""
                      className="learn-article-img"
                      loading="lazy"
                    />
                  ) : (
                    <div className="learn-article-placeholder">
                      <BookOpen size={24} />
                    </div>
                  )}
                  <span className="learn-article-category-badge">
                    {article.category}
                  </span>
                </div>

                <div className="learn-article-body">
                  <h3 className="learn-article-title">{article.title}</h3>
                  <p className="learn-article-excerpt">{article.excerpt}</p>
                  <div className="learn-article-meta">
                    <span className="learn-article-read-time">
                      {article.read_time_minutes} min
                    </span>
                    <span className="learn-article-views">
                      <Eye size={12} /> {article.view_count}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
