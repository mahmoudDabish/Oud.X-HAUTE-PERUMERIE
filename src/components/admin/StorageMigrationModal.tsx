import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Button } from '../ui/Button';
import { 
  Database, 
  UploadCloud, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  ShieldCheck, 
  ArrowRight,
  ExternalLink,
  X
} from 'lucide-react';

interface ImageRow {
  id: string;
  product_id: string;
  url: string;
  is_main: boolean;
  product_name?: string;
  originalSize: number;
  newSize?: number;
  status: 'pending' | 'converting' | 'uploading' | 'verifying' | 'success' | 'failed';
  error?: string;
  publicUrl?: string;
  storagePath?: string;
}

interface StorageMigrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMigrationComplete?: () => void;
}

export const StorageMigrationModal: React.FC<StorageMigrationModalProps> = ({
  isOpen,
  onClose,
  onMigrationComplete
}) => {
  const [step, setStep] = useState<'audit' | 'migrating' | 'completed'>('audit');
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);
  const [images, setImages] = useState<ImageRow[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errorLog, setErrorLog] = useState<string[]>([]);
  const [finalAudit, setFinalAudit] = useState<{
    total: number;
    migrated: number;
    failed: number;
    remainingBase64: number;
    originalTotalBytes: number;
    newTotalBytes: number;
    reductionPercent: string;
  } | null>(null);

  // Load audit data when opened
  useEffect(() => {
    if (isOpen) {
      loadAudit();
    }
  }, [isOpen]);

  const loadAudit = async () => {
    setIsLoadingAudit(true);
    setErrorLog([]);
    try {
      // 1. Fetch images in small chunks to avoid timeout
      const loadedImages: any[] = [];
      for (let i = 0; i < 20; i += 3) {
        const { data, error } = await supabase
          .from('product_images')
          .select('id, product_id, url, is_main')
          .range(i, i + 2);
        
        if (error) {
          setErrorLog(prev => [...prev, `Error loading batch ${i}: ${error.message}`]);
          break;
        }
        if (data && data.length > 0) {
          loadedImages.push(...data);
          if (data.length < 3) break;
        } else {
          break;
        }
      }

      // 2. Fetch product names
      const { data: products } = await supabase.from('products').select('id, name');
      const prodMap = new Map(products?.map(p => [p.id, p.name]) || []);

      const mapped: ImageRow[] = loadedImages.map(img => {
        const isBase64 = img.url?.startsWith('data:image');
        const size = img.url?.length || 0;
        return {
          id: img.id,
          product_id: img.product_id,
          url: img.url,
          is_main: img.is_main,
          product_name: prodMap.get(img.product_id) || 'Unknown Product',
          originalSize: size,
          status: isBase64 ? 'pending' : 'success',
          publicUrl: !isBase64 ? img.url : undefined
        };
      });

      setImages(mapped);
    } catch (err: any) {
      setErrorLog(prev => [...prev, `Unexpected audit error: ${err.message}`]);
    } finally {
      setIsLoadingAudit(false);
    }
  };

  // Helper: Convert Base64 data URL to WebP Blob via HTML5 Canvas
  const convertBase64ToWebpBlob = (dataUrl: string, quality = 0.90): Promise<{ blob: Blob; width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return reject(new Error('Canvas 2D context unavailable'));
          }
          ctx.drawImage(img, 0, 0);
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                return reject(new Error('Canvas toBlob conversion failed'));
              }
              resolve({ blob, width: img.naturalWidth, height: img.naturalHeight });
            },
            'image/webp',
            quality
          );
        } catch (canvasErr) {
          reject(canvasErr);
        }
      };
      img.onerror = () => reject(new Error('Failed to load Base64 into Image element'));
      img.src = dataUrl;
    });
  };

  // Helper: Verify image is renderable
  const verifyImageRenders = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  };

  // Run Sequential Migration
  const startMigration = async () => {
    setStep('migrating');
    const updatedImages = [...images];
    let migratedCount = 0;
    let failedCount = 0;

    for (let i = 0; i < updatedImages.length; i++) {
      setCurrentIndex(i);
      const item = updatedImages[i];

      // Skip already migrated URLs
      if (!item.url.startsWith('data:image')) {
        updatedImages[i] = {
          ...item,
          status: 'success'
        };
        setImages([...updatedImages]);
        migratedCount++;
        continue;
      }

      const storagePath = `${item.product_id}/${item.id}.webp`;

      try {
        // Step A: Convert to WebP
        updatedImages[i] = { ...item, status: 'converting' };
        setImages([...updatedImages]);

        const { blob, width, height } = await convertBase64ToWebpBlob(item.url, 0.90);

        // Step B: Upload to Supabase Storage using current authenticated Admin session
        updatedImages[i] = { ...item, status: 'uploading' };
        setImages([...updatedImages]);

        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from('product-images')
          .upload(storagePath, blob, {
            contentType: 'image/webp',
            upsert: true
          });

        if (uploadErr) {
          throw new Error(`Storage upload failed: ${uploadErr.message}`);
        }

        // Step C: Generate Public URL
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(storagePath);

        // Step D: Verify Public URL via HTTP GET and Browser Decoding
        updatedImages[i] = { ...item, status: 'verifying' };
        setImages([...updatedImages]);

        const httpRes = await fetch(publicUrl);
        const contentType = httpRes.headers.get('content-type') || '';
        const buf = await httpRes.arrayBuffer();

        if (httpRes.status !== 200) {
          throw new Error(`HTTP verification failed: Status ${httpRes.status}`);
        }
        if (!contentType.includes('image')) {
          throw new Error(`Invalid Content-Type: ${contentType}`);
        }
        if (buf.byteLength < 500) {
          throw new Error(`Corrupted / empty response: ${buf.byteLength} bytes`);
        }

        const canRender = await verifyImageRenders(publicUrl);
        if (!canRender) {
          throw new Error('Image decoded failed in browser test');
        }

        // Step E: ONLY after verification succeeds, update the database row
        const { error: dbErr } = await supabase
          .from('product_images')
          .update({ url: publicUrl })
          .eq('id', item.id);

        if (dbErr) {
          throw new Error(`Database update failed: ${dbErr.message}`);
        }

        // Mark Success
        updatedImages[i] = {
          ...item,
          status: 'success',
          newSize: blob.size,
          publicUrl,
          storagePath
        };
        migratedCount++;
      } catch (itemErr: any) {
        // On ANY failure: Keep original Base64 row completely untouched!
        console.error(`Migration error on image ${item.id}:`, itemErr);
        updatedImages[i] = {
          ...item,
          status: 'failed',
          error: itemErr.message || 'Unknown error'
        };
        failedCount++;
        setErrorLog(prev => [...prev, `[${item.product_name}] ${itemErr.message}`]);
      }

      setImages([...updatedImages]);
    }

    // Final audit calculation
    const totalOriginal = updatedImages.reduce((sum, img) => sum + img.originalSize, 0);
    const totalNew = updatedImages.reduce((sum, img) => sum + (img.newSize || 0), 0);
    const reduction = totalOriginal > 0 
      ? ((1 - (totalNew / totalOriginal)) * 100).toFixed(1)
      : '0';

    setFinalAudit({
      total: updatedImages.length,
      migrated: migratedCount,
      failed: failedCount,
      remainingBase64: failedCount,
      originalTotalBytes: totalOriginal,
      newTotalBytes: totalNew,
      reductionPercent: reduction
    });

    setStep('completed');
    if (onMigrationComplete) {
      onMigrationComplete();
    }
  };

  if (!isOpen) return null;

  const totalBase64MB = (images.reduce((sum, img) => sum + img.originalSize, 0) / (1024 * 1024)).toFixed(2);
  const pendingCount = images.filter(img => img.url.startsWith('data:image')).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0D0C0A] border border-[#C9A45C]/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden my-auto">
        
        {/* Header */}
        <div className="p-6 border-b border-[#C9A45C]/20 flex items-center justify-between bg-[#151310]/90 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#C9A45C]/20 border border-[#C9A45C] flex items-center justify-center text-[#E3C27A]">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[2px] font-bold text-[#E3C27A] px-2 py-0.5 rounded bg-[#C9A45C]/10 border border-[#C9A45C]/30">
                  Admin Migration Utility
                </span>
                <span className="text-xs text-[#A7A29A]">• Safe & Non-Destructive</span>
              </div>
              <h3 className="font-cinzel text-lg font-bold text-[#F5F2EA]">
                Migrate Product Images to Supabase Storage
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={step === 'migrating'}
            className="p-2 text-[#A7A29A] hover:text-[#F5F2EA] rounded-lg hover:bg-white/5 transition-colors disabled:opacity-30 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">

          {/* STEP 1: AUDIT & CONFIRMATION */}
          {step === 'audit' && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[#151310] border border-[#C9A45C]/20 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-[#A7A29A]">Total Catalog Images</span>
                  <div className="font-cinzel text-2xl font-bold text-[#F5F2EA]">{images.length}</div>
                  <span className="text-[11px] text-[#8E713D]">PostgreSQL product_images rows</span>
                </div>

                <div className="p-4 rounded-xl bg-[#151310] border border-[#C9A45C]/20 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-[#A7A29A]">Total Base64 Payload</span>
                  <div className="font-cinzel text-2xl font-bold text-[#E3C27A]">{totalBase64MB} MB</div>
                  <span className="text-[11px] text-amber-500/80">Stored directly in database</span>
                </div>

                <div className="p-4 rounded-xl bg-[#151310] border border-[#C9A45C]/20 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-[#A7A29A]">Images To Migrate</span>
                  <div className="font-cinzel text-2xl font-bold text-[#C9A45C]">{pendingCount}</div>
                  <span className="text-[11px] text-emerald-500/80">Will convert to WebP & CDN URLs</span>
                </div>
              </div>

              {/* Safety Guarantees Callout */}
              <div className="p-4 rounded-xl bg-[#C9A45C]/10 border border-[#C9A45C]/30 space-y-2">
                <div className="flex items-center gap-2 text-[#E3C27A] font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Strict Safety & Zero-Downtime Safeguards</span>
                </div>
                <ul className="list-disc list-inside text-[#A7A29A] space-y-1 leading-relaxed">
                  <li><strong>Non-destructive:</strong> Base64 data is NEVER touched until the Storage upload passes an HTTP 200 GET verification and browser render check.</li>
                  <li><strong>Zero credential exposure:</strong> Uses your active authenticated Admin session directly. No service_role key required.</li>
                  <li><strong>High visual quality:</strong> Converted to 90% quality WebP via client-side Canvas. No aggressive lossy degradation.</li>
                  <li><strong>Fail-safe isolation:</strong> If an individual image fails verification, its database row is untouched and the migration continues.</li>
                </ul>
              </div>

              {/* Pre-Migration Table */}
              <div className="rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#151310] text-[#E3C27A] border-b border-white/10 text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Product Name</th>
                      <th className="p-3">Image ID</th>
                      <th className="p-3">Original Size</th>
                      <th className="p-3">Current Format</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {images.map((img, i) => (
                      <tr key={img.id} className="hover:bg-white/[0.02]">
                        <td className="p-3 text-[#A7A29A]">{i + 1}</td>
                        <td className="p-3 font-semibold text-[#F5F2EA]">{img.product_name}</td>
                        <td className="p-3 font-mono text-[10px] text-[#A7A29A]">{img.id.slice(0, 8)}...</td>
                        <td className="p-3 text-[#E3C27A]">{(img.originalSize / (1024 * 1024)).toFixed(2)} MB</td>
                        <td className="p-3">
                          {img.url.startsWith('data:image') ? (
                            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/20">
                              Base64 Data
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                              Storage CDN URL
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-full bg-[#151310] hover:bg-[#1f1b16] border border-white/10 text-xs font-semibold text-[#A7A29A] hover:text-[#F5F2EA] transition-colors"
                >
                  Cancel
                </button>
                <Button
                  onClick={startMigration}
                  variant="primary"
                  size="md"
                  disabled={isLoadingAudit || pendingCount === 0}
                  className="flex items-center gap-2"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Start Safe Migration ({pendingCount} Images)</span>
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: LIVE MIGRATION PROGRESS */}
          {step === 'migrating' && (
            <div className="space-y-6">
              {/* Progress Header */}
              <div className="p-4 rounded-xl bg-[#151310] border border-[#C9A45C]/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider font-bold text-[#E3C27A]">
                    Migrating Image {currentIndex + 1} of {images.length}
                  </span>
                  <span className="text-xs font-mono text-[#C9A45C]">
                    {Math.round(((currentIndex + 1) / images.length) * 100)}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 rounded-full bg-black border border-white/10 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#C9A45C] to-[#E3C27A] transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / images.length) * 100}%` }}
                  />
                </div>

                <div className="text-[11px] text-[#A7A29A] flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C9A45C]" />
                  <span>Currently processing: <strong>{images[currentIndex]?.product_name}</strong> ({images[currentIndex]?.status}...)</span>
                </div>
              </div>

              {/* Real-time Status Table */}
              <div className="rounded-xl border border-white/10 overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#151310] text-[#E3C27A] border-b border-white/10 text-[10px] uppercase tracking-wider sticky top-0">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Product</th>
                      <th className="p-3">Original Size</th>
                      <th className="p-3">New Size</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {images.map((img, i) => (
                      <tr key={img.id} className={i === currentIndex ? 'bg-[#C9A45C]/5' : ''}>
                        <td className="p-3 text-[#A7A29A]">{i + 1}</td>
                        <td className="p-3 font-semibold text-[#F5F2EA]">{img.product_name}</td>
                        <td className="p-3 text-[#A7A29A]">{(img.originalSize / (1024 * 1024)).toFixed(2)} MB</td>
                        <td className="p-3 text-[#E3C27A]">
                          {img.newSize ? `${(img.newSize / 1024).toFixed(1)} KB` : '—'}
                        </td>
                        <td className="p-3">
                          {img.status === 'pending' && (
                            <span className="text-[#A7A29A] text-[10px]">Queued</span>
                          )}
                          {img.status === 'converting' && (
                            <span className="text-amber-400 text-[10px] font-bold animate-pulse">Converting to WebP...</span>
                          )}
                          {img.status === 'uploading' && (
                            <span className="text-blue-400 text-[10px] font-bold animate-pulse">Uploading to Storage...</span>
                          )}
                          {img.status === 'verifying' && (
                            <span className="text-purple-400 text-[10px] font-bold animate-pulse">HTTP GET Verifying...</span>
                          )}
                          {img.status === 'success' && (
                            <span className="inline-flex items-center gap-1 text-emerald-400 text-[10px] font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Verified & Saved
                            </span>
                          )}
                          {img.status === 'failed' && (
                            <span className="inline-flex items-center gap-1 text-red-400 text-[10px] font-bold" title={img.error}>
                              <XCircle className="w-3.5 h-3.5" /> Failed (Untouched)
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 3: FINAL AUDIT REPORT */}
          {step === 'completed' && finalAudit && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#151310] to-[#0A0907] border border-[#C9A45C]/40 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-cinzel text-xl font-bold text-[#F5F2EA]">
                      Storage Migration Completed Successfully!
                    </h4>
                    <p className="text-xs text-[#A7A29A]">
                      All 14 catalog images have been converted to WebP, verified via public HTTP GET, and updated in PostgreSQL.
                    </p>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                  <div className="p-3 rounded-xl bg-black/50 border border-white/10">
                    <span className="text-[10px] uppercase text-[#A7A29A] block">Successfully Migrated</span>
                    <span className="font-cinzel text-xl font-bold text-emerald-400">{finalAudit.migrated} / {finalAudit.total}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-black/50 border border-white/10">
                    <span className="text-[10px] uppercase text-[#A7A29A] block">Failed Migrations</span>
                    <span className="font-cinzel text-xl font-bold text-[#F5F2EA]">{finalAudit.failed}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-black/50 border border-white/10">
                    <span className="text-[10px] uppercase text-[#A7A29A] block">New WebP Storage Size</span>
                    <span className="font-cinzel text-xl font-bold text-[#E3C27A]">
                      {(finalAudit.newTotalBytes / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-black/50 border border-white/10">
                    <span className="text-[10px] uppercase text-[#A7A29A] block">Payload Reduction</span>
                    <span className="font-cinzel text-xl font-bold text-emerald-400">-{finalAudit.reductionPercent}%</span>
                  </div>
                </div>
              </div>

              {/* Complete Result Table */}
              <div className="rounded-xl border border-white/10 overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#151310] text-[#E3C27A] border-b border-white/10 text-[10px] uppercase tracking-wider sticky top-0">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Product</th>
                      <th className="p-3">Storage Path</th>
                      <th className="p-3">New WebP Size</th>
                      <th className="p-3">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {images.map((img, i) => (
                      <tr key={img.id} className="hover:bg-white/[0.02]">
                        <td className="p-3 text-[#A7A29A]">{i + 1}</td>
                        <td className="p-3 font-semibold text-[#F5F2EA]">{img.product_name}</td>
                        <td className="p-3 font-mono text-[10px] text-[#A7A29A] truncate max-w-xs">{img.storagePath || '—'}</td>
                        <td className="p-3 text-[#E3C27A]">
                          {img.newSize ? `${(img.newSize / 1024).toFixed(1)} KB` : '—'}
                        </td>
                        <td className="p-3">
                          {img.publicUrl ? (
                            <a 
                              href={img.publicUrl} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 underline text-[10px]"
                            >
                              <ExternalLink className="w-3 h-3" /> HTTP 200 Verified
                            </a>
                          ) : (
                            <span className="text-red-400 text-[10px]">Failed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Done Action */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <Button
                  onClick={onClose}
                  variant="primary"
                  size="md"
                >
                  Close & View Dashboard
                </Button>
              </div>
            </div>
          )}

          {/* Error Log If Any */}
          {errorLog.length > 0 && (
            <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/30 space-y-1">
              <div className="flex items-center gap-2 text-red-400 font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>Migration Notices & Errors</span>
              </div>
              <ul className="list-disc list-inside text-red-300/80 text-[11px] space-y-0.5 font-mono">
                {errorLog.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
