import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Lock,
  Mail,
  User,
  AtSign,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  KeyRound,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { checkUsernameAvailable } from '../../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup' | 'forgot';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess,
}) => {
  const {
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signInWithGithub,
    signInWithLinkedIn,
    resetPassword,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Username validation state
  const [usernameStatus, setUsernameStatus] = useState<{
    checking: boolean;
    available?: boolean;
    message?: string;
  }>({ checking: false });

  // Handle Username Input Change & Real-Time Availability Check
  const handleUsernameChange = async (val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9_\-]/g, '');
    setUsername(clean);

    if (clean.length < 3) {
      setUsernameStatus({ checking: false, available: false, message: 'Must be at least 3 characters' });
      return;
    }

    setUsernameStatus({ checking: true });
    try {
      const res = await checkUsernameAvailable(clean);
      if (res.available) {
        setUsernameStatus({ checking: false, available: true, message: `portfolioforge.io/${clean} is available!` });
      } else {
        setUsernameStatus({ checking: false, available: false, message: res.reason || 'Username handle is taken' });
      }
    } catch (e) {
      setUsernameStatus({ checking: false, available: true });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await signInWithEmail(email, password, rememberMe);
        if (onSuccess) onSuccess();
        onClose();
      } else if (mode === 'signup') {
        if (!username || username.length < 3) {
          throw new Error('Please choose a valid username handle (at least 3 characters).');
        }
        if (usernameStatus.available === false) {
          throw new Error('Selected username is unavailable. Please try another handle.');
        }
        await signUpWithEmail(email, password, displayName || username, username);
        setSuccessMsg('Account created successfully! Welcome to your PortfolioForge dashboard.');
        if (onSuccess) onSuccess();
        setTimeout(() => onClose(), 1000);
      } else if (mode === 'forgot') {
        await resetPassword(email);
        setSuccessMsg(`Password reset link sent to ${email}. Check your inbox!`);
      }
    } catch (err: any) {
      console.error('Auth submit error:', err);
      setErrorMsg(err.message || 'Authentication operation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github' | 'linkedin') => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      if (provider === 'google') {
        await signInWithGoogle(username || undefined);
      } else if (provider === 'github') {
        await signInWithGithub(username || undefined);
      } else if (provider === 'linkedin') {
        if (!email) {
          throw new Error('Please enter your email above to continue with LinkedIn Login.');
        }
        await signInWithLinkedIn(email, displayName || 'Developer User', username || undefined);
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || `${provider} login failed.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md overflow-hidden bg-slate-900 border border-slate-800 rounded-t-3xl md:rounded-3xl shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto"
        >
          {/* Mobile Sheet Drag Indicator Handle */}
          <div className="w-12 h-1.5 bg-slate-700/80 rounded-full mx-auto my-2.5 md:hidden" />

          {/* Header Bar */}
          <div className="flex items-center justify-between p-6 border-b border-slate-800/80 bg-slate-900/50">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {mode === 'login' && 'Welcome Back'}
                  {mode === 'signup' && 'Create Your Portfolio SaaS Account'}
                  {mode === 'forgot' && 'Reset Password'}
                </h2>
                <p className="text-xs text-slate-400">
                  {mode === 'login' && 'Log in to manage your portfolio, analytics & settings.'}
                  {mode === 'signup' && 'Your handle, your portfolio, fully owned by you.'}
                  {mode === 'forgot' && 'We will send a reset password link to your email.'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-5">
            {/* Error / Success Notifications */}
            {errorMsg && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{successMsg}</span>
              </div>
            )}

            {/* Social Logins (Google, GitHub, LinkedIn) */}
            {mode !== 'forgot' && (
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleOAuth('google')}
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700/80 text-xs font-bold text-slate-200 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                      />
                    </svg>
                    <span>Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOAuth('github')}
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700/80 text-xs font-bold text-slate-200 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    <span>GitHub</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleOAuth('linkedin')}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-xs font-medium text-slate-300 transition-all cursor-pointer disabled:opacity-50"
                >
                  <span className="font-bold text-blue-400">in</span>
                  <span>Continue with LinkedIn</span>
                </button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-800" />
                  </div>
                  <div className="relative flex justify-center text-[11px] uppercase tracking-wider font-mono">
                    <span className="bg-slate-900 px-3 text-slate-500">Or Email & Password</span>
                  </div>
                </div>
              </div>
            )}

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Full Name Input (Signup Only) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Manish Singh"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Unique Username Handle Input (Signup Only) */}
              {mode === 'signup' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-mono font-medium text-slate-300">
                      Choose Your Public Handle
                    </label>
                    <span className="text-[10px] text-indigo-400 font-mono">
                      https://portfolioforge.io/<strong>{username || 'username'}</strong>
                    </span>
                  </div>
                  <div className="relative">
                    <AtSign className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. manishsingh"
                      value={username}
                      onChange={(e) => handleUsernameChange(e.target.value)}
                      className={`w-full pl-9 pr-9 py-2.5 bg-slate-950 border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden transition-all ${
                        usernameStatus.available === true
                          ? 'border-emerald-500/80 focus:border-emerald-500'
                          : usernameStatus.available === false
                          ? 'border-rose-500/80 focus:border-rose-500'
                          : 'border-slate-800 focus:border-indigo-500'
                      }`}
                    />
                    {usernameStatus.checking ? (
                      <RefreshCw className="w-4 h-4 text-slate-400 animate-spin absolute right-3 top-3" />
                    ) : usernameStatus.available === true ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 absolute right-3 top-3" />
                    ) : usernameStatus.available === false ? (
                      <AlertCircle className="w-4 h-4 text-rose-400 absolute right-3 top-3" />
                    ) : null}
                  </div>
                  {usernameStatus.message && (
                    <p
                      className={`mt-1 text-[11px] font-mono ${
                        usernameStatus.available ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {usernameStatus.message}
                    </p>
                  )}
                </div>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden transition-all"
                  />
                </div>
              </div>

              {/* Password Input (Login & Signup) */}
              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-mono font-medium text-slate-300">Password</label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-[11px] text-indigo-400 hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Remember Me Checkbox */}
              {mode === 'login' && (
                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded-md border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
                    />
                    <span>Remember me on this browser</span>
                  </label>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs tracking-wide transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {mode === 'login' && 'Sign In to Dashboard'}
                      {mode === 'signup' && 'Create Account & Claim Portfolio'}
                      {mode === 'forgot' && 'Send Password Reset Link'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Switch Mode Footer */}
            <div className="pt-3 border-t border-slate-800/80 text-center text-xs text-slate-400">
              {mode === 'login' && (
                <p>
                  Don't have a portfolio SaaS account yet?{' '}
                  <button
                    onClick={() => {
                      setMode('signup');
                      setErrorMsg(null);
                    }}
                    className="font-bold text-indigo-400 hover:underline cursor-pointer"
                  >
                    Create Account
                  </button>
                </p>
              )}

              {mode === 'signup' && (
                <p>
                  Already registered?{' '}
                  <button
                    onClick={() => {
                      setMode('login');
                      setErrorMsg(null);
                    }}
                    className="font-bold text-indigo-400 hover:underline cursor-pointer"
                  >
                    Log In Here
                  </button>
                </p>
              )}

              {mode === 'forgot' && (
                <p>
                  Remembered your password?{' '}
                  <button
                    onClick={() => {
                      setMode('login');
                      setErrorMsg(null);
                    }}
                    className="font-bold text-indigo-400 hover:underline cursor-pointer"
                  >
                    Back to Login
                  </button>
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
