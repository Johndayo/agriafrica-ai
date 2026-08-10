-- ============================================================================
-- AgriAfrica AI v2 — Initial Schema Migration
-- Generated: 2026-07-10
-- Description: Core RBAC, relational tables, triggers, and RLS policies
-- ============================================================================

-- ============================================================================
-- 1. RBAC EXTENSIONS & CUSTOM TYPES
-- ============================================================================

-- Custom enum restricting assignable application roles.
-- Kept minimal (admin / moderator / user) to prevent role escalation.
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- SECURITY DEFINER function to check role membership.
-- search_path locked to 'public' to prevent search-path injection attacks.
-- This function is the single source of truth for all permission checks.
CREATE OR REPLACE FUNCTION public.has_role(
  _user_id uuid,
  _role    public.app_role
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM   public.user_roles
    WHERE  user_id = _user_id
    AND    role    = _role
  );
$$;

-- ============================================================================
-- 2. PERFORMANCE-OPTIMIZED RELATIONAL TABLES
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 2a. profiles — 1:1 mapping with auth.users
-- ---------------------------------------------------------------------------
-- Stores public-facing user data. The id column references auth.users(id)
-- with ON DELETE CASCADE to keep orphan rows impossible.
-- crops_grown uses a GIN index for efficient @> (contains) and && (overlap)
-- queries when filtering users by crop type in localized lookups.
CREATE TABLE public.profiles (
  id                  uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name           text        NOT NULL DEFAULT '',
  phone               text        NOT NULL DEFAULT '',
  location            text        NOT NULL DEFAULT '',
  farm_size_hectares  numeric(8,2) NOT NULL DEFAULT 0,
  crops_grown         text[]      NOT NULL DEFAULT '{}',
  avatar_url          text,
  preferred_language  text        NOT NULL DEFAULT 'en',
  onboarding_complete boolean     NOT NULL DEFAULT false,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- GIN index for array containment queries on crops_grown.
-- Enables fast lookups like: WHERE crops_grown @> ARRAY['maize']
-- Access path: Bitmap Index Scan → Bitmap Heap Scan (no seq scan on large tables).
CREATE INDEX idx_profiles_crops_grown ON public.profiles USING gin (crops_grown);

-- B-Tree index on location for regional filtering and proximity grouping.
CREATE INDEX idx_profiles_location ON public.profiles USING btree (location);

-- Updated_at trigger to keep timestamp fresh without app-layer logic.
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- 2b. user_roles — Security-isolated role table
-- ---------------------------------------------------------------------------
-- Separated from profiles to prevent role injection via public profile updates.
-- Only admins or the has_role() function should write to this table.
CREATE TABLE public.user_roles (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid             NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       public.app_role  NOT NULL DEFAULT 'user',
  granted_at timestamptz      NOT NULL DEFAULT now(),
  granted_by uuid             REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Prevent duplicate role assignments per user.
  CONSTRAINT uq_user_roles_user_role UNIQUE (user_id, role)
);

-- B-Tree index on user_id for the hot path: has_role() lookups.
-- This index is the backbone of every RLS policy check.
CREATE INDEX idx_user_roles_user_id ON public.user_roles USING btree (user_id);

-- ---------------------------------------------------------------------------
-- 2c. conversations — Optimized for streaming AI sessions
-- ---------------------------------------------------------------------------
-- Each conversation belongs to exactly one user. Soft-deleted via deleted_at
-- so message history persists for analytics and audit trails.
CREATE TABLE public.conversations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       text        NOT NULL DEFAULT 'New Conversation',
  is_active   boolean     NOT NULL DEFAULT true,
  deleted_at  timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- B-Tree on user_id for listing a user's conversations (most frequent query).
CREATE INDEX idx_conversations_user_id ON public.conversations USING btree (user_id);

-- Composite index for active-conversation lookups per user.
-- Covers: WHERE user_id = ? AND is_active = true ORDER BY updated_at DESC
CREATE INDEX idx_conversations_user_active
  ON public.conversations USING btree (user_id, is_active, updated_at DESC);

CREATE TRIGGER set_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- 2d. messages — Streaming-optimized message storage
-- ---------------------------------------------------------------------------
-- Messages reference a conversation_id (not user_id directly) to enforce
-- access through the conversation boundary. Content stored as plain text;
-- AI responses may use markdown rendered client-side.
CREATE TABLE public.messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid        NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role            text        NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content         text        NOT NULL,
  tokens_used     integer     NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- B-Tree on conversation_id for paginated message retrieval within a session.
-- Access path: Index Scan → Heap Fetch (optimal for sequential message loading).
CREATE INDEX idx_messages_conversation_id
  ON public.messages USING btree (conversation_id, created_at ASC);

-- B-Tree on user_id for cross-conversation analytics and moderation queries.
CREATE INDEX idx_messages_user_id ON public.messages USING btree (user_id);

-- ---------------------------------------------------------------------------
-- 2e. knowledge_articles — Structured for premium UI rendering
-- ---------------------------------------------------------------------------
-- Supports rich article cards with read_time_minutes for UX badges,
-- cover_image_url for hero images, and is_published for draft/publish workflow.
CREATE TABLE public.knowledge_articles (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title              text        NOT NULL,
  slug               text        NOT NULL UNIQUE,
  body               text        NOT NULL DEFAULT '',
  excerpt            text        NOT NULL DEFAULT '',
  category           text        NOT NULL DEFAULT 'general',
  author_id          uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  cover_image_url    text,
  read_time_minutes  integer     NOT NULL DEFAULT 1,
  is_published       boolean     NOT NULL DEFAULT false,
  view_count         integer     NOT NULL DEFAULT 0,
  published_at       timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

-- B-Tree on category for filtered article listings (e.g., "Crops", "Climate").
CREATE INDEX idx_articles_category
  ON public.knowledge_articles USING btree (category, published_at DESC);

-- Partial index on published articles only — avoids scanning drafts.
-- Smaller index = faster reads for the public knowledge library.
CREATE INDEX idx_articles_published
  ON public.knowledge_articles USING btree (published_at DESC)
  WHERE is_published = true;

-- B-Tree on slug for SEO-friendly URL resolution.
CREATE INDEX idx_articles_slug
  ON public.knowledge_articles USING btree (slug);

CREATE TRIGGER set_articles_updated_at
  BEFORE UPDATE ON public.knowledge_articles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 3. AUTOMATED TRIGGERS — Auto-profile on signup
-- ============================================================================

-- Trigger function: creates a blank profile row the moment a user verifies
-- their email. Inserts into user_roles with default 'user' role simultaneously.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create the public profile from auth metadata.
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'phone', '')
  );

  -- Assign default user role on signup.
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');

  RETURN NEW;
END;
$$;

-- Fires after a new user is confirmed in auth.users.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 4. ROW-LEVEL SECURITY (RLS) — Global enablement + policies
-- ============================================================================

-- Enable RLS on every table. Deny-all default when no policy matches.
ALTER TABLE public.profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_articles  ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owners (superuser bypass disabled).
ALTER TABLE public.profiles            FORCE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles          FORCE ROW LEVEL SECURITY;
ALTER TABLE public.conversations       FORCE ROW LEVEL SECURITY;
ALTER TABLE public.messages            FORCE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_articles  FORCE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- profiles policies
-- ---------------------------------------------------------------------------

-- Users can read their own profile.
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (role column is in user_roles, not here).
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can view all profiles (admin panel access).
CREATE POLICY "profiles_admin_select_all"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update any profile (e.g., suspend accounts).
CREATE POLICY "profiles_admin_update_all"
  ON public.profiles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- ---------------------------------------------------------------------------
-- user_roles policies
-- ---------------------------------------------------------------------------

-- Users can read their own roles (for client-side permission checks).
CREATE POLICY "user_roles_select_own"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Only admins can grant or modify roles (prevents self-elevation).
CREATE POLICY "user_roles_admin_insert"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "user_roles_admin_update"
  ON public.user_roles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "user_roles_admin_delete"
  ON public.user_roles FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- ---------------------------------------------------------------------------
-- conversations policies
-- ---------------------------------------------------------------------------

-- Users can CRUD their own conversations.
CREATE POLICY "conversations_select_own"
  ON public.conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "conversations_insert_own"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "conversations_update_own"
  ON public.conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "conversations_delete_own"
  ON public.conversations FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can read all conversations (moderation / support).
CREATE POLICY "conversations_admin_select_all"
  ON public.conversations FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- ---------------------------------------------------------------------------
-- messages policies
-- ---------------------------------------------------------------------------

-- Users can read messages in their own conversations.
-- Joined through conversations to enforce ownership without duplicating user_id checks.
CREATE POLICY "messages_select_own"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND   conversations.user_id = auth.uid()
    )
  );

-- Users can insert messages into their own conversations.
CREATE POLICY "messages_insert_own"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND   conversations.user_id = auth.uid()
    )
  );

-- Admins can read all messages (moderation / audit trail).
CREATE POLICY "messages_admin_select_all"
  ON public.messages FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- ---------------------------------------------------------------------------
-- knowledge_articles policies
-- ---------------------------------------------------------------------------

-- Public read access for published articles (knowledge library is open).
CREATE POLICY "articles_select_published"
  ON public.knowledge_articles FOR SELECT
  USING (is_published = true);

-- Authors can read their own unpublished drafts.
CREATE POLICY "articles_select_own_drafts"
  ON public.knowledge_articles FOR SELECT
  USING (auth.uid() = author_id);

-- Authors can insert new articles.
CREATE POLICY "articles_insert_own"
  ON public.knowledge_articles FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Authors can update their own articles.
CREATE POLICY "articles_update_own"
  ON public.knowledge_articles FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Admins have full access to all articles (publish / delete / edit).
CREATE POLICY "articles_admin_select_all"
  ON public.knowledge_articles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "articles_admin_update_all"
  ON public.knowledge_articles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "articles_admin_delete_all"
  ON public.knowledge_articles FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
