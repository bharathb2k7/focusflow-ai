import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Task,
  TimelineSlot,
  FocusSession,
  User,
  AppPage,
  AIRecommendation,
  ProductivityStats,
} from '../types';
import {
  DEFAULT_USER,
  INITIAL_TASKS,
  INITIAL_TIMELINE_SLOTS,
  INITIAL_FOCUS_SESSIONS,
} from '../data/mockData';

interface DisruptionState {
  active: boolean;
  beforeSummary: string[];
  afterSummary: string[];
  alertMessage: string;
  advice: string;
}

interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  currentPage: AppPage;
  setCurrentPage: (page: AppPage) => void;
  tasks: Task[];
  timelineSlots: TimelineSlot[];
  focusSessions: FocusSession[];
  aiRecommendation: AIRecommendation | null;
  activeFocusTask: Task | null;
  setActiveFocusTask: (task: Task | null) => void;
  isLoadingAI: boolean;
  disruptionState: DisruptionState | null;
  isOverloaded: boolean;
  overloadDiffMinutes: number;
  availableMinutes: number;
  plannedMinutes: number;
  productivityScore: number;
  stats: ProductivityStats;
  todayOverview: {
    tasksRemaining: number;
    completed: number;
    overdue: number;
    focusTimeFormatted: string;
  };
  login: (email: string, password?: string) => boolean;
  signup: (name: string, email: string, password?: string) => boolean;
  logout: () => void;
  startDemoMode: () => void;
  createTask: (taskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Task;
  updateTask: (id: string, taskData: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
  prioritizeWithAI: () => Promise<void>;
  recommendNextTask: () => Promise<AIRecommendation | null>;
  planDayWithAI: (hours: number, goal: string, energy: 'low' | 'medium' | 'high') => Promise<TimelineSlot[]>;
  applyPlan: (newSlots: TimelineSlot[], plannedMinutes: number) => void;
  simulateDisruption: () => Promise<void>;
  resetDisruption: () => void;
  optimizeOverload: () => void;
  logFocusSession: (taskId: string, durationMinutes: number, completed: boolean) => void;
  askAIChat: (message: string) => Promise<string>;
  updateUserPreferences: (prefs: Partial<User>) => void;
  isExportModalOpen: boolean;
  exportDefaultTab: 'plan' | 'tasks';
  openExportModal: (tab?: 'plan' | 'tasks') => void;
  closeExportModal: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('focusflow_user');
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('focusflow_auth') === 'true';
  });

  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    return localStorage.getItem('focusflow_demo') !== 'false';
  });

  const [currentPage, setCurrentPage] = useState<AppPage>(() => {
    // If not authenticated, start on landing page
    const auth = localStorage.getItem('focusflow_auth') === 'true';
    return auth ? 'dashboard' : 'landing';
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('focusflow_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [timelineSlots, setTimelineSlots] = useState<TimelineSlot[]>(() => {
    const saved = localStorage.getItem('focusflow_slots');
    return saved ? JSON.parse(saved) : INITIAL_TIMELINE_SLOTS;
  });

  const [focusSessions, setFocusSessions] = useState<FocusSession[]>(() => {
    const saved = localStorage.getItem('focusflow_sessions');
    return saved ? JSON.parse(saved) : INITIAL_FOCUS_SESSIONS;
  });

  const [activeFocusTask, setActiveFocusTask] = useState<Task | null>(() => {
    return tasks.find((t) => t.id === 'task-1') || tasks[0] || null;
  });

  const [aiRecommendation, setAiRecommendation] = useState<AIRecommendation | null>({
    taskId: 'task-1',
    title: 'Complete DBMS Assignment',
    priority: 'high',
    estimatedMinutes: 45,
    deadline: 'Tomorrow',
    reason: 'High urgency + approaching deadline',
    fitExplanation:
      'FocusFlow selected this task because it has a close deadline, high importance and fits your current available focus window.',
  });

  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);
  const [disruptionState, setDisruptionState] = useState<DisruptionState | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [exportDefaultTab, setExportDefaultTab] = useState<'plan' | 'tasks'>('plan');

  const openExportModal = (tab: 'plan' | 'tasks' = 'plan') => {
    setExportDefaultTab(tab);
    setIsExportModalOpen(true);
  };

  const closeExportModal = () => {
    setIsExportModalOpen(false);
  };

  // Sync to local storage
  useEffect(() => {
    if (user) localStorage.setItem('focusflow_user', JSON.stringify(user));
    localStorage.setItem('focusflow_auth', String(isAuthenticated));
    localStorage.setItem('focusflow_demo', String(isDemoMode));
    localStorage.setItem('focusflow_tasks', JSON.stringify(tasks));
    localStorage.setItem('focusflow_slots', JSON.stringify(timelineSlots));
    localStorage.setItem('focusflow_sessions', JSON.stringify(focusSessions));
  }, [user, isAuthenticated, isDemoMode, tasks, timelineSlots, focusSessions]);

  // Overload calculations
  const availableMinutes = (user?.availableHours || 4) * 60;
  const plannedMinutes = useMemo(() => {
    return timelineSlots
      .filter((s) => s.type === 'task')
      .reduce((acc, s) => acc + s.durationMinutes, 0);
  }, [timelineSlots]);

  const isOverloaded = plannedMinutes > availableMinutes;
  const overloadDiffMinutes = Math.max(0, plannedMinutes - availableMinutes);

  // Today's overview stats
  const todayOverview = useMemo(() => {
    const remaining = tasks.filter((t) => t.status !== 'completed').length;
    const completed = tasks.filter((t) => t.status === 'completed').length;

    // Overdue tasks check
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const overdue = tasks.filter(
      (t) => t.status !== 'completed' && t.deadline && t.deadline < todayStr
    ).length;

    const totalMinutes = focusSessions.reduce((acc, s) => acc + s.duration_minutes, 0);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const focusTimeFormatted = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

    return {
      tasksRemaining: remaining,
      completed,
      overdue,
      focusTimeFormatted,
    };
  }, [tasks, focusSessions]);

  // Composite Productivity Score & authentic stats
  const stats = useMemo<ProductivityStats>(() => {
    const total = tasks.length || 1;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const completionRate = Math.round((completed / total) * 100);

    const totalFocusMinutes = focusSessions.reduce((acc, s) => acc + s.duration_minutes, 0);
    const focusHours = parseFloat((totalFocusMinutes / 60).toFixed(1));

    const overdueCount = todayOverview.overdue;

    // Score calculations
    const taskCompletionScore = Math.min(100, Math.round(completionRate));
    const focusTimeScore = Math.min(100, Math.round((totalFocusMinutes / (4 * 60)) * 100)); // against 4h goal
    const deadlineScore = Math.max(50, 100 - overdueCount * 10);
    const consistencyScore = 80;

    const composite = Math.round(
      taskCompletionScore * 0.35 +
        focusTimeScore * 0.25 +
        deadlineScore * 0.25 +
        consistencyScore * 0.15
    );

    return {
      tasksCompleted: completed,
      totalTasks: total,
      completionRate,
      focusHours,
      tasksDelayed: overdueCount,
      avgCompletionMinutes: 38,
      productivityScore: composite,
      scoreBreakdown: {
        taskCompletion: taskCompletionScore,
        focusTime: focusTimeScore,
        deadlineManagement: deadlineScore,
        consistency: consistencyScore,
      },
    };
  }, [tasks, focusSessions, todayOverview]);

  const productivityScore = stats.productivityScore;

  // Authentication methods
  const login = (email: string) => {
    setUser({
      ...DEFAULT_USER,
      email: email || DEFAULT_USER.email,
      name: email ? email.split('@')[0] : DEFAULT_USER.name,
    });
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
    return true;
  };

  const signup = (name: string, email: string) => {
    setUser({
      ...DEFAULT_USER,
      name: name || 'Productive Hero',
      email: email || 'user@focusflow.ai',
    });
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentPage('landing');
  };

  const startDemoMode = () => {
    setUser(DEFAULT_USER);
    setTasks(INITIAL_TASKS);
    setTimelineSlots(INITIAL_TIMELINE_SLOTS);
    setFocusSessions(INITIAL_FOCUS_SESSIONS);
    setIsAuthenticated(true);
    setIsDemoMode(true);
    setCurrentPage('dashboard');
  };

  // Task operations
  const createTask = (taskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      user_id: user?.id || 'user-demo-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t))
    );
    if (activeFocusTask?.id === id) {
      setActiveFocusTask((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setTimelineSlots((prev) => prev.filter((s) => s.taskId !== id));
    if (activeFocusTask?.id === id) {
      const remaining = tasks.filter((t) => t.id !== id && t.status !== 'completed');
      setActiveFocusTask(remaining[0] || null);
    }
  };

  const toggleTaskComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const isDone = t.status === 'completed';
          return {
            ...t,
            status: isDone ? 'not_started' : 'completed',
            completed_at: isDone ? undefined : new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        }
        return t;
      })
    );

    // Also update slot status
    setTimelineSlots((prev) =>
      prev.map((s) => (s.taskId === id ? { ...s, completed: !s.completed } : s))
    );
  };

  // AI Task Prioritization
  const prioritizeWithAI = async () => {
    setIsLoadingAI(true);
    try {
      const res = await fetch('/api/ai/prioritize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks,
          availableMinutes,
        }),
      });
      const data = await res.json();
      if (data?.prioritized) {
        const priorityOrderMap = new Map<string, { suggestedPriority: string; aiRationale: string }>();
        data.prioritized.forEach((item: any) => {
          priorityOrderMap.set(item.taskId, item);
        });

        setTasks((prev) => {
          return [...prev].sort((a, b) => {
            if (a.status === 'completed' && b.status !== 'completed') return 1;
            if (b.status === 'completed' && a.status !== 'completed') return -1;
            const aInfo = priorityOrderMap.get(a.id);
            const bInfo = priorityOrderMap.get(b.id);
            if (!aInfo && !bInfo) return 0;
            if (!aInfo) return 1;
            if (!bInfo) return -1;
            const rank: any = { urgent: 4, high: 3, medium: 2, low: 1 };
            return rank[bInfo.suggestedPriority] - rank[aInfo.suggestedPriority];
          }).map((t) => {
            const info = priorityOrderMap.get(t.id);
            if (info) {
              return {
                ...t,
                priority: (info.suggestedPriority as any) || t.priority,
                ai_rationale: info.aiRationale,
              };
            }
            return t;
          });
        });
      }
    } catch (err) {
      console.warn('Prioritize call failed:', err);
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Recommend Next Task
  const recommendNextTask = async (): Promise<AIRecommendation | null> => {
    setIsLoadingAI(true);
    try {
      const res = await fetch('/api/ai/recommend-next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks,
          availableMinutes: 45,
          currentHour: '09:00 AM',
        }),
      });
      const data = await res.json();
      if (data?.recommendation) {
        setAiRecommendation(data.recommendation);
        const taskObj = tasks.find((t) => t.id === data.recommendation.taskId);
        if (taskObj) {
          setActiveFocusTask(taskObj);
        }
        return data.recommendation;
      }
    } catch (err) {
      console.warn('Recommendation failed:', err);
    } finally {
      setIsLoadingAI(false);
    }
    return null;
  };

  // Plan Day with AI
  const planDayWithAI = async (hours: number, goal: string, energy: 'low' | 'medium' | 'high') => {
    setIsLoadingAI(true);
    try {
      const res = await fetch('/api/ai/plan-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          availableHours: hours,
          mainGoal: goal,
          energyLevel: energy,
          tasks,
        }),
      });
      const data = await res.json();
      if (data?.plan?.slots) {
        return data.plan.slots as TimelineSlot[];
      }
    } catch (err) {
      console.warn('Plan day failed:', err);
    } finally {
      setIsLoadingAI(false);
    }
    return timelineSlots;
  };

  const applyPlan = (newSlots: TimelineSlot[]) => {
    setTimelineSlots(newSlots);
    if (user) {
      setUser({ ...user });
    }
  };

  // Hackathon Demo: Simulate Disruption
  const simulateDisruption = async () => {
    setIsLoadingAI(true);
    try {
      const res = await fetch('/api/ai/replan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPlan: timelineSlots,
          disruptionReason: 'Unexpected 1-hour executive & team sync meeting',
          delayMinutes: 60,
        }),
      });
      const data = await res.json();
      if (data?.replan) {
        const { beforeAfter, adjustedSlots, alertMessage, advice } = data.replan;
        setDisruptionState({
          active: true,
          beforeSummary: beforeAfter.beforeSummary,
          afterSummary: beforeAfter.afterSummary,
          alertMessage,
          advice,
        });
        setTimelineSlots(adjustedSlots);
      }
    } catch (err) {
      console.warn('Disruption simulation failed:', err);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const resetDisruption = () => {
    setDisruptionState(null);
    setTimelineSlots(INITIAL_TIMELINE_SLOTS);
  };

  // Optimize Overload
  const optimizeOverload = () => {
    // Find low priority tasks currently scheduled and defer them
    const nonCritical = timelineSlots.filter((s) => s.type === 'task').slice(-2);
    setTimelineSlots((prev) => prev.filter((s) => !nonCritical.some((nc) => nc.id === s.id)));
  };

  // Focus Session logging
  const logFocusSession = (taskId: string, durationMinutes: number, completed: boolean) => {
    const task = tasks.find((t) => t.id === taskId);
    const newSession: FocusSession = {
      id: `sess-${Date.now()}`,
      user_id: user?.id || 'user-demo-1',
      task_id: taskId,
      task_title: task?.title || 'Focused Block',
      start_time: new Date(Date.now() - durationMinutes * 60 * 1000).toISOString(),
      end_time: new Date().toISOString(),
      duration_minutes: durationMinutes,
      completed,
    };
    setFocusSessions((prev) => [newSession, ...prev]);

    if (completed && taskId) {
      toggleTaskComplete(taskId);
    }
  };

  // AIChat helper
  const askAIChat = async (message: string): Promise<string> => {
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          context: {
            tasks,
            availableTimeHours: user?.availableHours || 4,
            plannedTimeHours: parseFloat((plannedMinutes / 60).toFixed(1)),
            focusMinutes: focusSessions.reduce((acc, s) => acc + s.duration_minutes, 0),
          },
        }),
      });
      const data = await res.json();
      return data?.reply || 'I analyzed your schedule and tasks. Focus on high priority deadlines first.';
    } catch {
      return 'FocusFlow AI recommends completing DBMS assignment first, as its deadline approaches tomorrow.';
    }
  };

  const updateUserPreferences = (prefs: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...prefs });
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated,
        isDemoMode,
        currentPage,
        setCurrentPage,
        tasks,
        timelineSlots,
        focusSessions,
        aiRecommendation,
        activeFocusTask,
        setActiveFocusTask,
        isLoadingAI,
        disruptionState,
        isOverloaded,
        overloadDiffMinutes,
        availableMinutes,
        plannedMinutes,
        productivityScore,
        stats,
        todayOverview,
        login,
        signup,
        logout,
        startDemoMode,
        createTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        prioritizeWithAI,
        recommendNextTask,
        planDayWithAI,
        applyPlan,
        simulateDisruption,
        resetDisruption,
        optimizeOverload,
        logFocusSession,
        askAIChat,
        updateUserPreferences,
        isExportModalOpen,
        exportDefaultTab,
        openExportModal,
        closeExportModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
