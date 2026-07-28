import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
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
  RadialBarChart,
  RadialBar,
  TooltipProps,
} from 'recharts';

// SVG Definitions component for reusable gradients & filters
export const ChartSvgDefs: React.FC = () => (
  <svg style={{ height: 0, width: 0, position: 'absolute' }}>
    <defs>
      {/* Blue Gradient */}
      <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#2563EB" stopOpacity={1} />
        <stop offset="100%" stopColor="#60A5FA" stopOpacity={0.85} />
      </linearGradient>

      {/* Purple Gradient */}
      <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#7C3AED" stopOpacity={1} />
        <stop offset="100%" stopColor="#A78BFA" stopOpacity={0.85} />
      </linearGradient>

      {/* Emerald Gradient */}
      <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#059669" stopOpacity={1} />
        <stop offset="100%" stopColor="#34D399" stopOpacity={0.85} />
      </linearGradient>

      {/* Orange Gradient */}
      <linearGradient id="orangeGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#EA580C" stopOpacity={1} />
        <stop offset="100%" stopColor="#FB923C" stopOpacity={0.85} />
      </linearGradient>

      {/* Rose Gradient */}
      <linearGradient id="roseGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#E11D48" stopOpacity={1} />
        <stop offset="100%" stopColor="#FB7185" stopOpacity={0.85} />
      </linearGradient>

      {/* Teal Gradient */}
      <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0891B2" stopOpacity={1} />
        <stop offset="100%" stopColor="#67E8F9" stopOpacity={0.85} />
      </linearGradient>

      {/* Indigo Area Fills */}
      <linearGradient id="indigoAreaGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.35} />
        <stop offset="90%" stopColor="#4F46E5" stopOpacity={0.01} />
      </linearGradient>

      <linearGradient id="emeraldAreaGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#059669" stopOpacity={0.35} />
        <stop offset="90%" stopColor="#059669" stopOpacity={0.01} />
      </linearGradient>

      <linearGradient id="amberAreaGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#D97706" stopOpacity={0.35} />
        <stop offset="90%" stopColor="#D97706" stopOpacity={0.01} />
      </linearGradient>

      {/* Soft Glow Filter */}
      <filter id="chartGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
  </svg>
);

// Custom Glass Floating Tooltip
export const CustomChartTooltip: React.FC<TooltipProps<any, any> & { unit?: string }> = ({
  active,
  payload,
  label,
  unit = '',
}) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-2xl rounded-2xl p-3.5 text-slate-900 min-w-[150px] space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
      {label && (
        <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-100">
          {label}
        </div>
      )}
      <div className="space-y-1">
        {payload.map((item, index) => {
          const color = item.color || item.fill || '#4F46E5';
          return (
            <div key={index} className="flex items-center justify-between gap-3 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: color }} />
                <span className="text-slate-600 font-sans">{item.name || 'Value'}:</span>
              </div>
              <span className="font-mono font-bold text-slate-900">
                {typeof item.value === 'number' ? item.value.toLocaleString() : item.value} {unit}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Colors palette for pie charts / multi-series
export const PALETTE = ['#2563EB', '#7C3AED', '#059669', '#EA580C', '#E11D48', '#0891B2', '#D97706'];
export const PALETTE_GRADIENTS = [
  'url(#blueGrad)',
  'url(#purpleGrad)',
  'url(#emeraldGrad)',
  'url(#orangeGrad)',
  'url(#roseGrad)',
  'url(#tealGrad)',
];
