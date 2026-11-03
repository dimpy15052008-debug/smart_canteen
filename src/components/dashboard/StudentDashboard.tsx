import React, { Suspense, lazy, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { MetricCard } from '../ui/MetricCard';
import { StatusPill } from '../ui/StatusPill';
import { Skeleton } from '../ui/Skeleton';
import {
  ShieldCheck,
  Bot,
  Camera,
  Utensils,
  CreditCard,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Clock,
  MapPin,
  Sparkles,
  Bus,
  CheckCircle2,
  FileText,
  LifeBuoy,
  BookOpen,
  Mic,
  Activity,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';

const Avatar3DCanvas = lazy(() =>
  import('../campus-ai/Avatar3DCanvas').then((m) => ({ default: m.Avatar3DCanvas }))
);

interface RecentActivityItem {
  id: string;
  type: 'attendance' | 'canteen' | 'academic' | 'notice' | 'fee';
  title: string;
  description: string;
  timestamp: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: 'success' | 'warning' | 'primary' | 'ai';
  actionRoute?: string;
}

const recentActivities: RecentActivityItem[] = [
  {
    id: 'act-1',
    type: 'attendance',
    title: 'Biometric Attendance Verified',
    description: 'CS601 Distributed Systems • Hall 402 • Face + Geofence hash logged.',
    timestamp: '10:02 AM',
    icon: CheckCircle2,
    tone: 'success',
    actionRoute: '/attendance',
  },
  {
    id: 'act-2',
    type: 'canteen',
    title: 'Canteen Order Token Generated',
    description: 'Token #A-104 • Grilled Sandwich & Cold Coffee • Preparing in Kitchen.',
    timestamp: '9:45 AM',
    icon: Utensils,
    tone: 'warning',
    actionRoute: '/canteen',
  },
  {
    id: 'act-3',
    type: 'fee',
    title: 'Semester Fee Installment Credited',
    description: '₹35,000 received via UPI • Transaction ID: TXN_984128.',
    timestamp: 'Yesterday',
    icon: CreditCard,
    tone: 'primary',
    actionRoute: '/fees',
  },
  {
    id: 'act-4',
    type: 'notice',
    title: 'Mid-Semester Exam Roster Published',
    description: 'CS601 exam scheduled for Monday, 10:00 AM • Tech Block 401.',
    timestamp: 'Yesterday',
    icon: Calendar,
    tone: 'ai',
    actionRoute: '/exams',
  },
];

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, courses, canteenOrders, exams } = useApp();
  const shouldReduceMotion = useReducedMotion();

  const currentClass = courses.find((c) => c.isCurrentClass) || courses[0];
  const nextClass = courses[1] || courses[0];
  const activeOrder = canteenOrders.find(
    (o) => o.status !== 'completed' && o.status !== 'cancelled'
  );

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  // Spacebar to trigger voice navigation when not focused on an input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === 'Space' &&
        !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName) &&
        !e.metaKey &&
        !e.ctrlKey
      ) {
        // Only trigger if no modal is active
        const hasOpenModal = document.querySelector('[role="dialog"]');
        if (!hasOpenModal) {
          e.preventDefault();
          navigate('/campus-ai');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* 1. WELCOME + INTELLIGENT STATUS LINE (Full Width, Compact) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Good morning, {currentUser.name.split(' ')[0]}
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-mono font-semibold border border-indigo-200 dark:border-indigo-800">
              Semester 6 • B.Tech CSE
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Next lecture: <strong>{currentClass.name}</strong> in {currentClass.room}. Safe to skip: <strong>4 lectures</strong> across subjects.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 shrink-0">
          <Calendar className="w-3.5 h-3.5 text-indigo-500" />
          <span>{currentDateStr}</span>
        </div>
      </div>

      {/* 2. CAMPUSAI HERO (Left ~7 cols) + NOW/NEXT RAIL (Right ~5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* CampusAI Hero Stage (~7 cols) */}
        <Card
          surface="elevated"
          className="lg:col-span-7 p-5 sm:p-6 bg-gradient-to-br from-violet-500/5 via-indigo-500/5 to-transparent dark:from-violet-950/30 dark:via-indigo-950/20 border-violet-200/80 dark:border-violet-900/40 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-violet-600 text-white shadow-sm shadow-violet-500/30">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>CampusAI Companion</span>
                    <Badge variant="ai">3D Voice AI</Badge>
                  </h2>
                  <p className="text-[11px] text-slate-500">Autonomous Digital Campus Co-Pilot</p>
                </div>
              </div>

              <StatusPill status="ai" label="Aura Nominal" pulse />
            </div>

            {/* 3D Avatar Stage Viewport (Desktop/Tablet) */}
            <div className="hidden sm:block relative h-48 sm:h-52 w-full rounded-2xl bg-gradient-to-b from-indigo-900/10 to-transparent dark:from-slate-950/60 dark:to-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 overflow-hidden mb-4">
              <Suspense
                fallback={
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                    <Skeleton className="w-20 h-20 rounded-full" />
                    <Skeleton className="w-32 h-3" />
                  </div>
                }
              >
                <Avatar3DCanvas state="idle" movement="auto" />
              </Suspense>

              {/* Floating Prompt Bar overlay */}
              <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-xs shadow-sm">
                <div className="flex items-center gap-1.5 text-slate-500 truncate mr-2">
                  <Mic className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                  <span className="truncate">
                    Tap to speak or press <kbd className="font-mono text-[10px] px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800">Space</kbd>
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ai"
                  onClick={() => navigate('/campus-ai')}
                  className="h-7 text-xs px-2.5 shrink-0"
                  leftIcon={<Sparkles className="w-3 h-3" />}
                >
                  Speak
                </Button>
              </div>
            </div>

            {/* Mobile Compact AI Prompt */}
            <div className="sm:hidden p-3.5 rounded-2xl bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/40 dark:to-indigo-950/40 border border-violet-200 dark:border-violet-800/60 mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-violet-600 text-white">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-violet-950 dark:text-violet-200 block">
                    CampusAI Voice Companion
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Press to converse with 3D avatar
                  </span>
                </div>
              </div>
              <Button size="sm" variant="ai" onClick={() => navigate('/campus-ai')}>
                Launch
              </Button>
            </div>

            {/* Contextual Intelligence Statement */}
            <div className="p-2.5 rounded-xl bg-violet-50/60 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/40 text-xs text-slate-700 dark:text-slate-300 mb-3 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
              <p>
                <strong>CampusAI Briefing:</strong> 3 classes scheduled today. CS604 requires 1 more session this week to safely clear the 75% detention risk threshold.
              </p>
            </div>

            {/* Suggestion Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {[
                { label: 'Explain CAP Theorem', q: 'Explain CAP theorem with a distributed systems diagram.' },
                { label: 'Check detention risk', q: 'What is my current attendance and detention risk?' },
                { label: 'Transit route 4 ETA', q: 'Where is campus bus route 4 right now?' },
                { label: 'Next exam schedule', q: 'When and where is my next upcoming exam?' },
              ].map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => navigate(`/campus-ai?prompt=${encodeURIComponent(chip.q)}`)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-violet-950/50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-violet-300 transition-colors"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Now / Next Rail (~5 cols) */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          {/* NOW: Active Lecture */}
          <Card surface="elevated" className="p-4 sm:p-5 border-l-4 border-l-indigo-600">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                Happening Now
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Attendance Window Open
              </span>
            </div>

            <div className="text-xs font-mono text-slate-500 mt-1">
              {currentClass.code} • Room {currentClass.room}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              {currentClass.name}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Faculty: {currentClass.faculty} • <span className="font-mono">{currentClass.startTime} - {currentClass.endTime}</span>
            </p>

            {/* Live Progress Bar */}
            <div className="space-y-1 mt-3">
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>Progress: 35 mins elapsed</span>
                <span>25 mins left</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: '60%' }} />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">Geofence armed: 50m</span>
              <Button
                size="sm"
                variant="primary"
                onClick={() => navigate('/attendance/verify')}
                leftIcon={<Camera className="w-3.5 h-3.5" />}
              >
                Verify Attendance
              </Button>
            </div>
          </Card>

          {/* NEXT: Upcoming Class & Walking Estimate */}
          <Card surface="base" className="p-4 bg-slate-50/70 dark:bg-slate-900/60">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-mono uppercase font-semibold text-[10px] text-indigo-600 dark:text-indigo-400">
                Next in 45 mins
              </span>
              <span className="font-mono">{nextClass.startTime}</span>
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {nextClass.code}: {nextClass.name}
            </h4>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1.5">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {nextClass.room}
              </span>
              <span>•</span>
              <span>{nextClass.faculty}</span>
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
                ~4 min walk from Computer Center
              </span>
            </div>
          </Card>
        </div>
      </div>

      {/* 3. NEEDS-ATTENTION STRIP (Ranked by urgency, max 3 items) */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            Action Items Requiring Attention
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">Ranked by Priority</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Priority 1: Attendance Shortage */}
          <Card surface="base" className="p-3.5 border-l-4 border-l-rose-500 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <Badge variant="danger">Regulatory Risk</Badge>
                <span className="text-xs font-mono font-bold text-rose-600">71.9%</span>
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-1.5">
                CS604 Software Engineering
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Below 75% threshold. 3 consecutive sessions required to clear detention list.
              </p>
            </div>
            <button
              onClick={() => navigate('/attendance')}
              className="mt-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 self-start"
            >
              <span>View Recovery Plan</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </Card>

          {/* Priority 2: Fee Balance */}
          <Card surface="base" className="p-3.5 border-l-4 border-l-amber-500 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <Badge variant="warning">Due 15 Oct</Badge>
                <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">₹15,000 Due</span>
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-1.5">
                Semester 6 Tuition Installment
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                ₹70,000 of ₹85,000 cleared. Pay before deadline to prevent late fee.
              </p>
            </div>
            <button
              onClick={() => navigate('/fees')}
              className="mt-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 self-start"
            >
              <span>Pay Balance Securely</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </Card>

          {/* Priority 3: Active Canteen Order */}
          <Card surface="base" className="p-3.5 border-l-4 border-l-amber-500 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <Badge variant="warning">Token #A-104</Badge>
                <span className="text-xs font-mono font-bold text-amber-600">Preparing</span>
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-1.5">
                Central Food Court Counter 2
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Grilled Sandwich & Cold Coffee • Ready in ~4 mins.
              </p>
            </div>
            <button
              onClick={() => navigate('/canteen')}
              className="mt-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 self-start"
            >
              <span>View Live QR Token</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </Card>
        </div>
      </section>

      {/* 4. SMART METRICS ROW (4 cards with count-up tabular numbers) */}
      <section className="space-y-2">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
          Academic Standing & Operational Metrics
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <MetricCard
            label="Aggregate Attendance"
            value={86.4}
            decimals={1}
            suffix="%"
            trend={{ value: 2.1, isPositive: true, label: 'this week' }}
            subtitle="Safe to skip: 4 classes"
            icon={<ShieldCheck className="w-4 h-4 text-emerald-600" />}
            onClick={() => navigate('/attendance')}
          />
          <MetricCard
            label="Cumulative GPA"
            value={8.72}
            decimals={2}
            suffix="/10"
            trend={{ value: 0.18, isPositive: true, label: 'vs sem 5' }}
            subtitle="Rank: Top 5% in CSE"
            icon={<Sparkles className="w-4 h-4 text-indigo-600" />}
            onClick={() => navigate('/academics')}
          />
          <MetricCard
            label="Pending Dues"
            value={15000}
            prefix="₹"
            subtitle="Due Oct 15, 2026"
            badge={<Badge variant="warning">Due Soon</Badge>}
            onClick={() => navigate('/fees')}
          />
          <MetricCard
            label="Library / Campus Status"
            value={2}
            suffix=" Books"
            subtitle="0 overdue fines • NOC clear"
            icon={<BookOpen className="w-4 h-4 text-violet-600" />}
            onClick={() => navigate('/campus-life')}
          />
        </div>
      </section>

      {/* 5. QUICK-ACTIONS GRID (5 high-frequency institutional actions) */}
      <section className="space-y-2.5">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
          Quick Institutional Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            {
              label: 'SmartAttend',
              desc: 'Biometric verification',
              icon: Camera,
              route: '/attendance/verify',
              tone: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50',
              shortcut: 'A',
            },
            {
              label: 'Order Food',
              desc: 'Food court pre-order',
              icon: Utensils,
              route: '/canteen',
              tone: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50',
              shortcut: 'C',
            },
            {
              label: 'Certificates',
              desc: 'Digital signed forms',
              icon: FileText,
              route: '/certificates',
              tone: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50',
              shortcut: 'D',
            },
            {
              label: 'Bus Telemetry',
              desc: 'Route 4 live ETA',
              icon: Bus,
              route: '/transport-hostel',
              tone: 'text-sky-600 bg-sky-50 dark:bg-sky-950/50',
              shortcut: 'B',
            },
            {
              label: 'File Grievance',
              desc: 'AI routed helpdesk',
              icon: LifeBuoy,
              route: '/helpdesk',
              tone: 'text-rose-600 bg-rose-50 dark:bg-rose-950/50',
              shortcut: 'H',
            },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => navigate(action.route)}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all text-left flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className={`p-2 rounded-xl ${action.tone}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 group-hover:text-indigo-600 transition-colors">
                    ⌘{action.shortcut}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {action.label}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                    {action.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 6. RECENT CROSS-MODULE ACTIVITY FEED */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            Recent Campus Activity (Cross-Module Ledger)
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">Real-Time Sync</span>
        </div>

        <Card surface="base" className="p-0 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/80">
          {recentActivities.map((act) => {
            const Icon = act.icon;
            return (
              <div
                key={act.id}
                onClick={() => act.actionRoute && navigate(act.actionRoute)}
                className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl shrink-0 ${
                      act.tone === 'success'
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600'
                        : act.tone === 'warning'
                        ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600'
                        : act.tone === 'ai'
                        ? 'bg-violet-50 dark:bg-violet-950/50 text-violet-600'
                        : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                      {act.title}
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {act.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-400 shrink-0">
                  <span className="text-[11px] font-mono">{act.timestamp}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </Card>
      </section>
    </div>
  );
};
