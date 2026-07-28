import React, { useState, useEffect, useRef } from 'react';
import { User, Share2, Github, Layers, Trophy, Save, Check, RefreshCw, Sparkles, ExternalLink, Globe, BarChart3, Cloud, CheckCircle2 } from 'lucide-react';
import { PortfolioData, Project } from './types';
import { fetchPortfolio, savePortfolio, subscribeToPortfolio, fetchGitHubRepos } from './services/api';
import { triggerConfetti } from './utils/confetti';
import { cleanGithubHandle } from './utils/github';
import { Navbar } from './components/Navbar';
import { ProfileEditor } from './components/builder/ProfileEditor';
import { SocialEditor } from './components/builder/SocialEditor';
import { GithubSync } from './components/builder/GithubSync';
import { ProjectsEditor } from './components/builder/ProjectsEditor';
import { AchievementsEditor } from './components/builder/AchievementsEditor';
import { ProjectAnalytics } from './components/builder/ProjectAnalytics';
import { NewUserModal } from './components/builder/NewUserModal';
import { EmbedAndExportModal } from './components/builder/EmbedAndExportModal';
import { HeroSection } from './components/portfolio/HeroSection';
import { AchievementsSection } from './components/portfolio/AchievementsSection';
import { ProjectGrid } from './components/portfolio/ProjectGrid';
import { ProjectModal } from './components/portfolio/ProjectModal';
import { LivePreviewDock } from './components/portfolio/LivePreviewDock';
import { ThreeBackground } from './components/3d/ThreeBackground';
import { useOpenGraph } from './hooks/useOpenGraph';

export default function App() {
  const [currentUsername, setCurrentUsername] = useState<string>('alexdev');
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);

  // Dynamically update document head & Open Graph meta tags whenever active portfolio changes
  useOpenGraph(portfolio);
  const [activeMode, setActiveMode] = useState<'builder' | 'public'>('builder');
  const [builderTab, setBuilderTab] = useState<'profile' | 'social' | 'github' | 'projects' | 'achievements' | 'analytics'>('profile');
  
  const [allHandles, setAllHandles] = useState<{ username: string; displayName: string }[]>([
    { username: 'alexdev', displayName: 'Alex Rivera' },
    { username: 'sara_tech', displayName: 'Sara Chen' },
    { username: 'jordan_ai', displayName: 'Jordan Miller' },
  ]);

  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'autosaving' | 'saved'>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [selectedProjectForModal, setSelectedProjectForModal] = useState<Project | null>(null);
  const [dockedProject, setDockedProject] = useState<Project | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState<boolean>(false);

  // Hash-based route listener (e.g. #/sara_tech or #/jordan_ai)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').trim();
      if (hash && hash !== 'dashboard') {
        setCurrentUsername(hash);
        setActiveMode('public');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Fetch all directory handles
  useEffect(() => {
    fetch('/api/portfolios')
      .then((r) => r.json())
      .then((list) => {
        if (Array.isArray(list)) {
          setAllHandles(list.map((item: any) => ({ username: item.username, displayName: item.displayName })));
        }
      })
      .catch((e) => console.warn('Directory fetch error:', e));
  }, [currentUsername]);

  // Load & subscribe to real-time active portfolio data via Firebase
  useEffect(() => {
    const unsubscribe = subscribeToPortfolio(currentUsername, (data) => {
      if (data) {
        setPortfolio(data);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [currentUsername]);

  // Background auto-fetch public GitHub repos if githubUsername is set
  const ghUsername = portfolio?.profile.githubUsername;
  useEffect(() => {
    if (!ghUsername) return;
    const cleanHandle = cleanGithubHandle(ghUsername);
    if (!cleanHandle) return;

    fetchGitHubRepos(cleanHandle).then((res) => {
      if (res.repos && res.repos.length > 0) {
        setPortfolio((prev) => {
          if (!prev) return prev;
          const currentProjects = prev.projects || [];
          let changed = false;
          const updatedProjects = [...currentProjects];

          res.repos.forEach((repo) => {
            const matchIndex = updatedProjects.findIndex(
              (p) => p.title.toLowerCase().trim() === repo.title.toLowerCase().trim()
            );
            if (matchIndex >= 0) {
              const existing = updatedProjects[matchIndex];
              if (!existing.githubStats || existing.source !== 'merged') {
                updatedProjects[matchIndex] = {
                  ...existing,
                  source: 'merged',
                  repoUrl: repo.repoUrl || existing.repoUrl,
                  githubStats: repo.githubStats || existing.githubStats,
                  techStack: Array.from(new Set([...existing.techStack, ...repo.techStack])),
                };
                changed = true;
              }
            } else {
              updatedProjects.push(repo);
              changed = true;
            }
          });

          if (changed) {
            return { ...prev, projects: updatedProjects };
          }
          return prev;
        });
      }
    });
  }, [ghUsername]);

  // Save portfolio to server
  const handleSave = async (updatedData?: PortfolioData, isManual = true) => {
    const dataToSave = updatedData || portfolio;
    if (!dataToSave) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }

    setSavingStatus(isManual ? 'saving' : 'autosaving');
    const ok = await savePortfolio(currentUsername, dataToSave);
    if (ok) {
      setSavingStatus('saved');
      setLastSavedAt(new Date());
      if (isManual) {
        triggerConfetti('save');
      }
      setTimeout(() => setSavingStatus('idle'), 2500);
    } else {
      setSavingStatus('idle');
    }
  };

  const handleUpdatePortfolio = (updated: PortfolioData) => {
    setPortfolio(updated);
    setSavingStatus('autosaving');

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Debounced background auto-save (600ms)
    autoSaveTimerRef.current = setTimeout(() => {
      handleSave(updated, false);
    }, 600);
  };

  const handleSwitchUser = (username: string) => {
    setCurrentUsername(username);
    window.location.hash = `#/${username}`;
  };

  const handleUserCreated = (newPortfolio: PortfolioData) => {
    setPortfolio(newPortfolio);
    setCurrentUsername(newPortfolio.username);
    setAllHandles((prev) => [...prev, { username: newPortfolio.username, displayName: newPortfolio.profile.displayName }]);
    window.location.hash = `#/${newPortfolio.username}`;
    setActiveMode('builder');
    triggerConfetti('tierUp');
  };

  const handleToggleTheme = () => {
    if (!portfolio) return;
    const nextTheme = portfolio.profile.theme === 'light' ? 'dark' : 'light';
    const updated: PortfolioData = {
      ...portfolio,
      profile: {
        ...portfolio.profile,
        theme: nextTheme,
      },
    };
    handleUpdatePortfolio(updated);
  };

  // Keep root CSS variable --accent-color updated
  useEffect(() => {
    if (portfolio?.profile?.accentColor) {
      document.documentElement.style.setProperty('--accent-color', portfolio.profile.accentColor);
    }
  }, [portfolio?.profile?.accentColor]);

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <div className="text-xs font-mono text-cyan-300">Loading Portfolio Forge...</div>
        </div>
      </div>
    );
  }

  const isLight = portfolio.profile.theme === 'light';
  const accentColor = portfolio.profile.accentColor || '#06b6d4';

  return (
    <div
      style={{ '--accent-color': accentColor } as React.CSSProperties}
      className="min-h-screen transition-colors duration-300 font-sans bg-[#030712] text-slate-100 relative selection:bg-cyan-500/30 selection:text-cyan-200"
    >
      {/* Three.js Interactive Web3 Ambient Background Canvas */}
      <ThreeBackground accentColor={accentColor} />

      {/* Universal Top Navigation Header */}
      <Navbar
        currentUsername={currentUsername}
        activeMode={activeMode}
        setActiveMode={setActiveMode}
        allHandles={allHandles}
        onSwitchUser={handleSwitchUser}
        onNewUserModal={() => setIsNewUserModalOpen(true)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        portfolio={portfolio}
        onToggleTheme={handleToggleTheme}
        savingStatus={savingStatus}
        lastSavedAt={lastSavedAt}
      />

      {/* ============================================================ */}
      {/* BUILDER DASHBOARD MODE */}
      {/* ============================================================ */}
      {activeMode === 'builder' ? (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
          
          {/* Top Banner & Quick Controls */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={portfolio.profile.avatarUrl}
                alt="Avatar"
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-cyan-500/60 shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-white font-display">{portfolio.profile.displayName}</h1>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                    @{portfolio.username}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{portfolio.profile.tagline}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Subtle Background Auto-Save Status */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono">
                <span className={`w-2 h-2 rounded-full ${savingStatus === 'autosaving' || savingStatus === 'saving' ? 'bg-cyan-400 animate-ping' : 'bg-emerald-400'}`} />
                <span className="text-slate-300 text-[11px]">
                  {savingStatus === 'autosaving' || savingStatus === 'saving'
                    ? 'Syncing changes...'
                    : savingStatus === 'saved'
                    ? 'Saved just now'
                    : 'Auto-save active'}
                </span>
              </div>

              <button
                onClick={() => handleSave(undefined, true)}
                disabled={savingStatus === 'saving' || savingStatus === 'autosaving'}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition-all shadow-sm"
              >
                {savingStatus === 'saving' || savingStatus === 'autosaving' ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                ) : savingStatus === 'saved' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                ) : (
                  <Save className="w-3.5 h-3.5 text-cyan-400" />
                )}
                <span>{savingStatus === 'saving' ? 'Saving...' : savingStatus === 'autosaving' ? 'Auto-saving...' : savingStatus === 'saved' ? 'Saved to Cloud' : 'Save Now'}</span>
              </button>

              <button
                onClick={() => setActiveMode('public')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-500/25 transition-all"
              >
                <Globe className="w-3.5 h-3.5" />
                Preview Live Portfolio
              </button>
            </div>
          </div>

          {/* Builder Tab Navigation Bar */}
          <div className="flex border-b border-slate-800/80 gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setBuilderTab('profile')}
              style={builderTab === 'profile' ? { backgroundColor: accentColor, color: '#020617' } : undefined}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                builderTab === 'profile'
                  ? 'shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <User className="w-4 h-4" />
              1. Profile & Theme
            </button>

            <button
              onClick={() => setBuilderTab('social')}
              style={builderTab === 'social' ? { backgroundColor: accentColor, color: '#020617' } : undefined}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                builderTab === 'social'
                  ? 'shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Share2 className="w-4 h-4" />
              2. Social Links
            </button>

            <button
              onClick={() => setBuilderTab('github')}
              style={builderTab === 'github' ? { backgroundColor: accentColor, color: '#020617' } : undefined}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                builderTab === 'github'
                  ? 'shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Github className="w-4 h-4" />
              3. GitHub Auto-Sync
            </button>

            <button
              onClick={() => setBuilderTab('projects')}
              style={builderTab === 'projects' ? { backgroundColor: accentColor, color: '#020617' } : undefined}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                builderTab === 'projects'
                  ? 'shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              4. Projects ({portfolio.projects.length})
            </button>

            <button
              onClick={() => setBuilderTab('achievements')}
              style={builderTab === 'achievements' ? { backgroundColor: accentColor, color: '#020617' } : undefined}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                builderTab === 'achievements'
                  ? 'shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Trophy className="w-4 h-4" />
              5. Highlights ({portfolio.achievements.length})
            </button>

            <button
              onClick={() => setBuilderTab('analytics')}
              style={builderTab === 'analytics' ? { backgroundColor: accentColor, color: '#020617' } : undefined}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                builderTab === 'analytics'
                  ? 'shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              6. Project Analytics
            </button>
          </div>

          {/* Builder Tab Content Panels */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            {builderTab === 'profile' && (
              <ProfileEditor
                profile={portfolio.profile}
                onChange={(updated) => handleUpdatePortfolio({ ...portfolio, profile: updated })}
              />
            )}

            {builderTab === 'social' && (
              <SocialEditor
                socialLinks={portfolio.profile.socialLinks}
                onChange={(updated) =>
                  handleUpdatePortfolio({
                    ...portfolio,
                    profile: { ...portfolio.profile, socialLinks: updated },
                  })
                }
              />
            )}

            {builderTab === 'github' && (
              <GithubSync
                githubUsername={portfolio.profile.githubUsername}
                githubUsernames={portfolio.profile.githubUsernames || []}
                onUsernameChange={(gh) =>
                  handleUpdatePortfolio({
                    ...portfolio,
                    profile: { ...portfolio.profile, githubUsername: gh },
                  })
                }
                onUsernamesChange={(handles) =>
                  handleUpdatePortfolio({
                    ...portfolio,
                    profile: { ...portfolio.profile, githubUsernames: handles },
                  })
                }
                existingProjects={portfolio.projects}
                onImportProjects={(imported) => handleUpdatePortfolio({ ...portfolio, projects: imported })}
                showCommitTimestamp={portfolio.profile.showCommitTimestamp ?? true}
                onToggleCommitTimestamp={(show) =>
                  handleUpdatePortfolio({
                    ...portfolio,
                    profile: { ...portfolio.profile, showCommitTimestamp: show },
                  })
                }
              />
            )}

            {builderTab === 'projects' && (
              <ProjectsEditor
                projects={portfolio.projects}
                onChange={(projects) => handleUpdatePortfolio({ ...portfolio, projects })}
                githubUsername={portfolio.profile.githubUsername}
                onNavigateToGithubTab={() => setBuilderTab('github')}
              />
            )}

            {builderTab === 'achievements' && (
              <AchievementsEditor
                achievements={portfolio.achievements}
                onChange={(achievements) => handleUpdatePortfolio({ ...portfolio, achievements })}
              />
            )}

            {builderTab === 'analytics' && (
              <ProjectAnalytics
                projects={portfolio.projects}
                accentColor={accentColor}
              />
            )}
          </div>

        </main>
      ) : (
        /* ============================================================ */
        /* PUBLIC PORTFOLIO VIEW MODE */
        /* ============================================================ */
        <main className="space-y-4 pb-16 relative z-10">
          
          {/* Owner Quick Edit Floating Action (only shown when viewing active profile) */}
          <div className="fixed bottom-6 right-6 z-40">
            <button
              onClick={() => setActiveMode('builder')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900/90 border border-slate-700 text-white font-bold text-xs shadow-2xl hover:bg-slate-800 backdrop-blur-md transition-all group"
            >
              <Layers className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
              <span>Edit Portfolio (@{portfolio.username})</span>
            </button>
          </div>

          {/* 1. Hero Section */}
          <HeroSection profile={portfolio.profile} projects={portfolio.projects} isLight={isLight} />

          {/* 2. Achievements & Highlights Strip */}
          <AchievementsSection
            achievements={portfolio.achievements}
            accentColor={portfolio.profile.accentColor}
            isLight={isLight}
          />

          {/* 3. Projects & Repos Grid */}
          <ProjectGrid
            projects={portfolio.projects}
            accentColor={portfolio.profile.accentColor}
            onSelectProject={(project) => setSelectedProjectForModal(project)}
            isLight={isLight}
            showCommitTimestamp={portfolio.profile.showCommitTimestamp ?? true}
          />

        </main>
      )}

      {/* ============================================================ */}
      {/* MODALS & SIGNATURE INTERACTION OVERLAYS */}
      {/* ============================================================ */}

      {/* Project Details Modal */}
      <ProjectModal
        project={selectedProjectForModal}
        onClose={() => setSelectedProjectForModal(null)}
        onViewLive={(project) => {
          setSelectedProjectForModal(null);
          setDockedProject(project);
        }}
        accentColor={portfolio.profile.accentColor}
        isLight={isLight}
      />

      {/* THE SIGNATURE INTERACTION: Dock & Glassmorphism Live Preview Panel */}
      {dockedProject && (
        <LivePreviewDock
          activeProject={dockedProject}
          allProjects={portfolio.projects}
          onSelectProject={(project) => setDockedProject(project)}
          onCloseDock={() => setDockedProject(null)}
          accentColor={portfolio.profile.accentColor}
        />
      )}

      {/* Embed & Export Share Modal */}
      <EmbedAndExportModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        portfolio={portfolio}
      />

      {/* New Account Handle Registration Modal */}
      <NewUserModal
        isOpen={isNewUserModalOpen}
        onClose={() => setIsNewUserModalOpen(false)}
        onSuccess={handleUserCreated}
      />

    </div>
  );
}
