import React from 'react';
import { Share2, Github, Linkedin, Instagram, Facebook, Twitter, Globe, Mail } from 'lucide-react';
import { SocialLinks } from '../../types';

interface SocialEditorProps {
  socialLinks: SocialLinks;
  onChange: (updated: SocialLinks) => void;
}

const SOCIAL_ITEMS: { key: keyof SocialLinks; label: string; icon: React.FC<{ className?: string }>; placeholder: string }[] = [
  { key: 'github', label: 'GitHub Profile', icon: Github, placeholder: 'https://github.com/username' },
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/username' },
  { key: 'twitter', label: 'X / Twitter', icon: Twitter, placeholder: 'https://x.com/username' },
  { key: 'website', label: 'Personal Website', icon: Globe, placeholder: 'https://yourwebsite.com' },
  { key: 'email', label: 'Email Address', icon: Mail, placeholder: 'you@example.com' },
  { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/username' },
  { key: 'facebook', label: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/username' },
];

export const SocialEditor: React.FC<SocialEditorProps> = ({ socialLinks, onChange }) => {
  const handleItemChange = (key: keyof SocialLinks, value: string) => {
    onChange({ ...socialLinks, [key]: value });
  };

  const activeCount = Object.values(socialLinks || {}).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Share2 className="w-5 h-5 text-cyan-400" />
            Social & Contact Links
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Links appear as icon-linked pills in your portfolio hero header. Unfilled fields are omitted.
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/80">
          {activeCount} active links
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SOCIAL_ITEMS.map(({ key, label, icon: Icon, placeholder }) => (
          <div key={key} className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 flex items-center gap-2">
              <Icon className="w-4 h-4 text-cyan-400" />
              {label}
            </label>
            <input
              type="text"
              value={socialLinks[key] || ''}
              onChange={(e) => handleItemChange(key, e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
              placeholder={placeholder}
            />
          </div>
        ))}
      </div>

      {/* Live Preview Bar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Live Social Pill Preview</div>
        <div className="flex flex-wrap gap-2">
          {SOCIAL_ITEMS.filter((item) => Boolean(socialLinks[item.key])).map(({ key, label, icon: Icon }) => (
            <div
              key={key}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200"
            >
              <Icon className="w-3.5 h-3.5 text-cyan-400" />
              <span>{label}</span>
            </div>
          ))}
          {activeCount === 0 && (
            <div className="text-xs text-slate-500 italic">No social links configured yet. Fill out fields above.</div>
          )}
        </div>
      </div>
    </div>
  );
};
