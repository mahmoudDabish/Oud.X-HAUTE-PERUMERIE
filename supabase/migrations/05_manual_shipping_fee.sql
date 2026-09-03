-- ==============================================================================
-- Migration 05: Ensure manual shipping fee control and zero default
-- ==============================================================================

-- 1. Ensure shipping_fee column exists as an alias/companion to shipping
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'shipping_fee'
    ) THEN
        ALTER TABLE orders ADD COLUMN shipping_fee NUMERIC NOT NULL DEFAULT 0;
        UPDATE orders SET shipping_fee = COALESCE(shipping, 0);
    END IF;
END $$;

-- 2. Update create_order RPC function to guarantee zero automatic shipping fee
CREATE OR REPLACE FUNCTION create_order(
    p_user_id UUID,
    p_items JSONB,
    p_shipping_address JSONB,
    p_payment_method TEXT,
    p_express_delivery BOOLEAN DEFAULT false,
    p_promo_code TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
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

    -- 2. Calculate Discount (Simple logic for OUDX20, WELCOME10, ROYAL500)
    IF p_promo_code = 'OUDX20' THEN
        v_discount := ROUND(v_subtotal * 0.20);
    ELSIF p_promo_code = 'WELCOME10' THEN
        v_discount := ROUND(v_subtotal * 0.10);
    ELSIF p_promo_code = 'ROYAL500' AND v_subtotal >= 3000 THEN
        v_discount := 500;
    END IF;

    -- 3. Shipping Fee: Default is strictly 0 EGP (Admin controls fee manually)
    v_shipping := 0;

    -- 4. Calculate Final Total
    v_total := GREATEST(0, v_subtotal - v_discount + v_shipping);

    -- 5. Generate unique order number
    v_order_number := 'OUD-' || floor(random() * 90000 + 10000)::text;
    
    -- 6. Insert Order
    INSERT INTO orders (user_id, order_number, status, subtotal, shipping, shipping_fee, discount, total, payment_method, shipping_address)
    VALUES (p_user_id, v_order_number, 'Processing', v_subtotal, v_shipping, v_shipping, v_discount, v_total, p_payment_method, p_shipping_address)
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
        'shipping_fee', v_shipping,
        'discount', v_discount,
        'total', v_total
    )::jsonb;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Permissions
REVOKE EXECUTE ON FUNCTION create_order FROM PUBLIC;
GRANT EXECUTE ON FUNCTION create_order TO anon, authenticated;

-- Ensure any existing orders that had the 150 shipping fee reset to 0
UPDATE orders 
SET shipping = 0, shipping_fee = 0, total = subtotal - discount 
WHERE shipping = 150;
