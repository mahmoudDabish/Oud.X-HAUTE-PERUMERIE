-- DEVELOPMENT / DEMO SEED DATA
-- Replace these products with real OUD.X inventory before production launch.
-- Note on Images: Ensure you upload actual product images to the 'products' bucket in Supabase Storage.
-- These URLs currently point to placeholders that should be replaced with valid Supabase storage URLs.

-- Clear existing data if necessary (Optional, but safe for dev)
TRUNCATE TABLE product_images, product_variants, products, categories CASCADE;

-- Insert Categories
INSERT INTO categories (id, name, slug, description) VALUES
('11111111-1111-1111-1111-111111111111', 'Perfumes', 'perfumes', 'Luxury perfumes and exquisite extraits de parfum.'),
('22222222-2222-2222-2222-222222222222', 'Body Splash', 'body-splash', 'Refreshing and light body splashes for everyday wear.'),
('33333333-3333-3333-3333-333333333333', 'Oud', 'oud', 'Deep, rich, and grounding fragrances featuring luxurious oud.'),
('44444444-4444-4444-4444-444444444444', 'Body Care', 'body-care', 'Nourishing body care products with signature scents.'),
('55555555-5555-5555-5555-555555555555', 'Gift Sets', 'gift-sets', 'Curated collections perfect for gifting.');

-- Insert Products
INSERT INTO products (id, name, slug, brand, subtitle, description, story, price, compare_at_price, category_id, gender, concentration, fragrance_family, longevity, sillage, season, size, stock, badge, is_featured, is_best_seller) VALUES
-- 1. Oud Royal
('11111111-2222-3333-4444-000000000001', 'Oud Royal', 'oud-royal', 'OUD.X', 'The Crown Jewel of Fragrance', 'A majestic blend of aged Cambodian oud and velvety rose, designed for true connoisseurs.', 'Oud Royal was crafted to evoke the grandeur of ancient palaces. Every drop resonates with the deep history of Middle Eastern perfumery.', 2500, null, '33333333-3333-3333-3333-333333333333', 'unisex', 'Extrait de Parfum', 'Woody', '12+ Hours', 'Heavy', ARRAY['Winter', 'Fall'], '100ml', 50, 'Bestseller', true, true),

-- 2. Amber Privé
('11111111-2222-3333-4444-000000000002', 'Amber Privé', 'amber-prive', 'OUD.X', 'Liquid Gold', 'A sensual and warm elixir of golden amber, Madagascan vanilla, and rare spices.', 'An intimately crafted private blend that envelops the wearer in a comforting, yet powerfully seductive aura.', 1800, 2100, '11111111-1111-1111-1111-111111111111', 'unisex', 'Eau de Parfum', 'Oriental', '8-10 Hours', 'Moderate', ARRAY['Winter', 'Fall', 'Night'], '100ml', 30, 'Limited', true, false),

-- 3. Velvet Oud
('11111111-2222-3333-4444-000000000003', 'Velvet Oud', 'velvet-oud', 'OUD.X', 'Smooth and Seductive', 'A modern, soft interpretation of agarwood, wrapped in a blanket of cashmere wood and tonka bean.', 'Bridging the gap between ancient tradition and modern luxury, Velvet Oud is as smooth as its namesake.', 1950, null, '33333333-3333-3333-3333-333333333333', 'men', 'Eau de Parfum', 'Woody', '8 Hours', 'Moderate', ARRAY['Fall', 'Spring'], '100ml', 100, null, false, true),

-- 4. Noir Santal
('11111111-2222-3333-4444-000000000004', 'Noir Santal', 'noir-santal', 'OUD.X', 'Dark Sandalwood', 'An intoxicating fusion of dark Mysore sandalwood, leather, and smoked cardamom.', 'Created for the mysterious and bold, Noir Santal commands attention without raising its voice.', 2200, null, '11111111-1111-1111-1111-111111111111', 'unisex', 'Extrait de Parfum', 'Woody Spicy', '12 Hours', 'Strong', ARRAY['Winter'], '50ml', 25, 'New', true, false),

-- 5. Musk Éternel
('11111111-2222-3333-4444-000000000005', 'Musk Éternel', 'musk-eternel', 'OUD.X', 'The Ultimate Clean', 'A heavenly concoction of white musk, iris, and aldehydes that smells like divine skin.', 'Ethereal and timeless, this fragrance acts as a second skin, elevating your natural presence.', 1400, null, '22222222-2222-2222-2222-222222222222', 'women', 'Eau de Parfum', 'Musk', '6-8 Hours', 'Intimate', ARRAY['Spring', 'Summer', 'Day'], '100ml', 150, null, false, false),

-- 6. Rose Élégance
('11111111-2222-3333-4444-000000000006', 'Rose Élégance', 'rose-elegance', 'OUD.X', 'The Queen of Flowers', 'A breathtaking bouquet of Taif rose and Turkish rose absolute, resting on a bed of white amber.', 'A tribute to the majestic rose, captured at dawn when its petals are still heavy with morning dew.', 1750, null, '11111111-1111-1111-1111-111111111111', 'women', 'Eau de Parfum', 'Floral', '8 Hours', 'Moderate', ARRAY['Spring'], '50ml', 80, null, false, true),

-- 7. Oud Noir
('11111111-2222-3333-4444-000000000007', 'Oud Noir', 'oud-noir', 'OUD.X', 'The Midnight Elixir', 'An uncompromising, dark, and animalic oud designed for the purist.', 'Not for the faint of heart, Oud Noir is raw, primal, and incredibly opulent.', 3000, 3500, '33333333-3333-3333-3333-333333333333', 'men', 'Extrait de Parfum', 'Woody', '24+ Hours', 'Enormous', ARRAY['Winter', 'Night'], '50ml', 15, 'Rare', true, false),

-- 8. Amber Wood
('11111111-2222-3333-4444-000000000008', 'Amber Wood', 'amber-wood', 'OUD.X', 'The Golden Forest', 'A perfect harmony of dry cedar, rich amber, and sweet patchouli.', 'Like walking through an ancient, sun-dappled forest, it is simultaneously fresh and deeply resonant.', 1600, null, '11111111-1111-1111-1111-111111111111', 'unisex', 'Eau de Parfum', 'Woody Amber', '8-10 Hours', 'Moderate', ARRAY['Fall', 'Day'], '100ml', 60, null, false, true);

-- Insert Product Variants (Sizes)
-- Assuming base price is for the default size, we'll add 30ml, 50ml, 100ml for all.
INSERT INTO product_variants (product_id, size, price, compare_at_price, stock, sku) VALUES
-- Oud Royal (Base 100ml is 2500)
('11111111-2222-3333-4444-000000000001', '30ml', 900, null, 20, 'OUD-ROY-30'),
('11111111-2222-3333-4444-000000000001', '50ml', 1400, null, 30, 'OUD-ROY-50'),
('11111111-2222-3333-4444-000000000001', '100ml', 2500, null, 50, 'OUD-ROY-100'),

-- Amber Privé (Base 100ml is 1800)
('11111111-2222-3333-4444-000000000002', '50ml', 1000, 1200, 15, 'AMB-PRV-50'),
('11111111-2222-3333-4444-000000000002', '100ml', 1800, 2100, 30, 'AMB-PRV-100'),

-- Velvet Oud (Base 100ml is 1950)
('11111111-2222-3333-4444-000000000003', '50ml', 1100, null, 40, 'VEL-OUD-50'),
('11111111-2222-3333-4444-000000000003', '100ml', 1950, null, 100, 'VEL-OUD-100'),

-- Noir Santal (Base 50ml is 2200)
('11111111-2222-3333-4444-000000000004', '50ml', 2200, null, 25, 'NOI-SAN-50'),

-- Musk Éternel (Base 100ml is 1400)
('11111111-2222-3333-4444-000000000005', '30ml', 600, null, 50, 'MUS-ETE-30'),
('11111111-2222-3333-4444-000000000005', '50ml', 900, null, 70, 'MUS-ETE-50'),
('11111111-2222-3333-4444-000000000005', '100ml', 1400, null, 150, 'MUS-ETE-100'),

-- Rose Élégance (Base 50ml is 1750)
('11111111-2222-3333-4444-000000000006', '50ml', 1750, null, 80, 'ROS-ELE-50'),
('11111111-2222-3333-4444-000000000006', '100ml', 3000, null, 20, 'ROS-ELE-100'),

-- Oud Noir (Base 50ml is 3000)
('11111111-2222-3333-4444-000000000007', '50ml', 3000, 3500, 15, 'OUD-NOI-50'),

-- Amber Wood (Base 100ml is 1600)
('11111111-2222-3333-4444-000000000008', '50ml', 950, null, 30, 'AMB-WOO-50'),
('11111111-2222-3333-4444-000000000008', '100ml', 1600, null, 60, 'AMB-WOO-100');

-- Insert Product Images (Temporary Development Placeholders)
INSERT INTO product_images (product_id, url, is_main, display_order) VALUES
('11111111-2222-3333-4444-000000000001', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=600&auto=format&fit=crop', true, 1),
('11111111-2222-3333-4444-000000000002', 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?q=80&w=600&auto=format&fit=crop', true, 1),
('11111111-2222-3333-4444-000000000003', 'https://images.unsplash.com/photo-1595425970377-c9703bc48b2a?q=80&w=600&auto=format&fit=crop', true, 1),
('11111111-2222-3333-4444-000000000004', 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=600&auto=format&fit=crop', true, 1),
('11111111-2222-3333-4444-000000000005', 'https://images.unsplash.com/photo-1615529182904-14819c35db37?q=80&w=600&auto=format&fit=crop', true, 1),
('11111111-2222-3333-4444-000000000006', 'https://images.unsplash.com/photo-1587403212850-2bc634b07fb8?q=80&w=600&auto=format&fit=crop', true, 1),
('11111111-2222-3333-4444-000000000007', 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?q=80&w=600&auto=format&fit=crop', true, 1),
('11111111-2222-3333-4444-000000000008', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=600&auto=format&fit=crop', true, 1);
