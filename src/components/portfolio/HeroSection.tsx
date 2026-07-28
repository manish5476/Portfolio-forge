import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  MapPin,
  FileText,
  Github,
  Linkedin,
  Twitter,
  Globe,
  Mail,
  ArrowUpRight,
  Clock,
  Sparkles,
  CheckCircle2,
  QrCode,
  Code2,
  Terminal,
  Download,
  Send,
  Zap,
} from 'lucide-react';
import { Profile, Project, SocialLinks } from '../../types';

interface HeroSectionProps {
  profile: Profile;
  projects: Project[];
  isLight?: boolean;
  onOpenAtsResume?: () => void;
  onOpenShareModal?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  profile,
  projects,
  isLight = true,
  onOpenAtsResume,
  onOpenShareModal,
}) => {
  const [timeString, setTimeString] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const totalStars = projects.reduce((acc, p) => acc + (p.githubStats?.stars || 0), 0);

  const socialMap: { key: keyof SocialLinks; label: string; icon: React.FC<{ className?: string }>; url?: string }[] = [
    { key: 'github', label: 'GitHub', icon: Github, url: profile.socialLinks?.github || `https://github.com/${profile.githubUsername}` },
    { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, url: profile.socialLinks?.linkedin },
    { key: 'twitter', label: 'Twitter / X', icon: Twitter, url: profile.socialLinks?.twitter },
    { key: 'website', label: 'Website', icon: Globe, url: profile.socialLinks?.website },
  ];

  const activeSocials = socialMap.filter((s) => Boolean(s.url));

  return (
    <section id="hero" className="relative pt-10 pb-16 sm:pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Availability Badge + Location Ribbon */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-center gap-3 mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>{profile.availability === 'open_to_work' ? 'Available for new roles & projects' : 'Open to contracting'}</span>
          </div>

          {profile.location && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200/80 text-slate-700 text-xs font-medium shadow-xs">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>{profile.location}</span>
            </div>
          )}

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200/80 text-slate-500 text-xs font-mono shadow-xs">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{timeString || 'PST Local Time'}</span>
          </div>
        </motion.div>

        {/* Hero Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Main Editorial Text & Headline */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-8 space-y-6"
          >
            <div className="space-y-3">
              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-slate-900 tracking-tight font-display leading-[1.02]">
                {profile.displayName}
              </h1>

              <p className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 tracking-tight">
                {profile.tagline || 'Staff Software Engineer & Systems Designer'}
              </p>
            </div>

            <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-2xl">
              {profile.bio || 'Architecting fast, accessible software, high-throughput backend services, and interactive React applications with precision and craftsmanship.'}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <a
                href={`mailto:${profile.socialLinks?.email || 'contact@dev.com'}`}
                className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-lg shadow-slate-900/10 transition-all flex items-center gap-2 group cursor-pointer"
              >
                <Mail className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                <span>Get in Touch</span>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>

              {onOpenAtsResume && (
                <button
                  onClick={onOpenAtsResume}
                  className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-900 font-bold text-sm shadow-sm transition-all flex items-center gap-2.5 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Resume PDF</span>
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-mono font-bold">ATS 96%</span>
                </button>
              )}

              {profile.socialLinks?.github && (
                <a
                  href={profile.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 shadow-sm transition-all cursor-pointer"
                  title="View GitHub Profile"
                >
                  <Github className="w-5 h-5" />
                </a>
              )}

              {onOpenShareModal && (
                <button
                  onClick={onOpenShareModal}
                  className="p-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 shadow-sm transition-all cursor-pointer"
                  title="Share Portfolio"
                >
                  <QrCode className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Quick Socials Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              {activeSocials.map(({ key, label, icon: Icon, url }) => (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold transition-all"
                >
                  <Icon className="w-3.5 h-3.5 text-blue-600" />
                  <span>{label}</span>
                </a>
              ))}
            </div>
          </motion.div>

          {/* Developer Photo / Avatar Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-4 flex justify-center lg:justify-end"
          >
            <div className="relative group">
              {/* Soft Ambient Glow Effect */}
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-blue-500/20 via-indigo-500/20 to-purple-500/20 blur-2xl group-hover:blur-3xl transition-all duration-500" />

              <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-3xl bg-white border border-slate-200/80 shadow-2xl p-3 flex items-center justify-center overflow-hidden">
                <img
                  src={profile.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.displayName}`}
                  alt={profile.displayName}
                  className="w-full h-full rounded-2xl object-cover bg-slate-50"
                />

                {/* Floating Verified Badge */}
                {profile.verified && (
                  <div className="absolute bottom-6 right-6 p-2.5 rounded-2xl bg-white border border-slate-200 shadow-xl text-blue-600 flex items-center gap-1.5 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Verified Developer</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
