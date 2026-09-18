import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PriorityBadge } from './PriorityBadge';
import {
  Sparkles,
  ArrowRight,
  Info,
  Clock,
  Calendar,
  RotateCw,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const AIRecommendationCard: React.FC = () => {
  const {
    aiRecommendation,
    recommendNextTask,
    isLoadingAI,
    setActiveFocusTask,
    setCurrentPage,
    tasks,
  } = useApp();

  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  const matchedTask = tasks.find((t) => t.id === aiRecommendation?.taskId);

  const handleStartTask = () => {
    if (matchedTask) {
      setActiveFocusTask(matchedTask);
    }
    setCurrentPage('focus');
  };

  return (
    <div
      id="ai-recommendation-card"
      className="relative overflow-hidden rounded-2xl bg-white border border-indigo-100 shadow-sm p-6 sm:p-7"
    >
      {/* Subtle top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600" />

      {/* Header with Badge & Re-analyze */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100/80">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-spin-slow" />
          <span>AI RECOMMENDATION</span>
        </div>

        <button
          id="re-analyze-btn"
          type="button"
          onClick={() => recommendNextTask()}
          disabled={isLoadingAI}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 transition-colors disabled:opacity-50"
          title="Re-analyze tasks with AI"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isLoadingAI ? 'animate-spin text-indigo-600' : ''}`} />
          <span className="hidden sm:inline">
            {isLoadingAI ? 'Analyzing...' : 'Re-analyze'}
          </span>
        </button>
      </div>

      {/* Title query */}
      <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">
        What should I do now?
      </p>

      {aiRecommendation ? (
        <>
          {/* Central Task Heading */}
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-3">
            {aiRecommendation.title}
          </h2>

          {/* Key Attributes Row */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-5 text-sm text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 font-medium">Priority:</span>
              <PriorityBadge priority={aiRecommendation.priority} size="sm" />
            </div>

            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-700">
                {aiRecommendation.estimatedMinutes} min
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-700">
                {aiRecommendation.deadline}
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
              <span className="text-slate-400">Reason:</span>
              <span>{aiRecommendation.reason}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              id="start-task-recommended-btn"
              type="button"
              onClick={handleStartTask}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <span>Start Task</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="why-this-task-btn"
              type="button"
              onClick={() => setShowExplanation(!showExplanation)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-slate-500" />
              <span>Why this task?</span>
              {showExplanation ? (
                <ChevronUp className="w-3.5 h-3.5 ml-0.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
              )}
            </button>
          </div>

          {/* Intelligent Explanation Dropdown */}
          {showExplanation && (
            <div
              id="why-task-explanation"
              className="mt-4 p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 text-slate-800 text-sm leading-relaxed animate-in fade-in duration-200"
            >
              <div className="flex items-start gap-2.5">
                <Info className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-indigo-950 mb-1">
                    Intelligent Focus Allocation
                  </p>
                  <p className="text-slate-700 text-xs sm:text-sm">
                    {aiRecommendation.fitExplanation}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="py-6 text-center text-slate-500">
          <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-800">
            No active tasks pending!
          </p>
          <p className="text-xs text-slate-500">
            You&apos;re completely caught up on your plan. Add a new task to continue.
          </p>
        </div>
      )}
    </div>
  );
};
