import React, { useState, useEffect } from 'react';
import { Product, FragranceConcentration, FragranceFamily, FragranceGender } from '../../types';
import { X, Sparkles, Plus, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface AddEditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Partial<Product>) => void;
  productToEdit?: Product | null;
}

const PRESET_IMAGES = [
  { label: 'Royal Black & Gold Flacon', url: '/src/assets/images/hero_oud_bottle_1787700482747.jpg' },
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
  const [fragranceFamily, setFragranceFamily] = useState<FragranceFamily>('Smoky Oud');
  const [longevity, setLongevity] = useState<Product['longevity']>('14-18 Hours (Beast Mode)');
  const [sillage, setSillage] = useState<Product['sillage']>('Intense / Enormous');
  const [badge, setBadge] = useState<Product['badge'] | 'NONE'>('NEW');
  const [isFeatured, setIsFeatured] = useState(false);

  // Notes
  const [topNotes, setTopNotes] = useState('Saffron, Nutmeg, Lavender');
  const [heartNotes, setHeartNotes] = useState('Smoked Agarwood (Oud), Patchouli');
  const [baseNotes, setBaseNotes] = useState('Oud Wood, Dark Amber, Velvet Musk');

  // Images
  const [imageUrls, setImageUrls] = useState<string[]>([
    '/src/assets/images/hero_oud_bottle_1787700482747.jpg'
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
      setPrice(productToEdit.price || 1950);
      setCompareAtPrice(productToEdit.compareAtPrice);
      setStock(productToEdit.stock ?? 25);
      setCategory(productToEdit.categoryId || '11111111-1111-1111-1111-111111111111');
      setGender((productToEdit.gender as FragranceGender) || 'unisex');
      setConcentration(productToEdit.concentration || 'Eau de Parfum');
      setFragranceFamily(productToEdit.fragranceFamily || 'Smoky Oud');
      setLongevity(productToEdit.longevity || '14-18 Hours (Beast Mode)');
      setSillage(productToEdit.sillage || 'Intense / Enormous');
      setBadge(productToEdit.badge || 'NONE');
      setIsFeatured(productToEdit.isFeatured || false);

      if (productToEdit.notes) {
        setTopNotes(productToEdit.notes.top?.join(', ') || '');
        setHeartNotes(productToEdit.notes.heart?.join(', ') || '');
        setBaseNotes(productToEdit.notes.base?.join(', ') || '');
      }

      if (productToEdit.images && productToEdit.images.length > 0) {
        setImageUrls(productToEdit.images);
      } else {
        setImageUrls(['/src/assets/images/hero_oud_bottle_1787700482747.jpg']);
      }

      if (productToEdit.availableSizes && productToEdit.availableSizes.length > 0) {
        setSizes(productToEdit.availableSizes);
      }
    } else {
      // Reset form
      setName('');
      setBrand('OUD_X PRIVE');
      setSubtitle('');
      setDescription('');
      setStory('');
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
      setTopNotes('Saffron, Bergamot, Pink Pepper');
      setHeartNotes('Royal Cambodian Oud, Bulgarian Rose, Patchouli');
      setBaseNotes('Aged Ambergris, Dark Incense, Bourbon Vanilla');
      setImageUrls(['/src/assets/images/hero_oud_bottle_1787700482747.jpg']);
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

    const productPayload: Partial<Product> = {
      ...(productToEdit || {}),
      name: name.trim(),
      brand: brand.trim(),
      subtitle: subtitle.trim() || `${concentration} • ${fragranceFamily}`,
      description:
        description.trim() ||
        `An artisanal extrait de parfum showcasing rare raw essences and royal Cambodian agarwood. Formulated for remarkable longevity and regal sillage.`,
      story:
        story.trim() ||
        `Crafted in strictly limited batches by OUD_X master perfumers, honoring ancestral Arabian distilling traditions.`,
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
      stock: Number(stock),
      categoryId: category,
      gender: gender as 'men' | 'women' | 'unisex',
      concentration,
      fragranceFamily,
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
      }
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
                {isEditing ? `Edit Product: ${productToEdit?.name}` : 'Create New Haute Fragrance'}
              </h2>
              <p className="text-xs text-[#A7A29A]">
                {isEditing ? 'Modify stock inventory, pricing, or formulation notes' : 'Add new luxury fragrance directly to live boutique inventory'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#A7A29A] hover:text-[#F5F2EA] hover:bg-white/5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          {/* Row 1: Name, Brand, Subtitle */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-xs uppercase font-bold tracking-[2px] text-[#C9A45C]">
                Fragrance Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Bade'e Al Oud (Oud For Glory)"
                className="w-full px-4 py-2.5 bg-[#151310] border border-[#C9A45C]/30 rounded-xl text-sm text-[#F5F2EA] placeholder-stone-600 focus:outline-none focus:border-[#C9A45C]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs uppercase font-bold tracking-[2px] text-[#C9A45C]">
                Maison / Brand
              </label>
              <input
                type="text"
                list="brand-suggestions"
                value={brand}
                onChange={e => setBrand(e.target.value)}
                placeholder="OUD_X PRIVE"
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
                Subtitle / Olfactory Slogan
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={e => setSubtitle(e.target.value)}
                placeholder="e.g. Smoky Cambodian Oud & Royal Saffron"
                className="w-full px-4 py-2.5 bg-[#151310] border border-[#C9A45C]/30 rounded-xl text-sm text-[#F5F2EA] placeholder-stone-600 focus:outline-none focus:border-[#C9A45C]"
              />
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
                  Show in Hero Carousel
                </span>
              </label>
            </div>
          </div>

          {/* Row 2: Price, Compare Price, Stock, Badge */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[#151310]/50 border border-[#C9A45C]/20">
            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase font-bold tracking-wider text-[#E3C27A]">
                Base Price (EGP) *
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
                Compare At (EGP)
              </label>
              <input
                type="number"
                min="0"
                value={compareAtPrice || ''}
                onChange={e => setCompareAtPrice(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="e.g. 2400"
                className="w-full px-3 py-2 bg-[#070707] border border-white/10 rounded-lg text-sm text-[#A7A29A] focus:outline-none focus:border-[#C9A45C]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase font-bold tracking-wider text-[#E3C27A]">
                Live Stock (Units) *
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
                Status Badge
              </label>
              <select
                value={badge}
                onChange={e => setBadge(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#070707] border border-[#C9A45C]/30 rounded-lg text-xs text-[#F5F2EA] focus:outline-none focus:border-[#C9A45C]"
              >
                <option value="NONE">None</option>
                <option value="BEST SELLER">BEST SELLER</option>
                <option value="NEW">NEW</option>
                <option value="LIMITED">LIMITED</option>
                <option value="SALE">SALE</option>
              </select>
            </div>
          </div>

          {/* Row 3: Category, Gender, Concentration, Fragrance Family */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs uppercase font-bold tracking-wider text-[#C9A45C]">
                Collection
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-[#151310] border border-[#C9A45C]/30 rounded-xl text-xs text-[#F5F2EA] focus:outline-none focus:border-[#C9A45C]"
              >
                <option value="11111111-1111-1111-1111-111111111111">Perfumes</option>
                <option value="22222222-2222-2222-2222-222222222222">Body Splash</option>
                <option value="33333333-3333-3333-3333-333333333333">Oud</option>
                <option value="44444444-4444-4444-4444-444444444444">Body Care</option>
                <option value="55555555-5555-5555-5555-555555555555">Gift Sets</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs uppercase font-bold tracking-wider text-[#C9A45C]">
                Gender
              </label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-[#151310] border border-[#C9A45C]/30 rounded-xl text-xs text-[#F5F2EA] focus:outline-none focus:border-[#C9A45C]"
              >
                <option value="unisex">Unisex</option>
                <option value="men">Men</option>
                <option value="women">Women</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs uppercase font-bold tracking-wider text-[#C9A45C]">
                Concentration
              </label>
              <select
                value={concentration}
                onChange={e => setConcentration(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-[#151310] border border-[#C9A45C]/30 rounded-xl text-xs text-[#F5F2EA] focus:outline-none focus:border-[#C9A45C]"
              >
                <option value="Extrait de Parfum">Extrait de Parfum</option>
                <option value="Eau de Parfum">Eau de Parfum</option>
                <option value="Parfum Oil (Attar)">Parfum Oil (Attar)</option>
                <option value="Elixir">Elixir</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs uppercase font-bold tracking-wider text-[#C9A45C]">
                Olfactory Family
              </label>
              <select
                value={fragranceFamily}
                onChange={e => setFragranceFamily(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-[#151310] border border-[#C9A45C]/30 rounded-xl text-xs text-[#F5F2EA] focus:outline-none focus:border-[#C9A45C]"
              >
                <option value="Smoky Oud">Smoky Oud</option>
                <option value="Oriental Woody">Oriental Woody</option>
                <option value="Amber Gourmand">Amber Gourmand</option>
                <option value="Spicy Leather">Spicy Leather</option>
                <option value="Floral Citrus">Floral Citrus</option>
                <option value="Aromatic Fougere">Aromatic Fougere</option>
                <option value="Warm Resin">Warm Resin</option>
              </select>
            </div>
          </div>

          {/* Row 4: Longevity & Sillage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs uppercase font-bold tracking-wider text-[#C9A45C]">
                Longevity
              </label>
              <select
                value={longevity}
                onChange={e => setLongevity(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-[#151310] border border-[#C9A45C]/30 rounded-xl text-xs text-[#F5F2EA] focus:outline-none focus:border-[#C9A45C]"
              >
                <option value="14-18 Hours (Beast Mode)">14-18 Hours (Beast Mode)</option>
                <option value="12+ Hours">12+ Hours</option>
                <option value="8-10 Hours">8-10 Hours</option>
                <option value="6-8 Hours">6-8 Hours</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs uppercase font-bold tracking-wider text-[#C9A45C]">
                Sillage & Projection
              </label>
              <select
                value={sillage}
                onChange={e => setSillage(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-[#151310] border border-[#C9A45C]/30 rounded-xl text-xs text-[#F5F2EA] focus:outline-none focus:border-[#C9A45C]"
              >
                <option value="Intense / Enormous">Intense / Enormous</option>
                <option value="Heavy">Heavy</option>
                <option value="Moderate">Moderate</option>
                <option value="Intimate">Intimate</option>
              </select>
            </div>
          </div>

          {/* Olfactory Pyramid Notes */}
          <div className="space-y-3 p-4 rounded-xl bg-[#151310]/40 border border-[#C9A45C]/20">
            <h4 className="text-xs uppercase tracking-[2px] font-bold text-[#E3C27A]">
              Olfactory Pyramid (Comma Separated)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-[#A7A29A]">Top Notes</label>
                <input
                  type="text"
                  value={topNotes}
                  onChange={e => setTopNotes(e.target.value)}
                  placeholder="Saffron, Nutmeg"
                  className="w-full px-3 py-2 bg-[#070707] border border-white/10 rounded-lg text-xs text-[#F5F2EA] focus:outline-none focus:border-[#C9A45C]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-[#A7A29A]">Heart Notes</label>
                <input
                  type="text"
                  value={heartNotes}
                  onChange={e => setHeartNotes(e.target.value)}
                  placeholder="Cambodian Oud, Rose"
                  className="w-full px-3 py-2 bg-[#070707] border border-white/10 rounded-lg text-xs text-[#F5F2EA] focus:outline-none focus:border-[#C9A45C]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-[#A7A29A]">Base Notes</label>
                <input
                  type="text"
                  value={baseNotes}
                  onChange={e => setBaseNotes(e.target.value)}
                  placeholder="Ambergris, Musk, Vanilla"
                  className="w-full px-3 py-2 bg-[#070707] border border-white/10 rounded-lg text-xs text-[#F5F2EA] focus:outline-none focus:border-[#C9A45C]"
                />
              </div>
            </div>
          </div>

          {/* Sizes & Multi-Tier Pricing */}
          <div className="space-y-3 p-4 rounded-xl bg-[#151310]/40 border border-[#C9A45C]/20">
            <div className="flex items-center justify-between">
              <h4 className="text-xs uppercase tracking-[2px] font-bold text-[#E3C27A]">
                Available Flacon Sizes & Pricing
              </h4>
              <button
                type="button"
                onClick={handleAddSize}
                className="flex items-center gap-1 text-xs text-[#C9A45C] hover:text-[#E3C27A] font-semibold"
              >
                <Plus className="w-3.5 h-3.5" /> Add Size Option
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
                    placeholder="e.g. 100ml"
                    className="flex-1 px-3 py-1.5 bg-[#070707] border border-white/10 rounded-lg text-xs text-[#F5F2EA] focus:outline-none focus:border-[#C9A45C]"
                  />
                  <div className="flex items-center gap-1.5 w-36">
                    <span className="text-[10px] uppercase text-[#A7A29A]">Price:</span>
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
                    <span className="text-[10px] uppercase text-[#A7A29A]">Was:</span>
                    <input
                      type="number"
                      value={s.compareAtPrice || ''}
                      placeholder="e.g. 2400"
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
                      className="p-1.5 text-stone-500 hover:text-red-400 transition-colors"
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
              Flacon Photography & Gallery
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
                      className="absolute inset-0 bg-black/60 flex items-center justify-center text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
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
                <label className="text-[11px] uppercase tracking-wider text-[#A7A29A]">Upload Image to Storage</label>
                {isUploadingImage && (
                  <span className="text-[10px] text-[#E3C27A] flex items-center gap-1 font-bold animate-pulse">
                    <Loader2 className="w-3 h-3 animate-spin" /> Uploading to Storage...
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
                Quick Select Luxury Presets:
              </span>
              <div className="flex flex-wrap gap-2">
                {PRESET_IMAGES.map((preset, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAddImage(preset.url)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#070707] border border-white/10 hover:border-[#C9A45C]/50 text-[11px] text-[#A7A29A] hover:text-[#F5F2EA] transition-colors"
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
                Product Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="An enigmatic masterwork capturing dark smoked oud wood, spicy saffron..."
                className="w-full px-3 py-2 bg-[#151310] border border-[#C9A45C]/30 rounded-xl text-xs text-[#F5F2EA] focus:outline-none focus:border-[#C9A45C]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs uppercase font-bold tracking-wider text-[#C9A45C]">
                Artisan Story / Heritage
              </label>
              <textarea
                rows={3}
                value={story}
                onChange={e => setStory(e.target.value)}
                placeholder="Distilled under moonlight from 25-year aged agarwood trees..."
                className="w-full px-3 py-2 bg-[#151310] border border-[#C9A45C]/30 rounded-xl text-xs text-[#F5F2EA] focus:outline-none focus:border-[#C9A45C]"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-[#C9A45C]/20 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-white/20 text-xs uppercase tracking-wider text-[#A7A29A] hover:text-[#F5F2EA] hover:bg-white/5 transition-colors font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-7 py-2.5 rounded-full bg-[#C9A45C] hover:bg-[#E3C27A] text-[#070707] font-bold text-xs uppercase tracking-[2px] shadow-lg shadow-[#C9A45C]/20 transition-colors"
            >
              {isEditing ? 'Save Product Changes' : 'Publish Fragrance to Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
