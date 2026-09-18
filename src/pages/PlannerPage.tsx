import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TimelineSlot } from '../types';
import {
  Sparkles,
  Clock,
  Coffee,
  Flame,
  CheckCircle2,
  CalendarCheck,
  Zap,
  ArrowRight,
  BatteryCharging,
  Target,
  Download,
} from 'lucide-react';

export const PlannerPage: React.FC = () => {
  const {
    user,
    planDayWithAI,
    applyPlan,
    isLoadingAI,
    setCurrentPage,
    timelineSlots: currentActiveSlots,
    openExportModal,
  } = useApp();

  const [availableHours, setAvailableHours] = useState<number>(user?.availableHours || 4);
  const [mainGoal, setMainGoal] = useState<string>('Finish DBMS assignment and study Java');
  const [energyLevel, setEnergyLevel] = useState<'low' | 'medium' | 'high'>('high');

  const [generatedPlan, setGeneratedPlan] = useState<TimelineSlot[] | null>(null);
  const [hasApplied, setHasApplied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasApplied(false);
    const slots = await planDayWithAI(availableHours, mainGoal, energyLevel);
    setGeneratedPlan(slots);
  };

  const handleApplyPlan = () => {
    if (generatedPlan) {
      applyPlan(generatedPlan, availableHours * 60);
      setHasApplied(true);
      setTimeout(() => {
        setCurrentPage('dashboard');
      }, 700);
    }
  };

  // Compute metrics from generated plan (or current plan)
  const displaySlots = generatedPlan || currentActiveSlots;
  const focusSlots = displaySlots.filter((s) => s.type === 'task');
  const breakSlots = displaySlots.filter((s) => s.type === 'break' || s.type === 'buffer');

  const totalFocusMinutes = focusSlots.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalBreakMinutes = breakSlots.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalMinutes = totalFocusMinutes + totalBreakMinutes;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>FLAGSHIP AI FEATURE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            AI Planner: Build My Day
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Tell FocusFlow your available time, target objective, and energy level. We will build an optimal schedule.
          </p>
        </div>

        <button
          id="planner-export-btn"
          type="button"
          onClick={() => openExportModal('plan')}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-xs cursor-pointer self-start sm:self-auto"
          title="Export daily plan as PDF or CSV"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Export Plan</span>
        </button>
      </div>

      {/* Input Configuration Card */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-xs">
        <form onSubmit={handleGenerate} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Available Time */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-600" />
                Available Time Today
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="planner-hours-input"
                  type="number"
                  min="1"
                  max="12"
                  step="0.5"
                  value={availableHours}
                  onChange={(e) => setAvailableHours(parseFloat(e.target.value) || 4)}
                  className="w-24 px-3 py-2 text-base font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-indigo-500 text-slate-900 text-center"
                />
                <span className="text-sm font-semibold text-slate-600">Hours</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Total hours you can dedicate to focused productivity today.
              </p>
            </div>

            {/* Main Goal */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-indigo-600" />
                Main Goal / Key Outcome
              </label>
              <input
                id="planner-goal-input"
                type="text"
                required
                value={mainGoal}
                onChange={(e) => setMainGoal(e.target.value)}
                placeholder="e.g. Finish DBMS assignment and study Java"
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-900 font-medium"
              />
              <p className="text-[11px] text-slate-400 mt-1.5">
                FocusFlow will prioritize this outcome and schedule it during peak focus windows.
              </p>
            </div>
          </div>

          {/* Energy Level Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <BatteryCharging className="w-4 h-4 text-indigo-600" />
              Energy Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { level: 'low', label: 'Low Energy', desc: 'Shorter 25m focus blocks, longer breaks' },
                { level: 'medium', label: 'Moderate', desc: 'Balanced 35m blocks with regular breaks' },
                { level: 'high', label: 'High Energy', desc: 'Deep 45-50m flow blocks for difficult tasks' },
              ].map((item) => (
                <button
                  key={item.level}
                  type="button"
                  onClick={() => setEnergyLevel(item.level as any)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    energyLevel === item.level
                      ? 'bg-indigo-50/80 border-indigo-400 ring-2 ring-indigo-500/10'
                      : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900">{item.label}</span>
                    {energyLevel === item.level && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              id="generate-my-day-btn"
              type="submit"
              disabled={isLoadingAI}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isLoadingAI ? 'animate-spin' : ''}`} />
              <span>{isLoadingAI ? 'Generating Optimal Schedule...' : 'Generate My Day'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Plan Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">Total Planned</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">Focus Time</span>
          <p className="text-2xl font-bold text-indigo-600 mt-1">
            {Math.floor(totalFocusMinutes / 60)}h {totalFocusMinutes % 60}m
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">Break Time</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {totalBreakMinutes} min
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">Tasks Count</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {focusSlots.length} tasks
          </p>
        </div>
      </div>

      {/* Generated Schedule Timeline Preview & Apply */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-indigo-600" />
              <span>{generatedPlan ? 'AI-Generated Day Schedule' : 'Current Active Plan'}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {generatedPlan
                ? 'Review the synthesized schedule below before applying it to your day.'
                : 'Modify inputs above and click Generate My Day to create a new layout.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="planner-preview-export-btn"
              type="button"
              onClick={() => openExportModal('plan')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-xs cursor-pointer"
              title="Download this schedule as PDF or CSV"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {generatedPlan && (
              <button
                id="apply-this-plan-btn"
                type="button"
                onClick={handleApplyPlan}
                className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs cursor-pointer ${
                  hasApplied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {hasApplied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Plan Applied! Redirecting...</span>
                  </>
                ) : (
                  <>
                    <span>Apply This Plan</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Slot rows */}
        <div className="space-y-3">
          {displaySlots.map((slot, idx) => {
            const isBreak = slot.type === 'break' || slot.type === 'buffer';
            return (
              <div
                key={idx}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                  isBreak
                    ? 'bg-slate-50/70 border-slate-200 text-slate-600'
                    : 'bg-white border-slate-200 hover:border-indigo-200 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="font-mono text-xs font-semibold text-slate-500 w-28">
                    {slot.startTime} — {slot.endTime}
                  </div>
                  <div className="flex items-center gap-2">
                    {isBreak ? (
                      <Coffee className="w-4 h-4 text-slate-400" />
                    ) : (
                      <Flame className="w-4 h-4 text-indigo-600" />
                    )}
                    <div>
                      <p className="text-sm font-semibold">{slot.title}</p>
                      {slot.reason && (
                        <p className="text-[11px] text-slate-400">{slot.reason}</p>
                      )}
                    </div>
                  </div>
                </div>

                <span className="text-xs font-medium text-slate-400">
                  {slot.durationMinutes} min
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
