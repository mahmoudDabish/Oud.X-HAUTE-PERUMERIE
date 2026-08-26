import { supabase } from '../lib/supabaseClient';

export const wishlistService = {
  async getUserWishlist(userId: string): Promise<{ data: string[] | null, error: any }> {
    try {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('product_id')
        .eq('user_id', userId);

      if (error || !data) return { data: null, error };

      return { data: data.map(item => item.product_id), error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async addToWishlist(userId: string, productId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('wishlist_items')
        .insert({ user_id: userId, product_id: productId });

      return { error };
    } catch (error) {
      return { error };
    }
  },

  async removeFromWishlist(userId: string, productId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .match({ user_id: userId, product_id: productId });

      return { error };
    } catch (error) {
      return { error };
    }
  }
};
