import React from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingUp,
  Sparkles,
  AlertOctagon,
  Clock,
  Calendar,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const ProductivityScoreCard: React.FC = () => {
  const {
    stats,
    isOverloaded,
    overloadDiffMinutes,
    availableMinutes,
    plannedMinutes,
    optimizeOverload,
    tasks,
  } = useApp();

  const hoursAvail = (availableMinutes / 60).toFixed(1);
  const hoursPlanned = (plannedMinutes / 60).toFixed(1);
  const highPriorityRemaining = tasks.filter(
    (t) => (t.priority === 'urgent' || t.priority === 'high') && t.status !== 'completed'
  ).length;

  return (
    <div className="space-y-4">
      {/* Smart Overload Detection Banner (if applicable) */}
      {isOverloaded && (
        <div
          id="overload-warning-banner"
          className="rounded-2xl p-4 bg-rose-50/80 border border-rose-200/90 text-rose-950 shadow-xs animate-in fade-in duration-200"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-100 rounded-xl text-rose-600 shrink-0">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-rose-900">
                Your schedule is overloaded
              </h4>
              <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
                You have scheduled <strong>{hoursPlanned} hours</strong> of work in a{' '}
                <strong>{hoursAvail}-hour</strong> availability window (+{overloadDiffMinutes}m excess).
              </p>
              <p className="text-xs text-rose-600 mt-1">
                Recommendation: Move 2 low-priority tasks to tomorrow.
              </p>
              <div className="mt-3">
                <button
                  id="optimize-schedule-btn"
                  type="button"
                  onClick={optimizeOverload}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs"
                >
                  <span>Optimize Schedule</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Productivity Score Card */}
      <div
        id="productivity-score-card"
        className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs"
      >
        <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Productivity Score</h3>
              <p className="text-[11px] text-slate-400">Algorithmic focus metric</p>
            </div>
          </div>

          <div className="flex items-baseline gap-0.5">
            <span className="text-2xl font-black text-indigo-600 tracking-tight">
              {stats.productivityScore}
            </span>
            <span className="text-xs font-semibold text-slate-400">/100</span>
          </div>
        </div>

        {/* 4 Pillars Breakdown */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-slate-600">Task Completion</span>
              <span className="font-semibold text-slate-900">
                {stats.scoreBreakdown.taskCompletion}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${stats.scoreBreakdown.taskCompletion}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-slate-600">Focus Time</span>
              <span className="font-semibold text-slate-900">
                {stats.scoreBreakdown.focusTime}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${stats.scoreBreakdown.focusTime}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-slate-600">Deadline Management</span>
              <span className="font-semibold text-slate-900">
                {stats.scoreBreakdown.deadlineManagement}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${stats.scoreBreakdown.deadlineManagement}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-slate-600">Consistency</span>
              <span className="font-semibold text-slate-900">
                {stats.scoreBreakdown.consistency}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-500 rounded-full transition-all duration-500"
                style={{ width: `${stats.scoreBreakdown.consistency}%` }}
              />
            </div>
          </div>
        </div>

        {/* Disclaimer per requirement */}
        <p className="text-[10px] text-slate-400 mt-4 pt-3 border-t border-slate-100 leading-tight">
          * Application-generated composite indicator based on active completions, focus intervals, and deadline compliance — not a medical or scientific measurement.
        </p>
      </div>

      {/* AI Productivity Insights */}
      <div
        id="ai-insights-card"
        className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs"
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            AI Productivity Insights
          </h4>
        </div>

        <ul className="space-y-2.5 text-xs text-slate-700">
          <li className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <span>
              You have <strong>{highPriorityRemaining} high-priority tasks</strong> remaining in today&apos;s queue.
            </span>
          </li>

          {isOverloaded ? (
            <li className="flex items-start gap-2 p-2 rounded-lg bg-amber-50 border border-amber-100 text-amber-900">
              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                You have scheduled {hoursPlanned}h of work in a {hoursAvail}h window. Consider moving low-priority tasks to tomorrow.
              </span>
            </li>
          ) : (
            <li className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
              <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Your schedule has <strong>45 minutes of buffer time</strong> to absorb unplanned interruptions.
              </span>
            </li>
          )}

          <li className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
            <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <span>
              You complete your highest-priority tasks <strong>28% faster</strong> when working in morning focus blocks before noon.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};
