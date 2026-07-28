import React from 'react';
import { X, ExternalLink, Github, Star, GitFork, Monitor, Calendar, Code2, Sparkles, ArrowRight } from 'lucide-react';
import { Project } from '../../types';
import { getAllProjectLinks, getLinkTypeInfo } from '../../utils/customLinks';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
  onViewLive: (project: Project) => void;
  accentColor?: string;
  isLight?: boolean;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  project,
  onClose,
  onViewLive,
  accentColor = '#06b6d4',
  isLight,
}) => {
  if (!project) return null;

  const allLinks = getAllProjectLinks(project);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200 ${
      isLight ? 'bg-slate-900/40' : 'bg-slate-950/80'
    }`}>
      <div className={`border rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden relative space-y-0 max-h-[90vh] overflow-y-auto ${
        isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-200'
      }`}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 z-20 p-2 rounded-full border backdrop-blur-md transition-all ${
            isLight
              ? 'bg-white/80 hover:bg-slate-100 text-slate-700 border-slate-200'
              : 'bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Image or Visual Header */}
        <div className="relative h-56 w-full bg-slate-950">
          {project.imageUrl ? (
            <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-cyan-950 via-slate-900 to-slate-950 p-6 flex flex-col justify-end">
              <Code2 className="w-12 h-12 text-cyan-400/40 mb-2" />
              <div className="font-mono text-2xl font-black text-white">&lt;{project.title} /&gt;</div>
            </div>
          )}
          <div className={`absolute inset-0 bg-gradient-to-t ${isLight ? 'from-white' : 'from-slate-900'} via-transparent to-transparent`} />
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono font-semibold uppercase px-2.5 py-0.5 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800">
                {project.source} project
              </span>
              {project.githubStats && (
                <span className={`text-[11px] font-mono flex items-center gap-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" /> {project.githubStats.stars}</span>
                  <span className="flex items-center gap-1"><GitFork className="w-3.5 h-3.5 text-blue-500" /> {project.githubStats.forks}</span>
                </span>
              )}
            </div>

            <h2 className={`text-2xl font-extrabold font-display ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {project.title}
            </h2>
          </div>

          <p className={`text-sm leading-relaxed font-sans ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
            {project.description}
          </p>

          {/* Tech Stack Chips */}
          <div>
            <div className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Technologies Used</div>
            <div className="flex flex-wrap gap-1.5">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className={`px-3 py-1 rounded-lg border text-xs font-mono font-medium ${
                    isLight ? 'bg-slate-100 border-slate-200 text-slate-800' : 'bg-slate-800 border-slate-700 text-cyan-300'
                  }`}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Custom Resource Links Section */}
          {allLinks.length > 0 && (
            <div>
              <div className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Project Links & Resources
              </div>
              <div className="flex flex-wrap gap-2">
                {allLinks.map((link) => {
                  const info = getLinkTypeInfo(link.type);
                  const Icon = info.icon;
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all hover:scale-105 ${
                        link.type === 'figma'
                          ? isLight ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' : 'bg-purple-950/80 text-purple-300 border-purple-800 hover:bg-purple-900'
                          : link.type === 'docs'
                          ? isLight ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' : 'bg-blue-950/80 text-blue-300 border-blue-800 hover:bg-blue-900'
                          : link.type === 'video'
                          ? isLight ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' : 'bg-rose-950/80 text-rose-300 border-rose-800 hover:bg-rose-900'
                          : isLight ? 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200' : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{link.label}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400 ml-1" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions Bar */}
          <div className={`pt-4 border-t flex flex-col sm:flex-row gap-3 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
            {project.hostedUrl && (
              <button
                onClick={() => onViewLive(project)}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-2xl font-bold text-xs text-slate-950 transition-all shadow-xl hover:brightness-110"
                style={{ backgroundColor: accentColor }}
              >
                <Monitor className="w-4 h-4" />
                <span>Dock & View Live Interactive Site</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            )}

            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 py-3 px-5 rounded-2xl font-bold text-xs border transition-all ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-200 border-slate-800'
                }`}
              >
                <Github className="w-4 h-4" />
                <span>View Source</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
