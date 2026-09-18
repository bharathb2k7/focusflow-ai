import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coffee,
  Flame,
  Plus,
  Layers,
} from 'lucide-react';

export const CalendarPage: React.FC = () => {
  const { timelineSlots, tasks, setActiveFocusTask, setCurrentPage } = useApp();
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hoursList = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Calendar & Time Blocks
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Visual hourly time-blocking mapped directly to your daily plan
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex p-1 bg-slate-100 rounded-xl text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'day' ? 'bg-white text-slate-900 shadow-xs' : ''
              }`}
            >
              Day View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'week' ? 'bg-white text-slate-900 shadow-xs' : ''
              }`}
            >
              Week View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'month' ? 'bg-white text-slate-900 shadow-xs' : ''
              }`}
            >
              Month View
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Stage */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs">
        {/* Date Navigator Bar */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold text-slate-900">
              Today &bull; {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <button
              type="button"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              <span className="text-slate-600">Work Block</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-600">Break Block</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-600">Meeting / Disruption</span>
            </div>
          </div>
        </div>

        {/* Day View Timeline Grid */}
        {viewMode === 'day' && (
          <div className="relative divide-y divide-slate-100">
            {hoursList.map((hour) => {
              // Check if any slot matches this hour
              const matchingSlots = timelineSlots.filter((s) => s.startTime.startsWith(hour.slice(0, 2)));

              return (
                <div key={hour} className="flex min-h-[72px] py-2 gap-4">
                  <div className="w-16 text-right text-xs font-mono text-slate-400 shrink-0 select-none pt-1">
                    {hour}
                  </div>

                  <div className="flex-1 flex flex-col gap-2">
                    {matchingSlots.map((slot) => {
                      const isTask = slot.type === 'task';
                      const isBreak = slot.type === 'break' || slot.type === 'buffer';
                      const isMeeting = slot.type === 'disruption';

                      return (
                        <div
                          key={slot.id}
                          onClick={() => {
                            if (isTask && slot.taskId) {
                              const t = tasks.find((item) => item.id === slot.taskId);
                              if (t) {
                                setActiveFocusTask(t);
                                setCurrentPage('focus');
                              }
                            }
                          }}
                          className={`p-2.5 rounded-xl border text-xs transition-all ${
                            isBreak
                              ? 'bg-emerald-50/60 border-emerald-200/80 text-emerald-900'
                              : isMeeting
                              ? 'bg-amber-50/80 border-amber-300 text-amber-950 font-medium'
                              : 'bg-indigo-50/70 border-indigo-200/80 text-indigo-950 hover:border-indigo-400 hover:shadow-xs cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {isBreak ? (
                                <Coffee className="w-3.5 h-3.5 text-emerald-600" />
                              ) : isMeeting ? (
                                <span className="w-2 h-2 rounded-full bg-amber-500" />
                              ) : (
                                <Flame className="w-3.5 h-3.5 text-indigo-600" />
                              )}
                              <span className="font-bold">{slot.title}</span>
                            </div>
                            <span className="font-mono text-[11px] text-slate-500">
                              {slot.startTime} - {slot.endTime} ({slot.durationMinutes}m)
                            </span>
                          </div>
                          {slot.reason && (
                            <p className="text-[11px] text-slate-500 mt-1">{slot.reason}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Week View */}
        {viewMode === 'week' && (
          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {daysOfWeek.map((day, idx) => (
              <div key={day} className="p-3 bg-slate-50 rounded-xl border border-slate-100 min-h-[300px]">
                <span className="font-bold text-slate-700 block mb-2">{day}</span>
                {idx === 2 ? (
                  <div className="space-y-1.5 text-left">
                    <div className="p-1.5 bg-indigo-100 text-indigo-900 rounded font-semibold text-[10px]">
                      09:00 DBMS Assignment
                    </div>
                    <div className="p-1.5 bg-emerald-100 text-emerald-900 rounded text-[10px]">
                      09:45 Break
                    </div>
                    <div className="p-1.5 bg-indigo-100 text-indigo-900 rounded font-semibold text-[10px]">
                      10:00 Project Dev
                    </div>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-400">Available</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Month View */}
        {viewMode === 'month' && (
          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {Array.from({ length: 31 }).map((_, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl border min-h-[64px] flex flex-col justify-between ${
                  i === 16 ? 'bg-indigo-50/60 border-indigo-300 font-bold' : 'bg-white border-slate-100'
                }`}
              >
                <span className="text-right text-slate-400 text-[10px]">{i + 1}</span>
                {i === 16 && (
                  <span className="text-[10px] text-indigo-700 font-bold text-left truncate">
                    5 Tasks Scheduled
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
