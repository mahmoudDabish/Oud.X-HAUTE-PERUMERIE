import { BrandItem } from '../types';
import { supabase } from '../lib/supabaseClient';

export const DEFAULT_BRANDS: BrandItem[] = [
  {
    id: 'maison-asrar',
    name: 'Maison Asrar',
    nameAr: 'ميسون أسرار',
    tag: 'DUBAI / PARIS',
    iconPreset: 'key',
    displayOrder: 1,
    isActive: true
  },
  {
    id: 'gulf-orchid',
    name: 'Gulf Orchid',
    nameAr: 'جلف أوركيد',
    tag: 'HAUTE PARFUM',
    iconPreset: 'orchid',
    displayOrder: 2,
    isActive: true
  },
  {
    id: 'armaf',
    name: 'Armaf',
    nameAr: 'أرماف',
    tag: 'LUXURY PARFUMS',
    iconPreset: 'crown',
    displayOrder: 3,
    isActive: true
  },
  {
    id: 'lattafa',
    name: 'Lattafa',
    nameAr: 'لطافة',
    tag: 'DUBAI',
    iconPreset: 'flame',
    displayOrder: 4,
    isActive: true
  },
  {
    id: 'ibraheem-al-qurashi',
    name: 'Ibraheem Al.Qurashi',
    nameAr: 'إبراهيم القرشي',
    tag: 'SINCE 1929',
    iconPreset: 'palmette',
    displayOrder: 5,
    isActive: true
  },
  {
    id: 'gissah',
    name: 'Gissah',
    nameAr: 'قصة',
    tag: 'KUWAIT',
    iconPreset: 'script',
    displayOrder: 6,
    isActive: true
  },
  {
    id: 'afnan',
    name: 'Afnan Perfumes',
    nameAr: 'أفنان',
    tag: 'HERITAGE',
    iconPreset: 'wing',
    displayOrder: 7,
    isActive: true
  },
  {
    id: 'ajmal',
    name: 'Ajmal',
    nameAr: 'أجمل',
    tag: 'SINCE 1951',
    iconPreset: 'sunburst',
    displayOrder: 8,
    isActive: true
  },
  {
    id: 'alezz',
    name: 'Alezz',
    nameAr: 'العز',
    tag: 'ROYALTY',
    iconPreset: 'coronet',
    displayOrder: 9,
    isActive: true
  },
  {
    id: 'al-majed-oud',
    name: 'Al Majed Oud',
    nameAr: 'الماجد للعود',
    tag: 'EST. 1956',
    iconPreset: 'burner',
    displayOrder: 10,
    isActive: true
  },
  {
    id: 'rasasi',
    name: 'Rasasi',
    nameAr: 'الرصاصي',
    tag: 'ORIENTAL LUXE',
    iconPreset: 'calligraphy',
    displayOrder: 11,
    isActive: true
  },
  {
    id: 'oud-x-atelier',
    name: 'OUD.X Atelier',
    nameAr: 'عود إكس بريفيه',
    tag: 'HAUTE PARFUMERIE',
    iconPreset: 'atelier',
    displayOrder: 12,
    isActive: true
  }
];

const STORAGE_KEY = 'oudx_store_brands';

export const brandService = {
  getBrands(): BrandItem[] {
    try {
      if (typeof window === 'undefined') return DEFAULT_BRANDS;
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        }
      }
      // Initialize defaults silently without event dispatch during render
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_BRANDS));
      } catch {}
      return DEFAULT_BRANDS;
    } catch (e) {
      console.error('Failed to load brands from storage:', e);
      return DEFAULT_BRANDS;
    }
  },

  saveBrands(brands: BrandItem[]): void {
    try {
      if (typeof window === 'undefined') return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(brands));
      window.dispatchEvent(new CustomEvent('oudx_brands_updated', { detail: brands }));
    } catch (e) {
      console.error('Failed to save brands to storage:', e);
    }
  },

  addBrand(newBrandData: Omit<BrandItem, 'id'>): BrandItem {
    const brands = this.getBrands();
    const slug = newBrandData.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-') || `brand-${Date.now()}`;

    const id = brands.some(b => b.id === slug) ? `${slug}-${Date.now().toString(36)}` : slug;
    const maxOrder = brands.reduce((max, b) => Math.max(max, b.displayOrder || 0), 0);

    const brand: BrandItem = {
      ...newBrandData,
      id,
      displayOrder: newBrandData.displayOrder ?? (maxOrder + 1),
      isActive: newBrandData.isActive ?? true
    };

    const updated = [...brands, brand];
    this.saveBrands(updated);
    return brand;
  },

  updateBrand(id: string, updates: Partial<BrandItem>): BrandItem | null {
    const brands = this.getBrands();
    const index = brands.findIndex(b => b.id === id);
    if (index === -1) return null;

    const updatedBrand: BrandItem = {
      ...brands[index],
      ...updates
    };

    brands[index] = updatedBrand;
    this.saveBrands(brands);
    return updatedBrand;
  },

  deleteBrand(id: string): boolean {
    const brands = this.getBrands();
    const filtered = brands.filter(b => b.id !== id);
    if (filtered.length === brands.length) return false;
    this.saveBrands(filtered);
    return true;
  },

  resetToDefaults(): BrandItem[] {
    this.saveBrands(DEFAULT_BRANDS);
    return DEFAULT_BRANDS;
  },

  async uploadBrandLogo(file: File): Promise<{ url: string | null; error: Error | null }> {
    try {
      const allowedTypes = ['image/webp', 'image/jpeg', 'image/png', 'image/avif', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        return { url: null, error: new Error('Unsupported image format. Please use PNG, WebP, SVG or JPG.') };
      }

      if (file.size > 5 * 1024 * 1024) {
        return { url: null, error: new Error('Image exceeds 5MB size limit.') };
      }

      const fileExt = file.name.split('.').pop() || 'png';
      const fileName = `brand_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `brands/${fileName}`;

      const { error: uploadErr } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadErr) {
        // Fallback to Data URL base64 if storage bucket has issue
        console.warn('Storage bucket upload failed, using Data URL fallback:', uploadErr);
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        return { url: dataUrl, error: null };
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return { url: publicUrl, error: null };
    } catch (err: any) {
      return { url: null, error: err };
    }
  }
};
