import React from 'react';
import { motion } from 'motion/react';
import {
  FolderGit2,
  Briefcase,
  GitBranch,
  Trophy,
  Code2,
  FileText,
  BookOpen,
  Award,
  ArrowUpRight,
  Sparkles,
  Star,
  Zap,
  Flame,
  CheckCircle2,
  Layers,
  Terminal,
} from 'lucide-react';
import { PortfolioData, Project } from '../../types';

interface BentoGridSectionProps {
  portfolio: PortfolioData;
  onSelectProject?: (project: Project) => void;
  onOpenAtsResume?: () => void;
}

export const BentoGridSection: React.FC<BentoGridSectionProps> = ({
  portfolio,
  onSelectProject,
  onOpenAtsResume,
}) => {
  const profile = portfolio.profile;
  const projects = portfolio.projects || [];
  const cp = portfolio.competitiveProgramming;
  const achievements = portfolio.achievements || [];

  const featuredProject = projects.find((p) => p.featured) || projects[0];
  const totalStars = projects.reduce((acc, p) => acc + (p.githubStats?.stars || 0), 0);
  const totalForks = projects.reduce((acc, p) => acc + (p.githubStats?.forks || 0), 0);

  return (
    <section className="py-12 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-blue-600">
              Overview
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-display mt-1">
              At a Glance.
            </h2>
          </div>
          <p className="text-slate-500 text-sm max-w-md">
            An Apple-inspired editorial matrix highlighting active engineering pursuits, impact metrics, and verified credentials.
          </p>
        </div>

        {/* Bento Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
          
          {/* CARD 1: Featured Project (Spans 2 cols, 2 rows) */}
          <motion.div
            whileHover={{ y: -4, scale: 1.005 }}
            transition={{ duration: 0.2 }}
            className="md:col-span-2 lg:col-span-2 rounded-3xl p-8 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-white border border-blue-200/80 shadow-xl shadow-blue-500/5 relative overflow-hidden flex flex-col justify-between group cursor-pointer"
            onClick={() => featuredProject && onSelectProject?.(featuredProject)}
          >
            {/* Top Accent Pill */}
            <div className="flex items-center justify-between z-10 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold shadow-sm">
                <FolderGit2 className="w-3.5 h-3.5" />
                <span>Featured Engineering Project</span>
              </span>
              <div className="p-2 rounded-full bg-white text-slate-700 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-xs">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>

            {featuredProject ? (
              <div className="space-y-4 z-10">
                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-900/5 border border-slate-200 shadow-inner group-hover:scale-[1.01] transition-transform">
                  <img
                    src={featuredProject.imageUrl || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1000&q=80'}
                    alt={featuredProject.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{featuredProject.title}</h3>
                  <p className="text-slate-600 text-sm line-clamp-2 mt-1">{featuredProject.description}</p>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {featuredProject.techStack.map((tech) => (
                    <span key={tech} className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="z-10 py-12 text-slate-400 font-mono text-sm">No featured project set</div>
            )}
          </motion.div>

          {/* CARD 2: Experience & Seniority (Soft Emerald Gradient) */}
          <motion.div
            whileHover={{ y: -4, scale: 1.005 }}
            transition={{ duration: 0.2 }}
            className="rounded-3xl p-6 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-white border border-emerald-200/80 shadow-xl shadow-emerald-500/5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600">
                <Briefcase className="w-5 h-5" />
              </span>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Experience
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-4xl sm:text-5xl font-black text-slate-900 font-display">
                {profile.yearsExperience || 6}+ <span className="text-xl font-bold text-slate-500">Years</span>
              </div>
              <div className="text-base font-bold text-slate-800">{profile.tagline || 'Senior Systems Engineer'}</div>
              <p className="text-xs text-slate-500">{profile.currentCompany ? `Currently leading frontend architecture at ${profile.currentCompany}.` : 'Building resilient microservices & reactive platforms.'}</p>
            </div>

            <div className="pt-4 mt-4 border-t border-emerald-100 flex items-center gap-2 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Full-Cycle Production Delivery</span>
            </div>
          </motion.div>

          {/* CARD 3: Open Source & GitHub Commits (Soft Purple Gradient) */}
          <motion.div
            whileHover={{ y: -4, scale: 1.005 }}
            transition={{ duration: 0.2 }}
            className="rounded-3xl p-6 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-white border border-purple-200/80 shadow-xl shadow-purple-500/5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600">
                <GitBranch className="w-5 h-5" />
              </span>
              <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                Open Source
              </span>
            </div>

            <div className="space-y-2">
              <div className="text-3xl font-black text-slate-900 font-mono">
                {profile.totalCommits || 3840} <span className="text-xs font-sans text-slate-500 font-semibold">Commits</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1 text-amber-600">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {totalStars} Stars
                </span>
                <span className="text-purple-600">
                  {projects.length} Active Repos
                </span>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-purple-100 text-xs text-slate-500 font-mono">
              github.com/{profile.githubUsername || 'dev'}
            </div>
          </motion.div>

          {/* CARD 4: Competitive Programming (Soft Warm Orange Gradient) */}
          <motion.div
            whileHover={{ y: -4, scale: 1.005 }}
            transition={{ duration: 0.2 }}
            className="rounded-3xl p-6 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-white border border-amber-200/80 shadow-xl shadow-amber-500/5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600">
                <Trophy className="w-5 h-5" />
              </span>
              <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                Algorithms
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-3xl font-black text-slate-900 font-mono">
                {cp?.leetcode?.rating || 1850} <span className="text-xs font-sans font-bold text-amber-600">LeetCode Rating</span>
              </div>
              <div className="text-xs font-semibold text-slate-600">
                {cp?.leetcode?.totalSolved || 420}+ Problems Solved | {cp?.leetcode?.currentStreak || 18} Day Streak
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-amber-100 flex items-center justify-between text-xs font-bold text-amber-800">
              <span>Global Top 5%</span>
              <Flame className="w-4 h-4 text-orange-500" />
            </div>
          </motion.div>

          {/* CARD 5: Tech Stack & Core Mastery (Soft Cyan Gradient) */}
          <motion.div
            whileHover={{ y: -4, scale: 1.005 }}
            transition={{ duration: 0.2 }}
            className="rounded-3xl p-6 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-white border border-cyan-200/80 shadow-xl shadow-cyan-500/5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-600">
                <Code2 className="w-5 h-5" />
              </span>
              <span className="text-xs font-mono font-bold text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded-full border border-cyan-200">
                Core Stack
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {['TypeScript', 'React 18', 'Node.js', 'Next.js', 'Tailwind', 'GraphQL', 'PostgreSQL', 'Docker'].map((skill) => (
                <span key={skill} className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs font-bold shadow-2xs">
                  {skill}
                </span>
              ))}
            </div>

            <div className="pt-4 mt-4 border-t border-cyan-100 text-xs text-slate-500">
              Modern Full-Stack & Systems Engineering
            </div>
          </motion.div>

          {/* CARD 6: Resume & ATS Score (Pure White with Blue Accent) */}
          <motion.div
            whileHover={{ y: -4, scale: 1.005 }}
            transition={{ duration: 0.2 }}
            className="rounded-3xl p-6 bg-white border border-slate-200 shadow-xl shadow-slate-900/5 flex flex-col justify-between cursor-pointer"
            onClick={onOpenAtsResume}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="p-2.5 rounded-2xl bg-blue-50 text-blue-600">
                <FileText className="w-5 h-5" />
              </span>
              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                ATS Score 96%
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900">Verified Resume</h3>
              <p className="text-xs text-slate-500">Optimized for tech recruiters & automated parser audits.</p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 group">
              <span>Preview & Download PDF</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </motion.div>

          {/* CARD 7: Blog / Philosophy (Soft Pink Gradient) */}
          <motion.div
            whileHover={{ y: -4, scale: 1.005 }}
            transition={{ duration: 0.2 }}
            className="rounded-3xl p-6 bg-gradient-to-br from-pink-500/10 via-pink-500/5 to-white border border-pink-200/80 shadow-xl shadow-pink-500/5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="p-2.5 rounded-2xl bg-pink-500/10 text-pink-600">
                <BookOpen className="w-5 h-5" />
              </span>
              <span className="text-xs font-mono font-bold text-pink-700 bg-pink-50 px-2.5 py-1 rounded-full border border-pink-200">
                Writing
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">Engineering Notes</h3>
              <p className="text-xs text-slate-600 line-clamp-2">"Architecting Ultra-Low Latency React Applications in 2026"</p>
            </div>

            <div className="pt-4 mt-4 border-t border-pink-100 text-xs font-bold text-pink-600">
              Read 4 Articles
            </div>
          </motion.div>

          {/* CARD 8: Key Honors & Achievements (Soft Gold / Amber) */}
          <motion.div
            whileHover={{ y: -4, scale: 1.005 }}
            transition={{ duration: 0.2 }}
            className="rounded-3xl p-6 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white border border-amber-200/80 shadow-xl shadow-amber-500/5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600">
                <Award className="w-5 h-5" />
              </span>
              <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                Honors
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-3xl font-black text-slate-900 font-mono">
                {achievements.length || 5} <span className="text-xs font-sans font-bold text-slate-500">Awards</span>
              </div>
              <p className="text-xs text-slate-600">Hackathon winner, published papers, and cloud certifications.</p>
            </div>

            <div className="pt-4 mt-4 border-t border-amber-100 flex items-center justify-between text-xs font-bold text-amber-700">
              <span>Verified Badges</span>
              <Zap className="w-4 h-4 text-amber-500" />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
