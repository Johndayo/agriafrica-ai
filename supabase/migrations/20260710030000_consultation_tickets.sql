-- ============================================================================
-- AgriAfrica AI v2 — Consultation Tickets Migration
-- Generated: 2026-07-10
-- Description: Expert consultation ticketing system with image uploads
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. consultation_tickets — Expert triage surface
-- ---------------------------------------------------------------------------
-- Each ticket belongs to one user and tracks a crop problem with optional
-- photo evidence. Status flows: pending → under_review → responded → closed.
-- image_urls stores Supabase Storage public URLs (max 4 images per ticket).
CREATE TABLE public.consultation_tickets (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_category       text        NOT NULL,
  problem_description text        NOT NULL DEFAULT '',
  image_urls          text[]      NOT NULL DEFAULT '{}',
  status              text        NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'under_review', 'responded', 'closed')),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- B-Tree on user_id for listing a user's tickets (most frequent query).
-- Covers: WHERE user_id = ? ORDER BY created_at DESC LIMIT 20
CREATE INDEX idx_consultation_tickets_user_id
  ON public.consultation_tickets USING btree (user_id, created_at DESC);

-- Partial index on pending tickets for admin dashboard queries.
CREATE INDEX idx_consultation_tickets_pending
  ON public.consultation_tickets USING btree (created_at ASC)
  WHERE status = 'pending';

CREATE TRIGGER set_consultation_tickets_updated_at
  BEFORE UPDATE ON public.consultation_tickets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- 2. Row-Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE public.consultation_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_tickets FORCE ROW LEVEL SECURITY;

-- Users can read their own tickets.
CREATE POLICY "consultation_tickets_select_own"
  ON public.consultation_tickets FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own tickets.
CREATE POLICY "consultation_tickets_insert_own"
  ON public.consultation_tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own tickets (e.g., close a resolved ticket).
CREATE POLICY "consultation_tickets_update_own"
  ON public.consultation_tickets FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can read all tickets (triage / response workflow).
CREATE POLICY "consultation_tickets_admin_select_all"
  ON public.consultation_tickets FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update any ticket (change status, add response).
CREATE POLICY "consultation_tickets_admin_update_all"
  ON public.consultation_tickets FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete tickets (cleanup / moderation).
CREATE POLICY "consultation_tickets_admin_delete_all"
  ON public.consultation_tickets FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
