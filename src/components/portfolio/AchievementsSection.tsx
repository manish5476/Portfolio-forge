import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Star, Award, Zap, Code, Briefcase, GraduationCap, Globe, Sparkles } from 'lucide-react';
import { Achievement } from '../../types';

interface AchievementsSectionProps {
  achievements: Achievement[];
  accentColor?: string;
  isLight?: boolean;
}

const ICON_MAP: Record<Achievement['icon'], React.FC<{ className?: string }>> = {
  trophy: Trophy,
  award: Award,
  star: Star,
  zap: Zap,
  code: Code,
  briefcase: Briefcase,
  'graduation-cap': GraduationCap,
  globe: Globe,
};

export const AchievementsSection: React.FC<AchievementsSectionProps> = ({ achievements }) => {
  if (!achievements || achievements.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5 }}
      className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
    >
      <div className="mb-6 border-b border-slate-200/80 pb-6">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-blue-600">
          Recognition & Honors
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-display mt-1">
          Highlights & Key Milestones.
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {achievements.map((ach, index) => {
          const IconComp = ICON_MAP[ach.icon] || Trophy;

          return (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className="p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-blue-300 shadow-md hover:shadow-xl transition-all group relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-2xs">
                  <IconComp className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-slate-700">
                  {ach.date}
                </span>
              </div>

              <h3 className="font-black text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
                {ach.title}
              </h3>
              <p className="text-xs leading-relaxed mt-2 text-slate-600">
                {ach.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
};

