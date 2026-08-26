import { supabase } from '../lib/supabaseClient';

export interface CheckoutItem {
  product_id: string;
  size: string;
  quantity: number;
}

export const orderService = {
  async createOrder(
    userId: string | null,
    items: CheckoutItem[],
    shippingAddress: any,
    paymentMethod: string,
    expressDelivery: boolean,
    promoCode: string | null
  ): Promise<{ data: any, error: any }> {
    try {
      // Call the secure atomic RPC function
      const { data, error } = await supabase.rpc('create_order', {
        p_user_id: userId,
        p_items: items,
        p_shipping_address: shippingAddress,
        p_payment_method: paymentMethod,
        p_express_delivery: expressDelivery,
        p_promo_code: promoCode || ''
      });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async getUserOrders(userId: string): Promise<{ data: any, error: any }> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_id,
            quantity,
            price,
            size,
            products ( name, images )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }
};
