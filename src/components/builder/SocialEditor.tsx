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
  { key: 'leetcode', label: 'LeetCode Profile', icon: Globe, placeholder: 'https://leetcode.com/username or handle' },
  { key: 'codeforces', label: 'Codeforces', icon: Globe, placeholder: 'https://codeforces.com/profile/username' },
  { key: 'codechef', label: 'CodeChef', icon: Globe, placeholder: 'https://codechef.com/users/username' },
  { key: 'hackerrank', label: 'HackerRank', icon: Globe, placeholder: 'https://hackerrank.com/username' },
  { key: 'devto', label: 'Dev.to Blog', icon: Globe, placeholder: 'https://dev.to/username' },
  { key: 'hashnode', label: 'Hashnode Blog', icon: Globe, placeholder: 'https://hashnode.com/@username' },
  { key: 'stackoverflow', label: 'StackOverflow', icon: Globe, placeholder: 'https://stackoverflow.com/users/id/username' },
  { key: 'figma', label: 'Figma Community', icon: Globe, placeholder: 'https://figma.com/@username' },
  { key: 'dockerhub', label: 'DockerHub', icon: Globe, placeholder: 'https://hub.docker.com/u/username' },
  { key: 'npm', label: 'npm Registry', icon: Globe, placeholder: 'https://npmjs.com/~username' },
  { key: 'aws', label: 'AWS Certification / Credly', icon: Globe, placeholder: 'https://credly.com/badges/your-id' },
  { key: 'producthunt', label: 'Product Hunt', icon: Globe, placeholder: 'https://producthunt.com/@username' },
  { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/username' },
  { key: 'facebook', label: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/username' },
];

export const SocialEditor: React.FC<SocialEditorProps> = ({ socialLinks, onChange }) => {
  const handleItemChange = (key: keyof SocialLinks, value: string) => {
    onChange({ ...socialLinks, [key]: value });
  };

  const activeCount = Object.values(socialLinks || {}).filter(Boolean).length;

  return (
    <div className="space-y-6 text-slate-900">
      <div className="flex items-center justify-between border-b border-[#E7EAF0] pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 font-display">
            <Share2 className="w-5 h-5 text-indigo-600" />
            Social & Contact Links
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Links appear as icon-linked pills in your portfolio hero header. Unfilled fields are omitted.
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
          {activeCount} active links
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SOCIAL_ITEMS.map(({ key, label, icon: Icon, placeholder }) => (
          <div key={key} className="bg-slate-50 border border-[#E7EAF0] rounded-2xl p-3.5 space-y-1.5 shadow-2xs">
            <label className="block text-xs font-semibold text-slate-700 flex items-center gap-2">
              <Icon className="w-4 h-4 text-indigo-600" />
              {label}
            </label>
            <input
              type="text"
              value={socialLinks[key] || ''}
              onChange={(e) => handleItemChange(key, e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#E7EAF0] rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 transition-all shadow-2xs"
              placeholder={placeholder}
            />
          </div>
        ))}
      </div>

      {/* Live Preview Bar */}
      <div className="p-4 bg-white border border-[#E7EAF0] rounded-2xl shadow-xs">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">Live Social Pill Preview</div>
        <div className="flex flex-wrap gap-2">
          {SOCIAL_ITEMS.filter((item) => Boolean(socialLinks[item.key])).map(({ key, label, icon: Icon }) => (
            <div
              key={key}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800"
            >
              <Icon className="w-3.5 h-3.5 text-indigo-600" />
              <span>{label}</span>
            </div>
          ))}
          {activeCount === 0 && (
            <div className="text-xs text-slate-400 italic">No social links configured yet. Fill out fields above.</div>
          )}
        </div>
      </div>
    </div>
  );
};
