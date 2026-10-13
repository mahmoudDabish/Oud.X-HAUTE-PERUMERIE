import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BrandItem } from '../../types';
import { brandService } from '../../services/brandService';
import { X, Sparkles, Upload, Link as LinkIcon, Trash2, Check, Loader2, Image as ImageIcon } from 'lucide-react';

interface AddEditBrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (brandData: Omit<BrandItem, 'id'>) => void;
  brandToEdit?: BrandItem | null;
}

import { ICON_PRESETS, IconPreset } from '../../constants/brandPresets';
export { ICON_PRESETS };

export const AddEditBrandModal: React.FC<AddEditBrandModalProps> = ({
  isOpen,
  onClose,
  onSave,
  brandToEdit
}) => {
  const { t } = useTranslation();
  const isEditing = !!brandToEdit;

  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [tag, setTag] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [iconPreset, setIconPreset] = useState('crown');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState<boolean>(true);

  const [logoMode, setLogoMode] = useState<'upload' | 'url' | 'preset'>('preset');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (brandToEdit) {
      setName(brandToEdit.name || '');
      setNameAr(brandToEdit.nameAr || '');
      setTag(brandToEdit.tag || '');
      setLogoUrl(brandToEdit.logoUrl || '');
      setIconPreset(brandToEdit.iconPreset || 'crown');
      setDisplayOrder(brandToEdit.displayOrder ?? 1);
      setIsActive(brandToEdit.isActive ?? true);
      setLogoMode(brandToEdit.logoUrl ? 'upload' : 'preset');
    } else {
      setName('');
      setNameAr('');
      setTag('HAUTE PARFUM');
      setLogoUrl('');
      setIconPreset('crown');
      setDisplayOrder(1);
      setIsActive(true);
      setLogoMode('preset');
    }
    setUploadError(null);
  }, [brandToEdit, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsUploading(true);

    const { url, error } = await brandService.uploadBrandLogo(file);
    setIsUploading(false);

    if (error || !url) {
      setUploadError(error?.message || 'Failed to upload logo.');
    } else {
      setLogoUrl(url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      nameAr: nameAr.trim() || undefined,
      tag: tag.trim() || undefined,
      logoUrl: logoUrl.trim() || undefined,
      iconPreset,
      displayOrder: Number(displayOrder) || 1,
      isActive
    });

    onClose();
  };

  const selectedPresetObj = ICON_PRESETS.find(p => p.id === iconPreset) || ICON_PRESETS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#0D0C0A] border border-[#C9A45C]/30 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 my-8 text-left rtl:text-right">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#C9A45C]/15">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#C9A45C]" />
            <h3 className="font-serif-luxury text-xl sm:text-2xl font-normal text-[#F5F2EA]">
              {isEditing ? t('admin.brands.editTitle', 'Edit Brand / Atelier') : t('admin.brands.addTitle', 'Add New Brand / Atelier')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#A7A29A] hover:text-[#F5F2EA] hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Live Circular Preview matching carousel */}
          <div className="p-4 rounded-xl bg-[#151310] border border-[#C9A45C]/20 flex flex-col items-center justify-center space-y-3">
            <span className="text-[10px] uppercase tracking-[2px] text-[#C9A45C] font-semibold">
              {t('admin.brands.livePreview', 'Storefront Carousel Preview')}
            </span>

            {/* Circular Badge Preview */}
            <div className="relative w-28 h-28 rounded-full p-[2px] bg-gradient-to-b from-[#C9A45C]/60 via-[#8E713D]/30 to-[#C9A45C]/20 shadow-xl shadow-black/80">
              <div className="w-full h-full rounded-full bg-gradient-to-b from-[#1C1915] via-[#151310] to-[#0D0C0A] flex items-center justify-center p-3 relative overflow-hidden">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={name || 'Brand Logo'}
                    className="w-full h-full object-contain rounded-full"
                    onError={() => setUploadError('Invalid image URL or failed to load image.')}
                  />
                ) : (
                  <div className="text-[#C9A45C] flex items-center justify-center">
                    {selectedPresetObj.renderIcon()}
                  </div>
                )}
              </div>
            </div>

            {/* Name preview below circle */}
            <div className="text-center">
              <div className="font-cinzel text-sm font-bold text-[#F5F2EA]">
                {name || 'Brand Name'}
              </div>
              {nameAr && (
                <div className="text-xs text-[#A7A29A]">
                  {nameAr}
                </div>
              )}
              {tag && (
                <div className="text-[9px] uppercase tracking-wider text-[#8E713D] mt-0.5">
                  {tag}
                </div>
              )}
            </div>
          </div>

          {/* Form Fields: English Name, Arabic Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs uppercase font-bold tracking-wider text-[#C9A45C]">
                {t('admin.brands.nameEn', 'Brand Name (English) *')}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Maison Asrar"
                className="w-full px-3.5 py-2.5 bg-[#151310] border border-[#C9A45C]/30 rounded-xl text-xs text-[#F5F2EA] focus:outline-none focus:border-[#C9A45C]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs uppercase font-bold tracking-wider text-[#C9A45C]">
                {t('admin.brands.nameAr', 'Brand Name (Arabic)')}
              </label>
              <input
                type="text"
                dir="rtl"
                value={nameAr}
                onChange={e => setNameAr(e.target.value)}
                placeholder="مثال: ميسون أسرار"
                className="w-full px-3.5 py-2.5 bg-[#151310] border border-[#C9A45C]/30 rounded-xl text-xs text-[#F5F2EA] focus:outline-none focus:border-[#C9A45C]"
              />
            </div>
          </div>

          {/* Subtitle / Tag and Display Order */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs uppercase font-bold tracking-wider text-[#A7A29A]">
                {t('admin.brands.tag', 'Atelier Tag / Subtitle')}
              </label>
              <input
                type="text"
                value={tag}
                onChange={e => setTag(e.target.value)}
                placeholder="e.g. DUBAI / PARIS"
                className="w-full px-3.5 py-2.5 bg-[#151310] border border-white/10 rounded-xl text-xs text-[#F5F2EA] focus:outline-none focus:border-[#C9A45C]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs uppercase font-bold tracking-wider text-[#A7A29A]">
                {t('admin.brands.order', 'Display Sort Order')}
              </label>
              <input
                type="number"
                min="1"
                value={displayOrder}
                onChange={e => setDisplayOrder(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-[#151310] border border-white/10 rounded-xl text-xs text-[#F5F2EA] focus:outline-none focus:border-[#C9A45C]"
              />
            </div>
          </div>

          {/* Logo & Emblem Selection Section */}
          <div className="space-y-3 p-4 rounded-xl bg-[#151310] border border-[#C9A45C]/20">
            <div className="flex items-center justify-between">
              <label className="block text-xs uppercase font-bold tracking-wider text-[#E3C27A]">
                {t('admin.brands.logoHeader', 'Brand Logo & Crest Emblem')}
              </label>
              {logoUrl && (
                <button
                  type="button"
                  onClick={() => setLogoUrl('')}
                  className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> {t('admin.brands.removeCustomLogo', 'Use Vector Crest')}
                </button>
              )}
            </div>

            {/* Logo Mode Switcher Tabs */}
            <div className="flex items-center gap-2 p-1 rounded-lg bg-[#070707] border border-white/10">
              <button
                type="button"
                onClick={() => setLogoMode('preset')}
                className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  logoMode === 'preset' ? 'bg-[#C9A45C] text-[#070707]' : 'text-[#A7A29A] hover:text-[#F5F2EA]'
                }`}
              >
                ✨ {t('admin.brands.goldPreset', 'Gold Vector Crest')}
              </button>
              <button
                type="button"
                onClick={() => setLogoMode('upload')}
                className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  logoMode === 'upload' ? 'bg-[#C9A45C] text-[#070707]' : 'text-[#A7A29A] hover:text-[#F5F2EA]'
                }`}
              >
                📁 {t('admin.brands.uploadTab', 'Upload File')}
              </button>
              <button
                type="button"
                onClick={() => setLogoMode('url')}
                className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  logoMode === 'url' ? 'bg-[#C9A45C] text-[#070707]' : 'text-[#A7A29A] hover:text-[#F5F2EA]'
                }`}
              >
                🔗 {t('admin.brands.urlTab', 'Image URL')}
              </button>
            </div>

            {/* Mode 1: Presets Grid */}
            {logoMode === 'preset' && (
              <div className="space-y-2 pt-2">
                <span className="text-[11px] text-[#A7A29A]">
                  {t('admin.brands.selectPresetDesc', 'Select a handcrafted luxury gold emblem for this house:')}
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1 custom-scrollbar">
                  {ICON_PRESETS.map((preset) => {
                    const isSelected = iconPreset === preset.id && !logoUrl;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setIconPreset(preset.id);
                          setLogoUrl('');
                        }}
                        className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#C9A45C] bg-[#C9A45C]/20 shadow-md shadow-[#C9A45C]/20 text-[#E3C27A]'
                            : 'border-white/10 bg-[#070707] hover:border-[#C9A45C]/40 text-[#A7A29A] hover:text-[#F5F2EA]'
                        }`}
                        title={preset.label}
                      >
                        <div className="w-8 h-8 flex items-center justify-center">
                          {preset.renderIcon()}
                        </div>
                        <span className="text-[9px] mt-1 truncate max-w-full font-medium">
                          {preset.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Mode 2: File Upload */}
            {logoMode === 'upload' && (
              <div className="space-y-3 pt-2">
                <div className="border-2 border-dashed border-[#C9A45C]/30 hover:border-[#C9A45C]/60 rounded-xl p-4 text-center bg-[#070707]/50 transition-colors">
                  <input
                    type="file"
                    id="brand-logo-file"
                    accept="image/png,image/webp,image/jpeg,image/svg+xml"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                  <label htmlFor="brand-logo-file" className="cursor-pointer block space-y-2">
                    {isUploading ? (
                      <div className="flex flex-col items-center justify-center py-2 text-[#C9A45C]">
                        <Loader2 className="w-6 h-6 animate-spin mb-1" />
                        <span className="text-xs font-semibold">{t('admin.brands.uploading', 'Uploading logo to storage...')}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-2 text-[#A7A29A] hover:text-[#F5F2EA]">
                        <Upload className="w-6 h-6 text-[#C9A45C] mb-1" />
                        <span className="text-xs font-semibold text-[#F5F2EA]">{t('admin.brands.clickUpload', 'Click to choose brand logo image')}</span>
                        <span className="text-[10px] text-[#A7A29A]">PNG with transparent background, WebP, SVG, or JPG (up to 5MB)</span>
                      </div>
                    )}
                  </label>
                </div>

                {uploadError && (
                  <p className="text-xs text-red-400">{uploadError}</p>
                )}
              </div>
            )}

            {/* Mode 3: Image URL input */}
            {logoMode === 'url' && (
              <div className="space-y-2 pt-2">
                <label className="text-[11px] text-[#A7A29A] block">
                  {t('admin.brands.pasteUrl', 'Paste direct brand logo image link:')}
                </label>
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-[#C9A45C] shrink-0" />
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={e => setLogoUrl(e.target.value)}
                    placeholder="https://example.com/brand-logo.png"
                    className="w-full px-3 py-2 bg-[#070707] border border-white/10 rounded-lg text-xs text-[#F5F2EA] focus:outline-none focus:border-[#C9A45C]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Active Status Checkbox */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#151310] border border-white/5">
            <input
              type="checkbox"
              id="brand-is-active"
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded border-[#C9A45C]/40 text-[#C9A45C] focus:ring-[#C9A45C] accent-[#C9A45C] cursor-pointer"
            />
            <label htmlFor="brand-is-active" className="text-xs text-[#F5F2EA] font-medium cursor-pointer select-none">
              {t('admin.brands.activeCheckbox', 'Active & Visible on Storefront Carousel')}
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#C9A45C]/15">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-white/15 text-xs font-semibold text-[#A7A29A] hover:text-[#F5F2EA] hover:bg-white/5 transition-colors cursor-pointer"
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#C9A45C] hover:bg-[#E3C27A] text-[#070707] text-xs font-bold uppercase tracking-wider transition-colors shadow-lg shadow-[#C9A45C]/20 cursor-pointer"
            >
              {isEditing ? t('common.saveChanges', 'Save Changes') : t('admin.brands.createBtn', 'Add Brand')}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
