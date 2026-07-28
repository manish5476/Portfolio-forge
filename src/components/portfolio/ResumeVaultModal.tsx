import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Download,
  Copy,
  ExternalLink,
  Bot,
  RefreshCw,
  Send,
  Building,
  Briefcase,
  X
} from 'lucide-react';
import { PortfolioData } from '../../types';

interface ResumeVaultModalProps {
  portfolio: PortfolioData;
  onClose: () => void;
}

export const ResumeVaultModal: React.FC<ResumeVaultModalProps> = ({ portfolio, onClose }) => {
  const [activeTab, setActiveTab] = useState<'ats' | 'cover_letter' | 'versions'>('ats');
  const [targetCompany, setTargetCompany] = useState('Vercel');
  const [targetRole, setTargetRole] = useState('Staff Full-Stack Engineer');
  const [coverLetterText, setCoverLetterText] = useState('');
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [copied, setCopied] = useState(false);

  const vault = portfolio.resumeVault || {
    resumeUrl: portfolio.profile.resumeUrl || 'https://example.com/resume.pdf',
    atsScore: 96,
    atsKeywords: ['TypeScript', 'WebGL', 'React 19', 'Design Systems', 'CI/CD', 'State Management', 'WebSockets', 'GraphQL'],
    atsRecommendations: [
      'Quantify impact with specific metrics (e.g., % latency reduction or user count).',
      'Highlight senior engineer leadership metrics in experience bullets.',
      'Include link to live WebGL playground demo.',
    ],
    versions: [
      { id: 'v1', title: 'Staff Frontend & Architecture Resume (2026)', pdfUrl: 'https://example.com/resume-v1.pdf', atsScore: 96, updatedAt: '2026-07-01' },
      { id: 'v2', title: 'Creative Technologist & WebGL Resume', pdfUrl: 'https://example.com/resume-v2.pdf', atsScore: 92, updatedAt: '2026-05-15' },
    ],
  };

  const handleGenerateCoverLetter = async () => {
    setIsGeneratingCover(true);
    try {
      const res = await fetch('/api/ai/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetCompany,
          targetRole,
          profile: portfolio.profile,
          projects: portfolio.projects,
        }),
      });
      const data = await res.json();
      if (data.coverLetter) {
        setCoverLetterText(data.coverLetter);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingCover(false);
    }
  };

  const handleCopyCover = () => {
    navigator.clipboard.writeText(coverLetterText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-900/40 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        className="w-full max-w-3xl bg-white border border-slate-200/80 rounded-t-3xl md:rounded-3xl p-6 sm:p-8 relative shadow-2xl space-y-6 overflow-hidden max-h-[92vh] flex flex-col text-slate-900"
      >
        {/* Mobile Sheet Drag Handle */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto -mt-2 mb-2 md:hidden" />
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-600">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
                ATS Career Vault & AI Resume Suite
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 font-mono text-xs font-bold">
                  Score: {vault.atsScore}/100
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Gemini-powered ATS resume optimization, keyword matching, and targeted cover letter generator.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-slate-100 pb-3 shrink-0">
          <button
            onClick={() => setActiveTab('ats')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ats'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            ATS Score & Keyword Audit
          </button>
          <button
            onClick={() => setActiveTab('cover_letter')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'cover_letter'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            AI Cover Letter Generator
          </button>
          <button
            onClick={() => setActiveTab('versions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'versions'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Resume Versions ({vault.versions?.length || 1})
          </button>
        </div>

        {/* Tab Contents */}
        <div className="overflow-y-auto space-y-4 pr-1 flex-1">
          {activeTab === 'ats' && (
            <div className="space-y-4">
              {/* Gauge & Top Stats */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center gap-6">
                <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-800"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-cyan-400"
                      strokeDasharray={`${vault.atsScore}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-xl font-black text-white font-mono">{vault.atsScore}</span>
                    <span className="block text-[9px] text-slate-400 uppercase font-bold">ATS Score</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Top 2% Recruiter Screening Pass Rate</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Your profile and project stack match candidate keyword criteria for Apple, Vercel, Stripe, and Linear.
                  </p>
                </div>
              </div>

              {/* Keywords Identified */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">High-Impact Technical Keywords Detected</h4>
                <div className="flex flex-wrap gap-2 pt-1">
                  {vault.atsKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* AI Recommendations */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  AI Optimization Recommendations
                </h4>
                <div className="space-y-2 pt-1">
                  {vault.atsRecommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cover_letter' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-bold">Target Company</label>
                  <input
                    type="text"
                    value={targetCompany}
                    onChange={(e) => setTargetCompany(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-500 outline-none"
                    placeholder="e.g. Vercel / Apple"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-bold">Target Role Title</label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-500 outline-none"
                    placeholder="e.g. Staff Full-Stack Engineer"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerateCoverLetter}
                disabled={isGeneratingCover}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
              >
                {isGeneratingCover ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating Custom Cover Letter with Gemini AI...
                  </>
                ) : (
                  <>
                    <Bot className="w-4 h-4" />
                    Generate Targeted Cover Letter
                  </>
                )}
              </button>

              {coverLetterText && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 relative">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                    <span>Generated Cover Letter Preview</span>
                    <button
                      onClick={handleCopyCover}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs transition-all"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copied ? 'Copied!' : 'Copy to Clipboard'}
                    </button>
                  </div>
                  <pre className="text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed p-3 bg-slate-900 rounded-xl border border-slate-800">
                    {coverLetterText}
                  </pre>
                </div>
              )}
            </div>
          )}

          {activeTab === 'versions' && (
            <div className="space-y-3">
              {vault.versions?.map((ver) => (
                <div
                  key={ver.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between hover:border-cyan-500/40 transition-all"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-sm text-white">{ver.title}</div>
                    <div className="text-xs text-slate-400">Updated: {ver.updatedAt} • ATS Score: {ver.atsScore}/100</div>
                  </div>
                  <a
                    href={ver.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download PDF
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400 shrink-0">
          <span>Powered by Portfolio Forge Career Intelligence Engine</span>
          {vault.resumeUrl && (
            <a
              href={vault.resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:underline font-bold flex items-center gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open Primary PDF
            </a>
          )}
        </div>
      </motion.div>
    </div>
  );
};
