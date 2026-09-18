import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Download,
  FileText,
  Table,
  Printer,
  Check,
  Calendar,
  ListTodo,
  Filter,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import {
  exportTasksToCSV,
  exportTasksToPDF,
  exportDailyPlanToCSV,
  exportDailyPlanToPDF,
} from '../utils/exportUtils';
import { PriorityLevel, TaskStatus, Category } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'plan' | 'tasks';
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'plan',
}) => {
  const { timelineSlots, tasks, user } = useApp();

  const [activeTab, setActiveTab] = useState<'plan' | 'tasks'>(defaultTab);
  const [format, setFormat] = useState<'pdf' | 'csv'>('pdf');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Daily Plan Options
  const [includeBreaks, setIncludeBreaks] = useState(true);
  const [includeGoal, setIncludeGoal] = useState(true);

  // Tasks Filter Options
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | PriorityLevel>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | Category>('all');

  if (!isOpen) return null;

  // Filtered slots for plan export
  const exportSlots = timelineSlots.filter((slot) => {
    if (!includeBreaks && (slot.type === 'break' || slot.type === 'buffer')) {
      return false;
    }
    return true;
  });

  // Filtered tasks for tasks export
  const exportTasks = tasks.filter((task) => {
    if (statusFilter !== 'all' && task.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
    if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;
    return true;
  });

  // Summary counts
  const totalFocusMinutes = exportSlots
    .filter((s) => s.type === 'task')
    .reduce((acc, s) => acc + s.durationMinutes, 0);

  const totalTasksTime = exportTasks.reduce((acc, t) => acc + (t.estimated_minutes || 0), 0);

  const handleExport = (overrideFormat?: 'pdf' | 'csv') => {
    const selectedFormat = overrideFormat || format;
    const todayStr = new Date().toISOString().split('T')[0];

    try {
      if (activeTab === 'plan') {
        if (selectedFormat === 'pdf') {
          exportDailyPlanToPDF(exportSlots, {
            userName: user?.name,
            goal: includeGoal ? user?.mainGoal : undefined,
            energyLevel: user?.energyLevel,
          });
          setDownloadSuccess('Daily Plan PDF downloaded successfully!');
        } else {
          exportDailyPlanToCSV(exportSlots, {
            goal: includeGoal ? user?.mainGoal : undefined,
            date: todayStr,
          });
          setDownloadSuccess('Daily Plan CSV downloaded successfully!');
        }
      } else {
        const filterLabel =
          statusFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all'
            ? `Status: ${statusFilter}, Priority: ${priorityFilter}, Category: ${categoryFilter}`
            : 'All Tasks';

        if (selectedFormat === 'pdf') {
          exportTasksToPDF(exportTasks, {
            userName: user?.name,
            filterLabel,
          });
          setDownloadSuccess('Tasks Report PDF downloaded successfully!');
        } else {
          exportTasksToCSV(exportTasks);
          setDownloadSuccess('Tasks CSV spreadsheet downloaded successfully!');
        }
      }

      setTimeout(() => {
        setDownloadSuccess(null);
      }, 3500);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="export-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="export-modal-container"
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-slate-200/80 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Export & Offline Reporting
              </h2>
              <p className="text-xs text-slate-500">
                Download high-fidelity PDF documents or CSV spreadsheets for reporting and offline tracking
              </p>
            </div>
          </div>
          <button
            id="close-export-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body with Controls & Live Preview */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Export Dataset Switcher */}
          <div className="flex items-center justify-between gap-4 p-1.5 bg-slate-100/80 rounded-xl border border-slate-200/60">
            <button
              id="export-tab-daily-plan"
              type="button"
              onClick={() => setActiveTab('plan')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'plan'
                  ? 'bg-white text-indigo-950 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>Daily Plan & Schedule ({exportSlots.length} blocks)</span>
            </button>
            <button
              id="export-tab-task-list"
              type="button"
              onClick={() => setActiveTab('tasks')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'tasks'
                  ? 'bg-white text-indigo-950 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListTodo className="w-4 h-4 text-indigo-600" />
              <span>Task List & Workload ({exportTasks.length} tasks)</span>
            </button>
          </div>

          {/* Format Selector: PDF vs CSV */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormat('pdf')}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                format === 'pdf'
                  ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div
                className={`p-2 rounded-lg ${
                  format === 'pdf' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">Clean PDF Document</span>
                  {format === 'pdf' && <span className="w-2 h-2 rounded-full bg-indigo-600" />}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Executive summary table, metrics breakdown, and branded layout ready for print or sharing
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFormat('csv')}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                format === 'csv'
                  ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div
                className={`p-2 rounded-lg ${
                  format === 'csv' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Table className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">CSV Spreadsheet</span>
                  {format === 'csv' && <span className="w-2 h-2 rounded-full bg-emerald-600" />}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Universal spreadsheet file compatible with Excel, Google Sheets, Notion, and databases
                </p>
              </div>
            </button>
          </div>

          {/* Configuration & Filter Controls */}
          {activeTab === 'plan' ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Daily Plan Options
              </span>
              <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-700">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeBreaks}
                    onChange={(e) => setIncludeBreaks(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                  />
                  <span>Include Rest Breaks & Buffer Slots</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeGoal}
                    onChange={(e) => setIncludeGoal(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                  />
                  <span>Include Daily Objective Header</span>
                </label>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Filter Tasks Before Export
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as 'all' | TaskStatus)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
                  >
                    <option value="all">All Statuses ({tasks.length})</option>
                    <option value="not_started">To-Do / Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Priority
                  </label>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value as 'all' | PriorityLevel)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
                  >
                    <option value="all">All Priorities</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Category
                  </label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value as 'all' | Category)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
                  >
                    <option value="all">All Categories</option>
                    <option value="Academic">Academic</option>
                    <option value="Project">Project</option>
                    <option value="Work">Work</option>
                    <option value="Personal">Personal</option>
                    <option value="Health">Health</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Live Data Preview */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <span>Preview: {activeTab === 'plan' ? 'Daily Schedule' : 'Tasks Queue'}</span>
                <span className="text-slate-400 font-normal">
                  ({activeTab === 'plan' ? `${exportSlots.length} items` : `${exportTasks.length} items`})
                </span>
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                {activeTab === 'plan'
                  ? `${(totalFocusMinutes / 60).toFixed(1)} hrs focus scheduled`
                  : `${(totalTasksTime / 60).toFixed(1)} hrs total backlog`}
              </span>
            </div>

            <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 text-xs font-mono">
              {activeTab === 'plan' ? (
                exportSlots.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 font-sans">
                    No timeline slots match current filters.
                  </div>
                ) : (
                  exportSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="px-4 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 font-sans min-w-0">
                        <span className="font-mono text-slate-500 font-bold text-[11px] w-24 shrink-0">
                          {slot.startTime} - {slot.endTime}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                            slot.type === 'break' || slot.type === 'buffer'
                              ? 'bg-emerald-100 text-emerald-800'
                              : slot.type === 'disruption'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-indigo-100 text-indigo-900'
                          }`}
                        >
                          {slot.type}
                        </span>
                        <span className="font-medium text-slate-800 truncate">{slot.title}</span>
                      </div>
                      <span className="text-slate-400 text-[11px] shrink-0 font-sans">
                        {slot.durationMinutes}m
                      </span>
                    </div>
                  ))
                )
              ) : exportTasks.length === 0 ? (
                <div className="p-6 text-center text-slate-400 font-sans">
                  No tasks match current filters.
                </div>
              ) : (
                exportTasks.map((task) => (
                  <div
                    key={task.id}
                    className="px-4 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 font-sans min-w-0">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          task.priority === 'urgent'
                            ? 'bg-rose-600'
                            : task.priority === 'high'
                            ? 'bg-orange-500'
                            : task.priority === 'medium'
                            ? 'bg-indigo-500'
                            : 'bg-slate-400'
                        }`}
                      />
                      <span className="font-medium text-slate-900 truncate">{task.title}</span>
                      <span className="text-slate-400 text-[10px]">({task.category})</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-sans text-slate-500 shrink-0">
                      <span className="hidden sm:inline font-mono">{task.deadline || 'No date'}</span>
                      <span className="font-semibold text-slate-700">{task.estimated_minutes}m</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Success Toast / Notification */}
          {downloadSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 font-semibold animate-in fade-in duration-150">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{downloadSuccess}</span>
            </div>
          )}
        </div>

        {/* Modal Footer with Primary Actions */}
        <div className="px-6 py-4 border-t border-slate-200/80 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer w-full sm:w-auto"
              title="Print directly or use browser save to PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Page</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            {/* Quick Export Secondary Format */}
            <button
              id="export-secondary-format-btn"
              type="button"
              onClick={() => handleExport(format === 'pdf' ? 'csv' : 'pdf')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              {format === 'pdf' ? (
                <>
                  <Table className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Get CSV Instead</span>
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Get PDF Instead</span>
                </>
              )}
            </button>

            {/* Main Download Button */}
            <button
              id="export-primary-download-btn"
              type="button"
              onClick={() => handleExport()}
              className={`inline-flex items-center justify-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold text-white rounded-xl shadow-xs transition-all cursor-pointer ${
                format === 'pdf'
                  ? 'bg-indigo-600 hover:bg-indigo-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Download {format.toUpperCase()}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
