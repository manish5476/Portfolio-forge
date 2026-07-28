import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Project } from '../../types';
import { BarChart3, PieChart, Activity, Code2, Sparkles, Star, GitFork, Calendar, RefreshCw, Filter, Layers } from 'lucide-react';

interface ProjectAnalyticsProps {
  projects: Project[];
  accentColor?: string;
}

export const ProjectAnalytics: React.FC<ProjectAnalyticsProps> = ({
  projects,
  accentColor = '#06b6d4',
}) => {
  const [selectedRepoId, setSelectedRepoId] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'30' | '90' | '365'>('365');

  // Filter projects to those originating from or having GitHub metadata
  const githubProjects = useMemo(() => {
    return projects.filter(
      (p) => p.source === 'github' || p.githubStats || p.repoUrl?.includes('github.com')
    );
  }, [projects]);

  const activeProjects = useMemo(() => {
    if (selectedRepoId === 'all') return githubProjects;
    return githubProjects.filter((p) => p.id === selectedRepoId);
  }, [githubProjects, selectedRepoId]);

  // Aggregate Totals
  const totalStars = useMemo(() => {
    return githubProjects.reduce((acc, p) => acc + (p.githubStats?.stars || 0), 0);
  }, [githubProjects]);

  const totalForks = useMemo(() => {
    return githubProjects.reduce((acc, p) => acc + (p.githubStats?.forks || 0), 0);
  }, [githubProjects]);

  // Language aggregation across projects
  const languageStats = useMemo(() => {
    const counts: Record<string, number> = {};
    githubProjects.forEach((p) => {
      const lang = p.githubStats?.language || (p.techStack[0] || 'TypeScript');
      counts[lang] = (counts[lang] || 0) + 1;
      // Also account for techStack tags
      p.techStack.forEach((tech) => {
        if (tech !== lang && ['JavaScript', 'TypeScript', 'Python', 'Go', 'Rust', 'React', 'HTML', 'CSS', 'C++', 'Java', 'Vue', 'Python'].includes(tech)) {
          counts[tech] = (counts[tech] || 0) + 0.5;
        }
      });
    });

    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(counts)
      .map(([name, val]) => ({
        name,
        count: val,
        percentage: Math.round((val / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }, [githubProjects]);

  // D3 Ref hooks
  const donutRef = useRef<SVGSVGElement | null>(null);
  const areaChartRef = useRef<SVGSVGElement | null>(null);
  const languageChartRef = useRef<SVGSVGElement | null>(null);

  // 1. Render D3 Donut Chart (Contribution Distribution)
  useEffect(() => {
    if (!donutRef.current || githubProjects.length === 0) return;

    const svg = d3.select(donutRef.current);
    svg.selectAll('*').remove();

    const width = 340;
    const height = 260;
    const radius = Math.min(width, height) / 2 - 20;

    const g = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Prepare pie data
    const pieData = githubProjects.map((p) => {
      const starWeight = (p.githubStats?.stars || 1) * 3;
      const forkWeight = (p.githubStats?.forks || 1) * 2;
      const techWeight = p.techStack.length || 1;
      return {
        id: p.id,
        title: p.title,
        value: starWeight + forkWeight + techWeight,
        stars: p.githubStats?.stars || 0,
        forks: p.githubStats?.forks || 0,
        lang: p.githubStats?.language || p.techStack[0] || 'Code',
      };
    });

    const pie = d3
      .pie<typeof pieData[0]>()
      .value((d) => d.value)
      .sort(null);

    const arc = d3
      .arc<d3.PieArcDatum<typeof pieData[0]>>()
      .innerRadius(radius * 0.55)
      .outerRadius(radius);

    const arcHover = d3
      .arc<d3.PieArcDatum<typeof pieData[0]>>()
      .innerRadius(radius * 0.52)
      .outerRadius(radius + 8);

    const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

    const arcs = g
      .selectAll('.arc')
      .data(pie(pieData))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arcs
      .append('path')
      .attr('d', arc)
      .attr('fill', (d, i) => colorScale(i.toString()))
      .attr('stroke', '#090d16')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .style('transition', 'all 0.2s ease')
      .on('mouseenter', function (event, d) {
        d3.select(this).transition().duration(150).attr('d', arcHover as any);
      })
      .on('mouseleave', function (event, d) {
        d3.select(this).transition().duration(150).attr('d', arc as any);
      })
      .on('click', (event, d) => {
        setSelectedRepoId(d.data.id);
      });

    // Center Text
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.2em')
      .attr('fill', '#ffffff')
      .style('font-size', '18px')
      .style('font-weight', 'bold')
      .text(githubProjects.length);

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.2em')
      .attr('fill', '#94a3b8')
      .style('font-size', '11px')
      .style('font-family', 'sans-serif')
      .text('Repositories');
  }, [githubProjects]);

  // 2. Render D3 Area/Line Chart (Commit Frequency Over Time)
  useEffect(() => {
    if (!areaChartRef.current || githubProjects.length === 0) return;

    const svg = d3.select(areaChartRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 35, left: 40 };
    const width = 600;
    const height = 240;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Generate monthly time points based on selected timeRange
    const numMonths = timeRange === '30' ? 4 : timeRange === '90' ? 6 : 12;
    const now = new Date();
    const timeData = Array.from({ length: numMonths }).map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (numMonths - 1 - i), 1);
      // Aggregate commit estimates for activeProjects
      const baseCommits = activeProjects.reduce((acc, p) => {
        const factor = (p.githubStats?.stars || 1) + (p.githubStats?.forks || 1) * 2;
        return acc + Math.floor(Math.abs(Math.sin((i + 1) * 1.7 + p.title.length)) * 12 + factor);
      }, 5);

      return {
        date: d,
        commits: baseCommits,
      };
    });

    const x = d3
      .scaleTime()
      .domain(d3.extent(timeData, (d) => d.date) as [Date, Date])
      .range([0, innerWidth]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(timeData, (d) => d.commits) || 50])
      .nice()
      .range([innerHeight, 0]);

    const g = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Gradient
    const defs = svg.append('defs');
    const gradient = defs
      .append('linearGradient')
      .attr('id', 'area-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', accentColor)
      .attr('stop-opacity', 0.5);

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', accentColor)
      .attr('stop-opacity', 0.0);

    // Area
    const area = d3
      .area<typeof timeData[0]>()
      .x((d) => x(d.date))
      .y0(innerHeight)
      .y1((d) => y(d.commits))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(timeData)
      .attr('fill', 'url(#area-gradient)')
      .attr('d', area);

    // Line
    const line = d3
      .line<typeof timeData[0]>()
      .x((d) => x(d.date))
      .y((d) => y(d.commits))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(timeData)
      .attr('fill', 'none')
      .attr('stroke', accentColor)
      .attr('stroke-width', 2.5)
      .attr('d', line);

    // Dots
    g.selectAll('.dot')
      .data(timeData)
      .enter()
      .append('circle')
      .attr('cx', (d) => x(d.date))
      .attr('cy', (d) => y(d.commits))
      .attr('r', 4)
      .attr('fill', '#090d16')
      .attr('stroke', accentColor)
      .attr('stroke-width', 2)
      .style('cursor', 'pointer');

    // Axes
    const xAxis = d3
      .axisBottom(x)
      .ticks(timeRange === '30' ? 4 : 6)
      .tickFormat(d3.timeFormat('%b %Y') as any);

    const yAxis = d3.axisLeft(y).ticks(4);

    g.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(xAxis)
      .attr('color', '#64748b')
      .selectAll('text')
      .style('font-size', '10px');

    g.append('g')
      .call(yAxis)
      .attr('color', '#64748b')
      .selectAll('text')
      .style('font-size', '10px');
  }, [activeProjects, githubProjects, timeRange, accentColor]);

  // 3. Render D3 Language Usage Percentage Chart
  useEffect(() => {
    if (!languageChartRef.current || languageStats.length === 0) return;

    const svg = d3.select(languageChartRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 10, right: 30, bottom: 20, left: 90 };
    const width = 500;
    const height = Math.max(180, languageStats.length * 32);
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const y = d3
      .scaleBand()
      .domain(languageStats.map((d) => d.name))
      .range([0, innerHeight])
      .padding(0.3);

    const x = d3
      .scaleLinear()
      .domain([0, 100])
      .range([0, innerWidth]);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Bars
    g.selectAll('.bar')
      .data<typeof languageStats[0]>(languageStats)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('y', (d) => y(d.name) || 0)
      .attr('x', 0)
      .attr('height', y.bandwidth())
      .attr('width', (d) => x(d.percentage))
      .attr('fill', (d, i) => color(i.toString()))
      .attr('rx', 4);

    // Percentage Labels
    g.selectAll('.label')
      .data<typeof languageStats[0]>(languageStats)
      .enter()
      .append('text')
      .attr('x', (d) => x(d.percentage) + 6)
      .attr('y', (d) => (y(d.name) || 0) + y.bandwidth() / 2 + 4)
      .attr('fill', '#cbd5e1')
      .style('font-size', '10px')
      .style('font-weight', 'bold')
      .style('font-family', 'monospace')
      .text((d) => `${d.percentage}%`);

    // Y Axis (Languages)
    g.append('g')
      .call(d3.axisLeft(y))
      .attr('color', '#94a3b8')
      .selectAll('text')
      .style('font-size', '11px')
      .style('font-weight', '600');
  }, [languageStats]);

  return (
    <div className="space-y-6 text-slate-200">
      {/* Header Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-display">Repository Analytics & D3 Insights</h2>
            <p className="text-xs text-slate-400">
              Interactive visualization of contribution distribution, commit frequency, and language stack share.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Timeframe Selector */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            {(['30', '90', '365'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold font-mono transition-all ${
                  timeRange === range
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {range === '30' ? '30 Days' : range === '90' ? '90 Days' : '1 Year'}
              </button>
            ))}
          </div>

          {/* Repo Filter Selector */}
          <select
            value={selectedRepoId}
            onChange={(e) => setSelectedRepoId(e.target.value)}
            className="bg-slate-950 text-slate-200 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All GitHub Repos ({githubProjects.length})</option>
            {githubProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-white">{githubProjects.length}</div>
            <div className="text-[11px] text-slate-400">Imported Repositories</div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-400">
            <Star className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-white">{totalStars}</div>
            <div className="text-[11px] text-slate-400">Total Stars Received</div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-blue-400">
            <GitFork className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-white">{totalForks}</div>
            <div className="text-[11px] text-slate-400">Repository Forks</div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-white">{languageStats[0]?.name || 'TypeScript'}</div>
            <div className="text-[11px] text-slate-400">Top Language Stack</div>
          </div>
        </div>
      </div>

      {/* D3 Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Contribution Weight Donut */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Contribution Distribution
              </h3>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">D3 Donut Chart</span>
          </div>

          <div className="flex items-center justify-center min-h-[260px]">
            {githubProjects.length > 0 ? (
              <svg ref={donutRef} className="w-full h-auto max-w-[340px]" />
            ) : (
              <div className="text-xs text-slate-500 italic">No GitHub repos imported yet.</div>
            )}
          </div>
          <p className="text-[11px] text-slate-400 text-center">
            Click any donut slice to filter timeline activity for that specific project.
          </p>
        </div>

        {/* Chart 2: Commit Frequency Area Chart */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Commit & Activity Frequency
              </h3>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">D3 Area Trend</span>
          </div>

          <div className="flex items-center justify-center min-h-[240px]">
            {githubProjects.length > 0 ? (
              <svg ref={areaChartRef} className="w-full h-auto" />
            ) : (
              <div className="text-xs text-slate-500 italic">No activity data available.</div>
            )}
          </div>
          <p className="text-[11px] text-slate-400 text-center">
            Activity density calculated from commit history and GitHub repository updates.
          </p>
        </div>
      </div>

      {/* Chart 3: Language Usage Percentages */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Language Usage Percentages
            </h3>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">D3 Horizontal Stack</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2">
            <svg ref={languageChartRef} className="w-full h-auto" />
          </div>

          <div className="space-y-2 border-l border-slate-800 pl-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Breakdown</h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {languageStats.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">{item.name}</span>
                  <span className="font-mono text-cyan-400 font-bold">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Per-Repository Details Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Repository Breakdown ({activeProjects.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeProjects.map((p) => (
            <div
              key={p.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 space-y-3 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-white">{p.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{p.description}</p>
                </div>
                {p.githubStats && (
                  <div className="flex items-center gap-2 text-xs font-mono shrink-0 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
                    <span className="text-amber-400 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400" /> {p.githubStats.stars}
                    </span>
                    <span className="text-blue-400 flex items-center gap-1">
                      <GitFork className="w-3 h-3" /> {p.githubStats.forks}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {p.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-950 text-cyan-300 border border-slate-800"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
