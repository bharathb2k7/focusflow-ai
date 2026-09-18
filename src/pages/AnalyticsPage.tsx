import React from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { stats, tasks, focusSessions } = useApp();

  // Weekly data bars
  const weeklyData = [
    { day: 'Mon', completed: 6, focusMinutes: 180 },
    { day: 'Tue', completed: 8, focusMinutes: 240 },
    { day: 'Wed', completed: 5, focusMinutes: 150 },
    { day: 'Thu', completed: 9, focusMinutes: 270 },
    { day: 'Fri', completed: 7, focusMinutes: 210 },
    { day: 'Sat', completed: 4, focusMinutes: 120 },
    { day: 'Sun', completed: stats.tasksCompleted || 4, focusMinutes: Math.round(stats.focusHours * 60) },
  ];

  const maxCompleted = Math.max(...weeklyData.map((d) => d.completed), 10);
  const maxMinutes = Math.max(...weeklyData.map((d) => d.focusMinutes), 300);

  // Category distribution
  const categoryCounts: Record<string, number> = {};
  tasks.forEach((t) => {
    const c = t.category || 'Other';
    categoryCounts[c] = (categoryCounts[c] || 0) + 1;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Productivity Analytics & Velocity
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Measurable insights into your focus intervals, completion consistency, and execution pace
        </p>
      </div>

      {/* 6 Key Performance Metric Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Completed</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.tasksCompleted}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">+14% vs last week</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Completion Rate</span>
          <p className="text-2xl font-black text-indigo-600 mt-1">{stats.completionRate}%</p>
          <span className="text-[10px] text-slate-400">Target: &gt;75%</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Focus Hours</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.focusHours}h</p>
          <span className="text-[10px] text-slate-400">Total deep work</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Delayed Tasks</span>
          <p className="text-2xl font-black text-rose-600 mt-1">{stats.tasksDelayed}</p>
          <span className="text-[10px] text-rose-500">Overdue items</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg Duration</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.avgCompletionMinutes}m</p>
          <span className="text-[10px] text-slate-400">Per finished task</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Prod. Score</span>
          <p className="text-2xl font-black text-indigo-600 mt-1">{stats.productivityScore}</p>
          <span className="text-[10px] text-indigo-600 font-semibold">High tier focus</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Tasks Completed Over Time */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Tasks Completed (Weekly Trend)</h3>
              <p className="text-xs text-slate-400">Volume of closed tasks per day</p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
              Consistent Velocity
            </span>
          </div>

          {/* Bar Visualization */}
          <div className="h-48 flex items-end justify-between gap-3 pt-4 border-b border-slate-100">
            {weeklyData.map((d) => {
              const heightPct = Math.round((d.completed / maxCompleted) * 100);
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.completed}
                  </span>
                  <div
                    className="w-full bg-indigo-600/90 group-hover:bg-indigo-700 rounded-t-lg transition-all duration-300"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-xs font-medium text-slate-400">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Focus Time Distribution (Minutes) */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Focus Time Distribution</h3>
              <p className="text-xs text-slate-400">Deep work minutes invested per day</p>
            </div>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
              Goal: &gt;180m/day
            </span>
          </div>

          {/* Bar Visualization */}
          <div className="h-48 flex items-end justify-between gap-3 pt-4 border-b border-slate-100">
            {weeklyData.map((d) => {
              const heightPct = Math.round((d.focusMinutes / maxMinutes) * 100);
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.focusMinutes}m
                  </span>
                  <div
                    className="w-full bg-violet-600/80 group-hover:bg-violet-700 rounded-t-lg transition-all duration-300"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-xs font-medium text-slate-400">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category Breakdown & Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Workload by Category</h3>
          <div className="space-y-3">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const pct = Math.round((count / (tasks.length || 1)) * 100);
              return (
                <div key={cat}>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-slate-700">{cat}</span>
                    <span className="text-slate-500">
                      {count} tasks ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Productivity Synthesis */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">AI Weekly Synthesis</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Based on your logged focus sessions and deadline adherence, your most productive focus windows occur between <strong>09:00 AM and 11:30 AM</strong>.
            </p>
            <div className="p-3 bg-indigo-50/70 rounded-xl text-xs text-indigo-950 font-medium">
              💡 Recommendation: Continue scheduling your highest-cognitive load tasks (like DBMS algorithms or system design) before lunch to maintain a 90%+ completion rate.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
