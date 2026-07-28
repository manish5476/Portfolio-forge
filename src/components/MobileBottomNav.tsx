import React from 'react';
import { motion } from 'motion/react';
import {
  Home,
  FolderGit2,
  BarChart3,
  FileText,
  User,
  Sparkles,
  Layers,
  LogIn,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface MobileBottomNavProps {
  activeSection: string;
  setActiveSection: (sec: string) => void;
  activeMode: 'builder' | 'public';
  setActiveMode: (mode: 'builder' | 'public') => void;
  onOpenAuthModal: (mode: 'login' | 'signup') => void;
  onOpenAtsResume: () => void;
  onOpenAnalytics: () => void;
  currentUsername: string;
  isOwnerLoggedIn: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeSection,
  setActiveSection,
  activeMode,
  setActiveMode,
  onOpenAuthModal,
  onOpenAtsResume,
  onOpenAnalytics,
  currentUsername,
  isOwnerLoggedIn,
}) => {
  const { currentUser } = useAuth();

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    if (activeMode !== 'public') {
      setActiveMode('public');
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 md:hidden pointer-events-none pb-safe">
      <div className="px-4 pb-3 pt-1 pointer-events-auto">
        <nav className="mx-auto max-w-md bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-1.5 shadow-2xl flex items-center justify-around ring-1 ring-white/10">
          
          {/* Home Tab */}
          <button
            onClick={() => scrollToSection('hero')}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer min-h-[48px] min-w-[56px] ${
              activeSection === 'hero' && activeMode === 'public'
                ? 'text-indigo-400 bg-indigo-500/15 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium leading-none">Home</span>
          </button>

          {/* Projects Tab */}
          <button
            onClick={() => scrollToSection('projects')}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer min-h-[48px] min-w-[56px] ${
              activeSection === 'projects' && activeMode === 'public'
                ? 'text-indigo-400 bg-indigo-500/15 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderGit2 className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium leading-none">Projects</span>
          </button>

          {/* Analytics Modal Tab */}
          <button
            onClick={() => {
              onOpenAnalytics();
              setActiveSection('analytics');
            }}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer min-h-[48px] min-w-[56px] ${
              activeSection === 'analytics'
                ? 'text-purple-400 bg-purple-500/15 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium leading-none">Analytics</span>
          </button>

          {/* Resume Vault Tab */}
          <button
            onClick={onOpenAtsResume}
            className="flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl text-slate-400 hover:text-slate-200 transition-all cursor-pointer min-h-[48px] min-w-[56px]"
          >
            <FileText className="w-5 h-5 mb-0.5 text-blue-400" />
            <span className="text-[10px] font-medium leading-none">Resume</span>
          </button>

          {/* Dashboard or Auth Tab */}
          {currentUser && isOwnerLoggedIn ? (
            <button
              onClick={() => {
                setActiveMode(activeMode === 'builder' ? 'public' : 'builder');
                setActiveSection('dashboard');
              }}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer min-h-[48px] min-w-[56px] ${
                activeMode === 'builder'
                  ? 'text-emerald-400 bg-emerald-500/15 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-5 h-5 mb-0.5 text-emerald-400" />
              <span className="text-[10px] font-medium leading-none">Dashboard</span>
            </button>
          ) : (
            <button
              onClick={() => onOpenAuthModal('login')}
              className="flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl text-slate-400 hover:text-slate-200 transition-all cursor-pointer min-h-[48px] min-w-[56px]"
            >
              <User className="w-5 h-5 mb-0.5 text-indigo-400" />
              <span className="text-[10px] font-medium leading-none">Profile</span>
            </button>
          )}

        </nav>
      </div>
    </div>
  );
};
