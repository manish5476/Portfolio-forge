import React from 'react';
import { motion } from 'motion/react';
import { MapPin, FileText, Github, Linkedin, Instagram, Facebook, Twitter, Globe, Mail, Star, GitFork, Code, Sparkles, TrendingUp, Layers, Flame, Zap } from 'lucide-react';
import { Profile, Project, SocialLinks } from '../../types';
import { ThreeContributionGraph, ContributionDay } from '../3d/ThreeContributionGraph';
import { GithubHeatmap } from './GithubHeatmap';

interface HeroSectionProps {
  profile: Profile;
  projects: Project[];
  isLight?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ profile, projects, isLight = false }) => {
  const accent = profile.accentColor || '#06b6d4';

  // Compute stats from projects
  const totalStars = projects.reduce((acc, p) => acc + (p.githubStats?.stars || 0), 0);
  const totalForks = projects.reduce((acc, p) => acc + (p.githubStats?.forks || 0), 0);
  const totalRepos = projects.filter((p) => p.source === 'github' || p.source === 'merged' || p.repoUrl).length || projects.length;

  // Language breakdown computation
  const langCounts: Record<string, number> = {};
  projects.forEach((p) => {
    const lang = p.githubStats?.language || (p.techStack[0] || 'TypeScript');
    langCounts[lang] = (langCounts[lang] || 0) + 1;
  });
  const totalLangItems = Object.values(langCounts).reduce((a, b) => a + b, 0) || 1;

  const socialMap: { key: keyof SocialLinks; label: string; icon: React.FC<{ className?: string }>; url?: string }[] = [
    { key: 'github', label: 'GitHub', icon: Github, url: profile.socialLinks?.github },
    { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, url: profile.socialLinks?.linkedin },
    { key: 'twitter', label: 'X / Twitter', icon: Twitter, url: profile.socialLinks?.twitter },
    { key: 'website', label: 'Website', icon: Globe, url: profile.socialLinks?.website },
    { key: 'email', label: 'Email', icon: Mail, url: profile.socialLinks?.email ? `mailto:${profile.socialLinks.email}` : undefined },
    { key: 'instagram', label: 'Instagram', icon: Instagram, url: profile.socialLinks?.instagram },
    { key: 'facebook', label: 'Facebook', icon: Facebook, url: profile.socialLinks?.facebook },
  ];

  const activeSocials = socialMap.filter((item) => Boolean(item.url));

  // Generate synthetic or fetched contribution array for 3D graph
  const generatedContributions: ContributionDay[] = React.useMemo(() => {
    const days: ContributionDay[] = [];
    const now = new Date();
    for (let i = 364; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      // Deterministic realistic seed pattern based on index & project stats
      const pseudoRand = (Math.sin(i * 999 + totalStars) + 1) / 2;
      let level: 0 | 1 | 2 | 3 | 4 = 0;
      let count = 0;
      if (pseudoRand > 0.45) {
        level = 1;
        count = Math.floor(pseudoRand * 3) + 1;
      }
      if (pseudoRand > 0.7) {
        level = 2;
        count = Math.floor(pseudoRand * 6) + 3;
      }
      if (pseudoRand > 0.85) {
        level = 3;
        count = Math.floor(pseudoRand * 10) + 7;
      }
      if (pseudoRand > 0.94) {
        level = 4;
        count = Math.floor(pseudoRand * 18) + 12;
      }
      days.push({ date: dateStr, count, level });
    }
    return days;
  }, [totalStars]);

  return (
    <div className="relative pt-6 pb-12 overflow-hidden">
      
      {/* Background Neon Glow Spheres */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[350px] bg-cyan-500/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[300px] bg-blue-600/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ============================================================ */}
          {/* LEFT COLUMN: Profile Header & Web3 Glassmorphism Intro */}
          {/* ============================================================ */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="lg:col-span-6 space-y-6"
          >
            
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
              className="p-6 sm:p-8 rounded-3xl bg-slate-900/40 backdrop-blur-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] hover:border-cyan-500/30 transition-all duration-300 relative overflow-hidden group"
            >
              
              {/* Subtle top reflection accent */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                
                {/* 3D Floating Avatar with Animated Glowing Neon Ring */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="relative group/avatar shrink-0"
                >
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 blur-md opacity-70 group-hover/avatar:opacity-100 animate-pulse transition duration-500" />
                  <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1 bg-slate-950 border border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                    <img
                      src={profile.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.displayName}`}
                      alt={profile.displayName}
                      className="w-full h-full rounded-full object-cover shadow-inner"
                    />
                  </div>
                  {/* Floating Tech Badge on Avatar */}
                  <div className="absolute -bottom-1 -right-1 p-2 rounded-full bg-slate-950 border border-cyan-500/60 shadow-lg text-cyan-400 animate-bounce">
                    <Zap className="w-4 h-4 fill-cyan-400/20" />
                  </div>
                </motion.div>

                <div className="space-y-2 flex-1">
                  
                  {/* Location & Status Pill */}
                  <div className="flex flex-wrap items-center gap-2">
                    {profile.location && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-xs font-mono text-cyan-300">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{profile.location}</span>
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/80 text-[11px] font-mono text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>Available for Projects</span>
                    </span>
                  </div>

                  {/* Name in Sleek Gradient Typography */}
                  <h1 className="text-3xl sm:text-5xl font-black tracking-tight font-display text-white">
                    <span className="bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                      {profile.displayName}
                    </span>
                  </h1>

                  {/* Web3 Gradient Title / Tagline */}
                  <div className="text-base sm:text-lg font-extrabold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {profile.tagline || 'Full Stack & Web3 Developer'}
                  </div>

                </div>
              </div>

              {/* Bio Paragraph */}
              <p className="mt-6 text-sm sm:text-base leading-relaxed text-slate-300 font-sans border-t border-slate-800/80 pt-4">
                {profile.bio || 'Building scalable web applications, decentralized systems, and polished digital experiences.'}
              </p>

              {/* Social Links & Resume CTA */}
              <div className="flex flex-wrap items-center gap-2.5 pt-4">
                {activeSocials.map(({ key, label, icon: Icon, url }) => (
                  <motion.a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 text-xs font-semibold transition-all shadow-xs group cursor-pointer"
                  >
                    <Icon className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                    <span>{label}</span>
                  </motion.a>
                ))}

                {profile.resumeUrl && (
                  <motion.a
                    href={profile.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Download Resume</span>
                  </motion.a>
                )}
              </div>

            </motion.div>

            {/* Language Breakdown Glassmorphic Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="p-6 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-xl space-y-3"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                <span className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-cyan-400" />
                  <span>Tech Stack & Language Distribution</span>
                </span>
                <span className="font-mono text-[11px] text-cyan-400">{Object.keys(langCounts).length} Languages</span>
              </div>

              {/* Multi-segment Neon Progress Line */}
              <div className="h-3 w-full rounded-full bg-slate-950 border border-slate-800/80 overflow-hidden flex p-0.5 shadow-inner">
                {Object.entries(langCounts).map(([lang, count], i) => {
                  const pct = Math.round((count / totalLangItems) * 100);
                  const colors = ['#06b6d4', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#f59e0b'];
                  const color = colors[i % colors.length];
                  return (
                    <motion.div
                      key={lang}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                      style={{ backgroundColor: color }}
                      title={`${lang}: ${pct}%`}
                      className="h-full rounded-xs transition-all hover:brightness-125"
                    />
                  );
                })}
              </div>

              {/* Legend Tags */}
              <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1 text-xs">
                {Object.entries(langCounts).slice(0, 5).map(([lang, count], i) => {
                  const colors = ['#06b6d4', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#f59e0b'];
                  const pct = Math.round((count / totalLangItems) * 100);
                  return (
                    <div key={lang} className="flex items-center gap-1.5 font-mono text-[11px] text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full shadow-xs" style={{ backgroundColor: colors[i % colors.length] }} />
                      <span className="font-bold">{lang}</span>
                      <span className="text-slate-500">({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

          </motion.div>

          {/* ============================================================ */}
          {/* RIGHT COLUMN: Glowing Metric Widgets & 3D Isometric Matrix */}
          {/* ============================================================ */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-6 space-y-6"
          >
            
            {/* Glowing Metric Widgets Grid */}
            <div className="grid grid-cols-3 gap-4">
              
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="p-4 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/10 hover:border-cyan-500/50 transition-all shadow-xl group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-30 transition-opacity">
                  <Star className="w-12 h-12 text-amber-400" />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                  <span>Total Stars</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
                  {totalStars}
                </div>
                <div className="text-[10px] text-cyan-400 font-mono mt-1">+ GitHub Stars</div>
              </motion.div>

              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="p-4 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/10 hover:border-blue-500/50 transition-all shadow-xl group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-30 transition-opacity">
                  <GitFork className="w-12 h-12 text-blue-400" />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
                  <GitFork className="w-4 h-4 text-blue-400" />
                  <span>Forks</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
                  {totalForks}
                </div>
                <div className="text-[10px] text-blue-400 font-mono mt-1">+ Repos Forked</div>
              </motion.div>

              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="p-4 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/10 hover:border-emerald-500/50 transition-all shadow-xl group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-30 transition-opacity">
                  <Code className="w-12 h-12 text-emerald-400" />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
                  <Code className="w-4 h-4 text-emerald-400" />
                  <span>Projects</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
                  {totalRepos}
                </div>
                <div className="text-[10px] text-emerald-400 font-mono mt-1">+ Public Repos</div>
              </motion.div>

            </div>

            {/* 3D Isometric Contribution Graph Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="p-6 rounded-3xl bg-slate-900/40 backdrop-blur-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.4)] space-y-4"
            >
              
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">GitHub Activity Matrix</h3>
                    <p className="text-[10px] text-slate-400 font-mono">3D Interactive Isometric Heatmap</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/80 px-3 py-1 rounded-full border border-cyan-800">
                  @{profile.githubUsername || 'dev'}
                </span>
              </div>

              {/* Three.js Isometric 3D Cubes Visualization */}
              <ThreeContributionGraph
                contributions={generatedContributions}
                accentColor={accent}
                isLight={isLight}
              />

              {/* 2D Live GitHub Heatmap Fallback Toggle */}
              <div className="pt-2 border-t border-slate-800/60">
                <GithubHeatmap
                  username={profile.githubUsername || 'alexrivera'}
                  accentColor={accent}
                  isLight={isLight}
                />
              </div>

            </motion.div>

          </motion.div>

        </div>
      </div>

    </div>
  );
};

