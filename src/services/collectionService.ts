import { supabase } from '../lib/supabaseClient';

export interface HomeCollection {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  href: string;
  icon_type: string;
  display_order: number;
  is_active: boolean;
}

export const collectionService = {
  async getHomeCollections(): Promise<{ data: HomeCollection[] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('home_collections')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Supabase error fetching home collections:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (err: any) {
      console.error('Unexpected error fetching home collections:', err);
      return { data: null, error: err };
    }
  }
};
