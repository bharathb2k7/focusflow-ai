import React from 'react';
import { useApp } from '../context/AppContext';
import { AIRecommendationCard } from '../components/AIRecommendationCard';
import { Timeline } from '../components/Timeline';
import { TaskCard } from '../components/TaskCard';
import { ProductivityScoreCard } from '../components/ProductivityScoreCard';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Flame,
  Plus,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ListTodo,
  Download,
} from 'lucide-react';
import { Task } from '../types';

interface DashboardPageProps {
  onOpenNewTask: () => void;
  onEditTask: (task: Task) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onOpenNewTask, onEditTask }) => {
  const {
    user,
    todayOverview,
    tasks,
    setCurrentPage,
    simulateDisruption,
    isLoadingAI,
    openExportModal,
  } = useApp();

  const priorityTasks = tasks
    .filter((t) => t.status !== 'completed')
    .slice(0, 4);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Good morning, {user?.name || 'Alex'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Let&apos;s make today productive. Here is your intelligent priority sequence.
          </p>
        </div>

        {/* Quick Action Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="dash-add-task-btn"
            type="button"
            onClick={onOpenNewTask}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>

          <button
            id="dash-replan-btn"
            type="button"
            onClick={() => simulateDisruption()}
            disabled={isLoadingAI}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAI ? 'animate-spin' : ''}`} />
            <span>Replan Day</span>
          </button>

          <button
            id="dash-export-btn"
            type="button"
            onClick={() => openExportModal('plan')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-xs cursor-pointer"
            title="Export schedule or tasks as PDF or CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Report</span>
          </button>

          <button
            id="dash-focus-btn"
            type="button"
            onClick={() => setCurrentPage('focus')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5 text-amber-600" />
            <span>Start Focus Session</span>
          </button>
        </div>
      </div>

      {/* Today's Overview: 4 High-Impact Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Remaining</span>
            <ListTodo className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">
            {todayOverview.tasksRemaining}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Active tasks scheduled</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600">
            {todayOverview.completed}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Finished items</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Overdue</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-rose-600">
            {todayOverview.overdue}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Requires attention</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Focus Time</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">
            {todayOverview.focusTimeFormatted}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Logged deep work</span>
        </div>
      </div>

      {/* Centerpiece AI "What should I do now?" Card */}
      <AIRecommendationCard />

      {/* Main Grid: Left Column (Timeline & Priority Tasks) / Right Column (Productivity Score & Insights) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Plan Timeline */}
          <Timeline />

          {/* Priority Tasks List */}
          <div className="rounded-2xl bg-white border border-slate-200/80 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Priority Tasks
                </h3>
                <p className="text-xs text-slate-500">
                  Ranked by urgency, deadline proximity, and dependency status
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage('tasks')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
              >
                <span>View all ({tasks.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {priorityTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={onEditTask}
                  allTasks={tasks}
                />
              ))}

              {priorityTasks.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400">
                  No active tasks! Click &ldquo;Add Task&rdquo; to start your day.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Score & Real-time Insights */}
        <div className="space-y-6">
          <ProductivityScoreCard />
        </div>
      </div>
    </div>
  );
};
