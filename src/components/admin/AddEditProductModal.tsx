import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Product, FragranceConcentration, FragranceFamily, FragranceGender } from '../../types';
import { X, Sparkles, Plus, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import {
  getLocalizedCategory,
  getLocalizedGender,
  getLocalizedBadge,
  getLocalizedFragranceFamily,
  getLocalizedConcentration,
  getLocalizedLongevity,
  getLocalizedSillage
} from '../../i18n/presentation';

interface AddEditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Partial<Product>) => void;
  productToEdit?: Product | null;
}

const PRESET_IMAGES = [
  { label: 'Royal Black & Gold Flacon', url: '/images/hero_oud_bottle_1787700482747.jpg' },
  { label: 'Amber Crystal Bottle', url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop' },
  { label: 'Smoky Dark Elixir', url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=1000&auto=format&fit=crop' },
  { label: 'Golden Honey Flacon', url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=1000&auto=format&fit=crop' },
  { label: 'Velvet Midnight Flacon', url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop' },
  { label: 'Minimalist Noir Bottle', url: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?q=80&w=1000&auto=format&fit=crop' }
];

const PRESET_BRANDS = [
  'OUD_X PRIVE',
  'LATTAFA PRIVE',
  'MAISON FRANCIS KURKDJIAN',
  'NASOMATTO',
  'TOM FORD PRIVATE BLEND',
  'ROJA PARFUMS',
  'XERJOFF CASAMORATI'
];

export const AddEditProductModal: React.FC<AddEditProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  productToEdit
}) => {
  const { t } = useTranslation();
  const isEditing = !!productToEdit;

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('OUD_X PRIVE');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [story, setStory] = useState('');
  const [price, setPrice] = useState(1950);
  const [compareAtPrice, setCompareAtPrice] = useState<number | undefined>(undefined);
  const [stock, setStock] = useState(25);
  const [category, setCategory] = useState<string>('11111111-1111-1111-1111-111111111111');
  const [gender, setGender] = useState<FragranceGender>('unisex');
  const [concentration, setConcentration] = useState<FragranceConcentration>('Eau de Parfum');
  const PRESET_FAMILIES: FragranceFamily[] = [
    'Smoky Oud',
    'Oriental Woody',
    'Amber Gourmand',
    'Spicy Leather',
    'Floral Citrus',
    'Aromatic Fougere',
    'Warm Resin'
  ];

  const [fragranceFamily, setFragranceFamily] = useState<string>('Smoky Oud');
  const [isCustomFamily, setIsCustomFamily] = useState(false);
  const [customFamilyInput, setCustomFamilyInput] = useState('');
  const [longevity, setLongevity] = useState<Product['longevity']>('14-18 Hours (Beast Mode)');
  const [sillage, setSillage] = useState<Product['sillage']>('Intense / Enormous');
  const [badge, setBadge] = useState<Product['badge'] | 'NONE'>('NEW');
  const [isFeatured, setIsFeatured] = useState(false);

  // English Notes
  const [topNotes, setTopNotes] = useState('');
  const [heartNotes, setHeartNotes] = useState('');
  const [baseNotes, setBaseNotes] = useState('');

  // Arabic Localized Fields
  const [nameAr, setNameAr] = useState('');
  const [subtitleAr, setSubtitleAr] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [storyAr, setStoryAr] = useState('');
  const [topNotesAr, setTopNotesAr] = useState('');
  const [heartNotesAr, setHeartNotesAr] = useState('');
  const [baseNotesAr, setBaseNotesAr] = useState('');

  // Active formulation tab: 'en' | 'ar'
  const [contentTab, setContentTab] = useState<'en' | 'ar'>('en');

  // Images
  const [imageUrls, setImageUrls] = useState<string[]>([
    '/images/hero_oud_bottle_1787700482747.jpg'
  ]);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Sizes
  const [sizes, setSizes] = useState<{ size: string, price: number, compareAtPrice?: number }[]>([
    { size: '100ml / 3.4 fl.oz', price: 1950, compareAtPrice: undefined }
  ]);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name || '');
      setBrand(productToEdit.brand || 'OUD_X PRIVE');
      setSubtitle(productToEdit.subtitle || '');
      setDescription(productToEdit.description || '');
      setStory(productToEdit.story || '');

      setNameAr(productToEdit.nameAr || (productToEdit as any).notes?.ar?.name || '');
      setSubtitleAr(productToEdit.subtitleAr || (productToEdit as any).notes?.ar?.subtitle || '');
      setDescriptionAr(productToEdit.descriptionAr || (productToEdit as any).notes?.ar?.description || '');
      setStoryAr(productToEdit.storyAr || (productToEdit as any).notes?.ar?.story || '');

      setPrice(productToEdit.price || 1950);
      setCompareAtPrice(productToEdit.compareAtPrice);
      setStock(productToEdit.stock ?? 25);
      setCategory(productToEdit.categoryId || '11111111-1111-1111-1111-111111111111');
      setGender((productToEdit.gender as FragranceGender) || 'unisex');
      setConcentration(productToEdit.concentration || 'Eau de Parfum');

      const existingFamily = productToEdit.fragranceFamily || 'Smoky Oud';
      setFragranceFamily(existingFamily);
      const isPreset = PRESET_FAMILIES.includes(existingFamily as any);
      if (!isPreset && existingFamily.trim()) {
        setIsCustomFamily(true);
        setCustomFamilyInput(existingFamily);
      } else {
        setIsCustomFamily(false);
        setCustomFamilyInput('');
      }

      setLongevity(productToEdit.longevity || '14-18 Hours (Beast Mode)');
      setSillage(productToEdit.sillage || 'Intense / Enormous');
      setBadge(productToEdit.badge || 'NONE');
      setIsFeatured(productToEdit.isFeatured || false);

      const toNotesString = (val: any) => {
        if (!val) return '';
        if (Array.isArray(val)) return val.join(', ');
        return String(val);
      };
      setTopNotes(toNotesString(productToEdit.notes?.top));
      setHeartNotes(toNotesString(productToEdit.notes?.heart));
      setBaseNotes(toNotesString(productToEdit.notes?.base));

      const toArNotesString = (val: any) => {
        if (!val) return '';
        if (Array.isArray(val)) return val.join('، ');
        return String(val);
      };
      setTopNotesAr(toArNotesString(productToEdit.notesAr?.top || (productToEdit as any).notes?.ar?.top));
      setHeartNotesAr(toArNotesString(productToEdit.notesAr?.heart || (productToEdit as any).notes?.ar?.heart));
      setBaseNotesAr(toArNotesString(productToEdit.notesAr?.base || (productToEdit as any).notes?.ar?.base));

      if (productToEdit.images && productToEdit.images.length > 0) {
        setImageUrls(productToEdit.images);
      } else {
        setImageUrls(['/images/hero_oud_bottle_1787700482747.jpg']);
      }

      if (productToEdit.availableSizes && productToEdit.availableSizes.length > 0) {
        setSizes(productToEdit.availableSizes);
      }
    } else {
      // Reset form clean without hardcoded English text
      setName('');
      setNameAr('');
      setBrand('OUD_X PRIVE');
      setSubtitle('');
      setSubtitleAr('');
      setDescription('');
      setDescriptionAr('');
      setStory('');
      setStoryAr('');
      setPrice(1950);
      setCompareAtPrice(undefined);
      setStock(25);
      setCategory('11111111-1111-1111-1111-111111111111');
      setGender('unisex');
      setConcentration('Eau de Parfum');
      setFragranceFamily('Smoky Oud');
      setLongevity('14-18 Hours (Beast Mode)');
      setSillage('Intense / Enormous');
      setBadge('NEW');
      setIsFeatured(false);
      setTopNotes('');
      setHeartNotes('');
      setBaseNotes('');
      setTopNotesAr('');
      setHeartNotesAr('');
      setBaseNotesAr('');
      setImageUrls(['/images/hero_oud_bottle_1787700482747.jpg']);
      setSizes([
        { size: '100ml / 3.4 fl.oz', price: 1950, compareAtPrice: undefined }
      ]);
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddImage = (url: string) => {
    if (!url.trim()) return;
    if (!imageUrls.includes(url.trim())) {
      setImageUrls([...imageUrls, url.trim()]);
    }
    setCustomImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    if (imageUrls.length <= 1) return;
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleAddSize = () => {
    setSizes([...sizes, { size: '', price: price }]);
  };

  const handleRemoveSize = (index: number) => {
    if (sizes.length <= 1) return;
    setSizes(sizes.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parseList = (str: string) =>
      str
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

    const parseArList = (str: string) =>
      str
        .split(/[،,]/)
        .map(s => s.trim())
        .filter(Boolean);

    const finalFragranceFamily = isCustomFamily ? (customFamilyInput.trim() || 'Smoky Oud') : fragranceFamily;
    const hasArNotes = Boolean(topNotesAr.trim() || heartNotesAr.trim() || baseNotesAr.trim());

    const productPayload: Partial<Product> = {
      ...(productToEdit || {}),
      name: name.trim(),
      nameAr: nameAr.trim() || productToEdit?.nameAr || undefined,
      brand: brand.trim(),
      subtitle: subtitle.trim() || `${concentration} • ${finalFragranceFamily}`,
      subtitleAr: subtitleAr.trim() || productToEdit?.subtitleAr || undefined,
      description:
        description.trim() ||
        `An artisanal extrait de parfum showcasing rare raw essences and royal Cambodian agarwood. Formulated for remarkable longevity and regal sillage.`,
      descriptionAr: descriptionAr.trim() || productToEdit?.descriptionAr || undefined,
      story:
        story.trim() ||
        `Crafted in strictly limited batches by OUD_X master perfumers, honoring ancestral Arabian distilling traditions.`,
      storyAr: storyAr.trim() || productToEdit?.storyAr || undefined,
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
      stock: Number(stock),
      categoryId: category,
      gender: gender as 'men' | 'women' | 'unisex',
      concentration,
      fragranceFamily: finalFragranceFamily,
      longevity,
      sillage,
      badge: badge === 'NONE' ? undefined : badge,
      isBestSeller: badge === 'BEST SELLER',
      isNew: badge === 'NEW',
      isSale: badge === 'SALE' || sizes.some(s => s.compareAtPrice && Number(s.compareAtPrice) > Number(s.price)),
      isFeatured,
      images: imageUrls,
      size: sizes[0]?.size || '100ml / 3.4 fl.oz',
      availableSizes: sizes.map(s => ({
        size: s.size,
        price: Number(s.price),
        compareAtPrice: s.compareAtPrice ? Number(s.compareAtPrice) : undefined
      })),
      notes: {
        top: parseList(topNotes),
        heart: parseList(heartNotes),
        base: parseList(baseNotes)
      },
      notesAr: hasArNotes ? {
        top: parseArList(topNotesAr),
        heart: parseArList(heartNotesAr),
        base: parseArList(baseNotesAr)
      } : productToEdit?.notesAr
    };

    onSave(productPayload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0D0C0A] border border-[#C9A45C]/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden my-auto">
        {/* Header */}
        <div className="p-6 border-b border-[#C9A45C]/20 flex items-center justify-between bg-[#151310]/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#C9A45C]/20 border border-[#C9A45C] flex items-center justify-center text-[#E3C27A]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-cinzel text-lg sm:text-xl font-bold text-[#F5F2EA] tracking-wide">
                {isEditing ? `${t('admin.modals.editTitle', 'Edit Fragrance Creation')}: ${productToEdit?.name}` : t('admin.modals.addTitle', 'Create New Haute Fragrance')}
              </h2>
              <p className="text-xs text-[#A7A29A]">
                {isEditing ? t('admin.modals.editSubtitle', 'Modify stock inventory, pricing, or formulation notes') : t('admin.modals.addSubtitle', 'Add new luxury fragrance directly to live boutique inventory')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#A7A29A] hover:text-[#F5F2EA] hover:bg-white/5 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          {/* Formulation Language Selection Tabs */}
          <div className="flex items-center justify-between p-2 bg-[#151310] border border-[#C9A45C]/30 rounded-xl">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setContentTab('en')}
                className={`py-1.5 px-3.5 rounded-lg text-xs font-bold tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  contentTab === 'en'
                    ? 'bg-[#C9A45C] text-[#070707] shadow-md shadow-[#C9A45C]/20'
                    : 'text-[#A7A29A] hover:text-[#F5F2EA]'
                }`}
              >
                <span>🇬🇧 {t('admin.modals.tabs.english', 'English Formulation (EN)')}</span>
              </button>
              <button
                type="button"
                onClick={() => setContentTab('ar')}
                className={`py-1.5 px-3.5 rounded-lg text-xs font-bold tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  contentTab === 'ar'
                    ? 'bg-[#C9A45C] text-[#070707] shadow-md shadow-[#C9A45C]/20'
                    : 'text-[#A7A29A] hover:text-[#F5F2EA]'
                }`}
              >
                <span>🇸🇦 {t('admin.modals.tabs.arabic', 'Arabic Formulation (العربية)')}</span>
                {Boolean(nameAr || descriptionAr || topNotesAr) && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400" title="Arabic content present" />
                )}
              </button>
            </div>
            <div className="text-[11px] text-[#8E713D] hidden sm:block px-2 font-medium">
              {contentTab === 'en' ? 'Base formulation in English' : 'البيانات المعربة للموقع العربي'}
            </div>
          </div>

          {/* Row 1: Name, Brand, Subtitle */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-xs uppercase font-bold tracking-[2px] text-[#C9A45C]">
                {contentTab === 'en'
                  ? `${t('admin.modals.productName', 'Fragrance Name')} *`
                  : `${t('admin.modals.productNameAr', 'Fragrance Name (Arabic)')}`}
              </label>
              {contentTab === 'en' ? (
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={t('admin.modals.placeholders.productName', "e.g. Bade'e Al Oud (Oud For Glory)")}
                  className="w-full px-4 py-2.5 bg-[#151310] border border-[#C9A45C]/30 rounded-xl text-sm text-[#F5F2EA] placeholder-stone-600 focus:outline-none focus:border-[#C9A45C]"
                />
              ) : (
                <input
                  type="text"
                  dir="rtl"
                  value={nameAr}
                  onChange={e => setNameAr(e.target.value)}
                  placeholder="مثال: بديع العود (عود فور جلوري)"
                  className="w-full px-4 py-2.5 bg-[#151310] border border-[#C9A45C]/50 rounded-xl text-sm text-[#F5F2EA] placeholder-stone-600 focus:outline-none focus:border-[#E3C27A]"
                />
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs uppercase font-bold tracking-[2px] text-[#C9A45C]">
                {t('admin.modals.brand', 'Maison / Brand')}
              </label>
              <input
                type="text"
                list="brand-suggestions"
                value={brand}
                onChange={e => setBrand(e.target.value)}
                placeholder={t('admin.modals.placeholders.brand', 'OUD_X PRIVE')}
                className="w-full px-4 py-2.5 bg-[#151310] border border-[#C9A45C]/30 rounded-xl text-sm text-[#F5F2EA] focus:outline-none focus:border-[#C9A45C]"
              />
              <datalist id="brand-suggestions">
                {PRESET_BRANDS.map(b => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Subtitle & Featured */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3 space-y-1.5">
              <label className="block text-xs uppercase font-bold tracking-[2px] text-[#C9A45C]">
                {contentTab === 'en'
                  ? t('admin.modals.subtitle', 'Subtitle / Olfactory Slogan')
                  : t('admin.modals.subtitleAr', 'Subtitle / Olfactory Slogan (Arabic)')}
              </label>
              {contentTab === 'en' ? (
                <input
                  type="text"
                  value={subtitle}
                  onChange={e => setSubtitle(e.target.value)}
                  placeholder={t('admin.modals.placeholders.subtitle', 'e.g. Smoky Cambodian Oud & Royal Saffron')}
                  className="w-full px-4 py-2.5 bg-[#151310] border border-[#C9A45C]/30 rounded-xl text-sm text-[#F5F2EA] placeholder-stone-600 focus:outline-none focus:border-[#C9A45C]"
                />
              ) : (
                <input
                  type="text"
                  dir="rtl"
                  value={subtitleAr}
                  onChange={e => setSubtitleAr(e.target.value)}
                  placeholder="مثال: العود الكمبودي المدخن والزعفران الملكي"
                  className="w-full px-4 py-2.5 bg-[#151310] border border-[#C9A45C]/50 rounded-xl text-sm text-[#F5F2EA] placeholder-stone-600 focus:outline-none focus:border-[#E3C27A]"
                />
              )}
            </div>
            <div className="md:col-span-1 space-y-1.5 flex flex-col justify-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={e => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded border-[#C9A45C]/30 text-[#C9A45C] focus:ring-[#C9A45C] bg-[#151310]"
                />
                <span className="text-xs uppercase font-bold tracking-[1px] text-[#C9A45C]">
                  {t('admin.modals.featured', 'Show in Hero Carousel')}
                </span>
              </label>
            </div>
          </div>

          {/* Row 2: Price, Compare Price, Stock, Badge */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[#151310]/50 border border-[#C9A45C]/20">
            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase font-bold tracking-wider text-[#E3C27A]">
                {t('admin.modals.basePrice', 'Base Price (EGP)')} *
              </label>
              <input
                type="number"
                required
                min="0"
                value={price}
                onChange={e => setPrice(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#070707] border border-[#C9A45C]/30 rounded-lg text-sm text-[#F0D9A4] font-bold focus:outline-none focus:border-[#C9A45C]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase font-bold tracking-wider text-[#A7A29A]">
                {t('admin.modals.comparePrice', 'Compare At (EGP)')}
              </label>
              <input
                type="number"
                min="0"
                value={compareAtPrice || ''}
                onChange={e => setCompareAtPrice(e.target.value ? Number(e.target.value) : undefined)}
                placeholder={t('admin.modals.placeholders.price', 'e.g. 2400')}
                className="w-full px-3 py-2 bg-[#070707] border border-white/10 rounded-lg text-sm text-[#A7A29A] focus:outline-none focus:border-[#C9A45C]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase font-bold tracking-wider text-[#E3C27A]">
                {t('admin.modals.stockUnits', 'Live Stock (Units)')} *
              </label>
              <input
                type="number"
                required
                min="0"
                value={stock}
                onChange={e => setStock(Number(e.target.value))}
                className={`w-full px-3 py-2 bg-[#070707] border rounded-lg text-sm font-bold focus:outline-none ${stock === 0
                    ? 'text-red-400 border-red-500/50'
                    : stock <= 5
                      ? 'text-amber-400 border-amber-500/50'
                      : 'text-emerald-400 border-[#C9A45C]/30'
                  }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase font-bold tracking-wider text-[#A7A29A]">
                {t('admin.modals.badge', 'Status Badge')}
              </label>
              <select
                value={badge}
                onChange={e => setBadge(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#070707] border border-[#C9A45C]/30 rounded-lg text-xs text-[#F5F2EA] focus:outline-none focus:border-[#C9A45C]"
              >
                <option value="NONE">{t('common.none', 'None')}</option>
                <option value="BEST SELLER">{getLocalizedBadge('BEST SELLER', t)}</option>
                <option value="NEW">{getLocalizedBadge('NEW', t)}</option>
                <option value="LIMITED">{getLocalizedBadge('LIMITED', t)}</option>
                <option value="SALE">{getLocalizedBadge('SALE', t)}</option>
              </select>
            </div>
          </div>

          {/* Row 3: Category, Gender, Concentration, Fragrance Family */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs uppercase font-bold tracking-wider text-[#C9A45C]">
                {t('admin.modals.category', 'Collection')}
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-[#151310] border border-[#C9A45C]/30 rounded-xl text-xs text-[#F5F2EA] focus:outline-none focus:border-[#C9A45C]"
              >
                <option value="11111111-1111-1111-1111-111111111111">{t('categories.perfumes', 'Perfumes')}</option>
                <option value="22222222-2222-2222-2222-222222222222">{t('categories.bodySplash', 'Body Splash')}</option>
                <option value="33333333-3333-3333-3333-333333333333">{t('categories.oud', 'Oud')}</option>
                <option value="44444444-4444-4444-4444-444444444444">{t('categories.bodySpray', 'Body Spray')}</option>
                <option value="55555555-5555-5555-5555-555555555555">{t('categories.giftSets', 'Gift Sets')}</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs uppercase font-bold tracking-wider text-[#C9A45C]">
                {t('admin.modals.gender', 'Gender')}
              </label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-[#151310] border border-[#C9A45C]/30 rounded-xl text-xs text-[#F5F2EA] focus:outline-none focus:border-[#C9A45C]"
              >
                <option value="unisex">{t('gender.unisex', 'Unisex')}</option>
                <option value="men">{t('gender.men', 'Men')}</option>
                <option value="women">{t('gender.women', 'Women')}</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs uppercase font-bold tracking-wider text-[#C9A45C]">
                {t('admin.modals.concentration', 'Concentration')}
              </label>
              <select
                value={concentration}
                onChange={e => setConcentration(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-[#151310] border border-[#C9A45C]/30 rounded-xl text-xs text-[#F5F2EA] focus:outline-none focus:border-[#C9A45C]"
              >
                <option value="Extrait de Parfum">{getLocalizedConcentration('Extrait de Parfum', t)}</option>
                <option value="Eau de Parfum">{getLocalizedConcentration('Eau de Parfum', t)}</option>
                <option value="Parfum Oil (Attar)">{getLocalizedConcentration('Parfum Oil (Attar)', t)}</option>
                <option value="Elixir">{getLocalizedConcentration('Elixir', t)}</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs uppercase font-bold tracking-wider text-[#C9A45C]">
                  {t('admin.modals.fragranceFamily', 'Olfactory Family')}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (isCustomFamily) {
                      setIsCustomFamily(false);
                      setFragranceFamily('Smoky Oud');
                    } else {
                      setIsCustomFamily(true);
                      setCustomFamilyInput('');
                    }
                  }}
                  className="text-[10px] text-[#E3C27A] hover:text-[#F0D9A4] transition-colors font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {isCustomFamily ? (
                    <span>← {t('admin.modals.chooseFromList', 'Choose From List')}</span>
                  ) : (
                    <span>+ {t('admin.modals.addCustom', 'Add Custom')}</span>
                  )}
                </button>
              </div>

              {!isCustomFamily ? (
                <select
                  value={fragranceFamily}
                  onChange={e => {
                    if (e.target.value === '__custom__') {
                      setIsCustomFamily(true);
                      setCustomFamilyInput('');
                    } else {
                      setFragranceFamily(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2.5 bg-[#151310] border border-[#C9A45C]/30 rounded-xl text-xs text-[#F5F2EA] focus:outline-none focus:border-[#C9A45C]"
                >
                  {PRESET_FAMILIES.map(fam => (
                    <option key={fam} value={fam}>
                      {getLocalizedFragranceFamily(fam, t)}
                    </option>
                  ))}
                  <option value="__custom__" className="text-[#C9A45C] font-bold">
                    + {t('admin.modals.addNewFamily', 'Add New / مخصص...')}
                  </option>
                </select>
              ) : (
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={customFamilyInput}
                    onChange={e => {
                      setCustomFamilyInput(e.target.value);
                      setFragranceFamily(e.target.value);
                    }}
                    placeholder={t('admin.modals.customFamilyPlaceholder', 'e.g. Fruity Musk, Royal Amber, Citrus Woody...')}
                    autoFocus
                    className="w-full px-3 py-2.5 bg-[#151310] border border-[#C9A45C]/60 rounded-xl text-xs text-[#F5F2EA] placeholder:text-[#A7A29A]/50 focus:outline-none focus:border-[#E3C27A] shadow-inner"
                  />
                  {customFamilyInput && (
                    <span className="absolute right-2.5 rtl:right-auto rtl:left-2.5 text-[10px] font-bold text-[#C9A45C] px-1.5 py-0.5 rounded bg-[#C9A45C]/15 border border-[#C9A45C]/30">
                      Custom
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Row 4: Longevity & Sillage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs uppercase font-bold tracking-wider text-[#C9A45C]">
                {t('admin.modals.longevity', 'Longevity')}
              </label>
              <select
                value={longevity}
                onChange={e => setLongevity(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-[#151310] border border-[#C9A45C]/30 rounded-xl text-xs text-[#F5F2EA] focus:outline-none focus:border-[#C9A45C]"
              >
                <option value="14-18 Hours (Beast Mode)">{getLocalizedLongevity('14-18 Hours (Beast Mode)', t)}</option>
                <option value="12+ Hours">{getLocalizedLongevity('12+ Hours', t)}</option>
                <option value="8-10 Hours">{getLocalizedLongevity('8-10 Hours', t)}</option>
                <option value="6-8 Hours">{getLocalizedLongevity('6-8 Hours', t)}</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs uppercase font-bold tracking-wider text-[#C9A45C]">
                {t('admin.modals.sillage', 'Sillage & Projection')}
              </label>
              <select
                value={sillage}
                onChange={e => setSillage(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-[#151310] border border-[#C9A45C]/30 rounded-xl text-xs text-[#F5F2EA] focus:outline-none focus:border-[#C9A45C]"
              >
                <option value="Intense / Enormous">{getLocalizedSillage('Intense / Enormous', t)}</option>
                <option value="Heavy">{getLocalizedSillage('Heavy', t)}</option>
                <option value="Moderate">{getLocalizedSillage('Moderate', t)}</option>
                <option value="Intimate">{getLocalizedSillage('Intimate', t)}</option>
              </select>
            </div>
          </div>

          {/* Olfactory Pyramid Notes */}
          <div className="space-y-3 p-4 rounded-xl bg-[#151310]/40 border border-[#C9A45C]/20">
            <div className="flex items-center justify-between">
              <h4 className="text-xs uppercase tracking-[2px] font-bold text-[#E3C27A]">
                {contentTab === 'en'
                  ? t('admin.modals.olfactoryNotes', 'Olfactory Pyramid (Comma Separated)')
                  : 'الهرم العطري والنوتات (باللغة العربية)'}
              </h4>
              <span className="text-[10px] text-[#C9A45C] font-semibold">
                {contentTab === 'en' ? '🇬🇧 English Notes' : '🇸🇦 نوتات عربية'}
              </span>
            </div>

            {contentTab === 'en' ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-[#A7A29A]">{t('admin.modals.topNotes', 'Top Notes')}</label>
                  <input
                    type="text"
                    value={topNotes}
                    onChange={e => setTopNotes(e.target.value)}
                    placeholder={t('admin.modals.placeholders.topNotes', 'Saffron, Nutmeg')}
                    className="w-full px-3 py-2 bg-[#070707] border border-white/10 rounded-lg text-xs text-[#F5F2EA] focus:outline-none focus:border-[#C9A45C]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-[#A7A29A]">{t('admin.modals.heartNotes', 'Heart Notes')}</label>
                  <input
                    type="text"
                    value={heartNotes}
                    onChange={e => setHeartNotes(e.target.value)}
                    placeholder={t('admin.modals.placeholders.heartNotes', 'Cambodian Oud, Rose')}
                    className="w-full px-3 py-2 bg-[#070707] border border-white/10 rounded-lg text-xs text-[#F5F2EA] focus:outline-none focus:border-[#C9A45C]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-[#A7A29A]">{t('admin.modals.baseNotes', 'Base Notes')}</label>
                  <input
                    type="text"
                    value={baseNotes}
                    onChange={e => setBaseNotes(e.target.value)}
                    placeholder={t('admin.modals.placeholders.baseNotes', 'Ambergris, Musk, Vanilla')}
                    className="w-full px-3 py-2 bg-[#070707] border border-white/10 rounded-lg text-xs text-[#F5F2EA] focus:outline-none focus:border-[#C9A45C]"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-[#E3C27A]">{t('admin.modals.topNotesAr', 'Top Notes (Arabic)')}</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={topNotesAr}
                    onChange={e => setTopNotesAr(e.target.value)}
                    placeholder="زعفران، جوزة الطيب، خزامى"
                    className="w-full px-3 py-2 bg-[#070707] border border-[#C9A45C]/40 rounded-lg text-xs text-[#F5F2EA] focus:outline-none focus:border-[#E3C27A]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-[#E3C27A]">{t('admin.modals.heartNotesAr', 'Heart Notes (Arabic)')}</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={heartNotesAr}
                    onChange={e => setHeartNotesAr(e.target.value)}
                    placeholder="عود كمبودي، ورد طائفي"
                    className="w-full px-3 py-2 bg-[#070707] border border-[#C9A45C]/40 rounded-lg text-xs text-[#F5F2EA] focus:outline-none focus:border-[#E3C27A]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-[#E3C27A]">{t('admin.modals.baseNotesAr', 'Base Notes (Arabic)')}</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={baseNotesAr}
                    onChange={e => setBaseNotesAr(e.target.value)}
                    placeholder="عنبر داكن، مسك، فانيليا"
                    className="w-full px-3 py-2 bg-[#070707] border border-[#C9A45C]/40 rounded-lg text-xs text-[#F5F2EA] focus:outline-none focus:border-[#E3C27A]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sizes & Multi-Tier Pricing */}
          <div className="space-y-3 p-4 rounded-xl bg-[#151310]/40 border border-[#C9A45C]/20">
            <div className="flex items-center justify-between">
              <h4 className="text-xs uppercase tracking-[2px] font-bold text-[#E3C27A]">
                {t('admin.modals.sizes', 'Available Flacon Sizes & Pricing')}
              </h4>
              <button
                type="button"
                onClick={handleAddSize}
                className="flex items-center gap-1 text-xs text-[#C9A45C] hover:text-[#E3C27A] font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> {t('admin.modals.addSize', 'Add Size Option')}
              </button>
            </div>

            <div className="space-y-2">
              {sizes.map((s, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={s.size}
                    onChange={e => {
                      const updated = [...sizes];
                      updated[idx].size = e.target.value;
                      setSizes(updated);
                    }}
                    placeholder={t('admin.modals.placeholders.size', 'e.g. 100ml')}
                    className="flex-1 px-3 py-1.5 bg-[#070707] border border-white/10 rounded-lg text-xs text-[#F5F2EA] focus:outline-none focus:border-[#C9A45C]"
                  />
                  <div className="flex items-center gap-1.5 w-36">
                    <span className="text-[10px] uppercase text-[#A7A29A]">{t('common.price', 'Price')}:</span>
                    <input
                      type="number"
                      value={s.price}
                      onChange={e => {
                        const updated = [...sizes];
                        updated[idx].price = Number(e.target.value);
                        setSizes(updated);
                      }}
                      className="w-full px-2 py-1.5 bg-[#070707] border border-white/10 rounded-lg text-xs text-[#F0D9A4] font-bold focus:outline-none focus:border-[#C9A45C]"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 w-36">
                    <span className="text-[10px] uppercase text-[#A7A29A]">{t('cart.was', 'Was')}:</span>
                    <input
                      type="number"
                      value={s.compareAtPrice || ''}
                      placeholder={t('admin.modals.placeholders.price', 'e.g. 2400')}
                      onChange={e => {
                        const updated = [...sizes];
                        updated[idx].compareAtPrice = e.target.value ? Number(e.target.value) : undefined;
                        setSizes(updated);
                      }}
                      className="w-full px-2 py-1.5 bg-[#070707] border border-white/10 rounded-lg text-xs text-[#A7A29A] line-through focus:outline-none focus:border-[#C9A45C]"
                    />
                  </div>
                  {sizes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSize(idx)}
                      className="p-1.5 text-stone-500 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Images Section */}
          <div className="space-y-3 p-4 rounded-xl bg-[#151310]/40 border border-[#C9A45C]/20">
            <h4 className="text-xs uppercase tracking-[2px] font-bold text-[#E3C27A]">
              {t('admin.modals.images', 'Flacon Photography & Gallery')}
            </h4>

            {/* Current Images Preview */}
            <div className="flex flex-wrap gap-3 items-center">
              {imageUrls.map((img, idx) => (
                <div key={idx} className="relative group w-16 h-20 rounded-lg overflow-hidden border border-[#C9A45C]/30 bg-black">
                  <img src={img} alt="Flacon preview" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  {imageUrls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute inset-0 bg-black/60 flex items-center justify-center text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Image Upload Input */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] uppercase tracking-wider text-[#A7A29A]">{t('admin.modals.uploadImage', 'Upload Image to Storage')}</label>
                {isUploadingImage && (
                  <span className="text-[10px] text-[#E3C27A] flex items-center gap-1 font-bold animate-pulse">
                    <Loader2 className="w-3 h-3 animate-spin" /> {t('admin.modals.uploadingImage', 'Uploading to Storage...')}
                  </span>
                )}
              </div>
              <input
                type="file"
                accept="image/webp,image/jpeg,image/png,image/avif"
                disabled={isUploadingImage}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const allowedTypes = ['image/webp', 'image/jpeg', 'image/png', 'image/avif'];
                    if (!allowedTypes.includes(file.type)) {
                      alert('Please select a valid image file (WebP, JPEG, PNG, or AVIF).');
                      e.target.value = '';
                      return;
                    }
                    const maxSizeBytes = 10 * 1024 * 1024; // 10MB
                    if (file.size > maxSizeBytes) {
                      alert('Image file size exceeds the 10MB limit. Please select an optimized file.');
                      e.target.value = '';
                      return;
                    }

                    setIsUploadingImage(true);
                    try {
                      const fileExt = file.name.split('.').pop() || 'webp';
                      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
                      const filePath = `uploads/${fileName}`;

                      const { error: uploadErr } = await supabase.storage
                        .from('product-images')
                        .upload(filePath, file, {
                          cacheControl: '3600',
                          upsert: false
                        });

                      if (uploadErr) {
                        alert(`Image upload failed: ${uploadErr.message}`);
                      } else {
                        const { data: { publicUrl } } = supabase.storage
                          .from('product-images')
                          .getPublicUrl(filePath);

                        handleAddImage(publicUrl);
                      }
                    } catch (err: any) {
                      alert(`Upload error: ${err.message}`);
                    } finally {
                      setIsUploadingImage(false);
                    }
                  }
                  e.target.value = ''; // Reset input
                }}
                className="block w-full text-xs text-[#A7A29A] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#C9A45C]/20 file:text-[#E3C27A] hover:file:bg-[#C9A45C]/30 disabled:opacity-50 cursor-pointer"
              />
            </div>

            {/* Quick Luxury Presets Picker */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[10px] uppercase tracking-wider text-[#A7A29A]">
                {t('admin.modals.quickPresets', 'Quick Select Luxury Presets:')}
              </span>
              <div className="flex flex-wrap gap-2">
                {PRESET_IMAGES.map((preset, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAddImage(preset.url)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#070707] border border-white/10 hover:border-[#C9A45C]/50 text-[11px] text-[#A7A29A] hover:text-[#F5F2EA] transition-colors cursor-pointer"
                  >
                    <ImageIcon className="w-3 h-3 text-[#C9A45C]" />
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description & Story */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs uppercase font-bold tracking-wider text-[#C9A45C]">
                {contentTab === 'en'
                  ? t('admin.modals.description', 'Editorial Description')
                  : t('admin.modals.descriptionAr', 'Editorial Description (Arabic)')}
              </label>
              {contentTab === 'en' ? (
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder={t('admin.modals.placeholders.description', 'An enigmatic masterwork capturing dark smoked oud wood, spicy saffron...')}
                  className="w-full px-3 py-2 bg-[#151310] border border-[#C9A45C]/30 rounded-xl text-xs text-[#F5F2EA] focus:outline-none focus:border-[#C9A45C]"
                />
              ) : (
                <textarea
                  rows={3}
                  dir="rtl"
                  value={descriptionAr}
                  onChange={e => setDescriptionAr(e.target.value)}
                  placeholder="تحفة فنية غامضة تمزج خشب العود المدخن الداكن مع دفء التوابل الملكية..."
                  className="w-full px-3 py-2 bg-[#151310] border border-[#C9A45C]/50 rounded-xl text-xs text-[#F5F2EA] focus:outline-none focus:border-[#E3C27A]"
                />
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs uppercase font-bold tracking-wider text-[#C9A45C]">
                {contentTab === 'en'
                  ? t('admin.modals.story', 'Artisan Story / Heritage')
                  : t('admin.modals.storyAr', 'Artisan Story / Heritage (Arabic)')}
              </label>
              {contentTab === 'en' ? (
                <textarea
                  rows={3}
                  value={story}
                  onChange={e => setStory(e.target.value)}
                  placeholder={t('admin.modals.placeholders.story', 'Distilled under moonlight from 25-year aged agarwood trees...')}
                  className="w-full px-3 py-2 bg-[#151310] border border-[#C9A45C]/30 rounded-xl text-xs text-[#F5F2EA] focus:outline-none focus:border-[#C9A45C]"
                />
              ) : (
                <textarea
                  rows={3}
                  dir="rtl"
                  value={storyAr}
                  onChange={e => setStoryAr(e.target.value)}
                  placeholder="مقطر بعناية تحت ضوء القمر من أشجار العود المعمرة لأكثر من ٢٥ عاماً..."
                  className="w-full px-3 py-2 bg-[#151310] border border-[#C9A45C]/50 rounded-xl text-xs text-[#F5F2EA] focus:outline-none focus:border-[#E3C27A]"
                />
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-[#C9A45C]/20 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-white/20 text-xs uppercase tracking-wider text-[#A7A29A] hover:text-[#F5F2EA] hover:bg-white/5 transition-colors font-semibold cursor-pointer"
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              className="px-7 py-2.5 rounded-full bg-[#C9A45C] hover:bg-[#E3C27A] text-[#070707] font-bold text-xs uppercase tracking-[2px] shadow-lg shadow-[#C9A45C]/20 transition-colors cursor-pointer"
            >
              {isEditing ? t('admin.modals.saveProduct', 'Save Product Changes') : t('admin.modals.publishProduct', 'Publish Fragrance to Stock')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
