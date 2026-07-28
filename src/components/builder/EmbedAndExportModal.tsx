import React, { useState } from 'react';
import { X, Share2, Copy, Check, Code2, Download, ExternalLink, Globe, Sparkles, Layers } from 'lucide-react';
import { PortfolioData } from '../../types';
import { generateStaticHTML } from '../../services/api';

interface EmbedAndExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolio: PortfolioData | null;
}

export const EmbedAndExportModal: React.FC<EmbedAndExportModalProps> = ({ isOpen, onClose, portfolio }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [activeTab, setActiveTab] = useState<'link' | 'embed' | 'api' | 'export'>('link');

  if (!isOpen || !portfolio) return null;

  const origin = window.location.origin;
  const shareableUrl = `${origin}/#/${portfolio.username}`;
  const embedCode = `<script src="${origin}/api/embed.js" data-user="${portfolio.username}"></script>`;
  const jsonApiUrl = `${origin}/api/portfolio/${portfolio.username}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  const handleDownloadStaticHTML = () => {
    const htmlContent = generateStaticHTML(portfolio);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${portfolio.username}-portfolio.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl p-6 relative space-y-5 max-h-[90vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Share, Embed & Export</h3>
            <p className="text-xs text-slate-400">Distribute your portfolio anywhere across the web</p>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-800 gap-2 pb-1">
          <button
            onClick={() => setActiveTab('link')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'link' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50' : 'text-slate-400 hover:text-white'
            }`}
          >
            🔗 Shareable Link
          </button>
          <button
            onClick={() => setActiveTab('embed')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'embed' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50' : 'text-slate-400 hover:text-white'
            }`}
          >
            🧩 Embed Widget
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'api' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50' : 'text-slate-400 hover:text-white'
            }`}
          >
            ⚡ JSON API
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'export' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50' : 'text-slate-400 hover:text-white'
            }`}
          >
            📦 Static Export
          </button>
        </div>

        {/* TAB 1: Shareable Link */}
        {activeTab === 'link' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Your Permanent Portfolio URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareableUrl}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs font-mono text-cyan-300 focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shrink-0 transition-all shadow-md"
                >
                  {copiedLink ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
                  {copiedLink ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>

            {/* Open Graph Social Card Preview */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Dynamic Open Graph Social Card (Slack, LinkedIn, Twitter, Discord)
                </div>
                <a
                  href={`${origin}/api/og-image/${portfolio.username}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-cyan-400 hover:underline font-bold flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Open SVG Banner
                </a>
              </div>

              {/* Dynamic SVG Banner Render */}
              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl group">
                <img
                  src={`${origin}/api/og-image/${portfolio.username}`}
                  alt={`${portfolio.profile.displayName} Open Graph Card`}
                  className="w-full h-auto object-cover rounded-xl"
                />
              </div>

              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1.5 text-xs">
                <div className="font-bold text-slate-200 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Generated Open Graph Meta Tags (`&lt;head&gt;`)
                </div>
                <div className="font-mono text-[10px] text-cyan-300/90 space-y-0.5 overflow-x-auto p-2 bg-slate-950 rounded-lg border border-slate-800">
                  <div>&lt;meta property="og:title" content="{portfolio.profile.displayName} — {portfolio.profile.tagline}" /&gt;</div>
                  <div>&lt;meta property="og:description" content="{portfolio.profile.bio ? portfolio.profile.bio.substring(0, 80) + '...' : portfolio.profile.tagline}" /&gt;</div>
                  <div>&lt;meta property="og:image" content="{origin}/api/og-image/{portfolio.username}" /&gt;</div>
                  <div>&lt;meta name="twitter:card" content="summary_large_image" /&gt;</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Embed Widget */}
        {activeTab === 'embed' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Drop this script tag into any blog, Notion page, or custom website:
              </label>
              <div className="relative">
                <textarea
                  readOnly
                  rows={2}
                  value={embedCode}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs font-mono text-cyan-300 focus:outline-none"
                />
                <button
                  onClick={handleCopyEmbed}
                  className="absolute top-2 right-2 px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 shadow-sm"
                >
                  {copiedEmbed ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedEmbed ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Live Interactive Widget Preview */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Live Embedded Widget Output</span>
                <span className="text-[10px] text-cyan-400">Responsive preview</span>
              </div>
              
              <div className="p-4 bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md mx-auto shadow-xl space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={portfolio.profile.avatarUrl}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-cyan-500"
                  />
                  <div>
                    <div className="font-bold text-sm text-white">{portfolio.profile.displayName}</div>
                    <div className="text-xs text-slate-400 line-clamp-1">{portfolio.profile.tagline}</div>
                  </div>
                </div>

                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Featured Projects</div>
                
                <div className="space-y-2">
                  {portfolio.projects.slice(0, 2).map((pr) => (
                    <div key={pr.id} className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs">
                      <div className="font-semibold text-cyan-300 flex justify-between">
                        <span>{pr.title}</span>
                        {pr.githubStats && <span className="text-slate-400 font-mono text-[10px]">★ {pr.githubStats.stars}</span>}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{pr.description}</div>
                    </div>
                  ))}
                </div>

                <div className="text-right pt-1">
                  <a
                    href={shareableUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-semibold text-cyan-400 hover:underline inline-flex items-center gap-1"
                  >
                    View Full Portfolio ➔
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Read-Only JSON API */}
        {activeTab === 'api' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Public JSON API Endpoint</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={jsonApiUrl}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs font-mono text-cyan-300 focus:outline-none"
                />
                <a
                  href={jsonApiUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shrink-0"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open API
                </a>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Pull your raw portfolio JSON data directly into custom headless builds, Astro sites, React apps, or mobile clients without lock-in!
            </p>
          </div>
        )}

        {/* TAB 4: Static HTML Export */}
        {activeTab === 'export' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Download className="w-5 h-5 text-cyan-400" />
                Export Standalone Static HTML
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Download a self-contained single `.html` file of your portfolio. You can host this static file anywhere (GitHub Pages, Netlify, Vercel, S3) with zero platform dependency!
              </p>
              <button
                onClick={handleDownloadStaticHTML}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all"
              >
                <Download className="w-4 h-4" />
                Download {portfolio.username}-portfolio.html
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
