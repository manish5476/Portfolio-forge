import React from 'react';
import { Trophy, Plus, Trash2, Star, Award, Zap, Code, Briefcase, GraduationCap, Globe } from 'lucide-react';
import { Achievement } from '../../types';
import { triggerConfetti } from '../../utils/confetti';

interface AchievementsEditorProps {
  achievements: Achievement[];
  onChange: (achievements: Achievement[]) => void;
}

const ICON_OPTIONS: { type: Achievement['icon']; label: string; icon: React.FC<{ className?: string }> }[] = [
  { type: 'trophy', label: 'Trophy', icon: Trophy },
  { type: 'award', label: 'Award', icon: Award },
  { type: 'star', label: 'Star', icon: Star },
  { type: 'zap', label: 'Zap / Keynote', icon: Zap },
  { type: 'code', label: 'Code / Open Source', icon: Code },
  { type: 'briefcase', label: 'Briefcase / Career', icon: Briefcase },
  { type: 'graduation-cap', label: 'Education / Cert', icon: GraduationCap },
  { type: 'globe', label: 'Global / Community', icon: Globe },
];

export const AchievementsEditor: React.FC<AchievementsEditorProps> = ({ achievements, onChange }) => {
  const handleAdd = () => {
    const newAch: Achievement = {
      id: `ach_${Date.now()}`,
      title: 'New Achievement / Award',
      description: 'Brief description of the milestone, award, or certification.',
      date: new Date().getFullYear().toString(),
      icon: 'trophy',
    };
    onChange([newAch, ...achievements]);
    triggerConfetti('milestone');
  };

  const handleDelete = (id: string) => {
    onChange(achievements.filter((a) => a.id !== id));
  };

  const handleUpdate = (id: string, key: keyof Achievement, value: any) => {
    onChange(achievements.map((a) => (a.id === id ? { ...a, [key]: value } : a)));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-cyan-400" />
            Achievements & Milestones
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Display awards, speaking engagements, certifications, or career highlights in a horizontal timeline.
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-md shadow-cyan-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Highlight
        </button>
      </div>

      <div className="space-y-4">
        {achievements.map((ach) => (
          <div key={ach.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Title / Award</label>
                  <input
                    type="text"
                    value={ach.title}
                    onChange={(e) => handleUpdate(ach.id, 'title', e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Date / Year</label>
                  <input
                    type="text"
                    value={ach.date}
                    onChange={(e) => handleUpdate(ach.id, 'date', e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                    placeholder="e.g. Oct 2025"
                  />
                </div>
              </div>

              <button
                onClick={() => handleDelete(ach.id)}
                className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Description</label>
              <input
                type="text"
                value={ach.description}
                onChange={(e) => handleUpdate(ach.id, 'description', e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Icon Picker */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">Icon Category</label>
              <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map((opt) => {
                  const IconComp = opt.icon;
                  const isSel = ach.icon === opt.type;
                  return (
                    <button
                      key={opt.type}
                      type="button"
                      onClick={() => handleUpdate(ach.id, 'icon', opt.type)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                        isSel
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/80'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}

        {achievements.length === 0 && (
          <div className="p-6 text-center text-xs text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
            No highlights added yet. Click "Add Highlight" above.
          </div>
        )}
      </div>
    </div>
  );
};
