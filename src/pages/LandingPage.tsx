import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Flame,
  CheckCircle2,
  Clock,
  Calendar,
  Layers,
  TrendingUp,
  Activity,
  Play,
  RotateCw,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setCurrentPage, startDemoMode } = useApp();

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation bar */}
      <nav className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="2.2" />
              <path d="M12 5V2M19 12H22M12 19V22M5 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M10 12L15 9V15L10 12Z" fill="currentColor" />
            </svg>
          </div>
          <span className="font-extrabold text-base tracking-tight text-slate-900">
            FOCUSFLOW AI
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setCurrentPage('login')}
            className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg transition-colors cursor-pointer"
          >
            Log In
          </button>
          <button
            id="landing-try-demo-nav"
            type="button"
            onClick={startDemoMode}
            className="text-xs sm:text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
          >
            Try Demo
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage('signup')}
            className="hidden sm:inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            Get Started
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-8 pt-12 pb-16 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100/80 mb-6">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>AI-powered productivity</span>
        </div>

        {/* Hero Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-950 tracking-tight leading-[1.15] mb-6">
          Your AI-powered productivity <br className="hidden sm:inline" />
          <span className="text-indigo-600">command center.</span>
        </h1>

        {/* Subheading */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed mb-8">
          FocusFlow turns your tasks, deadlines and available time into an intelligent daily plan — and adapts when life gets in the way.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-14">
          <button
            id="hero-build-my-day-btn"
            type="button"
            onClick={() => setCurrentPage('signup')}
            className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <span>Build My Day</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            id="hero-try-demo-btn"
            type="button"
            onClick={startDemoMode}
            className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <span>Try Demo</span>
            <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              Instant
            </span>
          </button>
        </div>

        {/* Hero Dashboard Preview Mockup */}
        <div
          id="landing-dashboard-preview"
          className="relative max-w-4xl mx-auto rounded-2xl bg-white border border-slate-200/90 shadow-2xl p-4 sm:p-6 text-left overflow-hidden"
        >
          {/* Mock Window Controls */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-400" />
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="ml-3 text-xs font-semibold text-slate-500">
                FocusFlow Workspace — Today&apos;s Active Schedule
              </span>
            </div>
            <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
              Live Preview
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Left 2 Cols: AI Recommendation & Timeline */}
            <div className="md:col-span-2 space-y-4">
              {/* Preview Recommendation Card */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50/50 to-white border border-indigo-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-600" />
                    What should I do now?
                  </span>
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                    High Urgency
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  Complete DBMS Assignment
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  High urgency + approaching deadline tomorrow. Optimal 45-min focus window.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={startDemoMode}
                    className="text-xs font-semibold px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Start Task
                  </button>
                  <span className="text-xs text-slate-400">Estimated: 45 min</span>
                </div>
              </div>

              {/* Preview Timeline */}
              <div className="p-4 rounded-xl bg-slate-50/60 border border-slate-200/60">
                <span className="text-xs font-bold text-slate-800 block mb-2">
                  Today&apos;s Sequence
                </span>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
                    <span className="font-mono text-slate-400">09:00 — 09:45</span>
                    <span className="font-semibold text-indigo-900">DBMS Assignment</span>
                    <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/70 border border-slate-100">
                    <span className="font-mono text-slate-400">09:45 — 10:00</span>
                    <span className="text-slate-600">Rest & Hydration Break</span>
                    <span className="text-slate-400">15m</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/70 border border-slate-100">
                    <span className="font-mono text-slate-400">10:00 — 10:45</span>
                    <span className="text-slate-600">Project Development</span>
                    <span className="text-slate-400">45m</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col: Productivity Score & Progress */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">Productivity Score</span>
                  <span className="text-xl font-black text-indigo-600">82/100</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-500 mb-0.5">
                      <span>Task Completion</span>
                      <span className="font-bold text-slate-800">82%</span>
                    </div>
                    <div className="h-1 bg-slate-100 rounded-full">
                      <div className="h-full bg-emerald-500 rounded-full w-[82%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-500 mb-0.5">
                      <span>Focus Time</span>
                      <span className="font-bold text-slate-800">76%</span>
                    </div>
                    <div className="h-1 bg-slate-100 rounded-full">
                      <div className="h-full bg-indigo-500 rounded-full w-[76%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-500 mb-0.5">
                      <span>Deadline Management</span>
                      <span className="font-bold text-slate-800">90%</span>
                    </div>
                    <div className="h-1 bg-slate-100 rounded-full">
                      <div className="h-full bg-amber-500 rounded-full w-[90%]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs">
                <span className="font-bold text-indigo-950 block mb-1">
                  ⚡ Adaptive Replanning Ready
                </span>
                <p className="text-slate-600 text-[11px]">
                  If an unexpected meeting strikes, FocusFlow adjusts remaining slots automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section: "Stop managing tasks. Start getting things done." */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-16 border-t border-slate-200/80">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
            Stop managing tasks. Start getting things done.
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Traditional todo apps leave you guessing what to do next. FocusFlow continuously calculates the optimal sequence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-xs hover:border-indigo-200 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              AI Prioritization
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              &ldquo;Know what deserves your attention first.&rdquo;
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Analyzes urgency, deadline proximity, effort, dependencies, and cognitive load to order your queue intelligently.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-xs hover:border-indigo-200 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-4">
              <RotateCw className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Adaptive Planning
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              &ldquo;Your schedule automatically adjusts when plans change.&rdquo;
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Unexpected meeting or delayed task? FocusFlow calculates new slot boundaries and shifts non-critical work forward.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-xs hover:border-indigo-200 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Focus Mode
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              &ldquo;Eliminate distractions and work on one important task at a time.&rdquo;
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Dedicated full-screen execution with countdown timer, Pomodoro intervals (25/5, 50/10), and milestone tracking.
            </p>
          </div>
        </div>
      </section>

      {/* How it works: 5 Steps */}
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-16 border-t border-slate-200/80">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
            The Productivity Loop
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            How FocusFlow Works
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            {
              step: 'STEP 1',
              title: 'Add your tasks',
              desc: 'Input your tasks with deadlines, duration estimates, and dependencies.',
            },
            {
              step: 'STEP 2',
              title: 'Set available time',
              desc: 'Tell FocusFlow how many hours you have today and your main goal.',
            },
            {
              step: 'STEP 3',
              title: 'AI prioritizes workload',
              desc: 'Urgency, impact, and dependencies are computed in seconds.',
            },
            {
              step: 'STEP 4',
              title: 'Creates your day',
              desc: 'A minute-by-minute timeline is generated with healthy recovery breaks.',
            },
            {
              step: 'STEP 5',
              title: 'AI dynamically replans',
              desc: 'If anything gets delayed, 1-click adaptive replanning reorganizes the rest.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block mb-2">
                  {item.step}
                </span>
                <h4 className="text-sm font-bold text-slate-900 mb-1.5">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-slate-400">
                <span>0{idx + 1}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-16 text-center">
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mb-4 text-white">
              Plan smarter. Focus deeper. Finish faster.
            </h2>
            <p className="text-sm sm:text-base text-slate-300 mb-8 leading-relaxed">
              Experience the intelligent productivity operating system designed to get you across the finish line.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={startDemoMode}
                className="px-6 py-3 text-sm font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Try Demo Workspace
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage('signup')}
                className="px-6 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="w-full border-t border-slate-200/80 py-8 text-center text-xs text-slate-500">
        <p>© 2026 FocusFlow AI — Intelligent Productivity Operating System</p>
        <p className="text-[11px] text-slate-400 mt-1">
          &ldquo;Know what to do. Know when to do it. Get it done.&rdquo;
        </p>
      </footer>
    </div>
  );
};
