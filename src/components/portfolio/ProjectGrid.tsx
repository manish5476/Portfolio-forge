import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layers, Star, GitFork, ExternalLink, Github, Filter, Code2, Sparkles, ArrowUpRight, Clock, GitCommit, Zap } from 'lucide-react';
import { Project } from '../../types';
import { getAllProjectLinks, getLinkTypeInfo } from '../../utils/customLinks';

interface ProjectGridProps {
  projects: Project[];
  accentColor?: string;
  onSelectProject: (project: Project) => void;
  isLight?: boolean;
  showCommitTimestamp?: boolean;
}

// Tech tag color map
const TECH_COLOR_MAP: Record<string, string> = {
  react: 'bg-cyan-950/80 text-cyan-300 border-cyan-800/80',
  typescript: 'bg-blue-950/80 text-blue-300 border-blue-800/80',
  javascript: 'bg-amber-950/80 text-amber-300 border-amber-800/80',
  python: 'bg-sky-950/80 text-sky-300 border-sky-800/80',
  go: 'bg-teal-950/80 text-teal-300 border-teal-800/80',
  rust: 'bg-orange-950/80 text-orange-300 border-orange-800/80',
  tailwind: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80',
  'node.js': 'bg-green-950/80 text-green-300 border-green-800/80',
  webgl: 'bg-purple-950/80 text-purple-300 border-purple-800/80',
  docker: 'bg-indigo-950/80 text-indigo-300 border-indigo-800/80',
};

// Language placeholder gradient generator
function getLanguageGradient(lang: string = ''): string {
  const l = lang.toLowerCase();
  if (l.includes('script') || l.includes('ts') || l.includes('js')) {
    return 'from-cyan-950 via-blue-950 to-slate-950';
  }
  if (l.includes('py') || l.includes('ai')) {
    return 'from-sky-950 via-indigo-950 to-slate-950';
  }
  if (l.includes('go') || l.includes('rust')) {
    return 'from-teal-950 via-emerald-950 to-slate-950';
  }
  return 'from-purple-950 via-slate-950 to-slate-950';
}

export const ProjectGrid: React.FC<ProjectGridProps> = ({
  projects,
  accentColor = '#06b6d4',
  onSelectProject,
  isLight,
  showCommitTimestamp = true,
}) => {
  const [filter, setFilter] = useState<string>('all');

  // Extract unique filter tags dynamically
  const allTags = Array.from(
    new Set(projects.flatMap((p) => p.techStack).filter(Boolean))
  ).sort();

  const filteredProjects = projects.filter((p) => {
    if (filter === 'all') return true;
    if (filter === 'github') return p.source === 'github' || p.source === 'merged' || p.repoUrl;
    if (filter === 'live') return Boolean(p.hostedUrl);
    return p.techStack.map((t) => t.toLowerCase()).includes(filter.toLowerCase());
  });

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
      
      {/* Header & Filter Controls Glass Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5 }}
        className="p-6 rounded-3xl bg-slate-900/40 backdrop-blur-2xl border border-white/10 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-xl font-bold tracking-tight font-display flex items-center gap-2 text-white">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>Projects & Web3 Repositories</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Select any project card for details, live interactive preview, and GitHub source.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              filter === 'all'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All ({projects.length})
          </button>

          <button
            onClick={() => setFilter('live')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              filter === 'live'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Live Web Apps
          </button>

          <button
            onClick={() => setFilter('github')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              filter === 'github'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            GitHub Repos
          </button>

          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setFilter(tag)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono border transition-all cursor-pointer ${
                filter === tag
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Cards Grid with Framer Motion AnimatePresence */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((project, index) => {
            const primaryLang = project.githubStats?.language || project.techStack[0] || 'Code';
            const allLinks = getAllProjectLinks(project);

            return (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                whileHover={{ y: -6 }}
                onClick={() => onSelectProject(project)}
                className="group rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/10 hover:border-cyan-500/50 shadow-2xl hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden relative"
              >
                {/* Thumbnail / Language Placeholder */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                  {project.imageUrl ? (
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${getLanguageGradient(primaryLang)} p-6 flex flex-col justify-between relative border-b border-slate-800/80`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-cyan-300 px-3 py-1 rounded-xl bg-slate-950/90 border border-cyan-500/30">
                          {primaryLang}
                        </span>
                        <Code2 className="w-8 h-8 text-cyan-400/30" />
                      </div>
                      <div className="font-mono text-xl font-black text-white/90 tracking-wider">
                        &lt;{project.title.substring(0, 16)} /&gt;
                      </div>
                    </div>
                  )}

                  {/* Badges Overlay */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    {project.hostedUrl && (
                      <span className="px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 font-bold text-[10px] backdrop-blur-md shadow-lg flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Live App
                      </span>
                    )}
                    {project.source === 'merged' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-950/90 border border-purple-500/50 text-purple-300 font-bold text-[10px] backdrop-blur-md">
                        Merged
                      </span>
                    )}
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-extrabold text-lg text-white group-hover:text-cyan-300 transition-colors line-clamp-1 font-display">
                        {project.title}
                      </h3>
                      <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors shrink-0" />
                    </div>

                    <p className="text-xs line-clamp-2 mt-2 leading-relaxed font-sans text-slate-400">
                      {project.description}
                    </p>
                  </div>

                  {/* Tech Stack Chips */}
                  <div className="space-y-3 pt-2">
                    <div className="flex flex-wrap gap-1.5">
                      {project.techStack.map((tech) => {
                        const lower = tech.toLowerCase();
                        const styleClass = TECH_COLOR_MAP[lower] || 'bg-slate-800/90 text-slate-300 border-slate-700/80';
                        return (
                          <button
                            key={tech}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFilter(tech);
                            }}
                            className={`text-[10px] font-mono px-2.5 py-0.5 rounded-md border font-semibold hover:opacity-80 transition-opacity cursor-pointer ${styleClass}`}
                            title={`Filter by #${tech}`}
                          >
                            #{tech}
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Links Bar */}
                    {allLinks.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80">
                        {allLinks.map((link) => {
                          const info = getLinkTypeInfo(link.type);
                          const Icon = info.icon;
                          return (
                            <a
                              key={link.id}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-white text-[11px] font-semibold transition-all hover:scale-105"
                            >
                              <Icon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                              <span className="truncate max-w-[110px]">{link.label}</span>
                            </a>
                          );
                        })}
                      </div>
                    )}

                    {/* GitHub Repo Stats Bar */}
                    {project.githubStats && (
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                        <div className="flex items-center gap-3 font-mono">
                          <span className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
                            {project.githubStats.stars}
                          </span>
                          <span className="flex items-center gap-1">
                            <GitFork className="w-3.5 h-3.5 text-blue-400" />
                            {project.githubStats.forks}
                          </span>
                        </div>

                        {showCommitTimestamp && (
                          <span className="text-[10px] font-mono flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-950/80 border border-slate-800 text-cyan-300" title="Latest Commit">
                            <GitCommit className="w-3 h-3 text-cyan-400 shrink-0" />
                            <span>
                              {new Date(project.githubStats.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {filteredProjects.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800 backdrop-blur-xl"
        >
          <Filter className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <div className="text-sm font-semibold text-slate-300">No projects match the selected filter</div>
          <button
            onClick={() => setFilter('all')}
            className="mt-3 text-xs text-cyan-400 hover:underline font-bold cursor-pointer"
          >
            Reset Filters
          </button>
        </motion.div>
      )}
    </div>
  );
};

