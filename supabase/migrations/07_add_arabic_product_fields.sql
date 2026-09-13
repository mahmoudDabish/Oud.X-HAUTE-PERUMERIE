-- Migration 07: Add Arabic localization fields to products table
-- Idempotent and non-destructive: keeps all existing data intact

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS name_ar TEXT,
ADD COLUMN IF NOT EXISTS subtitle_ar TEXT,
ADD COLUMN IF NOT EXISTS description_ar TEXT,
ADD COLUMN IF NOT EXISTS story_ar TEXT,
ADD COLUMN IF NOT EXISTS notes_ar JSONB;

COMMENT ON COLUMN products.name_ar IS 'Arabic localized fragrance name';
COMMENT ON COLUMN products.subtitle_ar IS 'Arabic localized olfactory slogan';
COMMENT ON COLUMN products.description_ar IS 'Arabic editorial description';
COMMENT ON COLUMN products.story_ar IS 'Arabic atelier story';
COMMENT ON COLUMN products.notes_ar IS 'Arabic olfactory pyramid notes: { top: [], heart: [], base: [] }';
