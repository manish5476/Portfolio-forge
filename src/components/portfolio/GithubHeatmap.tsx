import React, { useState, useEffect } from 'react';
import { Github, Flame, Calendar, RefreshCw, ExternalLink, Sparkles, AlertCircle } from 'lucide-react';

interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface ApiData {
  total: {
    [year: string]: number;
    lastYear?: number;
  };
  contributions: ContributionDay[];
}

interface GithubHeatmapProps {
  username: string;
  accentColor?: string;
  isLight?: boolean;
}

export const GithubHeatmap: React.FC<GithubHeatmapProps> = ({
  username,
  accentColor = '#06b6d4',
  isLight = false,
}) => {
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [hoveredDay, setHoveredDay] = useState<ContributionDay | null>(null);

  const cleanUsername = (username || '').trim().replace(/^@/, '');

  useEffect(() => {
    if (!cleanUsername) {
      setLoading(false);
      setError(true);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(false);

    // Fetch from public GitHub contributions API
    fetch(`https://github-contributions-api.jogruber.de/v4/${cleanUsername}?y=last`)
      .then((res) => {
        if (!res.ok) throw new Error('User not found or API issue');
        return res.json();
      })
      .then((resData: ApiData) => {
        if (isMounted) {
          setData(resData);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('GitHub contributions API error, trying fallback:', err);
        if (isMounted) {
          // Attempt secondary API endpoint fallback if primary fails
          fetch(`https://github-contributions-canvas.vercel.app/api/v1/${cleanUsername}`)
            .then((r) => r.json())
            .then((fallbackData) => {
              if (isMounted && fallbackData?.contributions) {
                setData(fallbackData);
                setLoading(false);
              } else {
                setError(true);
                setLoading(false);
              }
            })
            .catch(() => {
              if (isMounted) {
                setError(true);
                setLoading(false);
              }
            });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [cleanUsername]);

  // Total contributions count calculation
  const totalCount = data?.total?.lastYear
    ? data.total.lastYear
    : data?.contributions
    ? data.contributions.reduce((acc, curr) => acc + curr.count, 0)
    : 0;

  // Group contributions into 52/53 weeks
  const weeks: ContributionDay[][] = [];
  if (data?.contributions && data.contributions.length > 0) {
    let currentWeek: ContributionDay[] = [];
    data.contributions.forEach((day, idx) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || idx === data.contributions.length - 1) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });
  }

  // Calculate month label offsets across weeks
  const monthLabels: { label: string; weekIndex: number }[] = [];
  if (weeks.length > 0) {
    let lastMonth = '';
    weeks.forEach((week, weekIdx) => {
      const firstDayInWeek = week[0];
      if (firstDayInWeek) {
        const monthName = new Date(firstDayInWeek.date).toLocaleDateString('en-US', { month: 'short' });
        if (monthName !== lastMonth) {
          monthLabels.push({ label: monthName, weekIndex: weekIdx });
          lastMonth = monthName;
        }
      }
    });
  }

  // Get color intensity for cell
  const getCellBg = (level: number, count: number) => {
    if (count === 0 || level === 0) {
      return isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200/60' : 'bg-slate-900 hover:bg-slate-800 border-slate-800/60';
    }
    // Hex to RGBA helpers for theme accent matching
    if (level === 1) return 'bg-cyan-900/60 hover:bg-cyan-800 border-cyan-800/40';
    if (level === 2) return 'bg-cyan-700 hover:bg-cyan-600 border-cyan-700/50';
    if (level === 3) return 'bg-cyan-500 hover:bg-cyan-400 border-cyan-500/60';
    return 'bg-cyan-300 hover:bg-white border-cyan-200 shadow-sm shadow-cyan-400/50';
  };

  return (
    <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
      isLight ? 'bg-slate-50/80 border-slate-200/80 text-slate-800' : 'bg-slate-950/80 border-slate-800/80 text-slate-200'
    }`}>
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-center text-cyan-400 shrink-0">
            <Flame className="w-4 h-4 text-orange-400 fill-orange-400/20 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-display uppercase tracking-wider">
                Live GitHub Contributions
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono border ${
                isLight ? 'bg-slate-200 text-slate-700 border-slate-300' : 'bg-slate-900 text-cyan-300 border-cyan-800/60'
              }`}>
                @{cleanUsername || 'user'}
              </span>
            </div>
            {!loading && !error && (
              <p className={`text-[11px] font-medium mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                <strong className={isLight ? 'text-slate-900' : 'text-white'}>{totalCount.toLocaleString()}</strong> contributions in the last year
              </p>
            )}
          </div>
        </div>

        <a
          href={`https://github.com/${cleanUsername}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all shrink-0 ${
            isLight
              ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
              : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          <Github className="w-3.5 h-3.5 text-cyan-400" />
          <span>View GitHub</span>
          <ExternalLink className="w-3 h-3 text-slate-500" />
        </a>
      </div>

      {/* Main Heatmap Canvas / Grid */}
      {loading ? (
        <div className="space-y-3 py-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono animate-pulse">
            <span>Fetching commit history from GitHub...</span>
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
          </div>
          <div className="grid grid-cols-12 gap-1.5 opacity-60">
            {Array.from({ length: 36 }).map((_, i) => (
              <div key={i} className={`h-3 rounded-sm animate-pulse ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`} />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="py-4 text-center space-y-3">
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl max-w-sm mx-auto text-xs text-slate-400 flex items-center gap-2 justify-center">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Could not load live heatmap for <strong>@{cleanUsername}</strong>. Check username.</span>
          </div>
          {/* Visual Fallback Heatmap SVG Image */}
          <div className="overflow-x-auto py-1 flex justify-center opacity-90 hover:opacity-100 transition-opacity">
            <img
              src={`https://ghchart.rshah.org/${accentColor.replace('#', '')}/${cleanUsername}`}
              alt={`${cleanUsername}'s Github Contribution Chart`}
              className="max-w-full h-auto min-h-[60px] filter drop-shadow-md rounded"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Scrollable Container for Heatmap Grid */}
          <div className="overflow-x-auto pb-1 scrollbar-thin">
            <div className="min-w-[620px]">
              
              {/* Month Header Row */}
              <div className="flex text-[10px] font-mono mb-1 text-slate-500 pl-6 relative h-4">
                {monthLabels.map(({ label, weekIndex }) => (
                  <span
                    key={`${label}-${weekIndex}`}
                    className="absolute"
                    style={{ left: `${(weekIndex / weeks.length) * 100}%` }}
                  >
                    {label}
                  </span>
                ))}
              </div>

              {/* Grid with Day Labels on Left */}
              <div className="flex gap-1.5 items-start">
                {/* Day Labels */}
                <div className="flex flex-col gap-1 text-[9px] font-mono text-slate-500 pt-0.5 w-5 shrink-0 select-none">
                  <span className="h-2.5 leading-none">Mon</span>
                  <span className="h-2.5 leading-none opacity-0">Tue</span>
                  <span className="h-2.5 leading-none">Wed</span>
                  <span className="h-2.5 leading-none opacity-0">Thu</span>
                  <span className="h-2.5 leading-none">Fri</span>
                  <span className="h-2.5 leading-none opacity-0">Sat</span>
                  <span className="h-2.5 leading-none opacity-0">Sun</span>
                </div>

                {/* 52 Columns of Weeks */}
                <div className="flex-1 grid grid-flow-col auto-cols-fr gap-1">
                  {weeks.map((week, wIdx) => (
                    <div key={wIdx} className="grid grid-rows-7 gap-1">
                      {week.map((day, dIdx) => (
                        <div
                          key={`${wIdx}-${dIdx}-${day.date}`}
                          onMouseEnter={() => setHoveredDay(day)}
                          onMouseLeave={() => setHoveredDay(null)}
                          className={`w-2.5 h-2.5 rounded-xs border transition-transform duration-150 hover:scale-125 hover:z-10 cursor-pointer ${getCellBg(
                            day.level,
                            day.count
                          )}`}
                          title={`${day.count} contributions on ${new Date(day.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Footer Bar: Hover Info + Legend */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/50 text-[10px] font-mono text-slate-400">
            {/* Dynamic Hover Tooltip Info */}
            <div className="h-4 flex items-center gap-1.5">
              {hoveredDay ? (
                <span className="text-cyan-300 font-semibold animate-in fade-in duration-100">
                  ⚡ <strong>{hoveredDay.count}</strong> contribution{hoveredDay.count === 1 ? '' : 's'} on{' '}
                  {new Date(hoveredDay.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              ) : (
                <span className="opacity-60">Hover over any day square for details</span>
              )}
            </div>

            {/* Heatmap Legend */}
            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
              <span className="opacity-60">Less</span>
              <div className={`w-2.5 h-2.5 rounded-xs border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'}`} />
              <div className="w-2.5 h-2.5 rounded-xs border bg-cyan-900/60 border-cyan-800/40" />
              <div className="w-2.5 h-2.5 rounded-xs border bg-cyan-700 border-cyan-700/50" />
              <div className="w-2.5 h-2.5 rounded-xs border bg-cyan-500 border-cyan-500/60" />
              <div className="w-2.5 h-2.5 rounded-xs border bg-cyan-300 border-cyan-200" />
              <span className="opacity-60">More</span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
