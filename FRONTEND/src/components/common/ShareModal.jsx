import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Share2, ExternalLink } from 'lucide-react';

/**
 * ShareModal — Reusable share popup with social buttons + copy link
 * Props: open, onClose, tripTitle, tripUrl
 */
export default function ShareModal({ open, onClose, tripTitle = 'My Trip', tripUrl = '' }) {
  const [copied, setCopied] = useState(false);
  const [fallbackShareId] = useState(() => Date.now());
  const shareUrl = tripUrl || `https://traveloop.app/trip/shared-${fallbackShareId}`;
  const shareText = `Check out my trip plan: ${tripTitle} — on Traveloop!`;

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(shareUrl); } catch { /* fallback */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const socials = [
    { name: 'WhatsApp', color: '#25D366', url: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
      icon: <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/> },
    { name: 'Twitter', color: '#1DA1F2', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      icon: <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/> },
    { name: 'Facebook', color: '#1877F2', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      icon: <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/> },
    { name: 'Telegram', color: '#0088cc', url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      icon: <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0h-.056zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/> },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-modal-title"
            className="fixed inset-x-0 bottom-0 top-auto z-[101] max-h-[calc(100dvh-1rem)] w-full overflow-y-auto rounded-t-3xl bg-white shadow-[0_-20px_60px_rgba(0,0,0,0.16)] sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-96 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:shadow-[0_20px_60px_rgba(0,0,0,0.15)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Share2 size={18} className="text-primary" />
                <h3 id="share-modal-title" className="font-poppins text-base font-bold text-gray-900">Share Trip</h3>
              </div>
              <button aria-label="Close share dialog" onClick={onClose} className="tap-target rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Trip info */}
              <div className="bg-[#f0f9ff] rounded-xl p-3 text-center">
                <p className="text-xs text-gray-400 mb-0.5">Sharing</p>
                <p className="font-poppins text-sm font-bold text-gray-800">{tripTitle}</p>
              </div>

              {/* Social Buttons */}
              <div className="grid grid-cols-4 gap-3">
                {socials.map((s) => (
                  <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer"
                    aria-label={`Share on ${s.name}`}
                    className="flex min-h-20 flex-col items-center gap-2 rounded-xl py-3 hover:bg-gray-50 transition-colors">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: s.color + '15' }}>
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill={s.color}>{s.icon}</svg>
                    </div>
                    <span className="text-[10px] font-medium text-gray-500">{s.name}</span>
                  </a>
                ))}
              </div>

              {/* Copy Link */}
              <div className="flex flex-col gap-2 xs:flex-row">
                <div className="min-h-11 flex-1 bg-gray-50 border border-gray-100 rounded-full px-4 py-2.5 text-xs text-gray-500 truncate flex items-center gap-2">
                  <ExternalLink size={13} className="text-gray-400 shrink-0" />
                  <span className="truncate">{shareUrl}</span>
                </div>
                <button onClick={copyLink}
                  className={`min-h-11 justify-center px-5 py-2.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    copied ? 'bg-green-500 text-white' : 'bg-primary text-white hover:bg-[#006098]'
                  }`}>
                  {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
