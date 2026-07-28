import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Database,
  Cloud,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldAlert,
  GitBranch,
  Code2,
  Activity,
  Sparkles,
  Info,
} from 'lucide-react';
import { UseTelemetrySyncResult } from '../../hooks/useTelemetrySync';

interface TelemetrySyncBannerProps {
  telemetrySync: UseTelemetrySyncResult;
  onNavigateToConfig?: (provider: string) => void;
}

export const TelemetrySyncBanner: React.FC<TelemetrySyncBannerProps> = ({
  telemetrySync,
  onNavigateToConfig,
}) => {
  const {
    telemetry,
    syncStatus,
    isSyncing,
    lastSyncedAt,
    missingConfigs,
    providerErrors,
    syncNow,
  } = telemetrySync;

  const [isDetailsExpanded, setIsDetailsExpanded] = useState<boolean>(false);

  const hasErrors = Object.keys(providerErrors).length > 0;
  const hasMissing = missingConfigs.length > 0;

  // Status Badge Styling
  const getStatusBadge = () => {
    if (isSyncing) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-mono font-bold">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
          Synchronizing Live Telemetry...
        </span>
      );
    }

    if (hasErrors) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-mono font-bold">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          Degraded Sync ({Object.keys(providerErrors).length} Provider Error)
        </span>
      );
    }

    if (hasMissing) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-mono font-bold">
          <Info className="w-3.5 h-3.5 text-indigo-600" />
          {telemetry.activeProvidersCount}/3 Providers Connected
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-bold">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        Verified & Synced with Database
      </span>
    );
  };

  return (
    <div className="w-full bg-slate-900/95 backdrop-blur-md text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          
          {/* Left: Telemetry Status Indicator */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Activity className="w-4 h-4" />
              </div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                Unified Telemetry Engine
              </span>
            </div>

            {getStatusBadge()}

            {lastSyncedAt && (
              <span className="text-[11px] font-mono text-slate-400 hidden lg:inline">
                Synced at {lastSyncedAt.toLocaleTimeString()}
              </span>
            )}
          </div>

          {/* Center / Right: Quick Controls & Drawer Toggle */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            
            {/* DevScore Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">DevScore:</span>
              <strong className="text-amber-400 font-black">{telemetry.overallDevScore}/100</strong>
            </div>

            {/* Manual Sync Button */}
            <button
              onClick={syncNow}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              title="Validate and synchronize provider telemetry against Firestore database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Re-Sync All'}</span>
            </button>

            {/* Expand Details Toggle */}
            <button
              onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold transition-all border border-slate-700 cursor-pointer"
            >
              <span>{isDetailsExpanded ? 'Hide Diagnostics' : 'Diagnostics'}</span>
              {isDetailsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

        </div>

        {/* Diagnostic Drawer */}
        <AnimatePresence>
          {isDetailsExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden pt-4 mt-3 border-t border-slate-800 space-y-4"
            >
              {/* Active Provider Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* GitHub Provider State */}
                <div className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                  telemetry.github.isConfigured 
                    ? 'bg-slate-800/80 border-emerald-500/30' 
                    : 'bg-amber-950/30 border-amber-500/30'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5 text-slate-200">
                      <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
                      GitHub
                    </span>
                    {telemetry.github.isConfigured ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                        Connected (@{telemetry.github.username})
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                        Unconfigured
                      </span>
                    )}
                  </div>
                  {telemetry.github.isConfigured ? (
                    <div className="text-[11px] font-mono text-slate-400 space-y-0.5">
                      <div>Public Repos: <strong className="text-white">{telemetry.github.publicReposCount}</strong></div>
                      <div>Total Stars: <strong className="text-amber-400">{telemetry.github.totalStars}</strong> | Forks: <strong className="text-blue-400">{telemetry.github.totalForks}</strong></div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-amber-300/80">Add GitHub handle in settings to sync repos & stars.</p>
                  )}
                  {providerErrors.github && (
                    <div className="text-[10px] font-mono text-rose-400 bg-rose-950/40 p-1.5 rounded-lg border border-rose-800/40">
                      ⚠️ {providerErrors.github}
                    </div>
                  )}
                </div>

                {/* LeetCode Provider State */}
                <div className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                  telemetry.leetcode.isConfigured 
                    ? 'bg-slate-800/80 border-emerald-500/30' 
                    : 'bg-amber-950/30 border-amber-500/30'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5 text-slate-200">
                      <Code2 className="w-3.5 h-3.5 text-amber-400" />
                      LeetCode
                    </span>
                    {telemetry.leetcode.isConfigured ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                        Connected (@{telemetry.leetcode.username})
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                        Unconfigured
                      </span>
                    )}
                  </div>
                  {telemetry.leetcode.isConfigured ? (
                    <div className="text-[11px] font-mono text-slate-400 space-y-0.5">
                      <div>Rating: <strong className="text-amber-400">{telemetry.leetcode.rating || '1600'}</strong> (Rank #{telemetry.leetcode.globalRanking})</div>
                      <div>Solved: <strong className="text-white">{telemetry.leetcode.totalSolved}</strong> problems (Streak: <strong className="text-emerald-400">{telemetry.leetcode.currentStreak}d</strong>)</div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-amber-300/80">Connect LeetCode handle to sync problem telemetry.</p>
                  )}
                  {providerErrors.leetcode && (
                    <div className="text-[10px] font-mono text-rose-400 bg-rose-950/40 p-1.5 rounded-lg border border-rose-800/40">
                      ⚠️ {providerErrors.leetcode}
                    </div>
                  )}
                </div>

                {/* Codeforces Provider State */}
                <div className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                  telemetry.codeforces.isConfigured 
                    ? 'bg-slate-800/80 border-emerald-500/30' 
                    : 'bg-amber-950/30 border-amber-500/30'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5 text-slate-200">
                      <Cloud className="w-3.5 h-3.5 text-blue-400" />
                      Codeforces
                    </span>
                    {telemetry.codeforces.isConfigured ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                        Connected (@{telemetry.codeforces.username})
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                        Unconfigured
                      </span>
                    )}
                  </div>
                  {telemetry.codeforces.isConfigured ? (
                    <div className="text-[11px] font-mono text-slate-400 space-y-0.5">
                      <div>Rating: <strong className="text-blue-400">{telemetry.codeforces.rating}</strong> ({telemetry.codeforces.rank})</div>
                      <div>Max Rating: <strong className="text-indigo-300">{telemetry.codeforces.maxRating}</strong></div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-amber-300/80">Add Codeforces handle to showcase rating & rank.</p>
                  )}
                  {providerErrors.codeforces && (
                    <div className="text-[10px] font-mono text-rose-400 bg-rose-950/40 p-1.5 rounded-lg border border-rose-800/40">
                      ⚠️ {providerErrors.codeforces}
                    </div>
                  )}
                </div>

              </div>

              {/* Missing Provider Configurations Warnings */}
              {hasMissing && (
                <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-xs space-y-2">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <span>Configuration Action Required ({missingConfigs.length} Unconfigured Provider)</span>
                  </div>
                  <div className="space-y-1.5">
                    {missingConfigs.map((cfg) => (
                      <div key={cfg.provider} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                        <div>
                          <span className="font-bold text-white">{cfg.label}:</span>{' '}
                          <span className="text-slate-400">{cfg.actionRequired}</span>
                        </div>
                        {onNavigateToConfig && (
                          <button
                            onClick={() => onNavigateToConfig(cfg.provider)}
                            className="shrink-0 px-3 py-1 rounded-lg bg-amber-500 text-slate-950 text-[11px] font-bold hover:bg-amber-400 transition-colors cursor-pointer"
                          >
                            Configure Handle
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Database Sync Guarantee Note */}
              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 pt-1">
                <Database className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>
                  Telemetry data is verified against Firestore before rendering. Updated metrics are synchronized continuously.
                </span>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
