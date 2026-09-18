import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { PriorityBadge } from '../components/PriorityBadge';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  SkipForward,
  Flame,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowRight,
  Maximize2,
  Minimize2,
  ChevronLeft,
} from 'lucide-react';

export const FocusModePage: React.FC = () => {
  const {
    activeFocusTask,
    setActiveFocusTask,
    tasks,
    toggleTaskComplete,
    logFocusSession,
    setCurrentPage,
  } = useApp();

  const [mode, setMode] = useState<'pomodoro' | 'deep' | 'custom'>('pomodoro');
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [nextSuggestedTaskTitle, setNextSuggestedTaskTitle] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Switch modes
  const handleSelectMode = (newMode: 'pomodoro' | 'deep' | 'custom') => {
    setMode(newMode);
    setIsRunning(false);
    let duration = 25 * 60;
    if (newMode === 'deep') duration = 50 * 60;
    if (newMode === 'custom') duration = (activeFocusTask?.estimated_minutes || 45) * 60;
    setTotalSeconds(duration);
    setSecondsRemaining(duration);
  };

  // Timer tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            handleCompleteTask();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsRemaining(totalSeconds);
  };

  const handleCompleteTask = () => {
    setIsRunning(false);
    const durationSpentMinutes = Math.max(1, Math.round((totalSeconds - secondsRemaining) / 60));

    if (activeFocusTask) {
      logFocusSession(activeFocusTask.id, durationSpentMinutes, true);
    }

    // Identify next task
    const remainingTasks = tasks.filter(
      (t) => t.id !== activeFocusTask?.id && t.status !== 'completed'
    );
    const nextTask = remainingTasks[0];
    if (nextTask) {
      setNextSuggestedTaskTitle(`${nextTask.title} (${nextTask.estimated_minutes} min)`);
    } else {
      setNextSuggestedTaskTitle('All scheduled tasks completed!');
    }

    setShowCelebration(true);
  };

  const handleNextTask = () => {
    setShowCelebration(false);
    const remainingTasks = tasks.filter(
      (t) => t.id !== activeFocusTask?.id && t.status !== 'completed'
    );
    if (remainingTasks.length > 0) {
      setActiveFocusTask(remainingTasks[0]);
      setSecondsRemaining(totalSeconds);
      setIsRunning(false);
    } else {
      setCurrentPage('dashboard');
    }
  };

  const handleSkip = () => {
    setIsRunning(false);
    const remainingTasks = tasks.filter(
      (t) => t.id !== activeFocusTask?.id && t.status !== 'completed'
    );
    if (remainingTasks.length > 0) {
      setActiveFocusTask(remainingTasks[0]);
      setSecondsRemaining(totalSeconds);
    }
  };

  // Format mm:ss
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressPercent = Math.round(((totalSeconds - secondsRemaining) / totalSeconds) * 100);

  const fallbackTask = tasks.find((t) => t.status !== 'completed') || tasks[0];
  const currentTask = activeFocusTask || fallbackTask;

  return (
    <div className="min-h-[82vh] flex flex-col justify-between max-w-3xl mx-auto py-6 px-4 animate-in fade-in duration-200">
      {/* Top Bar: Return to Dashboard & Sound Toggle */}
      <div className="flex items-center justify-between pb-4">
        <button
          type="button"
          onClick={() => setCurrentPage('dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Exit Focus Mode</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
            title={soundEnabled ? 'Ambient sound on' : 'Sound muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Center Focus Area */}
      <div className="flex-1 flex flex-col items-center justify-center text-center my-8">
        {/* Task Title & Context */}
        {currentTask ? (
          <div className="mb-8 max-w-lg">
            <div className="flex items-center justify-center gap-2 mb-3">
              <PriorityBadge priority={currentTask.priority} size="sm" />
              {currentTask.category && (
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  {currentTask.category}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {currentTask.title}
            </h1>

            {currentTask.description && (
              <p className="text-xs sm:text-sm text-slate-500 mt-2 line-clamp-2">
                {currentTask.description}
              </p>
            )}
          </div>
        ) : (
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Focused Session</h1>
            <p className="text-sm text-slate-500 mt-1">Free-form deep work block</p>
          </div>
        )}

        {/* Circular Progress & Huge Digital Timer */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center my-4">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 240 240">
            {/* Background ring */}
            <circle
              cx="120"
              cy="120"
              r="104"
              stroke="currentColor"
              strokeWidth="10"
              className="text-slate-100"
              fill="transparent"
            />
            {/* Progress ring */}
            <circle
              cx="120"
              cy="120"
              r="104"
              stroke="currentColor"
              strokeWidth="10"
              className="text-indigo-600 transition-all duration-500 ease-linear"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 104}
              strokeDashoffset={2 * Math.PI * 104 * (1 - progressPercent / 100)}
              strokeLinecap="round"
            />
          </svg>

          {/* Time digits */}
          <div className="absolute flex flex-col items-center justify-center">
            <span
              id="focus-timer-display"
              className="text-5xl sm:text-6xl font-black font-mono text-slate-900 tracking-tight"
            >
              {formattedTime}
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 mt-2">
              {isRunning ? 'Flow Active' : 'Paused'}
            </span>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl my-6 text-xs font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => handleSelectMode('pomodoro')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              mode === 'pomodoro'
                ? 'bg-white text-slate-950 shadow-xs font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            Pomodoro (25m)
          </button>
          <button
            type="button"
            onClick={() => handleSelectMode('deep')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              mode === 'deep'
                ? 'bg-white text-slate-950 shadow-xs font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            Deep Work (50m)
          </button>
          <button
            type="button"
            onClick={() => handleSelectMode('custom')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              mode === 'custom'
                ? 'bg-white text-slate-950 shadow-xs font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            Task Estimate ({currentTask?.estimated_minutes || 45}m)
          </button>
        </div>

        {/* Playback Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            id="focus-play-pause-btn"
            type="button"
            onClick={handleStartPause}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-2xl shadow-md transition-all cursor-pointer"
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-white" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" />
                <span>{secondsRemaining < totalSeconds ? 'Resume' : 'Start Focus'}</span>
              </>
            )}
          </button>

          <button
            id="focus-complete-btn"
            type="button"
            onClick={handleCompleteTask}
            className="inline-flex items-center gap-1.5 px-5 py-3.5 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-2xl transition-colors cursor-pointer"
            title="Mark this task as finished"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Complete Task</span>
          </button>

          <button
            id="focus-skip-btn"
            type="button"
            onClick={handleSkip}
            className="p-3.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-2xl transition-colors cursor-pointer"
            title="Skip to next task"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-3.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-2xl transition-colors cursor-pointer"
            title="Reset timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Subtle Celebration & Next Task Prompt (Section 14) */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-7 h-7" />
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              Task Finished!
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Outstanding execution. Focus session logged to your productivity stats.
            </p>

            {nextSuggestedTaskTitle && (
              <div className="mt-6 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block mb-1">
                  Next recommended task
                </span>
                <p className="text-sm font-bold text-slate-900">
                  {nextSuggestedTaskTitle}
                </p>
              </div>
            )}

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentPage('dashboard')}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl"
              >
                Back to Dashboard
              </button>
              <button
                type="button"
                onClick={handleNextTask}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
              >
                <span>Continue to Next Task</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
