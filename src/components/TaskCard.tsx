import React from 'react';
import { Task } from '../types';
import { PriorityBadge } from './PriorityBadge';
import {
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Circle,
  Play,
  Trash2,
  Edit2,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  allTasks?: Task[];
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, allTasks = [] }) => {
  const { toggleTaskComplete, deleteTask, setActiveFocusTask, setCurrentPage } = useApp();

  const isCompleted = task.status === 'completed';
  const isBlocked = task.status === 'blocked';

  // Find blocked parent tasks
  const blockedByTasks = (task.dependencies || []).map((depId) => {
    const parent = allTasks.find((t) => t.id === depId);
    return parent ? parent.title : `Task #${depId}`;
  });

  const handleStartFocus = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveFocusTask(task);
    setCurrentPage('focus');
  };

  const isOverdue =
    !isCompleted &&
    task.deadline &&
    new Date(task.deadline).getTime() < new Date().setHours(0, 0, 0, 0);

  return (
    <div
      id={`task-card-${task.id}`}
      className={`group relative rounded-xl p-4 transition-all duration-200 border ${
        isCompleted
          ? 'bg-slate-50/60 border-slate-200/60 opacity-75'
          : isBlocked
          ? 'bg-amber-50/30 border-amber-200/80 shadow-xs'
          : 'bg-white border-slate-200/80 hover:border-indigo-200 hover:shadow-xs'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Completion Checkbox */}
        <button
          id={`toggle-task-${task.id}`}
          type="button"
          onClick={() => toggleTaskComplete(task.id)}
          className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors shrink-0"
          title={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </button>

        {/* Task Core Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h4
              className={`text-sm font-semibold leading-snug truncate ${
                isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
              }`}
            >
              {task.title}
            </h4>

            <PriorityBadge priority={task.priority} size="sm" />

            {task.category && (
              <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                {task.category}
              </span>
            )}

            {isBlocked && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md">
                <AlertCircle className="w-3 h-3" />
                Blocked
              </span>
            )}
          </div>

          {task.description && (
            <p className="text-xs text-slate-500 line-clamp-2 mb-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* AI Rationale if generated */}
          {task.ai_rationale && !isCompleted && (
            <div className="flex items-start gap-1.5 p-2 mb-2.5 rounded-lg bg-indigo-50/50 border border-indigo-100/70 text-[11px] text-indigo-900 leading-snug">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
              <span>{task.ai_rationale}</span>
            </div>
          )}

          {/* Blocked Dependency Explanation */}
          {isBlocked && blockedByTasks.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-amber-700 mb-2 font-medium bg-amber-50 p-2 rounded-lg border border-amber-200/60">
              <Layers className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>
                Prerequisite incomplete: Cannot begin until &ldquo;{blockedByTasks.join(', ')}&rdquo; is finished.
              </span>
            </div>
          )}

          {/* Meta indicators */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{task.estimated_minutes} min</span>
            </div>

            {task.deadline && (
              <div
                className={`flex items-center gap-1 ${
                  isOverdue ? 'text-rose-600 font-semibold' : ''
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {isOverdue ? 'Overdue: ' : 'Due '}
                  {task.deadline}
                </span>
              </div>
            )}

            {task.tags && task.tags.length > 0 && (
              <div className="flex items-center gap-1">
                {task.tags.slice(0, 2).map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] text-slate-400 bg-slate-100/80 px-1.5 py-0.5 rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0">
          {!isCompleted && !isBlocked && (
            <button
              id={`start-focus-${task.id}`}
              type="button"
              onClick={handleStartFocus}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
              title="Start focused session"
            >
              <Play className="w-3 h-3 fill-indigo-600 text-indigo-600" />
              <span>Focus</span>
            </button>
          )}

          {onEdit && (
            <button
              id={`edit-task-${task.id}`}
              type="button"
              onClick={() => onEdit(task)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="Edit task"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            id={`delete-task-${task.id}`}
            type="button"
            onClick={() => deleteTask(task.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Delete task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
