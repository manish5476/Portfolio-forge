import React, { useState, useEffect } from 'react';
import { X, UserPlus, Check, AlertCircle, Sparkles, Github } from 'lucide-react';
import { checkUsernameAvailable, registerUser } from '../../services/api';
import { PortfolioData } from '../../types';

interface NewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newPortfolio: PortfolioData) => void;
}

export const NewUserModal: React.FC<NewUserModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [checkReason, setCheckReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Live username availability check debounce
  useEffect(() => {
    const handle = username.trim().toLowerCase();
    if (!handle || handle.length < 3) {
      setIsAvailable(null);
      setCheckReason('');
      return;
    }

    setIsChecking(true);
    const timer = setTimeout(async () => {
      const res = await checkUsernameAvailable(handle);
      setIsChecking(false);
      setIsAvailable(res.available);
      if (!res.available) {
        setCheckReason(res.reason || 'Username handle is already taken');
      } else {
        setCheckReason('Handle available!');
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [username]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || isAvailable === false) return;

    setIsSubmitting(true);
    setErrorMsg('');

    const res = await registerUser(
      username.trim().toLowerCase(),
      displayName.trim() || username.trim(),
      githubUsername.trim()
    );

    setIsSubmitting(false);

    if (res.success && res.portfolio) {
      onSuccess(res.portfolio);
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to create new portfolio account.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 relative space-y-5">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Create Portfolio Handle</h3>
            <p className="text-xs text-slate-400">Claim your unique permanent URL and builder profile</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Unique Username handle */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Desired Username Handle *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 text-xs font-mono">
                portfolioforge.com/
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                className="w-full pl-[135px] pr-8 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                placeholder="yourname"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {isChecking && <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />}
                {!isChecking && isAvailable === true && <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />}
                {!isChecking && isAvailable === false && <X className="w-4 h-4 text-red-400 stroke-[3]" />}
              </div>
            </div>

            {checkReason && (
              <div className={`text-[11px] mt-1 font-medium flex items-center gap-1 ${
                isAvailable ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {isAvailable ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                {checkReason}
              </div>
            )}
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Your Full Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              placeholder="e.g. Jordan Miller"
            />
          </div>

          {/* Optional GitHub Username */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <Github className="w-3.5 h-3.5 text-slate-400" />
              GitHub Username (Optional)
            </label>
            <input
              type="text"
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              placeholder="e.g. jordan-ml"
            />
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-red-950/60 border border-red-800 rounded-xl text-xs text-red-300">
              {errorMsg}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || isAvailable === false || !username.trim()}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              {isSubmitting ? 'Initializing Account...' : 'Create My Portfolio Handle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
