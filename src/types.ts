export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked';

export type Category = 'Academic' | 'Project' | 'Work' | 'Personal' | 'Health';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string;
  priority: PriorityLevel;
  status: TaskStatus;
  deadline: string; // ISO date string or YYYY-MM-DD
  estimated_minutes: number;
  category: Category;
  tags: string[];
  dependencies: string[]; // task IDs this task depends on
  notes?: string;
  ai_rationale?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export type SlotType = 'task' | 'break' | 'buffer' | 'disruption';
export type SlotStatus = 'normal' | 'delayed' | 'rescheduled' | 'disruption';

export interface TimelineSlot {
  id: string;
  startTime: string; // "09:00"
  endTime: string;   // "09:45"
  taskId?: string | null;
  title: string;
  type: SlotType;
  durationMinutes: number;
  completed: boolean;
  isCurrent?: boolean;
  status?: SlotStatus;
  reason?: string;
}

export interface DailyPlan {
  id: string;
  user_id: string;
  date: string;
  total_available_minutes: number;
  planned_minutes: number;
  main_goal: string;
  energy_level: 'low' | 'medium' | 'high';
  slots: TimelineSlot[];
}

export interface FocusSession {
  id: string;
  user_id: string;
  task_id: string;
  task_title: string;
  start_time: string;
  end_time?: string;
  duration_minutes: number;
  completed: boolean;
}

export interface ProductivityStats {
  tasksCompleted: number;
  totalTasks: number;
  completionRate: number;
  focusHours: number;
  tasksDelayed: number;
  avgCompletionMinutes: number;
  productivityScore: number;
  scoreBreakdown: {
    taskCompletion: number;
    focusTime: number;
    deadlineManagement: number;
    consistency: number;
  };
}

export interface AIRecommendation {
  taskId: string;
  title: string;
  priority: PriorityLevel;
  estimatedMinutes: number;
  deadline: string;
  reason: string;
  fitExplanation: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  availableHours: number;
  breakPreferenceMinutes?: number;
  mainGoal: string;
  energyLevel: 'low' | 'medium' | 'high';
}

export type AppPage =
  | 'landing'
  | 'login'
  | 'signup'
  | 'dashboard'
  | 'tasks'
  | 'planner'
  | 'focus'
  | 'calendar'
  | 'analytics'
  | 'settings';
