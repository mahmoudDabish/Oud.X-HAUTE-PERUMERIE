import { supabase } from '../lib/supabaseClient';
import { Order } from '../types';

export interface CheckoutItem {
  product_id: string;
  size: string;
  quantity: number;
}

function mapDatabaseOrders(data: any[]): Order[] {
  return (data || []).map((o: any) => {
    const shippingFee = Number(o.shipping_fee ?? o.shipping ?? 0);
    return {
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
      shipping: shippingFee,
      shippingFee: shippingFee,
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
      items: (o.order_items || []).map((it: any) => {
        const pImages = it.products?.product_images || [];
        const mainImg = pImages.find((img: any) => img.is_main) || pImages[0];
        const resolvedImageUrl = mainImg?.url || '';

        return {
          id: it.id,
          name: it.products?.name || 'Fragrance Flacon',
          size: it.size || '100ml',
          price: Number(it.price || 0),
          quantity: Number(it.quantity || 1),
          image: resolvedImageUrl,
          imageUrl: resolvedImageUrl
        };
      })
    };
  });
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
        p_express_delivery: false, // Standard delivery only, 0 shipping fee default
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
            products (
              id,
              name,
              product_images (
                url,
                is_main
              )
            )
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
            products (
              id,
              name,
              product_images (
                url,
                is_main
              )
            )
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

  async updateOrderShipping(orderId: string, shippingFee: number): Promise<{ error: any }> {
    try {
      const fee = Math.max(0, Number(shippingFee) || 0);

      // Fetch current order subtotal and discount
      const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('subtotal, discount')
        .eq('id', orderId)
        .single();

      if (fetchError) {
        return { error: fetchError };
      }

      const subtotal = Number(order?.subtotal || 0);
      const discount = Number(order?.discount || 0);
      const newTotal = Math.max(0, subtotal - discount + fee);

      const updateData: any = {
        shipping: fee,
        total: newTotal
      };

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
