import React, { useState, useEffect, useRef } from 'react';
import { X, ExternalLink, ArrowLeft, Code2 } from 'lucide-react';
import { Project } from '../../types';

interface LivePreviewDockProps {
  activeProject: Project;
  allProjects: Project[];
  onSelectProject: (project: Project) => void;
  onCloseDock: () => void;
  accentColor?: string;
}

export const LivePreviewDock: React.FC<LivePreviewDockProps> = ({
  activeProject,
  allProjects,
  onSelectProject,
  onCloseDock,
  accentColor = '#06b6d4',
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const liveProjects = allProjects.filter((p) => Boolean(p.hostedUrl));

  // Briefly show spinner on project switch then reveal iframe
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [activeProject.hostedUrl]);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
      
      {/* LEFT DOCK RAIL: Compact project selector */}
      <div className="w-80 border-r border-slate-800 bg-slate-950 flex flex-col justify-between shrink-0 hidden md:flex">
        
        {/* Top Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <button
            onClick={onCloseDock}
            className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span>Return to Portfolio</span>
          </button>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
            Dock Active
          </span>
        </div>

        {/* Project Rail Cards List */}
        <div className="p-3 space-y-2.5 overflow-y-auto flex-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2">
            Hosted Web Apps ({liveProjects.length})
          </div>

          {liveProjects.map((p) => {
            const isActive = p.id === activeProject.id;

            return (
              <div
                key={p.id}
                onClick={() => onSelectProject(p)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 border-cyan-500 shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      <Code2 className="w-5 h-5 text-cyan-400" />
                    )}
                  </div>

                  <div className="overflow-hidden flex-1">
                    <div className="font-bold text-xs text-white truncate flex items-center justify-between">
                      <span className="truncate">{p.title}</span>
                      {isActive && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0 ml-1" />}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">{p.hostedUrl}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dock Footer */}
        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500 text-center">
          Portfolio Forge • Live Preview Mode
        </div>
      </div>

      {/* RIGHT FLOATING GLASSMORPHISM PANEL */}
      <div className="flex-1 p-3 sm:p-6 flex flex-col overflow-hidden relative">
        
        {/* Floating Glassmorphism Frame Container */}
        <div className="w-full h-full bg-slate-900/80 backdrop-blur-2xl border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col relative ring-1 ring-white/10">
          
          {/* Top Browser-Chrome Header Bar */}
          <div className="h-12 px-4 bg-slate-950/90 border-b border-slate-800/80 flex items-center justify-between gap-3 shrink-0">
            
            {/* Window Controls (Mac style dots) */}
            <div className="flex items-center gap-2">
              <button onClick={onCloseDock} className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors" title="Close Live Preview" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>

            {/* URL Address Bar */}
            <div className="flex-1 max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-xl px-3 py-1 text-xs text-slate-300 font-mono truncate flex items-center gap-2">
              <span className="text-emerald-400 text-[10px]">🔒 HTTPS</span>
              <span className="truncate text-slate-200">{activeProject.hostedUrl}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <a
                href={activeProject.hostedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs font-semibold"
                title="Open in new tab"
              >
                <ExternalLink className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline">New Tab</span>
              </a>

              <button
                onClick={onCloseDock}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Exit Live Preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Iframe Viewport Area */}
          <div className="flex-1 relative bg-slate-950 overflow-hidden">
            
            {/* Transient Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/90 gap-3 pointer-events-none transition-opacity duration-300">
                <div className="w-8 h-8 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <div className="text-xs font-mono text-cyan-300">Loading live application...</div>
              </div>
            )}

            <iframe
              ref={iframeRef}
              src={activeProject.hostedUrl}
              title={activeProject.title}
              onLoad={handleIframeLoad}
              className="w-full h-full border-0 bg-white"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
            />

          </div>

        </div>

      </div>
    </div>
  );
};
