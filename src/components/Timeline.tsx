import React from 'react';
import { useApp } from '../context/AppContext';
import {
  CheckCircle2,
  Clock,
  Coffee,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  RotateCcw,
  CalendarCheck,
  ArrowRight,
  Activity,
} from 'lucide-react';

export const Timeline: React.FC = () => {
  const {
    timelineSlots,
    disruptionState,
    simulateDisruption,
    resetDisruption,
    isLoadingAI,
    setActiveFocusTask,
    setCurrentPage,
    tasks,
  } = useApp();

  const handleSlotClick = (taskId?: string | null) => {
    if (!taskId) return;
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setActiveFocusTask(task);
      setCurrentPage('focus');
    }
  };

  return (
    <div
      id="today-plan-timeline"
      className="rounded-2xl bg-white border border-slate-200/80 p-5 sm:p-6 shadow-xs"
    >
      {/* Timeline Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-indigo-600" />
            <span>Today&apos;s Plan</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Optimized execution sequence based on your deadlines & available focus window
          </p>
        </div>

        <div className="flex items-center gap-2">
          {disruptionState?.active ? (
            <button
              id="reset-disruption-btn"
              type="button"
              onClick={resetDisruption}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Schedule</span>
            </button>
          ) : (
            <button
              id="replan-my-day-btn"
              type="button"
              onClick={() => simulateDisruption()}
              disabled={isLoadingAI}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAI ? 'animate-spin' : ''}`} />
              <span>Replan My Day</span>
            </button>
          )}

          {/* Special Hackathon Demo Simulate Disruption Button */}
          {!disruptionState?.active && (
            <button
              id="simulate-disruption-btn"
              type="button"
              onClick={() => simulateDisruption()}
              disabled={isLoadingAI}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors shadow-xs"
              title="Simulate losing 1 hour to test AI adaptive replanning"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Simulate Disruption</span>
            </button>
          )}
        </div>
      </div>

      {/* Disruption Alert & Before/After Comparison Banner */}
      {disruptionState?.active && (
        <div
          id="disruption-banner"
          className="mb-6 rounded-xl bg-amber-50/80 border border-amber-200/90 p-4 animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <div className="flex items-start gap-2.5 mb-3">
            <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-700 shrink-0">
              <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
            </div>
            <div>
              <span className="inline-flex items-center text-xs font-bold text-amber-900 uppercase tracking-wide">
                Schedule Disruption Detected
              </span>
              <p className="text-xs text-amber-800 font-medium mt-0.5">
                {disruptionState.alertMessage}
              </p>
            </div>
          </div>

          {/* Before vs After Visualization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-amber-200/60 text-xs">
            <div className="bg-white/80 rounded-lg p-3 border border-amber-100">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1.5">
                Original Plan (Before)
              </span>
              <ul className="space-y-1 text-slate-600 font-medium">
                {disruptionState.beforeSummary.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-1.5 line-through opacity-70">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-lg p-3 border border-amber-300/80 shadow-xs">
              <span className="font-bold text-indigo-700 uppercase tracking-wider text-[10px] flex items-center gap-1 mb-1.5">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                Adaptive AI Replan (After)
              </span>
              <ul className="space-y-1 text-slate-800 font-medium">
                {disruptionState.afterSummary.map((item, idx) => (
                  <li
                    key={idx}
                    className={`flex items-center gap-1.5 ${
                      item.includes('Unexpected')
                        ? 'text-amber-800 font-semibold bg-amber-50/90 px-1 py-0.5 rounded'
                        : item.includes('moved')
                        ? 'text-indigo-700 font-semibold'
                        : ''
                    }`}
                  >
                    <ArrowRight className="w-3 h-3 text-indigo-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-amber-800 font-medium">
            <span>{disruptionState.advice}</span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              ✓ AI replanned your day
            </span>
          </div>
        </div>
      )}

      {/* Interactive Timeline Sequence */}
      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {timelineSlots.map((slot) => {
          const isTask = slot.type === 'task';
          const isBreak = slot.type === 'break' || slot.type === 'buffer';
          const isDisruption = slot.type === 'disruption';

          return (
            <div
              key={slot.id}
              id={`timeline-slot-${slot.id}`}
              onClick={() => isTask && handleSlotClick(slot.taskId)}
              className={`relative flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${
                slot.completed
                  ? 'bg-slate-50/70 border-slate-200/60 text-slate-400'
                  : slot.isCurrent
                  ? 'bg-indigo-50/40 border-indigo-300 ring-2 ring-indigo-500/10 shadow-xs'
                  : isDisruption
                  ? 'bg-amber-50/70 border-amber-300 text-amber-900'
                  : 'bg-white border-slate-200/80 hover:border-indigo-200 text-slate-700'
              } ${isTask ? 'cursor-pointer' : 'cursor-default'}`}
            >
              {/* Timeline dot marker */}
              <div
                className={`absolute -left-[1.85rem] w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                  slot.completed
                    ? 'border-emerald-500 bg-emerald-50'
                    : slot.isCurrent
                    ? 'border-indigo-600 bg-indigo-600'
                    : isDisruption
                    ? 'border-amber-500 bg-amber-500'
                    : 'border-slate-300'
                }`}
              >
                {slot.completed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                {slot.isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
              </div>

              {/* Slot Details */}
              <div className="flex items-center gap-3">
                <div className="text-xs font-mono font-semibold text-slate-500 shrink-0 w-24">
                  {slot.startTime} — {slot.endTime}
                </div>

                <div className="flex items-center gap-2">
                  {isBreak && <Coffee className="w-4 h-4 text-slate-400 shrink-0" />}
                  {isDisruption && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
                  {isTask && !slot.completed && !slot.isCurrent && (
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  {slot.isCurrent && <Activity className="w-4 h-4 text-indigo-600 shrink-0 animate-pulse" />}

                  <div>
                    <p
                      className={`text-sm font-medium ${
                        slot.completed
                          ? 'line-through text-slate-400'
                          : slot.isCurrent
                          ? 'font-semibold text-indigo-900'
                          : isDisruption
                          ? 'font-semibold text-amber-900'
                          : 'text-slate-800'
                      }`}
                    >
                      {slot.title}
                    </p>
                    {slot.reason && (
                      <p className="text-[11px] text-slate-400 leading-none mt-0.5">{slot.reason}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Indicator Badges */}
              <div className="flex items-center gap-2">
                {slot.completed ? (
                  <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Completed
                  </span>
                ) : slot.isCurrent ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping" />
                    Current
                  </span>
                ) : slot.status === 'rescheduled' ? (
                  <span className="text-[11px] font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                    Rescheduled
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">{slot.durationMinutes}m</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
