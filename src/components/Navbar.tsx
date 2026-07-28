import React, { useState, useEffect } from 'react';
import { Hammer, Sparkles, Share2, Code2, Monitor, Layers, UserCheck, Plus, Check, Sun, Moon, LogIn, LogOut, ShieldCheck, Cloud, CheckCircle2, RefreshCw, Cpu, Zap } from 'lucide-react';
import { PortfolioData } from '../types';
import { auth, loginWithGoogle, logoutUser } from '../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface NavbarProps {
  currentUsername: string;
  activeMode: 'builder' | 'public';
  setActiveMode: (mode: 'builder' | 'public') => void;
  allHandles: { username: string; displayName: string }[];
  onSwitchUser: (username: string) => void;
  onNewUserModal: () => void;
  onOpenShareModal: () => void;
  portfolio: PortfolioData | null;
  onToggleTheme?: () => void;
  savingStatus?: 'idle' | 'saving' | 'autosaving' | 'saved';
  lastSavedAt?: Date | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUsername,
  activeMode,
  setActiveMode,
  allHandles,
  onSwitchUser,
  onNewUserModal,
  onOpenShareModal,
  portfolio,
  onToggleTheme,
  savingStatus = 'idle',
  lastSavedAt = null,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const isLight = portfolio?.profile?.theme === 'light';
  const accent = portfolio?.profile?.accentColor || '#06b6d4';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error('Google login failed:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-950/70 backdrop-blur-2xl border-b border-cyan-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo with Glowing Hex/Icon */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveMode('builder')}
            className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:shadow-[0_0_25px_rgba(6,182,212,0.7)] transition-all duration-300">
              <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-black text-lg tracking-tight font-display text-white">
                Portfolio<span className="text-cyan-400 font-mono">Forge</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">3D</span>
              </div>
              <div className="text-[9px] -mt-0.5 tracking-widest uppercase font-mono text-slate-400">Web3 Portfolio Engine</div>
            </div>
          </button>
        </div>

        {/* Center Mode Switcher Tabs with Glowing Drop-Shadows */}
        <div className="hidden md:flex items-center p-1 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-inner">
          <button
            onClick={() => setActiveMode('builder')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeMode === 'builder'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Builder Dashboard
          </button>

          <button
            onClick={() => setActiveMode('public')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeMode === 'public'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            Public View ({portfolio?.username ? `/${portfolio.username}` : ''})
          </button>
        </div>

        {/* Right Actions & Account Switcher */}
        <div className="flex items-center gap-3">
          
          {/* Subtle Auto-Save Status Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono">
            {savingStatus === 'autosaving' || savingStatus === 'saving' ? (
              <>
                <RefreshCw className="w-3 h-3 text-cyan-400 animate-spin" />
                <span className="text-[11px] text-cyan-400 font-semibold">Cloud Syncing...</span>
              </>
            ) : savingStatus === 'saved' ? (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span className="text-[11px] text-emerald-400 font-semibold">Synced</span>
              </>
            ) : (
              <>
                <Cloud className="w-3 h-3 text-slate-400" />
                <span className="text-[11px] text-slate-400">
                  {lastSavedAt ? `Saved ${lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Auto-save'}
                </span>
              </>
            )}
          </div>

          {/* Share & Embed Button */}
          <button
            onClick={onOpenShareModal}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 hover:border-cyan-500/60 text-slate-200 hover:text-white text-xs font-bold transition-all shadow-md hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Share & Embed</span>
          </button>

          {/* Account Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-white text-xs font-semibold transition-all cursor-pointer focus:outline-none"
            >
              <img
                src={portfolio?.profile?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUsername}`}
                alt="Avatar"
                className="w-6 h-6 rounded-full object-cover ring-2 ring-cyan-500/60"
              />
              <span className="max-w-[100px] truncate font-mono text-cyan-300">@{currentUsername}</span>
              <span className="text-slate-400 text-[10px]">▼</span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 border border-cyan-500/30 rounded-2xl bg-slate-950/95 backdrop-blur-2xl text-slate-100 shadow-[0_0_40px_rgba(0,0,0,0.8)] p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-slate-800 mb-1">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Switch Account Portfolio</div>
                  <div className="text-xs truncate mt-0.5 font-bold text-cyan-400 font-mono">{portfolio?.profile?.displayName || currentUsername}</div>
                </div>

                {/* Firebase Authentication Status */}
                <div className="px-3 py-2 border-b border-slate-800 mb-1 rounded-xl bg-slate-900/60">
                  {firebaseUser ? (
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 truncate">
                        {firebaseUser.photoURL ? (
                          <img src={firebaseUser.photoURL} alt="User" className="w-5 h-5 rounded-full" />
                        ) : (
                          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                        <span className="text-[11px] font-mono text-emerald-300 truncate">
                          {firebaseUser.displayName || firebaseUser.email}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="text-[10px] text-slate-400 hover:text-red-400 flex items-center gap-1 shrink-0 font-mono cursor-pointer"
                        title="Sign Out of Firebase"
                      >
                        <LogOut className="w-3 h-3" />
                        Exit
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      className="w-full flex items-center justify-center gap-2 py-1.5 px-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 text-xs font-bold transition-all cursor-pointer"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      Sign in with Google
                    </button>
                  )}
                </div>

                <div className="max-h-52 overflow-y-auto space-y-1 py-1">
                  {allHandles.map((h) => (
                    <button
                      key={h.username}
                      onClick={() => {
                        onSwitchUser(h.username);
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                        h.username === currentUsername
                          ? 'bg-cyan-950/80 text-cyan-300 font-bold border border-cyan-800'
                          : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                      }`}
                    >
                      <div className="truncate text-left">
                        <div className="font-semibold text-white">{h.displayName}</div>
                        <div className="text-[10px] text-slate-400">@{h.username}</div>
                      </div>
                      {h.username === currentUsername && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800/80 mt-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onNewUserModal();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-md transition-all hover:brightness-110 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Create New Handle
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Mobile Mode Switcher Bar */}
      <div className="md:hidden flex border-t border-slate-800/60 p-1.5 px-4 justify-around bg-slate-950/90">
        <button
          onClick={() => setActiveMode('builder')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold ${
            activeMode === 'builder' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'text-slate-400'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Builder
        </button>
        <button
          onClick={() => setActiveMode('public')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold ${
            activeMode === 'public' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'text-slate-400'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          Public View
        </button>
      </div>
    </header>
  );
};
