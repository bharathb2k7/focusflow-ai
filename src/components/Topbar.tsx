import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Plus,
  Sparkles,
  AlertTriangle,
  Flame,
  Search,
  RotateCcw,
  Download,
} from 'lucide-react';

interface TopbarProps {
  onOpenNewTask: () => void;
  onOpenAIChat: () => void;
  onSearchClick?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenNewTask, onOpenAIChat }) => {
  const {
    simulateDisruption,
    disruptionState,
    resetDisruption,
    isLoadingAI,
    activeFocusTask,
    setCurrentPage,
    openExportModal,
  } = useApp();

  return (
    <header
      id="app-topbar"
      className="h-16 px-4 sm:px-8 border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between gap-3"
    >
      {/* Search / Context hint */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100/80 rounded-xl text-xs text-slate-500 w-64 border border-slate-200/50">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="truncate">Search tasks, deadlines, schedules...</span>
          <kbd className="hidden lg:inline text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-400 ml-auto">
            ⌘K
          </kbd>
        </div>

        {/* Focus Mode Quick Indicator */}
        {activeFocusTask && (
          <button
            type="button"
            onClick={() => setCurrentPage('focus')}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50/80 text-amber-900 border border-amber-200/60 text-xs font-semibold hover:bg-amber-100 transition-colors cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span className="truncate max-w-[140px]">Focus: {activeFocusTask.title}</span>
          </button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Hackathon Demo Simulate Disruption Button */}
        {disruptionState?.active ? (
          <button
            id="topbar-reset-disruption-btn"
            type="button"
            onClick={resetDisruption}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-900 bg-amber-100/70 hover:bg-amber-200 rounded-xl transition-colors cursor-pointer"
            title="Reset simulated disruption"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Disruption</span>
          </button>
        ) : (
          <button
            id="topbar-simulate-disruption-btn"
            type="button"
            onClick={() => simulateDisruption()}
            disabled={isLoadingAI}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-900 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-amber-300/80 rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
            title="Simulate an unexpected 1-hour meeting disruption to demonstrate AI replanning"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Simulate Disruption</span>
          </button>
        )}

        {/* Export Modal Trigger */}
        <button
          id="topbar-export-btn"
          type="button"
          onClick={() => openExportModal('plan')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200/90 rounded-xl transition-colors cursor-pointer shadow-xs"
          title="Export daily plan or task list as PDF or CSV"
        >
          <Download className="w-3.5 h-3.5 text-slate-600" />
          <span className="hidden md:inline">Export</span>
        </button>

        {/* AI Chat Copilot trigger */}
        <button
          id="topbar-open-ai-chat-btn"
          type="button"
          onClick={onOpenAIChat}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-xl transition-colors cursor-pointer shadow-xs"
          title="Open FocusFlow AI Assistant"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-spin-slow" />
          <span className="hidden sm:inline">FocusFlow AI</span>
          <span className="sm:hidden">AI</span>
        </button>

        {/* Add Task Button */}
        <button
          id="topbar-add-task-btn"
          type="button"
          onClick={onOpenNewTask}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>
    </header>
  );
};
