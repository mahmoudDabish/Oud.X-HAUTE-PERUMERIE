-- ==========================================================
-- Migration 03: Create 'product-images' Storage Bucket & RLS Policies
-- ==========================================================

-- 1. Create the public bucket 'product-images'
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/webp', 'image/jpeg', 'image/png', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/webp', 'image/jpeg', 'image/png', 'image/avif'];

-- 2. Storage Policies for product-images bucket

-- Public users can view images (Anonymous + Authenticated)
DROP POLICY IF EXISTS "Public users can view product images" ON storage.objects;
CREATE POLICY "Public users can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Only Admins can upload images (profiles.role = 'admin')
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images'
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Only Admins can update product images
DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images'
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Only Admins can delete product images
DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;
CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images'
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
