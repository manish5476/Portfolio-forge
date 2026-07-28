import React, { useState } from 'react';
import { Layers, Plus, Trash2, ExternalLink, Github, Sparkles, Image as ImageIcon, Star, GitFork, ArrowUpRight, Code2, GripVertical, ChevronUp, ChevronDown, Link as LinkIcon, BookOpen, Figma, Video, Globe } from 'lucide-react';
import { Project, CustomLinkType, ProjectCustomLink } from '../../types';
import { enhanceWithAI } from '../../services/api';
import { CUSTOM_LINK_TYPES, getLinkTypeInfo } from '../../utils/customLinks';

interface ProjectsEditorProps {
  projects: Project[];
  onChange: (projects: Project[]) => void;
  githubUsername?: string;
  onNavigateToGithubTab?: () => void;
}

export const ProjectsEditor: React.FC<ProjectsEditorProps> = ({
  projects,
  onChange,
  githubUsername,
  onNavigateToGithubTab,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const [newLinkType, setNewLinkType] = useState<CustomLinkType>('docs');
  const [newLinkLabel, setNewLinkLabel] = useState('Documentation');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  const handleAddCustomLink = (projId: string) => {
    if (!newLinkUrl.trim()) return;
    const target = projects.find((p) => p.id === projId);
    if (!target) return;

    const newLink: ProjectCustomLink = {
      id: `link_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: newLinkType,
      label: newLinkLabel.trim() || getLinkTypeInfo(newLinkType).defaultLabel,
      url: newLinkUrl.trim(),
    };

    const updatedLinks = [...(target.customLinks || []), newLink];
    handleUpdateProject(projId, 'customLinks', updatedLinks);
    setNewLinkUrl('');
    setNewLinkLabel('Documentation');
    setNewLinkType('docs');
  };

  const handleUpdateCustomLink = (projId: string, linkId: string, field: 'label' | 'url', value: string) => {
    const target = projects.find((p) => p.id === projId);
    if (!target) return;

    const updated = (target.customLinks || []).map((l) =>
      l.id === linkId ? { ...l, [field]: value } : l
    );
    handleUpdateProject(projId, 'customLinks', updated);
  };

  const handleRemoveCustomLink = (projId: string, linkId: string) => {
    const target = projects.find((p) => p.id === projId);
    if (!target) return;

    const updated = (target.customLinks || []).filter((l) => l.id !== linkId);
    handleUpdateProject(projId, 'customLinks', updated);
  };

  const handleAddProject = () => {
    const newProj: Project = {
      id: `proj_manual_${Date.now()}`,
      title: 'New Web Application',
      description: 'A brief overview of key features, engineering decisions, and architecture.',
      source: 'manual',
      techStack: ['React', 'TypeScript', 'Tailwind'],
      hostedUrl: '',
      imageUrl: '',
      repoUrl: '',
    };
    onChange([newProj, ...projects]);
    setEditingId(newProj.id);
  };

  const handleDeleteProject = (id: string) => {
    onChange(projects.filter((p) => p.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const handleUpdateProject = (id: string, key: keyof Project, value: any) => {
    onChange(
      projects.map((p) => (p.id === id ? { ...p, [key]: value } : p))
    );
  };

  const handleMoveProject = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= projects.length) return;
    const updated = [...projects];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    onChange(updated);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    const target = e.target as HTMLElement;
    if (['INPUT', 'TEXTAREA', 'BUTTON', 'A', 'SELECT'].includes(target.tagName)) {
      e.preventDefault();
      return;
    }
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    if (draggedIndex !== targetIndex) {
      handleMoveProject(draggedIndex, targetIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleAddTag = (projId: string) => {
    if (!tagInput.trim()) return;
    const target = projects.find((p) => p.id === projId);
    if (!target) return;

    if (!target.techStack.includes(tagInput.trim())) {
      handleUpdateProject(projId, 'techStack', [...target.techStack, tagInput.trim()]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (projId: string, tag: string) => {
    const target = projects.find((p) => p.id === projId);
    if (!target) return;
    handleUpdateProject(
      projId,
      'techStack',
      target.techStack.filter((t) => t !== tag)
    );
  };

  const handleAiEnhanceProject = async (proj: Project) => {
    setIsEnhancing(true);
    const enhanced = await enhanceWithAI('project', proj.description, proj.title);
    handleUpdateProject(proj.id, 'description', enhanced);
    setIsEnhancing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            Projects & Showcase Manager
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Drag cards or use ▲▼ arrows to reorder projects shown on your portfolio. Manual projects merge automatically with GitHub repos.
          </p>
        </div>
        <button
          onClick={handleAddProject}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-md shadow-cyan-500/20 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Manual Project
        </button>
      </div>

      {/* GitHub Auto-Sync Quick Banner */}
      <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 shrink-0">
            <Github className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>GitHub Repository Auto-Sync</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                @{githubUsername || 'alexrivera'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {projects.filter((p) => p.source === 'github' || p.source === 'merged').length} GitHub repositories active in portfolio showcase.
            </p>
          </div>
        </div>

        {onNavigateToGithubTab && (
          <button
            onClick={onNavigateToGithubTab}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold text-xs rounded-xl border border-slate-700 transition-all cursor-pointer shrink-0"
          >
            <Github className="w-3.5 h-3.5" />
            Manage & Sync Repos
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="p-8 text-center bg-slate-900/50 border border-slate-800 rounded-2xl">
          <Code2 className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <div className="text-sm font-semibold text-slate-300">No projects added yet</div>
          <div className="text-xs text-slate-500 mt-1">Click "Add Manual Project" above or use the GitHub Sync tab to fetch repos.</div>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((proj, index) => {
            const isEditing = editingId === proj.id;
            const isDragging = draggedIndex === index;
            const isOver = dragOverIndex === index && draggedIndex !== index;

            return (
              <div
                key={proj.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`bg-slate-900 border rounded-2xl transition-all overflow-hidden ${
                  isDragging ? 'opacity-40 border-dashed border-cyan-400' : ''
                } ${
                  isOver ? 'border-cyan-400 ring-2 ring-cyan-500/30 bg-slate-800/90' : ''
                } ${
                  isEditing ? 'border-cyan-500/80 ring-1 ring-cyan-500/40' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header Strip */}
                <div
                  onClick={() => setEditingId(isEditing ? null : proj.id)}
                  className="p-4 flex items-center justify-between cursor-pointer select-none bg-slate-900/90 hover:bg-slate-800/80 transition-colors gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Drag handle & Order Controls */}
                    <div
                      className="flex items-center gap-1.5 text-slate-500 hover:text-cyan-400 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="cursor-grab active:cursor-grabbing p-1 hover:bg-slate-800 rounded" title="Drag to reorder">
                        <GripVertical className="w-4 h-4" />
                      </span>
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveProject(index, index - 1)}
                          className="p-0.5 text-slate-500 hover:text-cyan-300 disabled:opacity-20 disabled:hover:text-slate-500 rounded transition-colors"
                          title="Move project up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === projects.length - 1}
                          onClick={() => handleMoveProject(index, index + 1)}
                          className="p-0.5 text-slate-500 hover:text-cyan-300 disabled:opacity-20 disabled:hover:text-slate-500 rounded transition-colors"
                          title="Move project down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-slate-800 overflow-hidden border border-slate-700/80 flex items-center justify-center shrink-0">
                      {proj.imageUrl ? (
                        <img src={proj.imageUrl} alt={proj.title} className="w-full h-full object-cover" />
                      ) : (
                        <Code2 className="w-5 h-5 text-cyan-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-white truncate">{proj.title}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider shrink-0 ${
                          proj.source === 'merged'
                            ? 'bg-purple-950 text-purple-300 border border-purple-800'
                            : proj.source === 'github'
                            ? 'bg-blue-950 text-blue-300 border border-blue-800'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}>
                          {proj.source}
                        </span>
                        {proj.hostedUrl && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-medium shrink-0">
                            Live URL
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{proj.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(proj.id);
                      }}
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <span className="text-slate-500 text-xs font-medium">{isEditing ? '▲ Close' : '▼ Edit'}</span>
                  </div>
                </div>

                {/* Edit Form */}
                {isEditing && (
                  <div className="p-5 border-t border-slate-800/80 space-y-4 bg-slate-950/60">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Project Title</label>
                        <input
                          type="text"
                          value={proj.title}
                          onChange={(e) => handleUpdateProject(proj.id, 'title', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                          <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                          Hosted Live Demo URL (for Live Iframe Preview)
                        </label>
                        <input
                          type="url"
                          value={proj.hostedUrl || ''}
                          onChange={(e) => handleUpdateProject(proj.id, 'hostedUrl', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                          <Github className="w-3.5 h-3.5 text-slate-400" />
                          GitHub Repository URL
                        </label>
                        <input
                          type="url"
                          value={proj.repoUrl || ''}
                          onChange={(e) => handleUpdateProject(proj.id, 'repoUrl', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                          placeholder="https://github.com/username/repo"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                          <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                          Screenshot / Thumbnail Image URL
                        </label>
                        <input
                          type="url"
                          value={proj.imageUrl || ''}
                          onChange={(e) => handleUpdateProject(proj.id, 'imageUrl', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                          placeholder="https://images.unsplash.com/photo-..."
                        />
                      </div>
                    </div>

                    {/* Description + AI Refine */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-300">Description</label>
                        <button
                          type="button"
                          onClick={() => handleAiEnhanceProject(proj)}
                          disabled={isEnhancing}
                          className="flex items-center gap-1 text-[11px] text-cyan-400 font-semibold bg-cyan-950/60 border border-cyan-800 px-2 py-0.5 rounded-lg hover:bg-cyan-900/60"
                        >
                          <Sparkles className="w-3 h-3" />
                          Refine Description
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={proj.description}
                        onChange={(e) => handleUpdateProject(proj.id, 'description', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    {/* Tech & Category Stack Chips Manager */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-300">Category & Tech Stack Tags</label>
                        <span className="text-[10px] text-slate-400">Custom categories e.g. Web3, React, AI</span>
                      </div>

                      {/* Active Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-2.5">
                        {proj.techStack.length > 0 ? (
                          proj.techStack.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-300 shadow-xs"
                            >
                              #{tag}
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(proj.id, tag)}
                                className="text-slate-400 hover:text-red-400 font-bold ml-1 transition-colors"
                                title={`Remove ${tag} tag`}
                              >
                                ×
                              </button>
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500 italic">No category tags assigned yet.</span>
                        )}
                      </div>

                      {/* Quick Add Suggestions */}
                      <div className="mb-2.5">
                        <span className="text-[10px] text-slate-400 font-medium block mb-1">Quick Add Presets:</span>
                        <div className="flex flex-wrap gap-1">
                          {['React', 'TypeScript', 'Web3', 'Full Stack', 'AI/ML', 'Mobile', 'Node.js', 'Tailwind', 'Python', 'Rust'].map((preset) => {
                            const exists = proj.techStack.includes(preset);
                            return (
                              <button
                                key={preset}
                                type="button"
                                disabled={exists}
                                onClick={() => {
                                  if (!exists) {
                                    handleUpdateProject(proj.id, 'techStack', [...proj.techStack, preset]);
                                  }
                                }}
                                className={`text-[10px] font-mono px-2 py-0.5 rounded-md border transition-all ${
                                  exists
                                    ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                                    : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50'
                                }`}
                              >
                                + {preset}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Custom Tag Input */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddTag(proj.id);
                            }
                          }}
                          className="px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 flex-1"
                          placeholder="Type custom category tag (e.g. Web3, Next.js, Cloud) and press Enter"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddTag(proj.id)}
                          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-colors shrink-0"
                        >
                          Add Tag
                        </button>
                      </div>
                    </div>

                    {/* Custom Project Links Manager */}
                    <div className="pt-3 border-t border-slate-800/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                          <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />
                          Custom Project Links (Documentation, Figma, Video, etc.)
                        </label>
                        <span className="text-[10px] text-slate-400">Rendered as interactive icons in Showcase</span>
                      </div>

                      {/* Active Custom Links */}
                      <div className="space-y-2">
                        {proj.customLinks && proj.customLinks.length > 0 ? (
                          proj.customLinks.map((link) => {
                            const typeInfo = getLinkTypeInfo(link.type);
                            const Icon = typeInfo.icon;
                            return (
                              <div key={link.id} className="flex items-center gap-2 p-2 bg-slate-900 border border-slate-800 rounded-xl">
                                <div className="p-1.5 rounded-lg bg-slate-800 text-cyan-400 shrink-0" title={typeInfo.label}>
                                  <Icon className="w-3.5 h-3.5" />
                                </div>
                                <input
                                  type="text"
                                  value={link.label}
                                  onChange={(e) => handleUpdateCustomLink(proj.id, link.id, 'label', e.target.value)}
                                  className="w-36 px-2.5 py-1 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                                  placeholder="Link Label"
                                />
                                <input
                                  type="url"
                                  value={link.url}
                                  onChange={(e) => handleUpdateCustomLink(proj.id, link.id, 'url', e.target.value)}
                                  className="flex-1 px-2.5 py-1 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                                  placeholder="https://..."
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCustomLink(proj.id, link.id)}
                                  className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                                  title="Remove link"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-xs text-slate-500 italic p-2 bg-slate-900/40 border border-slate-800/60 rounded-xl">
                            No custom links added yet. Choose a type below to add Documentation, Figma, Demo Video, or Custom links.
                          </div>
                        )}
                      </div>

                      {/* Add New Custom Link Form */}
                      <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2.5">
                        <div className="text-[11px] font-bold text-slate-300">Add New Custom Resource Link</div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-1">Link Type</label>
                            <select
                              value={newLinkType}
                              onChange={(e) => {
                                const val = e.target.value as CustomLinkType;
                                setNewLinkType(val);
                                const info = getLinkTypeInfo(val);
                                setNewLinkLabel(info.defaultLabel);
                              }}
                              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                            >
                              {CUSTOM_LINK_TYPES.map((t) => (
                                <option key={t.type} value={t.type}>
                                  {t.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-400 mb-1">Display Label</label>
                            <input
                              type="text"
                              value={newLinkLabel}
                              onChange={(e) => setNewLinkLabel(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                              placeholder="e.g. Figma Design"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-400 mb-1">Target URL</label>
                            <input
                              type="url"
                              value={newLinkUrl}
                              onChange={(e) => setNewLinkUrl(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                              placeholder="https://..."
                            />
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleAddCustomLink(proj.id)}
                            disabled={!newLinkUrl.trim()}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 disabled:opacity-40 font-semibold text-xs rounded-lg transition-all cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add Custom Link
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
