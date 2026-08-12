-- ============================================================================
-- AgriAfrica AI v2 — User FCM Tokens Table
-- Generated: 2026-07-10
-- Description: Stores Firebase Cloud Messaging tokens for push notifications
-- ============================================================================

-- Each user can have multiple FCM tokens (one per device).
-- Tokens are upserted on app launch and cleaned up on logout.
CREATE TABLE IF NOT EXISTS public.user_fcm_tokens (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fcm_token  text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),

  -- Prevent duplicate tokens per user
  CONSTRAINT uq_user_fcm_tokens UNIQUE (user_id, fcm_token)
);

-- B-Tree on user_id for bulk push dispatches
CREATE INDEX IF NOT EXISTS idx_user_fcm_tokens_user_id
  ON public.user_fcm_tokens USING btree (user_id);

-- B-Tree on token for reverse lookups (notification received → user)
CREATE INDEX IF NOT EXISTS idx_user_fcm_tokens_token
  ON public.user_fcm_tokens USING btree (fcm_token);

-- ---------------------------------------------------------------------------
-- RLS Policies
-- ---------------------------------------------------------------------------
ALTER TABLE public.user_fcm_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_fcm_tokens FORCE ROW LEVEL SECURITY;

-- Users can manage their own tokens
CREATE POLICY "user_fcm_tokens_select_own"
  ON public.user_fcm_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_fcm_tokens_insert_own"
  ON public.user_fcm_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_fcm_tokens_delete_own"
  ON public.user_fcm_tokens FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can read all tokens (for push dispatch edge function)
CREATE POLICY "user_fcm_tokens_admin_select_all"
  ON public.user_fcm_tokens FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
