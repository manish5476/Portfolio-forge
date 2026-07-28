import React, { useState } from 'react';
import {
  Sparkles,
  Share2,
  Monitor,
  Layers,
  Check,
  LogIn,
  LogOut,
  ShieldCheck,
  FileText,
  BarChart3,
  Sun,
  Moon,
  User,
  Settings,
  UserPlus,
  ExternalLink,
  Cpu,
  ChevronDown,
} from 'lucide-react';
import { PortfolioData } from '../types';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentUsername: string;
  activeMode: 'builder' | 'public';
  setActiveMode: (mode: 'builder' | 'public') => void;
  allHandles: { username: string; displayName: string }[];
  onSwitchUser: (username: string) => void;
  onOpenAuthModal: (mode: 'login' | 'signup') => void;
  onOpenShareModal: () => void;
  portfolio: PortfolioData | null;
  onToggleTheme?: () => void;
  onOpenAtsResume?: () => void;
  onOpenHealthModal?: () => void;
  onOpenAnalyticsModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUsername,
  activeMode,
  setActiveMode,
  allHandles,
  onSwitchUser,
  onOpenAuthModal,
  onOpenShareModal,
  portfolio,
  onToggleTheme,
  onOpenAtsResume,
  onOpenHealthModal,
  onOpenAnalyticsModal,
}) => {
  const { currentUser, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isOwnerLoggedIn = Boolean(
    currentUser &&
      (currentUser.username === currentUsername ||
        currentUser.uid === portfolio?.ownerId ||
        currentUser.id === portfolio?.ownerId)
  );

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/80 text-white shadow-lg transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveMode('public')}
            className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-md shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300">
              <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-indigo-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-black text-base tracking-tight font-display text-white">
                Portfolio<span className="text-indigo-400 font-mono">Forge</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                  SaaS
                </span>
              </div>
              <div className="text-[9px] -mt-0.5 tracking-widest uppercase font-mono text-slate-400 font-medium">
                Developer Identity Engine
              </div>
            </div>
          </button>

          {/* Navigation Items (Unauthenticated vs Authenticated) */}
          <nav className="hidden lg:flex items-center gap-5 text-xs font-medium text-slate-300">
            {!currentUser ? (
              <>
                <button
                  onClick={() => setActiveMode('public')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Home
                </button>
                <button
                  onClick={() => setActiveMode('public')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Explore
                </button>
                <button
                  onClick={() => onOpenAuthModal('signup')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Templates
                </button>
                <button
                  onClick={() => onOpenAuthModal('signup')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Pricing
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveMode('builder')}
                  className={`hover:text-white transition-colors cursor-pointer ${
                    activeMode === 'builder' ? 'text-indigo-400 font-bold' : ''
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveMode('builder')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Projects
                </button>
                {onOpenAnalyticsModal && (
                  <button
                    onClick={onOpenAnalyticsModal}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Analytics
                  </button>
                )}
                <button
                  onClick={() => setActiveMode('public')}
                  className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>My Public Portfolio</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Center Mode Switcher Tabs (Visible when logged in as owner) */}
        {isOwnerLoggedIn && (
          <div className="hidden md:flex items-center p-1 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner">
            <button
              onClick={() => setActiveMode('public')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeMode === 'public'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5 text-indigo-400" />
              Public View
            </button>

            <button
              onClick={() => setActiveMode('builder')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeMode === 'builder'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              Private Dashboard
            </button>
          </div>
        )}

        {/* Right Action Tools & Auth Menu */}
        <div className="flex items-center gap-2.5">
          
          {/* Health Score Trigger */}
          {onOpenHealthModal && (
            <button
              onClick={onOpenHealthModal}
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold transition-all cursor-pointer"
              title="Portfolio Health & Audit Score"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Score 98/100</span>
            </button>
          )}

          {/* ATS Resume Trigger */}
          {onOpenAtsResume && (
            <button
              onClick={onOpenAtsResume}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
              title="ATS Resume Vault"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden md:inline">Resume</span>
            </button>
          )}

          {/* Share QR Trigger */}
          <button
            onClick={onOpenShareModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Share</span>
          </button>

          {/* Theme Toggle Trigger */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="flex items-center justify-center p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 transition-all cursor-pointer"
              title="Toggle Theme"
            >
              {portfolio?.profile?.theme === 'light' ? (
                <Moon className="w-4 h-4 text-slate-300" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>
          )}

          {/* User Auth Section */}
          {!currentUser ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuthModal('login')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 border border-transparent transition-all cursor-pointer flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5 text-indigo-400" />
                <span>Log In</span>
              </button>

              <button
                onClick={() => onOpenAuthModal('signup')}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up</span>
              </button>
            </div>
          ) : (
            /* Logged In User Dropdown */
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer focus:outline-none"
              >
                <img
                  src={
                    currentUser.photoURL ||
                    portfolio?.profile?.avatarUrl ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.username}`
                  }
                  alt="User Avatar"
                  className="w-6 h-6 rounded-full object-cover ring-2 ring-indigo-500/40"
                />
                <span className="max-w-[100px] truncate font-mono text-indigo-300">
                  @{currentUser.username}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 border border-slate-800 rounded-2xl bg-slate-900 text-slate-100 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-slate-800 mb-1">
                    <div className="text-xs font-bold text-white truncate">{currentUser.displayName}</div>
                    <div className="text-[11px] font-mono text-indigo-400 truncate">@{currentUser.username}</div>
                    <div className="text-[10px] text-slate-500 truncate">{currentUser.email}</div>
                  </div>

                  <div className="space-y-1 py-1">
                    <button
                      onClick={() => {
                        setActiveMode('builder');
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5 text-purple-400" />
                      <span>Manage Portfolio Dashboard</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveMode('public');
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
                    >
                      <Monitor className="w-3.5 h-3.5 text-indigo-400" />
                      <span>View My Public Portfolio</span>
                    </button>

                    {/* Switch Public Handles (For testing / directory) */}
                    <div className="pt-2 border-t border-slate-800/80 my-1">
                      <div className="px-3 py-1 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                        Explore Public Handles
                      </div>
                      <div className="max-h-36 overflow-y-auto space-y-0.5">
                        {allHandles.map((h) => (
                          <button
                            key={h.username}
                            onClick={() => {
                              onSwitchUser(h.username);
                              setDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                              h.username === currentUsername
                                ? 'bg-indigo-500/20 text-indigo-300 font-bold'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                            }`}
                          >
                            <span className="truncate">@{h.username}</span>
                            {h.username === currentUsername && <Check className="w-3 h-3 text-indigo-400" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 mt-1">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs transition-all border border-rose-500/20 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </header>
  );
};
