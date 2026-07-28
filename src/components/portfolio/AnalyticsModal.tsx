import React from 'react';
import { motion } from 'motion/react';
import { BarChart3, Users, Globe, Download, Eye, TrendingUp, X, MapPin } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { PortfolioData } from '../../types';
import { ChartSvgDefs, CustomChartTooltip, PALETTE_GRADIENTS } from '../charts/CustomRecharts';

interface AnalyticsModalProps {
  portfolio: PortfolioData;
  onClose: () => void;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({ portfolio, onClose }) => {
  const analytics = portfolio.analytics || {
    totalViews: portfolio.profile.portfolioViews || 12480,
    uniqueVisitors: 4820,
    recruiterVisits: 310,
    resumeDownloads: 640,
    trafficSources: [
      { name: 'GitHub Profile & Repos', percentage: 48, visits: 5990 },
      { name: 'LinkedIn Recruiter Links', percentage: 28, visits: 3494 },
      { name: 'Direct & Twitter/X', percentage: 16, visits: 1996 },
      { name: 'Search Engines (Google)', percentage: 8, visits: 1000 },
    ],
    countryVisits: [
      { country: 'United States', code: 'US', visits: 5200 },
      { country: 'Germany', code: 'DE', visits: 1800 },
      { country: 'United Kingdom', code: 'GB', visits: 1400 },
      { country: 'India', code: 'IN', visits: 1200 },
      { country: 'Canada', code: 'CA', visits: 950 },
    ],
    popularProjects: [
      { id: 'proj_1', title: 'hyper-canvas', views: 5820 },
      { id: 'proj_2', title: 'nexus-design-system', views: 3410 },
      { id: 'proj_3', title: 'synth-flow-ai', views: 2100 },
    ],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-900/40 backdrop-blur-md">
      <ChartSvgDefs />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        className="w-full max-w-3xl bg-white border border-[#E7EAF0] rounded-t-3xl md:rounded-[28px] p-6 sm:p-8 relative shadow-apple-modal space-y-6 max-h-[92vh] overflow-y-auto text-slate-900"
      >
        {/* Mobile Sheet Drag Handle */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto -mt-2 mb-2 md:hidden" />
        <div className="flex items-center justify-between border-b border-[#E7EAF0] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 shadow-2xs">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-display">Profile Telemetry & Analytics</h2>
              <p className="text-xs text-slate-500">Traffic, recruiter engagements, and global visitor metrics.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-slate-50 border border-[#E7EAF0]">
            <div className="text-[10px] text-slate-500 font-bold uppercase">Total Views</div>
            <div className="text-2xl font-black text-slate-900 font-mono mt-1">{analytics.totalViews.toLocaleString()}</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-[#E7EAF0]">
            <div className="text-[10px] text-slate-500 font-bold uppercase">Unique Visitors</div>
            <div className="text-2xl font-black text-indigo-600 font-mono mt-1">{analytics.uniqueVisitors.toLocaleString()}</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-[#E7EAF0]">
            <div className="text-[10px] text-slate-500 font-bold uppercase">Recruiter Visits</div>
            <div className="text-2xl font-black text-amber-600 font-mono mt-1">{analytics.recruiterVisits.toLocaleString()}</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-[#E7EAF0]">
            <div className="text-[10px] text-slate-500 font-bold uppercase">Resume Downloads</div>
            <div className="text-2xl font-black text-emerald-600 font-mono mt-1">{analytics.resumeDownloads.toLocaleString()}</div>
          </div>
        </div>

        {/* Traffic Sources Recharts Bar Chart */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-[#E7EAF0] space-y-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display">Traffic Sources Breakdown</h4>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={analytics.trafficSources} margin={{ top: 0, right: 20, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" opacity={0.6} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#334155', fontSize: 11, fontWeight: 600 }} width={140} />
                <Tooltip content={<CustomChartTooltip unit="visits" />} />
                <Bar dataKey="visits" name="Visits" fill="url(#indigoAreaGrad)" radius={[0, 8, 8, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Country Breakdown */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-[#E7EAF0] space-y-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display">Global Visitor Geography</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {analytics.countryVisits.map((c, i) => (
              <div key={i} className="p-3 rounded-xl bg-white border border-[#E7EAF0] flex items-center justify-between text-xs shadow-2xs">
                <span className="text-slate-800 font-medium">{c.country}</span>
                <span className="font-mono text-indigo-600 font-bold">{c.visits.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
