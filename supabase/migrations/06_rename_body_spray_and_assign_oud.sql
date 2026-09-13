-- ==============================================================================
-- Migration: 06_rename_body_spray_and_assign_oud.sql
-- Description:
-- 1. Rename category '44444444-4444-4444-4444-444444444444' from 'Body Care' to 'Body Spray'
-- 2. Update Oud products ('OUD ALFARIS', 'EXOTIC OUD') to have category_id = '33333333-3333-3333-3333-333333333333'
-- ==============================================================================

-- 1. Update Category 44444444-4444-4444-4444-444444444444 to Body Spray
UPDATE public.categories
SET name = 'Body Spray',
    slug = 'body-spray',
    description = 'Refreshing Luxury Body Sprays'
WHERE id = '44444444-4444-4444-4444-444444444444';

-- 2. Assign Oud fragrances to category 33333333-3333-3333-3333-333333333333 (Oud)
UPDATE public.products
SET category_id = '33333333-3333-3333-3333-333333333333'
WHERE id IN (
  'a99f4ddf-c772-4ef4-8696-3336b445ab4a', -- OUD ALFARIS
  '6c5dc911-320b-4c83-ae10-3a2b2acbd1fc'  -- EXOTIC OUD
)
OR (
  category_id = '11111111-1111-1111-1111-111111111111'
  AND (name ILIKE '%oud%' OR fragrance_family = 'Smoky Oud')
);
