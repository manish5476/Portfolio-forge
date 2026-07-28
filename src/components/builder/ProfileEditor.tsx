import React, { useState } from 'react';
import { Sparkles, User, MapPin, FileText, Palette, Image as ImageIcon, Check, Github } from 'lucide-react';
import { Profile, AccentColor, ThemeMode } from '../../types';
import { enhanceWithAI } from '../../services/api';

interface ProfileEditorProps {
  profile: Profile;
  onChange: (updated: Profile) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
];

const ACCENT_COLORS: { color: string; label: string; hex: string }[] = [
  { color: '#06b6d4', label: 'Cyan', hex: '#06b6d4' },
  { color: '#3b82f6', label: 'Blue', hex: '#3b82f6' },
  { color: '#10b981', label: 'Emerald', hex: '#10b981' },
  { color: '#8b5cf6', label: 'Purple', hex: '#8b5cf6' },
  { color: '#ec4899', label: 'Pink', hex: '#ec4899' },
  { color: '#f59e0b', label: 'Amber', hex: '#f59e0b' },
  { color: '#f43f5e', label: 'Rose', hex: '#f43f5e' },
  { color: '#6366f1', label: 'Indigo', hex: '#6366f1' },
];

export const ProfileEditor: React.FC<ProfileEditorProps> = ({ profile, onChange }) => {
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleField = (field: keyof Profile, value: any) => {
    onChange({ ...profile, [field]: value });
  };

  const handleAiEnhanceBio = async () => {
    if (!profile.bio && !profile.tagline) return;
    setIsEnhancing(true);
    const polished = await enhanceWithAI('bio', profile.bio, profile.tagline);
    handleField('bio', polished);
    setIsEnhancing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-cyan-400" />
            Profile & Branding
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Personal bio, avatar, theme preferences, and identity information.
          </p>
        </div>
      </div>

      {/* Grid Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Full Display Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Display Name *</label>
          <input
            type="text"
            value={profile.displayName}
            onChange={(e) => handleField('displayName', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
            placeholder="e.g. Alex Rivera"
          />
        </div>

        {/* Tagline / Role */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tagline / Title *</label>
          <input
            type="text"
            value={profile.tagline}
            onChange={(e) => handleField('tagline', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
            placeholder="e.g. Lead Frontend Engineer & Creative Technologist"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            Location
          </label>
          <input
            type="text"
            value={profile.location}
            onChange={(e) => handleField('location', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
            placeholder="e.g. San Francisco, CA"
          />
        </div>

        {/* Resume Link */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            Resume / CV URL
          </label>
          <input
            type="url"
            value={profile.resumeUrl}
            onChange={(e) => handleField('resumeUrl', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
            placeholder="https://example.com/resume.pdf"
          />
        </div>

        {/* GitHub Username / Handle */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Github className="w-3.5 h-3.5 text-cyan-400" />
              Primary GitHub Username / Handle
            </span>
            <span className="text-[10px] text-cyan-400 font-mono">Multiple IDs supported in GitHub Sync</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 font-mono text-xs">@</span>
            <input
              type="text"
              value={profile.githubUsername || ''}
              onChange={(e) => handleField('githubUsername', e.target.value)}
              className="w-full pl-7 pr-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors"
              placeholder="e.g. alexrivera"
            />
          </div>
        </div>

      </div>

      {/* Avatar Image URL & Presets */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
        <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-cyan-400" />
          Avatar Picture URL
        </label>
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <img
            src={profile.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=avatar'}
            alt="Avatar Preview"
            className="w-14 h-14 rounded-full object-cover ring-2 ring-cyan-500/50 shrink-0"
          />
          <input
            type="url"
            value={profile.avatarUrl}
            onChange={(e) => handleField('avatarUrl', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
            placeholder="https://images.unsplash.com/photo-..."
          />
        </div>
        
        {/* Preset Thumbnails */}
        <div>
          <div className="text-[11px] font-medium text-slate-400 mb-2">Or choose a sample developer avatar:</div>
          <div className="flex flex-wrap gap-2">
            {PRESET_AVATARS.map((url, idx) => (
              <button
                key={idx}
                onClick={() => handleField('avatarUrl', url)}
                className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${
                  profile.avatarUrl === url ? 'border-cyan-400 ring-2 ring-cyan-400/30 scale-105' : 'border-slate-700 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={url} alt="Preset" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bio Field with AI Enhancer */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold text-slate-300">Professional Bio</label>
          <button
            type="button"
            onClick={handleAiEnhanceBio}
            disabled={isEnhancing}
            className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 border border-cyan-800/80 px-2.5 py-1 rounded-lg transition-all hover:bg-cyan-900/60 disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isEnhancing ? 'animate-spin' : ''}`} />
            {isEnhancing ? 'Refining with Gemini...' : 'Enhance with AI'}
          </button>
        </div>
        <textarea
          rows={3}
          value={profile.bio}
          onChange={(e) => handleField('bio', e.target.value)}
          className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors leading-relaxed"
          placeholder="Briefly describe your expertise, background, and what you build..."
        />
      </div>

      {/* Theme & Accent Color Palette */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-slate-800">
        
        {/* Theme Toggle */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">Portfolio Theme</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleField('theme', 'dark')}
              className={`p-3 rounded-xl border text-left transition-all ${
                profile.theme === 'dark'
                  ? 'bg-slate-900 border-cyan-500 text-white shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="font-semibold text-xs">🌙 Dark Mode</div>
              <div className="text-[10px] text-slate-500 mt-1">Sleek dev aesthetics & high contrast</div>
            </button>

            <button
              type="button"
              onClick={() => handleField('theme', 'light')}
              className={`p-3 rounded-xl border text-left transition-all ${
                profile.theme === 'light'
                  ? 'bg-slate-100 border-cyan-500 text-slate-900 shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="font-semibold text-xs">☀️ Light Mode</div>
              <div className="text-[10px] text-slate-500 mt-1">Clean slate & soft shadows</div>
            </button>
          </div>
        </div>

        {/* Accent Color Selection & Custom Color Input */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-cyan-400" />
              Brand Accent Color
            </label>
            
            {/* Live Accent Preview Tag */}
            <span
              className="text-[11px] font-mono px-2.5 py-0.5 rounded-full font-bold text-slate-950 shadow"
              style={{ backgroundColor: profile.accentColor || '#06b6d4' }}
            >
              Active Accent
            </span>
          </div>

          {/* Color Presets */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {ACCENT_COLORS.map((item) => {
              const isSelected = profile.accentColor?.toLowerCase() === item.hex.toLowerCase();
              return (
                <button
                  key={item.color}
                  type="button"
                  onClick={() => handleField('accentColor', item.color)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-all transform ${
                    isSelected ? 'ring-4 ring-white/30 scale-110 shadow-lg' : 'opacity-70 hover:opacity-100 hover:scale-105'
                  }`}
                  style={{ backgroundColor: item.hex }}
                  title={item.label}
                >
                  {isSelected && <Check className="w-4 h-4 stroke-[3] text-slate-950" />}
                </button>
              );
            })}
          </div>

          {/* Custom Hex Color & Color Picker Input */}
          <div className="pt-2 flex items-center gap-3">
            <div className="relative flex items-center">
              <input
                type="color"
                value={profile.accentColor && profile.accentColor.startsWith('#') ? profile.accentColor : '#06b6d4'}
                onChange={(e) => handleField('accentColor', e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer border border-slate-700 bg-slate-950 p-1 focus:outline-none"
                title="Choose custom color picker"
              />
            </div>

            <div className="flex-1 relative">
              <input
                type="text"
                value={profile.accentColor || ''}
                onChange={(e) => handleField('accentColor', e.target.value)}
                placeholder="#06b6d4"
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div
              className="px-3 py-2 rounded-xl text-xs font-bold font-mono border border-slate-700 shrink-0 flex items-center gap-2"
              style={{ color: profile.accentColor || '#06b6d4', borderColor: profile.accentColor || '#06b6d4' }}
            >
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: profile.accentColor || '#06b6d4' }} />
              <span>{profile.accentColor || '#06b6d4'}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
