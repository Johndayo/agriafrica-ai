-- ============================================================================
-- AgriAfrica AI v2 — Crop Images Storage Bucket
-- Generated: 2026-07-10
-- Description: Storage bucket for consultation photo uploads (JPEG/PNG, 5MB max)
-- ============================================================================

-- Create the storage bucket with file size limit and allowed MIME types.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'crop-images',
  'crop-images',
  true,                          -- public read access for image URLs
  5242880,                       -- 5MB limit
  ARRAY['image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Storage RLS Policies
-- ---------------------------------------------------------------------------

-- Authenticated users can upload to their own folder: {user_id}/filename.ext
CREATE POLICY "crop_images_insert_own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'crop-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Anyone can read crop images (public bucket).
CREATE POLICY "crop_images_select_public"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'crop-images');

-- Users can delete their own uploaded images.
CREATE POLICY "crop_images_delete_own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'crop-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
