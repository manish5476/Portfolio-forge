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

export const AchievementsSection: React.FC<AchievementsSectionProps> = ({ achievements, isLight }) => {
  if (!achievements || achievements.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5 }}
      className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
    >
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-5 h-5 text-cyan-400" />
        <h2 className="text-xl font-bold tracking-tight font-display text-white">
          Highlights & Key Milestones
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              className="p-5 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/10 hover:border-cyan-500/50 shadow-xl transition-all group relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-950 border border-cyan-500/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                  <IconComp className="w-5 h-5 text-cyan-400" />
                </div>
                <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-cyan-300">
                  {ach.date}
                </span>
              </div>

              <h3 className="font-extrabold text-base text-white group-hover:text-cyan-300 transition-colors">
                {ach.title}
              </h3>
              <p className="text-xs leading-relaxed mt-1.5 text-slate-400">
                {ach.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

