import { supabase } from '../lib/supabaseClient';
import { UserProfile } from '../types';

export const authService = {
  async register(email: string, password?: string, fullName?: string): Promise<{ data: any, error: any }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: password || 'default-password-if-magic-link',
        options: {
          data: {
            full_name: fullName
          }
        }
      });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async login(email: string, password?: string): Promise<{ data: any, error: any }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: password || 'default-password-if-magic-link'
      });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async logout(): Promise<{ error: any }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error };
    }
  },

  async getSession(): Promise<{ session: any, userProfile: UserProfile | null, error: any }> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) return { session: null, userProfile: null, error };

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (!profileData) return { session, userProfile: null, error: null };

      const userProfile: UserProfile = {
        id: profileData.id,
        email: session.user.email || '',
        name: profileData.full_name || session.user.email?.split('@')[0] || '',
        phone: profileData.phone || '',
        tier: profileData.tier || 'Oud Privé Member',
        points: profileData.points || 0,
        addresses: [],
        orders: []
      };

      return { session, userProfile, error: null };
    } catch (error) {
      return { session: null, userProfile: null, error };
    }
  }
};
