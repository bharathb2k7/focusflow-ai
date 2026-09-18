import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LandingPage } from './pages/LandingPage';
import { LoginPage, SignupPage } from './pages/AuthPages';
import { DashboardPage } from './pages/DashboardPage';
import { TasksPage } from './pages/TasksPage';
import { PlannerPage } from './pages/PlannerPage';
import { FocusModePage } from './pages/FocusModePage';
import { CalendarPage } from './pages/CalendarPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { TaskModal } from './components/TaskModal';
import { AIChatModal } from './components/AIChatModal';
import { ExportModal } from './components/ExportModal';
import { Task } from './types';

const MainAppLayout: React.FC = () => {
  const { currentPage, isAuthenticated, isExportModalOpen, exportDefaultTab, closeExportModal } = useApp();

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  // Unauthenticated / Standalone Pages
  if (!isAuthenticated && currentPage === 'landing') {
    return <LandingPage />;
  }

  if (currentPage === 'login') {
    return <LoginPage />;
  }

  if (currentPage === 'signup') {
    return <SignupPage />;
  }

  // If focus mode, display full-screen without sidebar distractions
  if (currentPage === 'focus') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <FocusModePage />
      </div>
    );
  }

  const handleOpenNewTask = () => {
    setTaskToEdit(null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-900 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar onOpenNewTask={handleOpenNewTask} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Topbar */}
        <Topbar
          onOpenNewTask={handleOpenNewTask}
          onOpenAIChat={() => setIsAIChatOpen(true)}
        />

        {/* Dynamic Page Container */}
        <main
          id="main-scroll-container"
          className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 sm:py-8 pb-24 md:pb-12 max-w-7xl w-full mx-auto"
        >
          {currentPage === 'dashboard' && (
            <DashboardPage
              onOpenNewTask={handleOpenNewTask}
              onEditTask={handleEditTask}
            />
          )}
          {currentPage === 'tasks' && (
            <TasksPage
              onOpenNewTask={handleOpenNewTask}
              onEditTask={handleEditTask}
            />
          )}
          {currentPage === 'planner' && <PlannerPage />}
          {currentPage === 'calendar' && <CalendarPage />}
          {currentPage === 'analytics' && <AnalyticsPage />}
          {currentPage === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Task Creation/Editing Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        taskToEdit={taskToEdit}
      />

      {/* FocusFlow AI Copilot Drawer */}
      <AIChatModal
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
      />

      {/* Export & Offline Reporting Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={closeExportModal}
        defaultTab={exportDefaultTab}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppLayout />
    </AppProvider>
  );
}
