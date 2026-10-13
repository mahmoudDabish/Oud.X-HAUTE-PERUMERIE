import { supabase } from '../lib/supabaseClient';
import { Product } from '../types';

export const productService = {
  async getProducts(): Promise<{ data: Product[] | null, error: any }> {
    try {
      // Fetch base products and categories
      let { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          categories ( id, name )
        `)
        .order('created_at', { ascending: false });
        
      if (productsError && productsError.code === 'PGRST200') {
        console.warn('Relationships missing, falling back to basic products fetch');
        const fallback = await supabase.from('products').select('*');
        productsData = fallback.data;
        productsError = fallback.error;
      }
        
      if (productsError || !productsData) return { data: null, error: productsError };

      // Fetch variants
      const { data: variantsData, error: variantsError } = await supabase.from('product_variants').select('*');
      if (variantsError) {
        console.warn('Could not load product variants:', variantsError);
      }
      
      // Fetch product images directly (now lightweight Storage URLs)
      let imagesData: any[] = [];
      const { data: imgData, error: imgError } = await supabase
        .from('product_images')
        .select('product_id, url, is_main');

      if (imgError) {
        console.warn('Could not load product images from Supabase:', imgError.message);
      } else if (imgData) {
        imagesData = imgData;
      }

      // Transform data to match frontend types
      const products: Product[] = productsData.map((p: any) => {
        const productVariants = variantsData?.filter(v => v.product_id === p.id) || [];
        const productImages = imagesData?.filter(img => img.product_id === p.id) || [];
        
        return {
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
          size: p.size,
          availableSizes: productVariants.map((v: any) => ({
            size: v.size,
            price: v.price,
            compareAtPrice: v.compare_at_price
          })),
          concentration: p.concentration,
          fragranceFamily: p.fragrance_family,
          nameAr: p.name_ar || p.notes?.ar?.name || (typeof p.notes?.name_ar === 'string' ? p.notes.name_ar : undefined),
          subtitleAr: p.subtitle_ar || p.notes?.ar?.subtitle || (typeof p.notes?.subtitle_ar === 'string' ? p.notes.subtitle_ar : undefined),
          descriptionAr: p.description_ar || p.notes?.ar?.description || (typeof p.notes?.description_ar === 'string' ? p.notes.description_ar : undefined),
          storyAr: p.story_ar || p.notes?.ar?.story || (typeof p.notes?.story_ar === 'string' ? p.notes.story_ar : undefined),
          notes: {
            top: p.notes?.top || [],
            heart: p.notes?.heart || [],
            base: p.notes?.base || []
          },
          notesAr: p.notes_ar || (p.notes?.ar && (p.notes.ar.top || p.notes.ar.heart || p.notes.ar.base) ? {
            top: p.notes.ar.top || [],
            heart: p.notes.ar.heart || [],
            base: p.notes.ar.base || []
          } : undefined),
          longevity: p.longevity,
          sillage: p.sillage,
          season: Array.isArray(p.season) ? p.season : [],
          stock: p.stock,
          badge: p.badge,
          images: productImages.map((img: any) => img.url),
          isFeatured: p.is_featured,
          isBestSeller: p.is_best_seller,
          isNew: p.is_new,
          isSale: p.is_sale,
          rating: p.rating || 5,
          reviewCount: p.review_count || 0,
          reviews: []
        };
      });

      // Place out of stock products at the end
      products.sort((a, b) => {
        const aOut = (a.stock ?? 0) <= 0;
        const bOut = (b.stock ?? 0) <= 0;
        if (aOut !== bOut) return aOut ? 1 : -1;
        return 0;
      });

      return { data: products, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async getProductBySlug(slug: string): Promise<{ data: Product | null, error: any }> {
    try {
      const { data: p, error } = await supabase
        .from('products')
        .select(`
          *,
          categories ( id, name ),
          product_variants ( size, price, compare_at_price )
        `)
        .eq('slug', slug)
        .single();
        
      if (error || !p) return { data: null, error };

      // Fetch images for this specific product
      const { data: productImages } = await supabase
        .from('product_images')
        .select('url')
        .eq('product_id', p.id);

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
        size: p.size,
        availableSizes: p.product_variants?.map((v: any) => ({
          size: v.size,
          price: v.price,
          compareAtPrice: v.compare_at_price
        })) || [],
        concentration: p.concentration,
        fragranceFamily: p.fragrance_family,
        nameAr: p.name_ar || p.notes?.ar?.name || (typeof p.notes?.name_ar === 'string' ? p.notes.name_ar : undefined),
        subtitleAr: p.subtitle_ar || p.notes?.ar?.subtitle || (typeof p.notes?.subtitle_ar === 'string' ? p.notes.subtitle_ar : undefined),
        descriptionAr: p.description_ar || p.notes?.ar?.description || (typeof p.notes?.description_ar === 'string' ? p.notes.description_ar : undefined),
        storyAr: p.story_ar || p.notes?.ar?.story || (typeof p.notes?.story_ar === 'string' ? p.notes.story_ar : undefined),
        notes: {
          top: p.notes?.top || [],
          heart: p.notes?.heart || [],
          base: p.notes?.base || []
        },
        notesAr: p.notes_ar || (p.notes?.ar && (p.notes.ar.top || p.notes.ar.heart || p.notes.ar.base) ? {
          top: p.notes.ar.top || [],
          heart: p.notes.ar.heart || [],
          base: p.notes.ar.base || []
        } : undefined),
        longevity: p.longevity,
        sillage: p.sillage,
        season: Array.isArray(p.season) ? p.season : [],
        stock: p.stock,
        badge: p.badge,
        images: productImages?.map((img: any) => img.url) || [],
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

      const notesObj: any = {
        top: productData.notes?.top || [],
        heart: productData.notes?.heart || [],
        base: productData.notes?.base || []
      };

      if (
        productData.nameAr ||
        productData.subtitleAr ||
        productData.descriptionAr ||
        productData.storyAr ||
        productData.notesAr
      ) {
        notesObj.ar = {
          name: productData.nameAr || undefined,
          subtitle: productData.subtitleAr || undefined,
          description: productData.descriptionAr || undefined,
          story: productData.storyAr || undefined,
          top: productData.notesAr?.top || undefined,
          heart: productData.notesAr?.heart || undefined,
          base: productData.notesAr?.base || undefined
        };
      }

      const insertData: any = {
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
        notes: notesObj,
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

      if (productData.nameAr) insertData.name_ar = productData.nameAr;
      if (productData.subtitleAr) insertData.subtitle_ar = productData.subtitleAr;
      if (productData.descriptionAr) insertData.description_ar = productData.descriptionAr;
      if (productData.storyAr) insertData.story_ar = productData.storyAr;
      if (productData.notesAr) insertData.notes_ar = productData.notesAr;

      let { data, error } = await supabase
        .from('products')
        .insert(insertData)
        .select()
        .single();
        
      // If root columns do not exist in DB yet (42703 or PGRST204), retry without root _ar columns
      if (error && (error.code === '42703' || error.code === 'PGRST204' || error.message?.includes('does not exist') || error.message?.includes('Could not find'))) {
        delete insertData.name_ar;
        delete insertData.subtitle_ar;
        delete insertData.description_ar;
        delete insertData.story_ar;
        delete insertData.notes_ar;
        const fallbackRes = await supabase.from('products').insert(insertData).select().single();
        data = fallbackRes.data;
        error = fallbackRes.error;
      }

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
        nameAr: productData.nameAr || data.name_ar || data.notes?.ar?.name,
        slug: data.slug,
        brand: data.brand,
        subtitle: data.subtitle,
        subtitleAr: productData.subtitleAr || data.subtitle_ar || data.notes?.ar?.subtitle,
        description: data.description,
        descriptionAr: productData.descriptionAr || data.description_ar || data.notes?.ar?.description,
        story: data.story,
        storyAr: productData.storyAr || data.story_ar || data.notes?.ar?.story,
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
        notesAr: productData.notesAr || data.notes_ar || (data.notes?.ar ? {
          top: data.notes.ar.top || [],
          heart: data.notes.ar.heart || [],
          base: data.notes.ar.base || []
        } : undefined),
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
      if ('name' in updates) updateData.name = updates.name;
      if ('brand' in updates) updateData.brand = updates.brand;
      if ('subtitle' in updates) updateData.subtitle = updates.subtitle;
      if ('description' in updates) updateData.description = updates.description;
      if ('story' in updates) updateData.story = updates.story;
      if ('price' in updates) updateData.price = updates.price;
      if ('compareAtPrice' in updates) updateData.compare_at_price = updates.compareAtPrice ?? null;
      if ('stock' in updates) updateData.stock = updates.stock;
      if ('isFeatured' in updates) updateData.is_featured = updates.isFeatured;
      if ('isSale' in updates) updateData.is_sale = updates.isSale;
      if ('isNew' in updates) updateData.is_new = updates.isNew;
      if ('isBestSeller' in updates) updateData.is_best_seller = updates.isBestSeller;
      if ('badge' in updates) updateData.badge = updates.badge ?? null;
      if ('categoryId' in updates) updateData.category_id = updates.categoryId;
      if ('gender' in updates) updateData.gender = updates.gender;
      if ('concentration' in updates) updateData.concentration = updates.concentration;
      if ('fragranceFamily' in updates) updateData.fragrance_family = updates.fragranceFamily;
      if ('longevity' in updates) updateData.longevity = updates.longevity;
      if ('sillage' in updates) updateData.sillage = updates.sillage;
      if ('season' in updates) updateData.season = updates.season;
      if ('size' in updates) updateData.size = updates.size;

      // Handle notes and notes.ar merging carefully
      if (
        'notes' in updates ||
        'nameAr' in updates ||
        'subtitleAr' in updates ||
        'descriptionAr' in updates ||
        'storyAr' in updates ||
        'notesAr' in updates
      ) {
        const { data: currentProd } = await supabase
          .from('products')
          .select('notes')
          .eq('id', id)
          .single();

        const currentNotes = currentProd?.notes || {};
        const currentAr = currentNotes.ar || {};

        const mergedNotes: any = {
          top: ('notes' in updates && updates.notes?.top) ? updates.notes.top : (currentNotes.top || []),
          heart: ('notes' in updates && updates.notes?.heart) ? updates.notes.heart : (currentNotes.heart || []),
          base: ('notes' in updates && updates.notes?.base) ? updates.notes.base : (currentNotes.base || [])
        };

        const mergedAr: any = {
          name: updates.nameAr !== undefined ? updates.nameAr : currentAr.name,
          subtitle: updates.subtitleAr !== undefined ? updates.subtitleAr : currentAr.subtitle,
          description: updates.descriptionAr !== undefined ? updates.descriptionAr : currentAr.description,
          story: updates.storyAr !== undefined ? updates.storyAr : currentAr.story,
          top: (updates.notesAr?.top !== undefined) ? updates.notesAr.top : currentAr.top,
          heart: (updates.notesAr?.heart !== undefined) ? updates.notesAr.heart : currentAr.heart,
          base: (updates.notesAr?.base !== undefined) ? updates.notesAr.base : currentAr.base
        };

        const cleanAr: any = {};
        Object.entries(mergedAr).forEach(([k, v]) => {
          if (v !== undefined && v !== '') cleanAr[k] = v;
        });

        if (Object.keys(cleanAr).length > 0) {
          mergedNotes.ar = cleanAr;
        }

        updateData.notes = mergedNotes;
      }

      if ('nameAr' in updates && updates.nameAr !== undefined) updateData.name_ar = updates.nameAr;
      if ('subtitleAr' in updates && updates.subtitleAr !== undefined) updateData.subtitle_ar = updates.subtitleAr;
      if ('descriptionAr' in updates && updates.descriptionAr !== undefined) updateData.description_ar = updates.descriptionAr;
      if ('storyAr' in updates && updates.storyAr !== undefined) updateData.story_ar = updates.storyAr;
      if ('notesAr' in updates && updates.notesAr !== undefined) updateData.notes_ar = updates.notesAr;

      let { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id);

      // If root columns do not exist in DB yet (42703 or PGRST204), retry without root _ar columns
      if (error && (error.code === '42703' || error.code === 'PGRST204' || error.message?.includes('does not exist') || error.message?.includes('Could not find'))) {
        delete updateData.name_ar;
        delete updateData.subtitle_ar;
        delete updateData.description_ar;
        delete updateData.story_ar;
        delete updateData.notes_ar;
        const retryRes = await supabase.from('products').update(updateData).eq('id', id);
        error = retryRes.error;
      }

      if (error) return { error };

      // Update variants if provided
      if ('availableSizes' in updates && Array.isArray(updates.availableSizes)) {
        await supabase.from('product_variants').delete().eq('product_id', id);
        if (updates.availableSizes.length > 0) {
          const variantInserts = updates.availableSizes.map(v => ({
            product_id: id,
            size: v.size,
            price: v.price,
            compare_at_price: v.compareAtPrice
          }));
          await supabase.from('product_variants').insert(variantInserts);
        }
      }

      // Update images if provided
      if ('images' in updates && Array.isArray(updates.images)) {
        await supabase.from('product_images').delete().eq('product_id', id);
        if (updates.images.length > 0) {
          const imageInserts = updates.images.map((url, idx) => ({
            product_id: id,
            url,
            is_main: idx === 0
          }));
          await supabase.from('product_images').insert(imageInserts);
        }
      }

      return { error: null };
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
