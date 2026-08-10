-- ============================================================================
-- AgriAfrica AI v2 — Add FCM Token Column for Push Notifications
-- Migration: 20260710020000_add_fcm_token
-- ============================================================================

-- Add fcm_token column for Firebase Cloud Messaging registration.
-- Nullable: only populated when the native app registers for push.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS fcm_token text;

-- B-Tree index for token lookup during bulk push dispatches.
-- Access path: Index Scan → Heap Fetch (optimal for single-token lookups).
CREATE INDEX IF NOT EXISTS idx_profiles_fcm_token
  ON public.profiles USING btree (fcm_token)
  WHERE fcm_token IS NOT NULL;

-- Composite index for push dispatch queries: find all users with valid tokens.
-- Partial index skips rows where fcm_token IS NULL (majority of web users).
CREATE INDEX IF NOT EXISTS idx_profiles_push_dispatch
  ON public.profiles USING btree (id, fcm_token)
  WHERE fcm_token IS NOT NULL AND fcm_token != '';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
