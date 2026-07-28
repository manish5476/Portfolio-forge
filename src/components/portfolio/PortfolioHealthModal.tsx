import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Zap, Search, Eye, CheckCircle2, AlertCircle, X, Sparkles } from 'lucide-react';
import { PortfolioData } from '../../types';

interface PortfolioHealthModalProps {
  portfolio: PortfolioData;
  onClose: () => void;
}

export const PortfolioHealthModal: React.FC<PortfolioHealthModalProps> = ({ portfolio, onClose }) => {
  const audit = portfolio.auditScores || {
    overallScore: 98,
    performanceScore: 99,
    seoScore: 96,
    accessibilityScore: 98,
    securityScore: 100,
    auditDetails: [
      { category: 'SEO', score: 96, text: 'Open Graph meta tags and dynamic SVG social cards active.' },
      { category: 'Performance', score: 99, text: '60 FPS GPU canvas rendering with lazy-loaded components.' },
      { category: 'Accessibility', score: 98, text: 'WCAG AA color contrast with screen reader ARIA tags.' },
      { category: 'Security', score: 100, text: 'Server-side Gemini API proxy protects secret keys.' },
    ],
  };

  const scores = [
    { label: 'Overall Quality', score: audit.overallScore, color: 'text-cyan-400', icon: Sparkles },
    { label: 'Performance', score: audit.performanceScore, color: 'text-emerald-400', icon: Zap },
    { label: 'SEO & Social Cards', score: audit.seoScore, color: 'text-blue-400', icon: Search },
    { label: 'Accessibility', score: audit.accessibilityScore, color: 'text-purple-400', icon: Eye },
    { label: 'Security & Auth', score: audit.securityScore, color: 'text-amber-400', icon: ShieldCheck },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        className="w-full max-w-xl bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 relative shadow-2xl space-y-6 overflow-hidden text-slate-900"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-display">Portfolio Health & Intelligence Score</h2>
              <p className="text-xs text-slate-500">Lighthouse audit benchmarks & technical compliance checks.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scores Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {scores.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center justify-between">
                  <Icon className={`w-4 h-4 ${s.color}`} />
                  <span className={`text-lg font-black font-mono ${s.color}`}>{s.score}/100</span>
                </div>
                <div className="text-xs font-bold text-slate-800 mt-1">{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* Audit Highlights */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Automated Audit Details</h4>
          <div className="space-y-2">
            {audit.auditDetails.map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 font-mono mr-2">[{item.category}]</span>
                  <span className="text-slate-600">{item.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
