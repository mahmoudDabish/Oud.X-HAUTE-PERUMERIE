import { BrandItem } from '../types';
import { supabase } from '../lib/supabaseClient';

export const DEFAULT_BRANDS: BrandItem[] = [
  {
    id: 'maison-asrar',
    name: 'Maison Asrar',
    nameAr: 'ميسون أسرار',
    tag: 'DUBAI / PARIS',
    logoUrl: '/images/maison-asrar-logo_45ca8419-0c67-40d2-a51d-ba8a2f580a5d-removebg-preview.png',
    iconPreset: 'key',
    displayOrder: 1,
    isActive: true
  },
  {
    id: 'gulf-orchid',
    name: 'Gulf Orchid',
    nameAr: 'جلف أوركيد',
    tag: 'HAUTE PARFUM',
    logoUrl: '/images/1778926179928-13ogiz-removebg-preview.png',
    iconPreset: 'orchid',
    displayOrder: 2,
    isActive: true
  },
  {
    id: 'armaf',
    name: 'Armaf',
    nameAr: 'أرماف',
    tag: 'LUXURY PARFUMS',
    logoUrl: '/images/cab3d53407b1bde48252848f362fc92d-3-removebg-preview.png',
    iconPreset: 'crown',
    displayOrder: 3,
    isActive: true
  },
  {
    id: 'lattafa',
    name: 'Lattafa',
    nameAr: 'لطافة',
    tag: 'DUBAI',
    logoUrl: '/images/lattafa-logo-final-2.svg',
    iconPreset: 'flame',
    displayOrder: 4,
    isActive: true
  },
  {
    id: 'ibraheem-al-qurashi',
    name: 'Ibraheem Al.Qurashi',
    nameAr: 'إبراهيم القرشي',
    tag: 'SINCE 1929',
    logoUrl: '/images/o.6368-removebg-preview.png',
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
    logoUrl: '/images/Rasasi_Logo.webp',
    iconPreset: 'calligraphy',
    displayOrder: 11,
    isActive: true
  },
  {
    id: 'oud-x-atelier',
    name: 'OUD.X Atelier',
    nameAr: 'عود إكس بريفيه',
    tag: 'HAUTE PARFUMERIE',
    logoUrl: '/images/Minimal_Gold_EX_Parfum_Logo-removebg-preview.png',
    iconPreset: 'atelier',
    displayOrder: 12,
    isActive: true
  }
];

const STORAGE_KEY = 'oudx_store_brands';

// In-memory cache to guarantee state consistency even if localStorage faces quota issues
let _memoryBrands: BrandItem[] | null = null;

/**
 * Optimizes a brand logo image to a max 280x280 WebP/PNG blob and data URL.
 * Produces an ultra-compact ~10-25 KB asset, preventing localStorage QuotaExceededError.
 */
async function optimizeBrandLogo(file: File): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      resolve({ blob: file, dataUrl: '' });
      return;
    }

    // SVG files can be handled as clean text/svg
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        const blob = new Blob([text], { type: 'image/svg+xml' });
        resolve({
          blob,
          dataUrl: text.startsWith('data:') ? text : `data:image/svg+xml;utf8,${encodeURIComponent(text)}`
        });
      };
      reader.onerror = reject;
      reader.readAsText(file);
      return;
    }

    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => {
        const fallbackReader = new FileReader();
        fallbackReader.onload = () => resolve({ blob: file, dataUrl: fallbackReader.result as string });
        fallbackReader.onerror = reject;
        fallbackReader.readAsDataURL(file);
      };
      img.onload = () => {
        try {
          const MAX_DIM = 280;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > MAX_DIM) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            }
          } else {
            if (height > MAX_DIM) {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve({ blob: file, dataUrl: reader.result as string });
            return;
          }

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                const dataUrl = canvas.toDataURL('image/png');
                resolve({ blob: file, dataUrl });
                return;
              }
              const dataUrl = canvas.toDataURL('image/webp', 0.88);
              resolve({ blob, dataUrl });
            },
            'image/webp',
            0.88
          );
        } catch {
          resolve({ blob: file, dataUrl: reader.result as string });
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export const brandService = {
  getBrands(): BrandItem[] {
    if (_memoryBrands && _memoryBrands.length > 0) {
      return [..._memoryBrands];
    }

    try {
      if (typeof window === 'undefined') return DEFAULT_BRANDS;
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const merged = parsed.map(b => {
            const def = DEFAULT_BRANDS.find(d => d.id === b.id);
            if (def?.logoUrl && !b.logoUrl) {
              return { ...b, logoUrl: def.logoUrl };
            }
            return b;
          });
          _memoryBrands = merged.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
          return [..._memoryBrands];
        }
      }
      _memoryBrands = [...DEFAULT_BRANDS];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_BRANDS));
      } catch {}
      return [...DEFAULT_BRANDS];
    } catch (e) {
      console.error('Failed to load brands from storage:', e);
      _memoryBrands = [...DEFAULT_BRANDS];
      return [...DEFAULT_BRANDS];
    }
  },

  saveBrands(brands: BrandItem[]): void {
    _memoryBrands = [...brands];
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(brands));
      }
    } catch (e: any) {
      console.warn('LocalStorage save warning, preserving in memory:', e?.message);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(brands));
      } catch (err2) {
        console.error('Critical quota error on brands save:', err2);
      }
    }
    // Always dispatch sync event so UI never reverts
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('oudx_brands_updated', { detail: brands }));
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

    const current = brands[index];
    const updatedBrand: BrandItem = {
      ...current,
      ...updates
    };

    // If logoUrl was cleared, explicitly delete property so it falls back to crest
    if (updates.logoUrl === '' || updates.logoUrl === null || (('logoUrl' in updates) && updates.logoUrl === undefined)) {
      delete updatedBrand.logoUrl;
    }

    const updatedList = [...brands];
    updatedList[index] = updatedBrand;
    this.saveBrands(updatedList);
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

      if (file.size > 10 * 1024 * 1024) {
        return { url: null, error: new Error('Image exceeds 10MB size limit.') };
      }

      // 1. Optimize image first (compress & resize to 280x280 WebP/PNG)
      let optimizedBlob: Blob = file;
      let optimizedDataUrl: string = '';
      try {
        const opt = await optimizeBrandLogo(file);
        optimizedBlob = opt.blob;
        optimizedDataUrl = opt.dataUrl;
      } catch (optErr) {
        console.warn('Logo optimization notice:', optErr);
      }

      const fileExt = file.type === 'image/svg+xml' ? 'svg' : 'webp';
      const fileName = `brand_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `brands/${fileName}`;

      // 2. Try Supabase Storage upload
      try {
        const { error: uploadErr } = await supabase.storage
          .from('product-images')
          .upload(filePath, optimizedBlob, {
            contentType: file.type === 'image/svg+xml' ? 'image/svg+xml' : 'image/webp',
            cacheControl: '3600',
            upsert: true
          });

        if (!uploadErr) {
          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath);

          return { url: publicUrl, error: null };
        } else {
          console.warn('Storage upload returned error, using optimized Data URL fallback:', uploadErr.message);
        }
      } catch (storageException: any) {
        console.warn('Storage connection exception, using optimized Data URL fallback:', storageException?.message);
      }

      // 3. Ultra-compact fallback (~10-25KB, fits safely in localStorage)
      if (optimizedDataUrl) {
        return { url: optimizedDataUrl, error: null };
      }

      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      return { url: dataUrl, error: null };
    } catch (err: any) {
      return { url: null, error: err };
    }
  }
};
