import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Share2,
  Github,
  Layers,
  Trophy,
  Save,
  Check,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Globe,
  BarChart3,
  Cloud,
  CheckCircle2,
  ShieldCheck,
  FileText,
  Lock,
  LogIn,
  ShieldAlert,
} from 'lucide-react';
import { PortfolioData, Project } from './types';
import { fetchPortfolio, savePortfolio, fetchGitHubRepos } from './services/api';
import { triggerConfetti } from './utils/confetti';
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
import { BentoGridSection } from './components/portfolio/BentoGridSection';
import { GithubAnalyticsSection } from './components/portfolio/GithubAnalyticsSection';
import { AutoSyncHubSection } from './components/portfolio/AutoSyncHubSection';
import { CompetitiveCodingSection } from './components/portfolio/CompetitiveCodingSection';
import { AchievementsSection } from './components/portfolio/AchievementsSection';
import { ProjectGrid } from './components/portfolio/ProjectGrid';
import { ProjectModal } from './components/portfolio/ProjectModal';
import { LivePreviewDock } from './components/portfolio/LivePreviewDock';
import { ResumeVaultModal } from './components/portfolio/ResumeVaultModal';
import { PortfolioHealthModal } from './components/portfolio/PortfolioHealthModal';
import { AnalyticsModal } from './components/portfolio/AnalyticsModal';
import { ShareQrModal } from './components/portfolio/ShareQrModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ThreeBackground } from './components/3d/ThreeBackground';
import { useOpenGraph } from './hooks/useOpenGraph';
import { useTelemetrySync } from './hooks/useTelemetrySync';
import { TelemetrySyncBanner } from './components/portfolio/TelemetrySyncBanner';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/auth/AuthModal';

function MainApp() {
  const { currentUser, logout } = useAuth();
  const [currentUsername, setCurrentUsername] = useState<string>('alexdev');

  // Unified telemetry data-fetching, validation, and database synchronization hook
  const telemetrySync = useTelemetrySync(currentUsername);
  const { portfolio, setPortfolio, updateAndSyncPortfolio } = telemetrySync;

  // Dynamically update document head & Open Graph meta tags whenever active portfolio changes
  useOpenGraph(portfolio);

  const [activeMode, setActiveMode] = useState<'builder' | 'public'>('public');
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [builderTab, setBuilderTab] = useState<
    'profile' | 'social' | 'github' | 'projects' | 'achievements' | 'analytics'
  >('profile');

  const [allHandles, setAllHandles] = useState<{ username: string; displayName: string }[]>([
    { username: 'alexdev', displayName: 'Alex Rivera' },
    { username: 'manishsingh', displayName: 'Manish Singh' },
    { username: 'sara_tech', displayName: 'Sara Chen' },
  ]);

  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'autosaving' | 'saved'>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Modals & Auth State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'forgot'>('login');

  const [selectedProjectForModal, setSelectedProjectForModal] = useState<Project | null>(null);
  const [dockedProject, setDockedProject] = useState<Project | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState<boolean>(false);
  const [isAtsResumeModalOpen, setIsAtsResumeModalOpen] = useState<boolean>(false);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState<boolean>(false);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState<boolean>(false);

  // Automatically update active username handle when user logs in
  useEffect(() => {
    if (currentUser?.username) {
      setCurrentUsername(currentUser.username);
    }
  }, [currentUser?.username]);

  // Hash-based route listener (e.g. #/manishsingh or #/sara_tech)
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

  // Save portfolio
  const handleSave = async (updatedData?: PortfolioData, isManual = true) => {
    const dataToSave = updatedData || portfolio;
    if (!dataToSave) return;

    // Attach ownership UID if user is logged in
    if (currentUser) {
      dataToSave.ownerId = currentUser.uid;
      dataToSave.updatedBy = currentUser.uid;
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

    autoSaveTimerRef.current = setTimeout(() => {
      handleSave(updated, false);
    }, 600);
  };

  const handleSwitchUser = (username: string) => {
    setCurrentUsername(username);
    window.location.hash = `#/${username}`;
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

  // Check if current user is owner of the active portfolio
  const isOwner = Boolean(
    currentUser &&
      (currentUser.username === currentUsername ||
        currentUser.uid === portfolio?.ownerId ||
        currentUser.id === portfolio?.ownerId)
  );

  useEffect(() => {
    if (portfolio?.profile?.accentColor) {
      document.documentElement.style.setProperty('--accent-color', portfolio.profile.accentColor);
    }
    if (portfolio?.profile?.theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, [portfolio?.profile?.accentColor, portfolio?.profile?.theme]);

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-xs font-mono text-indigo-300">Loading SaaS Developer Platform...</div>
        </div>
      </div>
    );
  }

  const isLight = portfolio.profile.theme === 'light';
  const accentColor = portfolio.profile.accentColor || '#6366f1';

  return (
    <div
      style={{ '--accent-color': accentColor } as React.CSSProperties}
      className={`min-h-screen transition-colors duration-300 font-sans relative selection:bg-indigo-500/30 selection:text-indigo-200 ${
        isLight ? 'bg-slate-100 text-slate-900' : 'bg-[#030712] text-slate-100'
      }`}
    >
      {/* Three.js Ambient Canvas */}
      <ThreeBackground accentColor={accentColor} />

      {/* Universal Top Navigation Header */}
      <Navbar
        currentUsername={currentUsername}
        activeMode={activeMode}
        setActiveMode={(mode) => {
          if (mode === 'builder' && !isOwner) {
            setAuthModalMode('login');
            setIsAuthModalOpen(true);
            return;
          }
          setActiveMode(mode);
        }}
        allHandles={allHandles}
        onSwitchUser={handleSwitchUser}
        onOpenAuthModal={(m) => {
          setAuthModalMode(m);
          setIsAuthModalOpen(true);
        }}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        portfolio={portfolio}
        onToggleTheme={handleToggleTheme}
        onOpenAtsResume={() => setIsAtsResumeModalOpen(true)}
        onOpenHealthModal={() => setIsHealthModalOpen(true)}
        onOpenAnalyticsModal={() => setIsAnalyticsModalOpen(true)}
      />

      {/* Live Telemetry Data-Fetching & Database Synchronization Control Banner */}
      {isOwner && (
        <TelemetrySyncBanner
          telemetrySync={telemetrySync}
          onNavigateToConfig={(p) => {
            setActiveMode('builder');
            setBuilderTab(p === 'github' ? 'github' : 'social');
          }}
        />
      )}

      {/* ============================================================ */}
      {/* BUILDER DASHBOARD MODE (PROTECTED ROUTE) */}
      {/* ============================================================ */}
      {activeMode === 'builder' ? (
        !isOwner ? (
          /* Unauthenticated or Non-Owner Protection Guard */
          <main className="max-w-3xl mx-auto px-4 py-20 relative z-10">
            <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 text-center space-y-5 shadow-2xl backdrop-blur-xl">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                <Lock className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-black text-white font-display">
                  Protected Private Dashboard
                </h1>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  Only the authenticated owner of <strong className="text-indigo-400 font-mono">@{currentUsername}</strong> has permission to modify portfolio data, projects, and settings.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setAuthModalMode('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Log In to Manage Portfolio</span>
                </button>

                <button
                  onClick={() => setActiveMode('public')}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all cursor-pointer"
                >
                  <span>View Public Portfolio</span>
                </button>
              </div>
            </div>
          </main>
        ) : (
          /* Authenticated Owner Private Dashboard */
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
            {/* Top Banner & Quick Controls */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={portfolio.profile.avatarUrl}
                  alt="Avatar"
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/60 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-white font-display">{portfolio.profile.displayName}</h1>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                      @{portfolio.username}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      Owner Authenticated
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{portfolio.profile.tagline}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      savingStatus === 'autosaving' || savingStatus === 'saving'
                        ? 'bg-indigo-400 animate-ping'
                        : 'bg-emerald-400'
                    }`}
                  />
                  <span className="text-slate-300 text-[11px]">
                    {savingStatus === 'autosaving' || savingStatus === 'saving'
                      ? 'Syncing changes...'
                      : savingStatus === 'saved'
                      ? 'Saved to Firestore'
                      : 'Auto-save active'}
                  </span>
                </div>

                <button
                  onClick={() => handleSave(undefined, true)}
                  disabled={savingStatus === 'saving' || savingStatus === 'autosaving'}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition-all shadow-sm cursor-pointer"
                >
                  {savingStatus === 'saving' || savingStatus === 'autosaving' ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  ) : savingStatus === 'saved' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                  ) : (
                    <Save className="w-3.5 h-3.5 text-indigo-400" />
                  )}
                  <span>
                    {savingStatus === 'saving'
                      ? 'Saving...'
                      : savingStatus === 'autosaving'
                      ? 'Auto-saving...'
                      : savingStatus === 'saved'
                      ? 'Saved to Cloud'
                      : 'Save Portfolio'}
                  </span>
                </button>

                <button
                  onClick={() => setActiveMode('public')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5" />
                  View Public Page
                </button>
              </div>
            </div>

            {/* Builder Tab Navigation Bar */}
            <div className="flex border-b border-slate-800/80 gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setBuilderTab('profile')}
                style={builderTab === 'profile' ? { backgroundColor: accentColor, color: '#ffffff' } : undefined}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  builderTab === 'profile'
                    ? 'shadow-md shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <User className="w-4 h-4" />
                1. Profile & Bio
              </button>

              <button
                onClick={() => setBuilderTab('social')}
                style={builderTab === 'social' ? { backgroundColor: accentColor, color: '#ffffff' } : undefined}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  builderTab === 'social'
                    ? 'shadow-md shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Share2 className="w-4 h-4" />
                2. Social Links
              </button>

              <button
                onClick={() => setBuilderTab('github')}
                style={builderTab === 'github' ? { backgroundColor: accentColor, color: '#ffffff' } : undefined}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  builderTab === 'github'
                    ? 'shadow-md shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Github className="w-4 h-4" />
                3. GitHub Repos
              </button>

              <button
                onClick={() => setBuilderTab('projects')}
                style={builderTab === 'projects' ? { backgroundColor: accentColor, color: '#ffffff' } : undefined}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  builderTab === 'projects'
                    ? 'shadow-md shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Layers className="w-4 h-4" />
                4. Projects ({portfolio.projects.length})
              </button>

              <button
                onClick={() => setBuilderTab('achievements')}
                style={builderTab === 'achievements' ? { backgroundColor: accentColor, color: '#ffffff' } : undefined}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  builderTab === 'achievements'
                    ? 'shadow-md shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Trophy className="w-4 h-4" />
                5. Achievements
              </button>

              <button
                onClick={() => setBuilderTab('analytics')}
                style={builderTab === 'analytics' ? { backgroundColor: accentColor, color: '#ffffff' } : undefined}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  builderTab === 'analytics'
                    ? 'shadow-md shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                6. Analytics
              </button>
            </div>

            {/* Builder Content Area */}
            <div className="space-y-6">
              {builderTab === 'profile' && (
                <ProfileEditor
                  profile={portfolio.profile}
                  onChange={(profile) => handleUpdatePortfolio({ ...portfolio, profile })}
                />
              )}

              {builderTab === 'social' && (
                <SocialEditor
                  socialLinks={portfolio.profile.socialLinks}
                  onChange={(socialLinks) =>
                    handleUpdatePortfolio({
                      ...portfolio,
                      profile: { ...portfolio.profile, socialLinks },
                    })
                  }
                />
              )}

              {builderTab === 'github' && (
                <GithubSync
                  githubUsername={portfolio.profile.githubUsername}
                  githubUsernames={portfolio.profile.githubUsernames}
                  onGithubUsernameChange={(gh) =>
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
                <ProjectAnalytics projects={portfolio.projects} accentColor={accentColor} />
              )}
            </div>
          </main>
        )
      ) : (
        /* ============================================================ */
        /* PUBLIC PORTFOLIO VIEW MODE (READ ONLY) */
        /* ============================================================ */
        <main className="space-y-4 pb-16 relative z-10">
          {/* Owner Floating Edit Badge (Only visible when authenticated owner visits their page) */}
          {isOwner && (
            <div className="fixed bottom-6 right-6 z-40">
              <button
                onClick={() => setActiveMode('builder')}
                className="flex items-center gap-2 px-5 py-3 rounded-full bg-slate-900/90 border border-slate-700 text-white font-bold text-xs shadow-2xl hover:bg-slate-800 backdrop-blur-md transition-all group cursor-pointer"
              >
                <Layers className="w-4 h-4 text-indigo-400 group-hover:rotate-12 transition-transform" />
                <span>Manage Portfolio (@{portfolio.username})</span>
              </button>
            </div>
          )}

          {/* 1. Hero Flagship Section */}
          <HeroSection
            profile={portfolio.profile}
            projects={portfolio.projects}
            isLight={isLight}
            onOpenAtsResume={() => setIsAtsResumeModalOpen(true)}
            onOpenShareModal={() => setIsShareModalOpen(true)}
          />

          {/* 2. Apple-Style Bento Grid Matrix */}
          <BentoGridSection
            portfolio={portfolio}
            onSelectProject={(project) => setSelectedProjectForModal(project)}
            onOpenAtsResume={() => setIsAtsResumeModalOpen(true)}
          />

          {/* 3. GitHub Analytics Dashboard Section */}
          <GithubAnalyticsSection
            portfolio={portfolio}
            onSelectProject={(project) => setSelectedProjectForModal(project)}
          />

          {/* 4. Auto-Synced Multi-Platform Hub Section */}
          <AutoSyncHubSection portfolio={portfolio} onUpdatePortfolio={handleUpdatePortfolio} />

          {/* 5. Competitive Coding & Verified Credentials Section */}
          <CompetitiveCodingSection portfolio={portfolio} onUpdatePortfolio={handleUpdatePortfolio} />

          {/* 6. Achievements & Highlights Strip */}
          <AchievementsSection
            achievements={portfolio.achievements}
            accentColor={portfolio.profile.accentColor}
            isLight={isLight}
          />

          {/* 7. Projects & Repos Grid */}
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
      {/* MODALS & OVERLAYS */}
      {/* ============================================================ */}

      {/* Authentication Modal (Login / Signup / Forgot Password) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onSuccess={() => {
          setActiveMode('builder');
        }}
      />

      {/* Project Details Modal */}
      <ProjectModal
        project={selectedProjectForModal}
        onClose={() => setSelectedProjectForModal(null)}
        onViewLive={(project) => {
          setSelectedProjectForModal(null);
          setDockedProject(project);
        }}
      />

      {/* Live Dock Drawer */}
      {dockedProject && (
        <LivePreviewDock project={dockedProject} onClose={() => setDockedProject(null)} />
      )}

      {/* Share QR Code Modal */}
      {isShareModalOpen && (
        <ShareQrModal
          portfolio={portfolio}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}

      {/* ATS Resume Vault Modal */}
      {isAtsResumeModalOpen && (
        <ResumeVaultModal
          portfolio={portfolio}
          onClose={() => setIsAtsResumeModalOpen(false)}
        />
      )}

      {/* Health Audit Modal */}
      {isHealthModalOpen && (
        <PortfolioHealthModal
          portfolio={portfolio}
          onClose={() => setIsHealthModalOpen(false)}
        />
      )}

      {/* Analytics Realtime Modal */}
      {isAnalyticsModalOpen && (
        <AnalyticsModal
          portfolio={portfolio}
          onClose={() => setIsAnalyticsModalOpen(false)}
        />
      )}

      {/* Floating Glass Mobile Bottom Navigation */}
      <MobileBottomNav
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        activeMode={activeMode}
        setActiveMode={setActiveMode}
        onOpenAuthModal={(m) => {
          setAuthModalMode(m);
          setIsAuthModalOpen(true);
        }}
        onOpenAtsResume={() => setIsAtsResumeModalOpen(true)}
        onOpenAnalytics={() => setIsAnalyticsModalOpen(true)}
        currentUsername={currentUsername}
        isOwnerLoggedIn={isOwner}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
