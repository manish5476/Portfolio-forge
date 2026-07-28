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
    <section id="projects" className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
      
      {/* Header & Filter Controls Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200/80 pb-6"
      >
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-blue-600">
            Portfolio Showcase
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-display mt-1">
            Featured Craft.
          </h2>
          <p className="text-slate-500 text-sm mt-1 max-w-xl">
            Selected applications, open-source repositories, and high-performance interactive modules.
          </p>
        </div>

        {/* Filter Pills with Horizontal Touch Scrolling on Mobile */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar touch-scrolling pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`min-h-[44px] px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              filter === 'all'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            All ({projects.length})
          </button>

          <button
            onClick={() => setFilter('live')}
            className={`min-h-[44px] px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              filter === 'live'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Live Web Apps
          </button>

          <button
            onClick={() => setFilter('github')}
            className={`min-h-[44px] px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              filter === 'github'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            GitHub Repos
          </button>

          {allTags.slice(0, 5).map((tag) => (
            <button
              key={tag}
              onClick={() => setFilter(tag)}
              className={`min-h-[44px] px-3.5 py-2 rounded-full text-xs font-mono border transition-all shrink-0 cursor-pointer ${
                filter === tag
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Cards Grid with Framer Motion AnimatePresence */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ y: -6 }}
                onClick={() => onSelectProject(project)}
                className="group rounded-3xl bg-white border border-slate-200/80 hover:border-blue-300 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden relative"
              >
                {/* Thumbnail / Media Container */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-100 border-b border-slate-100">
                  {project.imageUrl ? (
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-100 via-blue-50/50 to-indigo-50 p-6 flex flex-col justify-between relative">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-blue-700 px-3 py-1 rounded-full bg-white border border-blue-200 shadow-2xs">
                          {primaryLang}
                        </span>
                        <Code2 className="w-8 h-8 text-blue-400/40" />
                      </div>
                      <div className="font-mono text-xl font-black text-slate-800 tracking-wider">
                        &lt;{project.title.substring(0, 16)} /&gt;
                      </div>
                    </div>
                  )}

                  {/* Badges Overlay */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    {project.hostedUrl && (
                      <span className="px-3 py-1 rounded-full bg-emerald-500 text-white font-bold text-[10px] shadow-sm flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        Live Demo
                      </span>
                    )}
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-black text-xl text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 font-display">
                        {project.title}
                      </h3>
                      <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                    </div>

                    <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  {/* Tech Stack Chips */}
                  <div className="space-y-3 pt-2">
                    <div className="flex flex-wrap gap-1.5">
                      {project.techStack.map((tech) => (
                        <button
                          key={tech}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFilter(tech);
                          }}
                          className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors cursor-pointer"
                        >
                          #{tech}
                        </button>
                      ))}
                    </div>

                    {/* Custom Links Bar */}
                    {allLinks.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
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
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-semibold transition-all hover:scale-105"
                            >
                              <Icon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span className="truncate max-w-[110px]">{link.label}</span>
                            </a>
                          );
                        })}
                      </div>
                    )}

                    {/* GitHub Repo Stats Bar */}
                    {project.githubStats && (
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-amber-600 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            {project.githubStats.stars}
                          </span>
                          <span className="flex items-center gap-1">
                            <GitFork className="w-3.5 h-3.5" />
                            {project.githubStats.forks}
                          </span>
                        </div>

                        {showCommitTimestamp && (
                          <span className="text-[10px] flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600">
                            <GitCommit className="w-3 h-3 text-blue-600 shrink-0" />
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
          className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm"
        >
          <Filter className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <div className="text-sm font-semibold text-slate-700">No projects match the selected filter</div>
          <button
            onClick={() => setFilter('all')}
            className="mt-3 text-xs text-blue-600 hover:underline font-bold cursor-pointer"
          >
            Reset Filters
          </button>
        </motion.div>
      )}
    </section>
  );
};

