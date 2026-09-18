import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TaskCard } from '../components/TaskCard';
import { Task, PriorityLevel, Category } from '../types';
import {
  Plus,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Layers,
  ArrowUpDown,
  Download,
} from 'lucide-react';

interface TasksPageProps {
  onOpenNewTask: () => void;
  onEditTask: (task: Task) => void;
}

export const TasksPage: React.FC<TasksPageProps> = ({ onOpenNewTask, onEditTask }) => {
  const { tasks, prioritizeWithAI, isLoadingAI, openExportModal } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q);
      const matchCategory = task.category?.toLowerCase().includes(q);
      const matchTags = task.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchCategory && !matchTags) return false;
    }

    // Status
    if (statusFilter === 'active' && task.status === 'completed') return false;
    if (statusFilter === 'blocked' && task.status !== 'blocked') return false;
    if (statusFilter === 'completed' && task.status !== 'completed') return false;

    // Priority
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

    // Category
    if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;

    return true;
  });

  const categories: Category[] = ['Academic', 'Project', 'Work', 'Personal', 'Health'];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Tasks & Workload
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your queue, track prerequisite dependencies, and auto-prioritize with AI
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Export Tasks Button */}
          <button
            id="tasks-export-btn"
            type="button"
            onClick={() => openExportModal('tasks')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-xs cursor-pointer"
            title="Download task list as PDF or CSV"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export</span>
          </button>

          {/* AI Prioritize Button */}
          <button
            id="ai-prioritize-tasks-btn"
            type="button"
            onClick={() => prioritizeWithAI()}
            disabled={isLoadingAI}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
            title="Re-order tasks with AI based on deadline, urgency, and dependencies"
          >
            <Sparkles className={`w-4 h-4 text-indigo-600 ${isLoadingAI ? 'animate-spin' : ''}`} />
            <span>{isLoadingAI ? 'Analyzing...' : 'AI Prioritize'}</span>
          </button>

          {/* New Task Button */}
          <button
            id="tasks-add-task-btn"
            type="button"
            onClick={onOpenNewTask}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            id="tasks-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, description, category, or tag..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-900"
          />
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-xl text-xs font-medium text-slate-600">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : ''
              }`}
            >
              All ({tasks.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'active' ? 'bg-white text-slate-900 shadow-xs font-bold' : ''
              }`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('blocked')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'blocked' ? 'bg-white text-amber-700 shadow-xs font-bold' : ''
              }`}
            >
              Blocked
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'completed' ? 'bg-white text-emerald-700 shadow-xs font-bold' : ''
              }`}
            >
              Done
            </button>
          </div>

          {/* Priority Select */}
          <select
            id="filter-priority-select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:border-indigo-500"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Category Select */}
          <select
            id="filter-category-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:border-indigo-500"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEditTask}
            allTasks={tasks}
          />
        ))}

        {filteredTasks.length === 0 && (
          <div className="rounded-2xl bg-white border border-slate-200 p-12 text-center text-slate-400">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">No matching tasks</p>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your search criteria or add a new task.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
