import { supabase } from '../lib/supabaseClient';
import { Product } from '../types';

export const productService = {
  async getProducts(): Promise<{ data: Product[] | null, error: any }> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_variants ( size, price, compare_at_price ),
          product_images ( url, is_main )
        `);
        
      if (error) return { data: null, error };

      // Transform data to match frontend types
      const products: Product[] = data.map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        brand: p.brand,
        subtitle: p.subtitle,
        description: p.description,
        story: p.story,
        price: p.price,
        compareAtPrice: p.compare_at_price,
        category: p.category_id,
        gender: p.gender,
        concentration: p.concentration,
        fragranceFamily: p.fragrance_family,
        notes: p.notes || { top: [], heart: [], base: [] },
        longevity: p.longevity,
        sillage: p.sillage,
        season: p.season,
        size: p.size,
        availableSizes: p.product_variants || [],
        stock: p.stock,
        badge: p.badge,
        images: p.product_images?.map((img: any) => img.url) || [],
        isFeatured: p.is_featured,
        isBestSeller: p.is_best_seller,
        isNew: p.is_new,
        isSale: p.is_sale,
        rating: p.rating || 5,
        reviewCount: p.review_count || 0,
        reviews: []
      }));

      return { data: products, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async getProductBySlug(slug: string): Promise<{ data: Product | null, error: any }> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_variants ( size, price, compare_at_price ),
          product_images ( url, is_main )
        `)
        .eq('slug', slug)
        .single();
        
      if (error || !data) return { data: null, error };

      const p = data;
      const product: Product = {
        id: p.id,
        name: p.name,
        slug: p.slug,
        brand: p.brand,
        subtitle: p.subtitle,
        description: p.description,
        story: p.story,
        price: p.price,
        compareAtPrice: p.compare_at_price,
        category: p.category_id,
        gender: p.gender,
        concentration: p.concentration,
        fragranceFamily: p.fragrance_family,
        notes: p.notes || { top: [], heart: [], base: [] },
        longevity: p.longevity,
        sillage: p.sillage,
        season: p.season,
        size: p.size,
        availableSizes: p.product_variants || [],
        stock: p.stock,
        badge: p.badge,
        images: p.product_images?.map((img: any) => img.url) || [],
        isFeatured: p.is_featured,
        isBestSeller: p.is_best_seller,
        isNew: p.is_new,
        isSale: p.is_sale,
        rating: p.rating || 5,
        reviewCount: p.review_count || 0,
        reviews: []
      };

      return { data: product, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Admin Mutations
  async createProduct(productData: Partial<Product>): Promise<{ data: any, error: any }> {
    try {
      const insertData = {
        name: productData.name,
        slug: productData.slug,
        brand: productData.brand,
        subtitle: productData.subtitle,
        description: productData.description,
        story: productData.story,
        price: productData.price || 0,
        compare_at_price: productData.compareAtPrice,
        category_id: productData.category,
        gender: productData.gender,
        concentration: productData.concentration,
        fragrance_family: productData.fragranceFamily,
        notes: productData.notes,
        longevity: productData.longevity,
        sillage: productData.sillage,
        season: productData.season,
        size: productData.size,
        stock: productData.stock || 0,
        badge: productData.badge,
        is_featured: productData.isFeatured || false,
        is_best_seller: productData.isBestSeller || false,
        is_new: productData.isNew || false,
        is_sale: productData.isSale || false
      };

      const { data, error } = await supabase
        .from('products')
        .insert(insertData)
        .select()
        .single();
        
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<{ error: any }> {
    try {
      const updateData: any = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.price !== undefined) updateData.price = updates.price;
      if (updates.stock !== undefined) updateData.stock = updates.stock;
      if (updates.description) updateData.description = updates.description;
      if (updates.isFeatured !== undefined) updateData.is_featured = updates.isFeatured;

      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id);

      return { error };
    } catch (error) {
      return { error };
    }
  },

  async deleteProduct(id: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      return { error };
    } catch (error) {
      return { error };
    }
  },

  async adjustStock(id: string, newStock: number): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('products')
        .update({ stock: Math.max(0, newStock) })
        .eq('id', id);
      return { error };
    } catch (error) {
      return { error };
    }
  }
};
