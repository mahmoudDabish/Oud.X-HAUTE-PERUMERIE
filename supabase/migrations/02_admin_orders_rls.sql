-- Migration: Add Admin RLS policies for orders and order_items
-- Description: Allows administrators (profiles.role = 'admin') to view, update, and delete orders, and view order items.

CREATE POLICY "Admins can view all orders" 
ON orders FOR SELECT 
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can update orders" 
ON orders FOR UPDATE 
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can delete orders" 
ON orders FOR DELETE 
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can view all order items" 
ON order_items FOR SELECT 
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
