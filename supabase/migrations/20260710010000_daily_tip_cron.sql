-- ============================================================================
-- AgriAfrica AI v2 — Daily Tip Log Table + pg_cron Schedule
-- Migration: 20260710010000_daily_tip_cron
-- ============================================================================

-- ============================================================================
-- 1. daily_tip_log — Diagnostic audit table for SMS dispatches
-- ============================================================================
-- Stores one row per SMS attempt. Phone "SYSTEM" entries hold batch summaries.
-- Retained indefinitely for compliance and debugging; archive older rows monthly.
CREATE TABLE IF NOT EXISTS public.daily_tip_log (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone          text        NOT NULL,
  status         text        NOT NULL CHECK (status IN ('sent', 'failed', 'skipped')),
  gateway        text        NOT NULL CHECK (gateway IN ('twilio', 'africastalking')),
  error_message  text,
  sent_at        timestamptz NOT NULL DEFAULT now()
);

-- B-Tree on sent_at for time-range queries in admin dashboards.
CREATE INDEX IF NOT EXISTS idx_daily_tip_log_sent_at
  ON public.daily_tip_log USING btree (sent_at DESC);

-- Partial index on failed attempts for quick error triage.
CREATE INDEX IF NOT EXISTS idx_daily_tip_log_failed
  ON public.daily_tip_log USING btree (sent_at DESC)
  WHERE status = 'failed';

-- RLS: only admins can read logs.
ALTER TABLE public.daily_tip_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_tip_log FORCE ROW LEVEL SECURITY;

CREATE POLICY "daily_tip_log_admin_select"
  ON public.daily_tip_log FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- System inserts bypass RLS (service_role has full access).
CREATE POLICY "daily_tip_log_service_insert"
  ON public.daily_tip_log FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- 2. daily_tips — Content table for daily agricultural tips
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.daily_tips (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title      text        NOT NULL,
  body       text        NOT NULL,
  language   text        NOT NULL DEFAULT 'en',
  is_active  boolean     NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_daily_tips_active
  ON public.daily_tips USING btree (created_at DESC)
  WHERE is_active = true;

ALTER TABLE public.daily_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_tips FORCE ROW LEVEL SECURITY;

CREATE POLICY "daily_tips_select_published"
  ON public.daily_tips FOR SELECT
  USING (is_active = true);

CREATE POLICY "daily_tips_admin_manage"
  ON public.daily_tips FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- 3. pg_cron schedule — Fire daily at 06:00 WAT (05:00 UTC)
-- ============================================================================
-- Requires: CREATE EXTENSION IF NOT EXISTS pg_cron;
-- The job invokes the send-daily-tip Edge Function via HTTP POST.
-- timeout_seconds set to 300 (5 min) to prevent runaway executions.
SELECT cron.schedule(
  'daily_tip_dispatch',              -- unique job name
  '0 5 * * *',                       -- cron expression: 05:00 UTC daily (06:00 WAT)
  $$
    SELECT net.http_post(
      url    := current_setting('app.settings.supabase_url') || '/functions/v1/send-daily-tip',
      headers := jsonb_build_object(
        'Content-Type',  'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := '{"source": "pg_cron"}'::jsonb
    );
  $$
);

-- ============================================================================
-- 4. Cleanup job — Archive logs older than 90 days (runs weekly, Sunday 03:00 UTC)
-- ============================================================================
SELECT cron.schedule(
  'cleanup_daily_tip_log',
  '0 3 * * 0',
  $$
    DELETE FROM public.daily_tip_log
    WHERE sent_at < now() - interval '90 days';
  $$
);

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
