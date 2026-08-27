import { supabase } from '../lib/supabaseClient';
import { Product } from '../types';

export const productService = {
  async getProducts(): Promise<{ data: Product[] | null, error: any }> {
    try {
      let { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories ( id, name ),
          product_variants ( size, price, compare_at_price ),
          product_images ( url, is_main )
        `);
        
      if (error && error.code === 'PGRST200') {
        // Fallback if relations like categories aren't set up yet
        console.warn('Relationships missing, falling back to basic products fetch');
        const fallback = await supabase.from('products').select('*');
        data = fallback.data;
        error = fallback.error;
      }
        
      if (error || !data) return { data: null, error };

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
        category: p.categories?.name || p.category_id,
        categoryId: p.category_id,
        gender: p.gender,
        concentration: p.concentration,
        fragranceFamily: p.fragrance_family,
        notes: {
          top: p.notes?.top || [],
          heart: p.notes?.heart || [],
          base: p.notes?.base || []
        },
        longevity: p.longevity,
        sillage: p.sillage,
        season: Array.isArray(p.season) ? p.season : [],
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
          categories ( id, name ),
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
        category: p.categories?.name || p.category_id,
        categoryId: p.category_id,
        gender: p.gender,
        concentration: p.concentration,
        fragranceFamily: p.fragrance_family,
        notes: {
          top: p.notes?.top || [],
          heart: p.notes?.heart || [],
          base: p.notes?.base || []
        },
        longevity: p.longevity,
        sillage: p.sillage,
        season: Array.isArray(p.season) ? p.season : [],
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
      const generatedSlug = productData.slug || 
        (productData.name 
          ? productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000)
          : `product-${Date.now()}`);

      const insertData = {
        name: productData.name,
        slug: generatedSlug,
        brand: productData.brand,
        subtitle: productData.subtitle,
        description: productData.description,
        story: productData.story,
        price: productData.price || 0,
        compare_at_price: productData.compareAtPrice,
        category_id: productData.categoryId || productData.category,
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
        
      if (error || !data) return { data: null, error };

      // Insert images if available
      if (productData.images && productData.images.length > 0) {
        const imageInserts = productData.images.map((url, idx) => ({
          product_id: data.id,
          url,
          is_main: idx === 0
        }));
        await supabase.from('product_images').insert(imageInserts);
      }

      // Insert variants if available
      if (productData.availableSizes && productData.availableSizes.length > 0) {
        const variantInserts = productData.availableSizes.map(v => ({
          product_id: data.id,
          size: v.size,
          price: v.price,
          compare_at_price: v.compareAtPrice
        }));
        await supabase.from('product_variants').insert(variantInserts);
      }

      // Return fully mapped product for frontend state
      const mappedProduct: Product = {
        id: data.id,
        name: data.name,
        slug: data.slug,
        brand: data.brand,
        subtitle: data.subtitle,
        description: data.description,
        story: data.story,
        price: data.price,
        compareAtPrice: data.compare_at_price,
        category: productData.category || data.category_id,
        categoryId: data.category_id,
        gender: data.gender,
        concentration: data.concentration,
        fragranceFamily: data.fragrance_family,
        notes: {
          top: data.notes?.top || [],
          heart: data.notes?.heart || [],
          base: data.notes?.base || []
        },
        longevity: data.longevity,
        sillage: data.sillage,
        season: Array.isArray(data.season) ? data.season : [],
        size: data.size,
        availableSizes: Array.isArray(productData.availableSizes) ? productData.availableSizes : [],
        stock: data.stock,
        badge: data.badge,
        images: Array.isArray(productData.images) ? productData.images : [],
        isFeatured: data.is_featured,
        isBestSeller: data.is_best_seller,
        isNew: data.is_new,
        isSale: data.is_sale,
        rating: 5,
        reviewCount: 0,
        reviews: []
      };

      return { data: mappedProduct, error: null };
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
      if (updates.categoryId) updateData.category_id = updates.categoryId;
      if (updates.gender) updateData.gender = updates.gender;

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
