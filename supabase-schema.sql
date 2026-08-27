-- Supabase Schema for OUDX

-- 1. Categories
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Products
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  brand TEXT,
  subtitle TEXT,
  description TEXT,
  story TEXT,
  price NUMERIC NOT NULL,
  compare_at_price NUMERIC,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  gender TEXT,
  concentration TEXT,
  fragrance_family TEXT,
  longevity TEXT,
  sillage TEXT,
  notes JSONB,
  season TEXT[],
  size TEXT,
  stock INTEGER DEFAULT 0,
  badge TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_best_seller BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  is_sale BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Product Sizes/Variants
CREATE TABLE product_variants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  price NUMERIC NOT NULL,
  compare_at_price NUMERIC
);

-- 4. Product Images
CREATE TABLE product_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_main BOOLEAN DEFAULT false
);

-- 5. Profiles (Extends Supabase Auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  tier TEXT DEFAULT 'Oud Privé Member',
  points INTEGER DEFAULT 0,
  role TEXT DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Orders
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Nullable for guests
  order_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'Processing',
  subtotal NUMERIC NOT NULL,
  shipping NUMERIC NOT NULL,
  discount NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
  payment_method TEXT,
  tracking_number TEXT,
  shipping_address JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Order Items
CREATE TABLE order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  size TEXT
);

-- 8. Wishlist
CREATE TABLE wishlist_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE(user_id, product_id)
);

-- Set up Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

-- Security Policies

-- Public access for catalog
CREATE POLICY "Public profiles viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users insert own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Categories are public" ON categories FOR SELECT USING (true);
CREATE POLICY "Products are public" ON products FOR SELECT USING (true);
CREATE POLICY "Product variants are public" ON product_variants FOR SELECT USING (true);
CREATE POLICY "Product images are public" ON product_images FOR SELECT USING (true);

-- Admin write policies for catalog
CREATE POLICY "Admins can insert categories" ON categories FOR INSERT WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins can update categories" ON categories FOR UPDATE USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins can delete categories" ON categories FOR DELETE USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can insert products" ON products FOR INSERT WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins can update products" ON products FOR UPDATE USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins can delete products" ON products FOR DELETE USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can insert product variants" ON product_variants FOR INSERT WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins can update product variants" ON product_variants FOR UPDATE USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins can delete product variants" ON product_variants FOR DELETE USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can insert product images" ON product_images FOR INSERT WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins can update product images" ON product_images FOR UPDATE USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins can delete product images" ON product_images FOR DELETE USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');


-- User isolated access
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
-- order insertion is handled by the security definer function.
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

CREATE POLICY "Users can view own wishlist" ON wishlist_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wishlist" ON wishlist_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own wishlist" ON wishlist_items FOR DELETE USING (auth.uid() = user_id);

-- Atomic Checkout Function (RPC)
CREATE OR REPLACE FUNCTION create_order(
    p_user_id UUID,
    p_items JSONB, -- Array of { product_id, size, quantity }
    p_shipping_address JSONB,
    p_payment_method TEXT,
    p_express_delivery BOOLEAN,
    p_promo_code TEXT
) RETURNS JSONB AS $$
DECLARE
    v_order_id UUID;
    v_order_number TEXT;
    v_subtotal NUMERIC := 0;
    v_shipping NUMERIC := 0;
    v_discount NUMERIC := 0;
    v_total NUMERIC := 0;
    v_item RECORD;
    v_product RECORD;
    v_price NUMERIC;
    v_stock INTEGER;
    v_items_array JSONB;
BEGIN
    -- Security Validation: Ensure authenticated users can only create orders for themselves
    IF auth.uid() IS NOT NULL AND p_user_id IS NOT NULL AND auth.uid() != p_user_id THEN
        RAISE EXCEPTION 'Unauthorized: User ID mismatch';
    END IF;

    -- Security Validation: Ensure anon users cannot create orders assigned to a registered user
    IF auth.uid() IS NULL AND p_user_id IS NOT NULL THEN
        RAISE EXCEPTION 'Unauthorized: Guests cannot create orders for registered users';
    END IF;

    -- 1. Iterate through requested items to validate stock and accumulate subtotal
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id UUID, size TEXT, quantity INTEGER)
    LOOP
        -- Lock the product row for update to prevent race conditions
        SELECT id, price, stock INTO v_product FROM products WHERE id = v_item.product_id FOR UPDATE;
        
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Product not found: %', v_item.product_id;
        END IF;
        
        IF v_product.stock < v_item.quantity THEN
            RAISE EXCEPTION 'Insufficient stock for product: %', v_item.product_id;
        END IF;

        -- Get variant price if variant size matches, otherwise use base price
        SELECT price INTO v_price FROM product_variants WHERE product_id = v_item.product_id AND size = v_item.size LIMIT 1;
        IF v_price IS NULL THEN
            v_price := v_product.price;
        END IF;

        v_subtotal := v_subtotal + (v_price * v_item.quantity);
        
        -- Deduct stock
        UPDATE products SET stock = stock - v_item.quantity WHERE id = v_item.product_id;
    END LOOP;

    -- 2. Calculate Discount (Simple logic for OUDX20, WELCOME10, ROYAL500 as in frontend)
    IF p_promo_code = 'OUDX20' THEN
        v_discount := ROUND(v_subtotal * 0.20);
    ELSIF p_promo_code = 'WELCOME10' THEN
        v_discount := ROUND(v_subtotal * 0.10);
    ELSIF p_promo_code = 'ROYAL500' AND v_subtotal >= 3000 THEN
        v_discount := 500;
    END IF;

    -- 3. Calculate Shipping (FREE_SHIPPING_THRESHOLD = 2500)
    IF (v_subtotal - v_discount) >= 2500 OR v_subtotal = 0 THEN
        v_shipping := 0;
    ELSE
        v_shipping := 150;
    END IF;
    
    IF p_express_delivery THEN
        v_shipping := v_shipping + 75;
    END IF;

    -- 4. Calculate Final Total
    v_total := GREATEST(0, v_subtotal - v_discount + v_shipping);

    -- 5. Generate unique order number
    v_order_number := 'OUD-' || floor(random() * 90000 + 10000)::text;
    
    -- 6. Insert Order
    INSERT INTO orders (user_id, order_number, status, subtotal, shipping, discount, total, payment_method, shipping_address)
    VALUES (p_user_id, v_order_number, 'Processing', v_subtotal, v_shipping, v_discount, v_total, p_payment_method, p_shipping_address)
    RETURNING id INTO v_order_id;

    -- 7. Insert Order Items
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id UUID, size TEXT, quantity INTEGER)
    LOOP
        SELECT price INTO v_price FROM product_variants WHERE product_id = v_item.product_id AND size = v_item.size LIMIT 1;
        IF v_price IS NULL THEN
            SELECT price INTO v_price FROM products WHERE id = v_item.product_id;
        END IF;

        INSERT INTO order_items (order_id, product_id, quantity, price, size)
        VALUES (v_order_id, v_item.product_id, v_item.quantity, v_price, v_item.size);
    END LOOP;

    -- Return JSON summary
    RETURN json_build_object(
        'id', v_order_id,
        'order_number', v_order_number,
        'subtotal', v_subtotal,
        'shipping', v_shipping,
        'discount', v_discount,
        'total', v_total
    )::jsonb;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Revoke execute from public to secure the function, but grant to anon and authenticated
REVOKE EXECUTE ON FUNCTION create_order FROM PUBLIC;
GRANT EXECUTE ON FUNCTION create_order TO anon, authenticated;

 - -   T r i g g e r   t o   a u t o m a t i c a l l y   c r e a t e   a   p r o f i l e   f o r   n e w   u s e r s 
 c r e a t e   o r   r e p l a c e   f u n c t i o n   p u b l i c . h a n d l e _ n e w _ u s e r ( ) 
 r e t u r n s   t r i g g e r 
 l a n g u a g e   p l p g s q l 
 s e c u r i t y   d e f i n e r   s e t   s e a r c h _ p a t h   =   ' ' 
 a s   \ $ \ $ 
 b e g i n 
     i n s e r t   i n t o   p u b l i c . p r o f i l e s   ( i d ,   f u l l _ n a m e ,   r o l e ) 
     v a l u e s   ( n e w . i d ,   n e w . r a w _ u s e r _ m e t a _ d a t a - > > ' f u l l _ n a m e ' ,   ' c u s t o m e r ' ) ; 
     r e t u r n   n e w ; 
 e n d ; 
 \ $ \ $ ; 
 
 d r o p   t r i g g e r   i f   e x i s t s   o n _ a u t h _ u s e r _ c r e a t e d   o n   a u t h . u s e r s ; 
 c r e a t e   t r i g g e r   o n _ a u t h _ u s e r _ c r e a t e d 
     a f t e r   i n s e r t   o n   a u t h . u s e r s 
     f o r   e a c h   r o w   e x e c u t e   p r o c e d u r e   p u b l i c . h a n d l e _ n e w _ u s e r ( ) ; 
  
 