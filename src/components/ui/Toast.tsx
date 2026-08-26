import React from 'react';
import { useShop } from '../../context/ShopContext';
import { CheckCircle2, Info, Sparkles, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useShop();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="pointer-events-auto bg-[#151310]/85 border border-[#C9A45C]/40 rounded-2xl p-4 shadow-2xl shadow-black/80 flex items-start gap-3.5 backdrop-blur-2xl"
          >
            <div className="mt-0.5 text-[#C9A45C] shrink-0">
              {toast.type === 'gold' && <Sparkles className="w-5 h-5 text-[#C9A45C]" />}
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-[#F0D9A4]" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold uppercase tracking-[2px] text-[#F5F2EA]">
                {toast.title}
              </h4>
              {toast.message && (
                <p className="text-xs text-[#A7A29A] mt-1 leading-relaxed line-clamp-2">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#A7A29A] hover:text-[#F5F2EA] transition-colors p-1 rounded-full hover:bg-white/5"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export const Toast = ToastContainer;

