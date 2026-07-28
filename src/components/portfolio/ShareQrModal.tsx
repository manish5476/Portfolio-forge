import React, { useState } from 'react';
import { motion } from 'motion/react';
import { QrCode, Share2, Copy, CheckCircle2, ExternalLink, X, Twitter, Linkedin, Github } from 'lucide-react';
import { PortfolioData } from '../../types';

interface ShareQrModalProps {
  portfolio: PortfolioData;
  onClose: () => void;
}

export const ShareQrModal: React.FC<ShareQrModalProps> = ({ portfolio, onClose }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/u/${portfolio.username}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    shareUrl
  )}&color=06b6d4&bgcolor=0f172a`;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-900/40 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        className="w-full max-w-md bg-white border border-slate-200/80 rounded-t-3xl md:rounded-3xl p-6 relative shadow-2xl space-y-5 text-center text-slate-900 max-h-[92vh] overflow-y-auto"
      >
        {/* Mobile Sheet Drag Handle */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto -mt-2 mb-2 md:hidden" />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1 pt-2">
          <h3 className="text-xl font-bold text-slate-900 font-display">Developer Identity QR Code</h3>
          <p className="text-xs text-slate-500">Scan to open digital identity profile or share custom social card.</p>
        </div>

        {/* Generated QR Code Container */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 inline-block mx-auto relative group">
          <img src={qrImageUrl} alt="QR Code" className="w-48 h-48 rounded-xl shadow-xs mx-auto" />
          <div className="text-[10px] text-indigo-600 font-mono font-bold mt-2">@{portfolio.username} • Verified Digital Identity</div>
        </div>

        {/* Share Link Input */}
        <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="w-full bg-transparent text-xs text-slate-700 font-mono px-2 outline-none"
          />
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shrink-0 flex items-center gap-1.5"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        {/* Quick Social Share Buttons */}
        <div className="flex justify-center gap-3 pt-1">
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
              `Check out my developer identity profile on Portfolio Forge!`
            )}&url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noreferrer"
            className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-400 transition-all text-xs font-bold flex items-center gap-2"
          >
            <Twitter className="w-4 h-4 text-cyan-400" />
            <span>Share on X</span>
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noreferrer"
            className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-blue-400 transition-all text-xs font-bold flex items-center gap-2"
          >
            <Linkedin className="w-4 h-4 text-blue-400" />
            <span>Share on LinkedIn</span>
          </a>
        </div>
      </motion.div>
    </div>
  );
};
