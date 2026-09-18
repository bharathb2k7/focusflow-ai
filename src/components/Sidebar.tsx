import React from 'react';
import { useApp } from '../context/AppContext';
import { AppPage } from '../types';
import {
  LayoutDashboard,
  CheckSquare,
  Sparkles,
  Flame,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  SlidersHorizontal,
  ChevronRight,
  Download,
} from 'lucide-react';

interface SidebarProps {
  onOpenNewTask?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenNewTask }) => {
  const { currentPage, setCurrentPage, logout, user, isDemoMode, startDemoMode, openExportModal } = useApp();

  const navItems: { page: AppPage; label: string; icon: React.FC<{ className?: string }> }[] = [
    { page: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { page: 'tasks', label: 'Tasks', icon: CheckSquare },
    { page: 'planner', label: 'AI Planner', icon: Sparkles },
    { page: 'focus', label: 'Focus Mode', icon: Flame },
    { page: 'calendar', label: 'Calendar', icon: Calendar },
    { page: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        id="desktop-sidebar"
        className="hidden md:flex flex-col w-64 h-screen bg-white border-r border-slate-200/80 sticky top-0 shrink-0 select-none z-30"
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentPage('dashboard')}
            className="flex items-center gap-3 text-left group"
          >
            {/* Minimal abstract symbol combining focus, flow, forward movement */}
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="2.2" />
                <path d="M12 5V2M19 12H22M12 19V22M5 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M10 12L15 9V15L10 12Z" fill="currentColor" />
              </svg>
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-slate-900 block leading-none">
                FOCUSFLOW AI
              </span>
              <span className="text-[10px] font-semibold text-indigo-600 tracking-wider uppercase mt-1 block">
                Productivity OS
              </span>
            </div>
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Workspace
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.page;
            return (
              <button
                key={item.page}
                id={`nav-${item.page}`}
                type="button"
                onClick={() => setCurrentPage(item.page)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50/90 text-indigo-700 shadow-xs border border-indigo-100/80 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
              </button>
            );
          })}
        </div>

        {/* Demo Mode Badge */}
        {isDemoMode && (
          <div className="mx-3 mb-2 p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-900">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                Hackathon Demo Mode
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1 leading-tight">
              Preloaded with real tasks, deadlines, and schedule.
            </p>
            <button
              type="button"
              onClick={startDemoMode}
              className="mt-2 text-[10px] font-semibold text-indigo-700 hover:underline flex items-center gap-1"
            >
              <span>Reload Demo Workspace</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Bottom / Secondary Navigation & User Profile */}
        <div className="p-3 border-t border-slate-100 space-y-1">
          <button
            id="nav-export"
            type="button"
            onClick={() => openExportModal('plan')}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            title="Download daily plan or task list as PDF or CSV"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Export & Reports</span>
          </button>

          <button
            id="nav-settings"
            type="button"
            onClick={() => setCurrentPage('settings')}
            className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition-colors ${
              currentPage === 'settings'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Settings</span>
          </button>

          {/* User info card */}
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between px-2 py-1.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                alt={user?.name || 'User'}
                className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate leading-none">
                  {user?.name || 'Alex Vance'}
                </p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                  {user?.email || 'alex.vance@focusflow.ai'}
                </p>
              </div>
            </div>

            <button
              id="logout-btn"
              type="button"
              onClick={logout}
              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav
        id="mobile-bottom-nav"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 flex items-center justify-around"
      >
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.page;
          return (
            <button
              key={item.page}
              type="button"
              onClick={() => setCurrentPage(item.page)}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                isActive ? 'text-indigo-600 font-bold' : 'text-slate-500'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setCurrentPage('settings')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-medium ${
            currentPage === 'settings' ? 'text-indigo-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Settings className="w-5 h-5 text-slate-400" />
          <span>Settings</span>
        </button>
      </nav>
    </>
  );
};
