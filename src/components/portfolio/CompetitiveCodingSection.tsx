import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Code2,
  Terminal,
  Trophy,
  Award,
  Flame,
  Zap,
  Star,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  BarChart2,
  Edit3,
  RefreshCw,
  X,
  Check,
  Target,
  Activity,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { PortfolioData } from '../../types';
import { fetchLeetCodeStats } from '../../services/api';
import { ChartSvgDefs, CustomChartTooltip } from '../charts/CustomRecharts';

interface CompetitiveCodingSectionProps {
  portfolio: PortfolioData;
  onUpdatePortfolio?: (updated: PortfolioData) => void;
}

export const CompetitiveCodingSection: React.FC<CompetitiveCodingSectionProps> = ({
  portfolio,
  onUpdatePortfolio,
}) => {
  const cp = portfolio.competitiveProgramming || {};
  const leetcode = cp.leetcode;
  const codeforces = cp.codeforces;
  const codechef = cp.codechef;
  const badges = cp.badges || [];

  const [isEditingLeetcode, setIsEditingLeetcode] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Form states
  const [editUsername, setEditUsername] = useState(leetcode?.username || '');
  const [editRating, setEditRating] = useState(leetcode?.rating || 1850);
  const [editStreak, setEditStreak] = useState(leetcode?.currentStreak || 45);
  const [editRank, setEditRank] = useState(leetcode?.globalRanking || 12400);
  const [editTotal, setEditTotal] = useState(leetcode?.totalSolved || 520);
  const [editEasy, setEditEasy] = useState(leetcode?.easySolved || 180);
  const [editMedium, setEditMedium] = useState(leetcode?.mediumSolved || 260);
  const [editHard, setEditHard] = useState(leetcode?.hardSolved || 80);

  const handleOpenEdit = () => {
    if (!leetcode) return;
    setEditUsername(leetcode.username || '');
    setEditRating(leetcode.rating || 1850);
    setEditStreak(leetcode.currentStreak || 45);
    setEditRank(leetcode.globalRanking || 12400);
    setEditTotal(leetcode.totalSolved || 520);
    setEditEasy(leetcode.easySolved || 180);
    setEditMedium(leetcode.mediumSolved || 260);
    setEditHard(leetcode.hardSolved || 80);
    setIsEditingLeetcode(true);
  };

  const handleFetchLive = async () => {
    if (!editUsername) return;
    setIsSyncing(true);
    const live = await fetchLeetCodeStats(editUsername);
    if (live) {
      setEditUsername(live.username || editUsername);
      setEditRating(live.rating ?? editRating);
      setEditRank(live.globalRanking ?? editRank);
      setEditTotal(live.totalSolved ?? editTotal);
      setEditEasy(live.easySolved ?? editEasy);
      setEditMedium(live.mediumSolved ?? editMedium);
      setEditHard(live.hardSolved ?? editHard);
      setEditStreak(live.currentStreak ?? editStreak);
    }
    setIsSyncing(false);
  };

  const handleSaveLeetcode = () => {
    if (!onUpdatePortfolio) return;
    const updated: PortfolioData = {
      ...portfolio,
      competitiveProgramming: {
        ...portfolio.competitiveProgramming,
        leetcode: {
          username: editUsername,
          rating: Number(editRating),
          globalRanking: Number(editRank),
          totalSolved: Number(editTotal),
          easySolved: Number(editEasy),
          mediumSolved: Number(editMedium),
          hardSolved: Number(editHard),
          currentStreak: Number(editStreak),
          contestHistory: leetcode?.contestHistory || [],
        },
      },
    };
    onUpdatePortfolio(updated);
    setIsEditingLeetcode(false);
  };

  // LeetCode Contest Rating History Data
  const leetcodeRatingHistory = [
    { contest: 'Q120', rating: 1520 },
    { contest: 'Q124', rating: 1580 },
    { contest: 'W340', rating: 1640 },
    { contest: 'Q128', rating: 1610 },
    { contest: 'W348', rating: 1720 },
    { contest: 'Q132', rating: 1780 },
    { contest: 'W355', rating: 1820 },
    { contest: 'Q138', rating: 1850 },
  ];

  // LeetCode Difficulty Breakdown Data
  const difficultyData = [
    { name: 'Easy', count: leetcode?.easySolved || 180, fill: 'url(#emeraldGrad)', color: '#059669' },
    { name: 'Medium', count: leetcode?.mediumSolved || 260, fill: 'url(#orangeGrad)', color: '#EA580C' },
    { name: 'Hard', count: leetcode?.hardSolved || 80, fill: 'url(#roseGrad)', color: '#E11D48' },
  ];

  // Codeforces Rating History Data
  const codeforcesRatingHistory = [
    { round: 'R820', rating: 1350 },
    { round: 'R835', rating: 1420 },
    { round: 'R845', rating: 1490 },
    { round: 'R860', rating: 1560 },
    { round: 'R880', rating: 1630 },
    { round: 'R895', rating: 1680 },
    { round: 'R910', rating: 1720 },
  ];

  // Algorithmic Skill Radar Data
  const skillRadarData = [
    { subject: 'Dynamic Prog.', score: 88, fullMark: 100 },
    { subject: 'Graphs & Trees', score: 92, fullMark: 100 },
    { subject: 'Data Structures', score: 95, fullMark: 100 },
    { subject: 'Algorithms', score: 90, fullMark: 100 },
    { subject: 'Math & Logic', score: 82, fullMark: 100 },
    { subject: 'System Design', score: 85, fullMark: 100 },
  ];

  if (!leetcode && !codeforces && !codechef && badges.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5 }}
      className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-slate-900 space-y-8"
    >
      <ChartSvgDefs />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E7EAF0] pb-6">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-600">
            Algorithmic Benchmarks & Badges
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-display mt-1 flex items-center gap-3">
            Competitive Coding Insights.
            <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-200 shadow-2xs">
              Verified Profiles
            </span>
          </h2>
          <p className="text-slate-500 text-sm mt-1 max-w-xl leading-relaxed">
            Contest rating growth curves, difficulty distribution breakdown, and verified algorithmic skill radars across LeetCode and Codeforces.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LeetCode Card (2 cols wide on desktop) */}
        {leetcode && (
          <div className="lg:col-span-2 p-6 rounded-[28px] bg-white border border-[#E7EAF0] shadow-apple space-y-6">
            
            {/* Top LeetCode Header */}
            <div className="flex items-center justify-between border-b border-[#E7EAF0] pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 shadow-2xs">
                  <Code2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-xl text-slate-900 font-display">LeetCode Analytics</h3>
                    {onUpdatePortfolio && (
                      <button
                        onClick={handleOpenEdit}
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-700 border border-slate-200 transition-colors cursor-pointer"
                        title="Edit or sync LeetCode stats"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <a
                    href={`https://leetcode.com/${leetcode.username}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-amber-600 hover:underline font-mono font-bold"
                  >
                    @{leetcode.username}
                  </a>
                </div>
              </div>

              <div className="text-right">
                <div className="text-3xl font-black font-mono text-amber-600">{leetcode.rating}</div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Contest Rating</div>
              </div>
            </div>

            {/* Quick Stat Pill Widgets */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-[#E7EAF0] flex items-center gap-3">
                <Flame className="w-5 h-5 text-orange-500 shrink-0" />
                <div>
                  <div className="text-sm font-black text-slate-900 font-mono">{leetcode.currentStreak} Days</div>
                  <div className="text-[10px] text-slate-500">Active Streak</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-[#E7EAF0] flex items-center gap-3">
                <Trophy className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <div className="text-sm font-black text-slate-900 font-mono">Top {(100 - (leetcode.globalRanking / 200000 * 100)).toFixed(1)}%</div>
                  <div className="text-[10px] text-slate-500">Global Rank #{leetcode.globalRanking.toLocaleString()}</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-[#E7EAF0] flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                <div>
                  <div className="text-sm font-black text-slate-900 font-mono">{leetcode.totalSolved}</div>
                  <div className="text-[10px] text-slate-500">Problems Solved</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-[#E7EAF0] flex items-center gap-3">
                <Zap className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="text-sm font-black text-slate-900 font-mono">Knight</div>
                  <div className="text-[10px] text-slate-500">Contest Badge</div>
                </div>
              </div>
            </div>

            {/* Charts sub-grid inside LeetCode Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              
              {/* Rating History Line/Area Chart */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-[#E7EAF0] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-amber-600" />
                    Contest Rating History
                  </h4>
                  <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100/60 px-2.5 py-0.5 rounded-full">
                    Peak {leetcode.rating}
                  </span>
                </div>

                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={leetcodeRatingHistory} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
                      <XAxis
                        dataKey="contest"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        domain={['dataMin - 50', 'dataMax + 50']}
                        tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }}
                      />
                      <Tooltip content={<CustomChartTooltip unit="pts" />} />
                      <Area
                        type="monotone"
                        dataKey="rating"
                        name="Contest Rating"
                        stroke="#D97706"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#amberAreaGrad)"
                        activeDot={{ r: 6, stroke: '#FFFFFF', strokeWidth: 2, fill: '#D97706' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Problem Difficulty Donut Chart */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-[#E7EAF0] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display flex items-center gap-1.5">
                    <BarChart2 className="w-4 h-4 text-indigo-600" />
                    Difficulty Breakdown
                  </h4>
                  <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-100/60 px-2.5 py-0.5 rounded-full">
                    {leetcode.totalSolved} Solved
                  </span>
                </div>

                <div className="h-36 w-full relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={difficultyData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={62}
                        paddingAngle={5}
                        dataKey="count"
                      >
                        {difficultyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} stroke="#FFFFFF" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomChartTooltip unit="problems" />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xl font-black font-mono text-slate-900">{leetcode.totalSolved}</span>
                    <span className="text-[9px] uppercase font-bold text-slate-400">Total</span>
                  </div>
                </div>

                {/* Difficulty Legend */}
                <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
                  <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="text-[10px] font-bold text-emerald-800 uppercase">Easy</div>
                    <div className="font-mono font-black text-emerald-700">{leetcode.easySolved}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-orange-50 border border-orange-200">
                    <div className="text-[10px] font-bold text-orange-800 uppercase">Medium</div>
                    <div className="font-mono font-black text-orange-700">{leetcode.mediumSolved}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-rose-50 border border-rose-200">
                    <div className="text-[10px] font-bold text-rose-800 uppercase">Hard</div>
                    <div className="font-mono font-black text-rose-700">{leetcode.hardSolved}</div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Right Sidebar: Algorithmic Skill Radar Chart + Codeforces */}
        <div className="space-y-6">
          
          {/* Skill Radar Chart */}
          <div className="p-6 rounded-[28px] bg-white border border-[#E7EAF0] shadow-apple space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7EAF0] pb-3">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2 font-display">
                <Target className="w-5 h-5 text-indigo-600" />
                <span>Algorithmic Skill Radar</span>
              </h3>
              <span className="text-xs font-mono text-indigo-700 bg-indigo-50 font-bold px-2.5 py-0.5 rounded-full border border-indigo-200">
                Top 5%
              </span>
            </div>

            <div className="h-60 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={skillRadarData}>
                  <PolarGrid stroke="#E2E8F0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94A3B8', fontSize: 9 }} />
                  <Radar
                    name="Skill Matrix"
                    dataKey="score"
                    stroke="#4F46E5"
                    strokeWidth={2.5}
                    fill="url(#indigoAreaGrad)"
                    fillOpacity={0.6}
                  />
                  <Tooltip content={<CustomChartTooltip unit="pts" />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Codeforces Profile Card */}
          {codeforces && (
            <div className="p-6 rounded-[28px] bg-white border border-[#E7EAF0] shadow-apple space-y-4">
              <div className="flex items-center justify-between border-b border-[#E7EAF0] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900 font-display">Codeforces</h3>
                    <a
                      href={`https://codeforces.com/profile/${codeforces.username}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-600 hover:underline font-mono font-bold"
                    >
                      @{codeforces.username}
                    </a>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black font-mono text-blue-600">{codeforces.rating}</div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">{codeforces.maxRank || 'Specialist'}</div>
                </div>
              </div>

              {/* Codeforces Rating Chart */}
              <div className="h-36 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={codeforcesRatingHistory} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
                    <XAxis dataKey="round" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 10 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 10 }} />
                    <Tooltip content={<CustomChartTooltip unit="rating" />} />
                    <Line
                      type="monotone"
                      dataKey="rating"
                      name="CF Rating"
                      stroke="#2563EB"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#2563EB', stroke: '#FFFFFF', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Badges List */}
          {badges.length > 0 && (
            <div className="p-6 rounded-[28px] bg-white border border-[#E7EAF0] shadow-apple space-y-3">
              <div className="flex items-center justify-between border-b border-[#E7EAF0] pb-2">
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2 font-display">
                  <Award className="w-5 h-5 text-indigo-600" />
                  <span>Verified Platform Badges</span>
                </h3>
              </div>

              <div className="space-y-2">
                {badges.map((badge, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-[#E7EAF0] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">{badge.title}</div>
                      <div className="text-[10px] font-mono text-indigo-600 font-bold">{badge.platform} • Issued {badge.date || '2026'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* LeetCode Edit Modal */}
      <AnimatePresence>
        {isEditingLeetcode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="w-full max-w-lg bg-white border border-[#E7EAF0] rounded-[28px] p-6 sm:p-8 relative shadow-apple-modal space-y-6 text-slate-900"
            >
              <div className="flex items-center justify-between border-b border-[#E7EAF0] pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 font-display">Edit LeetCode Profile</h3>
                    <p className="text-xs text-slate-500">Sync live or adjust metrics manually.</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditingLeetcode(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form inputs */}
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">LeetCode Username</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      className="flex-1 px-4 py-2.5 bg-slate-50 border border-[#E7EAF0] rounded-xl font-mono text-xs text-slate-900 outline-none focus:border-amber-500"
                      placeholder="e.g. alexrivera"
                    />
                    <button
                      type="button"
                      onClick={handleFetchLive}
                      disabled={isSyncing}
                      className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                      {isSyncing ? 'Syncing...' : 'Live Sync'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Contest Rating</label>
                    <input
                      type="number"
                      value={editRating}
                      onChange={(e) => setEditRating(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-[#E7EAF0] rounded-xl font-mono text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Global Ranking</label>
                    <input
                      type="number"
                      value={editRank}
                      onChange={(e) => setEditRank(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-[#E7EAF0] rounded-xl font-mono text-xs outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-emerald-700 mb-1">Easy Solved</label>
                    <input
                      type="number"
                      value={editEasy}
                      onChange={(e) => setEditEasy(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl font-mono text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-orange-700 mb-1">Medium Solved</label>
                    <input
                      type="number"
                      value={editMedium}
                      onChange={(e) => setEditMedium(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-orange-50/50 border border-orange-200 rounded-xl font-mono text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-rose-700 mb-1">Hard Solved</label>
                    <input
                      type="number"
                      value={editHard}
                      onChange={(e) => setEditHard(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-rose-50/50 border border-rose-200 rounded-xl font-mono text-xs outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E7EAF0]">
                <button
                  type="button"
                  onClick={() => setIsEditingLeetcode(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveLeetcode}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md cursor-pointer"
                >
                  Save LeetCode Metrics
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
