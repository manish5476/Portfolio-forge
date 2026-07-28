import React, { useState, useEffect, useCallback } from 'react';
import { Github, RefreshCw, Star, GitFork, Check, AlertCircle, Sparkles, Clock, GitCommit, Download, Wifi, CheckCircle2, AlertTriangle, XCircle, RotateCcw, Globe, UserPlus, Trash2, Users } from 'lucide-react';
import { Project } from '../../types';
import { fetchGitHubRepos } from '../../services/api';
import { GithubHeatmap } from '../portfolio/GithubHeatmap';
import { triggerConfetti } from '../../utils/confetti';
import { cleanGithubHandle, getGithubHandlesList } from '../../utils/github';

export type ApiConnectionStatus = 'idle' | 'connecting' | 'connected' | 'rate_limited' | 'error';

interface GithubSyncProps {
  githubUsername: string;
  githubUsernames?: string[];
  onUsernameChange: (username: string) => void;
  onUsernamesChange?: (usernames: string[]) => void;
  existingProjects: Project[];
  onImportProjects: (imported: Project[]) => void;
  showCommitTimestamp?: boolean;
  onToggleCommitTimestamp?: (show: boolean) => void;
}

export const GithubSync: React.FC<GithubSyncProps> = ({
  githubUsername,
  githubUsernames = [],
  onUsernameChange,
  onUsernamesChange,
  existingProjects,
  onImportProjects,
  showCommitTimestamp = true,
  onToggleCommitTimestamp,
}) => {
  const [loading, setLoading] = useState(false);
  const [fetchedRepos, setFetchedRepos] = useState<Project[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);
  const [rateLimitNotice, setRateLimitNotice] = useState(false);
  const [selectedRepoIds, setSelectedRepoIds] = useState<Set<string>>(new Set());
  
  const [connectionStatus, setConnectionStatus] = useState<ApiConnectionStatus>('idle');
  const [connectionErrorMsg, setConnectionErrorMsg] = useState<string | null>(null);

  const [newAccountInput, setNewAccountInput] = useState('');
  const [activeTabAccount, setActiveTabAccount] = useState<string>('');

  const allConnectedHandles = getGithubHandlesList(githubUsername, githubUsernames);

  // Sync a single account
  const handleSync = useCallback(async (targetUsername?: string, autoImportIfEmpty = false) => {
    const rawUser = targetUsername !== undefined ? targetUsername : (activeTabAccount || githubUsername);
    const handle = cleanGithubHandle(rawUser);

    if (!handle) {
      setStatusMessage('Please enter a valid GitHub handle');
      setConnectionStatus('idle');
      return;
    }

    setLoading(true);
    setStatusMessage(null);
    setConnectionErrorMsg(null);
    setRateLimitNotice(false);
    setConnectionStatus('connecting');

    const result = await fetchGitHubRepos(handle);
    setLoading(false);

    if (result.error && (!result.repos || !result.repos.length)) {
      setStatusMessage(result.error);
      setConnectionErrorMsg(result.error);
      if (result.rateLimitHit) {
        setRateLimitNotice(true);
        setConnectionStatus('rate_limited');
      } else {
        setConnectionStatus('error');
      }
      return;
    }

    const repos = result.repos || [];
    setFetchedRepos(repos);
    setIsCached(Boolean(result.cached));
    
    if (result.rateLimitHit) {
      setRateLimitNotice(true);
      setConnectionStatus('rate_limited');
    } else {
      setConnectionStatus('connected');
    }

    const allIds = new Set(repos.map((r) => r.id));
    setSelectedRepoIds(allIds);

    setStatusMessage(`Fetched ${repos.length} public repositories from @${handle}`);

    if (repos.length > 0 && (autoImportIfEmpty || existingProjects.length === 0)) {
      const updatedList = [...existingProjects];
      repos.forEach((repo) => {
        const matchIndex = updatedList.findIndex(
          (p) => p.title.toLowerCase().trim() === repo.title.toLowerCase().trim()
        );
        if (matchIndex >= 0) {
          const existing = updatedList[matchIndex];
          updatedList[matchIndex] = {
            ...existing,
            source: 'merged',
            repoUrl: repo.repoUrl || existing.repoUrl,
            githubStats: repo.githubStats || existing.githubStats,
            techStack: Array.from(new Set([...existing.techStack, ...repo.techStack])),
          };
        } else {
          updatedList.push(repo);
        }
      });
      onImportProjects(updatedList);
      triggerConfetti('milestone');
    }
  }, [githubUsername, activeTabAccount, existingProjects, onImportProjects]);

  // Sync ALL connected accounts in parallel
  const handleSyncAllAccounts = useCallback(async (autoImportIfEmpty = false) => {
    const handles = getGithubHandlesList(githubUsername, githubUsernames);
    if (handles.length === 0) return;

    setLoading(true);
    setStatusMessage(null);
    setConnectionErrorMsg(null);
    setRateLimitNotice(false);
    setConnectionStatus('connecting');

    const results = await Promise.all(handles.map((h) => fetchGitHubRepos(h)));
    setLoading(false);

    let allRepos: Project[] = [];
    let hasError = false;
    let rateLimitHit = false;

    results.forEach((res) => {
      if (res.rateLimitHit) rateLimitHit = true;
      if (res.error && (!res.repos || !res.repos.length)) {
        hasError = true;
      }
      if (res.repos && res.repos.length > 0) {
        res.repos.forEach((r) => {
          if (!allRepos.some((existing) => existing.id === r.id)) {
            allRepos.push(r);
          }
        });
      }
    });

    setFetchedRepos(allRepos);
    setSelectedRepoIds(new Set(allRepos.map((r) => r.id)));

    if (rateLimitHit) {
      setRateLimitNotice(true);
      setConnectionStatus('rate_limited');
    } else if (hasError && allRepos.length === 0) {
      setConnectionStatus('error');
      setConnectionErrorMsg('Failed to connect to one or more GitHub handles.');
    } else {
      setConnectionStatus('connected');
    }

    setStatusMessage(`Successfully fetched ${allRepos.length} total repositories across ${handles.length} GitHub accounts!`);

    if (allRepos.length > 0 && (autoImportIfEmpty || existingProjects.length === 0)) {
      const updatedList = [...existingProjects];
      allRepos.forEach((repo) => {
        const matchIndex = updatedList.findIndex(
          (p) => p.title.toLowerCase().trim() === repo.title.toLowerCase().trim()
        );
        if (matchIndex >= 0) {
          const existing = updatedList[matchIndex];
          updatedList[matchIndex] = {
            ...existing,
            source: 'merged',
            repoUrl: repo.repoUrl || existing.repoUrl,
            githubStats: repo.githubStats || existing.githubStats,
            techStack: Array.from(new Set([...existing.techStack, ...repo.techStack])),
          };
        } else {
          updatedList.push(repo);
        }
      });
      onImportProjects(updatedList);
      triggerConfetti('milestone');
    }
  }, [githubUsername, githubUsernames, existingProjects, onImportProjects]);

  // Handle adding a new GitHub account ID/handle
  const handleAddAccount = () => {
    const cleaned = cleanGithubHandle(newAccountInput);
    if (!cleaned) return;

    let updatedHandles = githubUsernames || [];
    if (!githubUsername) {
      onUsernameChange(cleaned);
    } else {
      if (!updatedHandles.includes(cleaned) && cleaned !== cleanGithubHandle(githubUsername)) {
        updatedHandles = [...updatedHandles, cleaned];
        onUsernamesChange?.(updatedHandles);
      }
    }
    setNewAccountInput('');

    // Trigger sync across all handles
    setTimeout(() => {
      const allHandles = getGithubHandlesList(githubUsername || cleaned, updatedHandles);
      if (allHandles.length > 1) {
        handleSyncAllAccounts(true);
      } else {
        handleSync(cleaned, true);
      }
    }, 50);
  };

  const handleRemoveAccount = (handleToRemove: string) => {
    if (cleanGithubHandle(githubUsername) === handleToRemove) {
      // If removing primary, demote to next or clear
      const remaining = (githubUsernames || []).filter((h) => h !== handleToRemove);
      if (remaining.length > 0) {
        onUsernameChange(remaining[0]);
        onUsernamesChange?.(remaining.slice(1));
      } else {
        onUsernameChange('');
      }
    } else {
      const remaining = (githubUsernames || []).filter((h) => h !== handleToRemove);
      onUsernamesChange?.(remaining);
    }
  };

  // Auto-fetch repositories on mount or when connected handles change if not fetched yet
  useEffect(() => {
    const handles = getGithubHandlesList(githubUsername, githubUsernames);
    if (handles.length > 0 && fetchedRepos.length === 0 && !loading) {
      if (handles.length > 1) {
        handleSyncAllAccounts(true);
      } else {
        handleSync(handles[0], true);
      }
    }
  }, [githubUsername, githubUsernames, handleSync, handleSyncAllAccounts]);

  const toggleRepoSelect = (id: string) => {
    const next = new Set(selectedRepoIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedRepoIds(next);
  };

  const handleImportSelected = () => {
    const reposToImport = fetchedRepos.filter((r) => selectedRepoIds.has(r.id));
    if (!reposToImport.length) return;

    const updatedList = [...existingProjects];

    reposToImport.forEach((repo) => {
      const matchIndex = updatedList.findIndex(
        (p) => p.title.toLowerCase().trim() === repo.title.toLowerCase().trim()
      );

      if (matchIndex >= 0) {
        const existing = updatedList[matchIndex];
        updatedList[matchIndex] = {
          ...existing,
          source: 'merged',
          repoUrl: repo.repoUrl || existing.repoUrl,
          githubStats: repo.githubStats || existing.githubStats,
          techStack: Array.from(new Set([...existing.techStack, ...repo.techStack])),
        };
      } else {
        updatedList.push(repo);
      }
    });

    onImportProjects(updatedList);
    triggerConfetti('milestone');
    setStatusMessage(`Successfully merged ${reposToImport.length} repositories into your project grid!`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Github className="w-5 h-5 text-cyan-400" />
            GitHub Repository Auto-Sync
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Fetches your public GitHub repositories, stars, language tags, and update stats automatically.
          </p>
        </div>
      </div>

      {/* GitHub API Connection Status Indicator Bar */}
      <div className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
        connectionStatus === 'connected'
          ? 'bg-emerald-950/30 border-emerald-800/60'
          : connectionStatus === 'connecting'
          ? 'bg-cyan-950/30 border-cyan-800/60'
          : connectionStatus === 'rate_limited'
          ? 'bg-amber-950/30 border-amber-800/60'
          : connectionStatus === 'error'
          ? 'bg-rose-950/30 border-rose-800/60'
          : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
            connectionStatus === 'connected'
              ? 'bg-emerald-950 border-emerald-700/80 text-emerald-400'
              : connectionStatus === 'connecting'
              ? 'bg-cyan-950 border-cyan-700/80 text-cyan-400 animate-pulse'
              : connectionStatus === 'rate_limited'
              ? 'bg-amber-950 border-amber-700/80 text-amber-400'
              : connectionStatus === 'error'
              ? 'bg-rose-950 border-rose-700/80 text-rose-400'
              : 'bg-slate-950 border-slate-800 text-slate-400'
          }`}>
            {connectionStatus === 'connected' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {connectionStatus === 'connecting' && <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />}
            {connectionStatus === 'rate_limited' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
            {connectionStatus === 'error' && <XCircle className="w-5 h-5 text-rose-400" />}
            {connectionStatus === 'idle' && <Wifi className="w-5 h-5 text-slate-400" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                API Connection Status
              </span>
              <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border ${
                connectionStatus === 'connected'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : connectionStatus === 'connecting'
                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                  : connectionStatus === 'rate_limited'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : connectionStatus === 'error'
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {connectionStatus === 'connected' && 'Connected'}
                {connectionStatus === 'connecting' && 'Connecting...'}
                {connectionStatus === 'rate_limited' && 'Rate Limited'}
                {connectionStatus === 'error' && 'Error'}
                {connectionStatus === 'idle' && 'Ready to Connect'}
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-0.5">
              {connectionStatus === 'connected' && (
                <>GitHub API connected for <span className="font-mono text-cyan-300">@{cleanGithubHandle(githubUsername) || 'user'}</span>. Fetched {fetchedRepos.length} public repos.</>
              )}
              {connectionStatus === 'connecting' && (
                <>Connecting to GitHub API to fetch repositories for <span className="font-mono text-cyan-300">@{cleanGithubHandle(githubUsername) || 'user'}</span>...</>
              )}
              {connectionStatus === 'rate_limited' && (
                <>GitHub API rate limit reached. Displaying cached repository data.</>
              )}
              {connectionStatus === 'error' && (
                <span className="text-rose-300 font-medium">
                  {connectionErrorMsg || 'Failed to establish connection to GitHub API.'}
                </span>
              )}
              {connectionStatus === 'idle' && (
                <>Enter your GitHub username handle below to fetch public repositories.</>
              )}
            </p>
          </div>
        </div>

        {/* Retry Button when error or rate limited or explicit reload */}
        {(connectionStatus === 'error' || connectionStatus === 'rate_limited' || connectionStatus === 'connected') && (
          <button
            type="button"
            onClick={() => handleSync(githubUsername, true)}
            disabled={loading || !githubUsername.trim()}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold text-xs transition-all cursor-pointer shrink-0 ${
              connectionStatus === 'error'
                ? 'bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200'
                : connectionStatus === 'rate_limited'
                ? 'bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200'
                : 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300'
            }`}
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{connectionStatus === 'error' ? 'Retry Connection' : 'Refresh API'}</span>
          </button>
        )}
      </div>

      {/* Multi-Account GitHub Management Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Connected GitHub Accounts / IDs</h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
              {allConnectedHandles.length} Connected
            </span>
          </div>

          {allConnectedHandles.length > 1 && (
            <button
              onClick={handleSyncAllAccounts}
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Sync All ({allConnectedHandles.length}) Accounts
            </button>
          )}
        </div>

        {/* Account Badges List */}
        {allConnectedHandles.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {allConnectedHandles.map((handle, idx) => {
              const isPrimary = idx === 0;
              return (
                <div
                  key={handle}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl group hover:border-cyan-500/50 transition-all"
                >
                  <Github className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-xs font-mono text-white font-semibold">@{handle}</span>
                  {isPrimary && (
                    <span className="text-[9px] uppercase font-bold text-cyan-400 bg-cyan-950 px-1.5 py-0.2 rounded border border-cyan-800">
                      Primary
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleSync(handle, false)}
                    className="p-1 text-slate-400 hover:text-cyan-300 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                    title={`Fetch repositories for @${handle}`}
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveAccount(handle)}
                    className="p-1 text-slate-500 hover:text-red-400 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                    title={`Remove @${handle}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-xs text-slate-500 italic">No GitHub accounts connected yet. Add your first account handle below.</div>
        )}

        {/* Add New GitHub Account Input */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 font-mono text-xs">@</span>
            <input
              type="text"
              value={newAccountInput}
              onChange={(e) => setNewAccountInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddAccount()}
              className="w-full pl-7 pr-3.5 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors"
              placeholder="Add another handle (e.g. work-account or client-org)"
            />
          </div>
          <button
            type="button"
            onClick={handleAddAccount}
            disabled={!newAccountInput.trim() || loading}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-cyan-300 font-bold text-xs rounded-xl border border-slate-700 transition-all cursor-pointer shrink-0"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add Account ID
          </button>
        </div>

        {/* Cache & Rate Limit Notice */}
        {rateLimitNotice && (
          <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl text-xs text-amber-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>GitHub API rate limit reached. Returning cached repository data to prevent disruption.</span>
          </div>
        )}

        {statusMessage && (
          <div className="text-xs text-cyan-300 bg-cyan-950/40 border border-cyan-800/60 p-2.5 rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4 text-cyan-400" />
            <span>{statusMessage}</span>
            {isCached && <span className="ml-auto text-[10px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-400">Cached 1h</span>}
          </div>
        )}
      </div>

      {/* Latest GitHub Commit Timestamp Toggle Settings Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 text-cyan-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Display "Latest GitHub Commit" Timestamp</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-semibold">
                Public Cards
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              When enabled, public project cards display the exact latest commit/updated date badge on GitHub repositories.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onToggleCommitTimestamp?.(!showCommitTimestamp)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            showCommitTimestamp ? 'bg-cyan-500' : 'bg-slate-800'
          }`}
          title={showCommitTimestamp ? 'Disable commit timestamp on public cards' : 'Enable commit timestamp on public cards'}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
              showCommitTimestamp ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Live GitHub Heatmap Preview */}
      <div className="space-y-2">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
          <span>Live Heatmap Preview</span>
          <span className="text-[10px] text-slate-500 font-mono">Syncing @{githubUsername || 'alexrivera'}</span>
        </div>
        <GithubHeatmap username={githubUsername || 'alexrivera'} isLight={false} />
      </div>

      {/* Fetched Repos Selection Grid */}
      {fetchedRepos.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Select Repositories to Include ({selectedRepoIds.size}/{fetchedRepos.length})
            </div>
            <button
              onClick={handleImportSelected}
              disabled={selectedRepoIds.size === 0}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all disabled:opacity-40"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Import & Merge Selected
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
            {fetchedRepos.map((repo) => {
              const isSelected = selectedRepoIds.has(repo.id);
              const isAlreadyAdded = existingProjects.some(
                (p) => p.title.toLowerCase().trim() === repo.title.toLowerCase().trim()
              );

              return (
                <div
                  key={repo.id}
                  onClick={() => toggleRepoSelect(repo.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500/80 ring-1 ring-cyan-500/50'
                      : 'bg-slate-950/80 border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold text-xs text-white truncate flex items-center gap-1.5">
                      <span className="text-cyan-400">{repo.title}</span>
                      {isAlreadyAdded && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800">
                          Merged
                        </span>
                      )}
                    </div>
                    <div className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                      isSelected ? 'bg-cyan-500 border-cyan-400 text-slate-950' : 'border-slate-700'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{repo.description}</p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2.5">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                      {repo.githubStats?.language || 'Code'}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400/20" />
                        {repo.githubStats?.stars || 0}
                      </span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <GitFork className="w-3 h-3 text-blue-400" />
                        {repo.githubStats?.forks || 0}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
