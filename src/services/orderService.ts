import { supabase } from '../lib/supabaseClient';
import { Order } from '../types';

export interface CheckoutItem {
  product_id: string;
  size: string;
  quantity: number;
}

function mapDatabaseOrders(data: any[]): Order[] {
  return (data || []).map((o: any) => ({
    id: o.id,
    orderNumber: o.order_number || o.id,
    date: o.created_at
      ? new Date(o.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      : new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
    status: (o.status || 'Processing') as Order['status'],
    subtotal: Number(o.subtotal || 0),
    shipping: Number(o.shipping || 0),
    discount: Number(o.discount || 0),
    total: Number(o.total || 0),
    paymentMethod: (o.payment_method || 'Cash on Delivery') as Order['paymentMethod'],
    shippingAddress: o.shipping_address || {
      id: '',
      fullName: 'Customer',
      phone: '',
      city: '',
      area: '',
      streetAddress: '',
      building: '',
      apartment: '',
      isDefault: true
    },
    trackingNumber: o.tracking_number,
    items: (o.order_items || []).map((it: any) => ({
      id: it.id,
      name: it.products?.name || 'Fragrance Flacon',
      size: it.size || '100ml',
      price: Number(it.price || 0),
      quantity: Number(it.quantity || 1),
      image: ''
    }))
  }));
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

  async getUserOrders(userId: string): Promise<{ data: Order[] | null, error: any }> {
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
            products ( id, name )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error };
      }

      return { data: mapDatabaseOrders(data), error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async getAllOrders(): Promise<{ data: Order[] | null, error: any }> {
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
            products ( id, name )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error };
      }

      return { data: mapDatabaseOrders(data), error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async updateOrderStatus(orderId: string, status: string, trackingNumber?: string): Promise<{ error: any }> {
    try {
      const updateData: any = { status };
      if (trackingNumber !== undefined) {
        updateData.tracking_number = trackingNumber;
      }
      
      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);
        
      return { error };
    } catch (error) {
      return { error };
    }
  },

  async deleteOrder(orderId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);
        
      return { error };
    } catch (error) {
      return { error };
    }
  }
};
