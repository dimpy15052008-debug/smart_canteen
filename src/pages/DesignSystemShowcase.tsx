import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { IconButton } from '../components/ui/IconButton';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { StatusPill } from '../components/ui/StatusPill';
import { MetricCard } from '../components/ui/MetricCard';
import { StepTimeline, TimelineStep } from '../components/ui/StepTimeline';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Skeleton } from '../components/ui/Skeleton';
import { PageHeader } from '../components/ui/PageHeader';
import { SectionHeader } from '../components/ui/SectionHeader';
import { useMotionPreset } from '../hooks/useMotionPreset';
import {
  Sparkles,
  Calendar,
  Plus,
  Bot,
  ShieldCheck,
  Moon,
  Sun,
  Search,
  Bell,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Copy,
  Check,
  Download,
  Terminal,
  Activity,
  Zap,
  Info
} from 'lucide-react';

const sampleSteps: TimelineStep[] = [
  { id: 1, label: 'Location detected', status: 'completed', timestamp: '10:02 AM' },
  { id: 2, label: 'Geofence verified (50m radius)', status: 'completed', timestamp: '10:02 AM' },
  { id: 3, label: 'Face verified (98.4% match)', status: 'active', description: 'Matching biometric landmark vectors...' },
  { id: 4, label: 'Liveness confirmed', status: 'upcoming' },
  { id: 5, label: 'Attendance recorded on ledger', status: 'upcoming' },
];

const colorTokens = [
  { name: 'Indigo 50', hex: '#EEF2FF', token: '--color-primary-50', textDark: true },
  { name: 'Indigo 100', hex: '#E0E7FF', token: '--color-primary-100', textDark: true },
  { name: 'Indigo 200', hex: '#C7D2FE', token: '--color-primary-200', textDark: true },
  { name: 'Indigo 300', hex: '#A5B4FC', token: '--color-primary-300', textDark: true },
  { name: 'Indigo 400', hex: '#818CF8', token: '--color-primary-400', textDark: false },
  { name: 'Indigo 500', hex: '#6366F1', token: '--color-primary-500', textDark: false },
  { name: 'Indigo 600 (Anchor)', hex: '#4F46E5', token: '--color-primary-600', textDark: false, isAnchor: true },
  { name: 'Indigo 700', hex: '#4338CA', token: '--color-primary-700', textDark: false },
  { name: 'Indigo 800', hex: '#3730A3', token: '--color-primary-800', textDark: false },
  { name: 'Indigo 900', hex: '#312E81', token: '--color-primary-900', textDark: false },
  { name: 'Indigo 950', hex: '#1E1B4B', token: '--color-primary-950', textDark: false },
];

const semanticTokens = [
  { name: 'Success / Verified', role: 'Attendance, Approvals', hex: '#10B981', bgLight: '#ECFDF5', text: 'Emerald' },
  { name: 'Warning / Attention', role: 'Detention Risk, Pending', hex: '#F59E0B', bgLight: '#FFFBEB', text: 'Amber' },
  { name: 'Critical / Overdue', role: 'Fee Holds, Absences', hex: '#F43F5E', bgLight: '#FFF1F2', text: 'Rose' },
  { name: 'AI Signature', role: 'CampusAI Predictions & Aura', hex: '#7C3AED', bgLight: '#F5F3FF', text: 'Violet' },
  { name: 'Informational', role: 'Bus Transit, General', hex: '#0284C7', bgLight: '#F0F9FF', text: 'Sky' },
];

export const DesignSystemShowcase: React.FC = () => {
  const { durations, spring, shouldReduceMotion } = useMotionPreset();
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [motionTrigger, setMotionTrigger] = useState(0);
  const [textInputVal, setTextInputVal] = useState('0827CS221045');

  const copyCode = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedToken(text);
    setTimeout(() => setCopiedToken(null), 1800);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-6 px-4 pb-20">
      {/* ── Page Header ── */}
      <PageHeader
        title="Campus Aurora Design System"
        subtitle="Foundational tokens, primitives, motion choreography, and component states for SmartUni.Ai."
        badge={<Badge variant="ai">System v1.2</Badge>}
        action={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyCode('https://smartuni.ai/tokens.json')}
              leftIcon={copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copiedToken ? 'Token URL Copied' : 'Share Spec'}
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                const el = document.documentElement;
                el.classList.toggle('dark');
              }}
              leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            >
              Toggle Light/Dark
            </Button>
          </div>
        }
      />

      {/* ── Section 1: Color Tokens & Surfaces ── */}
      <section className="space-y-4">
        <SectionHeader
          title="Color Hierarchy & Layered Surfaces"
          subtitle="Anchor: Electric Indigo (#4F46E5). Accent: Aurora Violet (#7C3AED reserved for AI moments)."
        />

        {/* Primary Indigo Palette Swatches */}
        <Card surface="base" className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
              Primary Indigo Spectrum (50 – 950)
            </h4>
            <span className="text-[11px] font-mono text-slate-400">Click to copy token name</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-2">
            {colorTokens.map((c) => (
              <button
                key={c.hex}
                onClick={() => copyCode(c.token)}
                className={`p-2.5 rounded-xl flex flex-col justify-between h-24 text-left transition-transform hover:scale-105 relative border ${
                  c.isAnchor ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900 border-indigo-400' : 'border-slate-200/50 dark:border-slate-700/50'
                }`}
                style={{ backgroundColor: c.hex }}
              >
                <div className={`text-[10px] font-mono font-semibold ${c.textDark ? 'text-slate-900' : 'text-white'}`}>
                  {c.name.split(' ')[1]}
                </div>
                <div>
                  <div className={`text-[9px] font-mono opacity-80 ${c.textDark ? 'text-slate-800' : 'text-slate-100'}`}>
                    {c.hex}
                  </div>
                  {c.isAnchor && (
                    <span className="text-[8px] uppercase tracking-wider font-extrabold px-1 py-0.2 rounded bg-white text-indigo-900 block mt-1 text-center shadow-xs">
                      Anchor
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Semantics & Surfaces */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card surface="base" className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
              Semantic Functional Colors
            </h4>
            <div className="space-y-2">
              {semanticTokens.map((s) => (
                <div
                  key={s.name}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-lg shrink-0 shadow-xs" style={{ backgroundColor: s.hex }} />
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{s.name}</span>
                      <p className="text-[11px] text-slate-500">{s.role}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-semibold text-slate-500">{s.hex}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card surface="base" className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
              Layered Dark/Light Elevation Surfaces
            </h4>
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Level 0: Page Canvas</span>
                  <p className="text-[11px] text-slate-500">Light: #F8FAFC • Dark: #030712</p>
                </div>
                <Badge variant="default">Base Canvas</Badge>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Level 1: Card Surface</span>
                  <p className="text-[11px] text-slate-500">Light: #FFFFFF • Dark: #0F172A</p>
                </div>
                <Badge variant="primary">Cards & Rails</Badge>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Level 2: Raised / Modals</span>
                  <p className="text-[11px] text-slate-500">Light: #FFFFFF • Dark: #1E293B</p>
                </div>
                <Badge variant="ai">Elevated Overlays</Badge>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Section 2: Typography Scale ── */}
      <section className="space-y-4">
        <SectionHeader
          title="Typography Scale"
          subtitle="Plus Jakarta Sans (UI) & JetBrains Mono (tokens, IDs, dates, tabular numbers)."
        />
        <Card surface="base" className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3">
            <span className="text-xs font-mono text-slate-400 w-36 shrink-0">Display (36px / 44px)</span>
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white flex-1">
              One University. One Intelligent Campus.
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 pb-3">
            <span className="text-xs font-mono text-slate-400 w-36 shrink-0">Page Title (24px / 32px)</span>
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex-1">
              Campus Command Center & Autonomous Co-Pilot
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 pb-3">
            <span className="text-xs font-mono text-slate-400 w-36 shrink-0">Section (18px / 26px)</span>
            <span className="text-lg font-semibold text-slate-900 dark:text-white flex-1">
              Cryptographic Attendance Ledger & Biometric Verification
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 pb-3">
            <span className="text-xs font-mono text-slate-400 w-36 shrink-0">Card Title (15px)</span>
            <span className="text-base font-semibold text-slate-900 dark:text-white flex-1">
              Distributed Systems & Cloud Computing (CS601)
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 pb-3">
            <span className="text-xs font-mono text-slate-400 w-36 shrink-0">Tabular Numerals</span>
            <div className="flex items-center gap-6 font-mono font-bold text-base text-indigo-600 dark:text-indigo-400 tabular-nums flex-1">
              <span>86.4% Aggregate</span>
              <span>₹15,000.00 Due</span>
              <span>23.2599° N, 77.4126° E</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3">
            <span className="text-xs font-mono text-slate-400 w-36 shrink-0">Mono Token Label</span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 flex-1">
              SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
            </span>
          </div>
        </Card>
      </section>

      {/* ── Section 3: Buttons & Icon Buttons ── */}
      <section className="space-y-4">
        <SectionHeader title="Buttons & Interactive Controls" subtitle="All variants, sizes, and active states" />
        <Card surface="base" className="space-y-6">
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-3">
              Variants
            </h4>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="ai" leftIcon={<Bot className="w-4 h-4" />}>
                CampusAI Action
              </Button>
              <Button variant="primary" isLoading>
                Processing
              </Button>
              <Button variant="primary" disabled>
                Disabled
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-3">
              Sizes & Icon Placement
            </h4>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm" variant="primary" leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
                Small (32px)
              </Button>
              <Button size="md" variant="primary" leftIcon={<Sparkles className="w-4 h-4" />}>
                Medium (38px)
              </Button>
              <Button size="lg" variant="primary" leftIcon={<Sparkles className="w-4.5 h-4.5" />}>
                Large (44px)
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-3">
              Icon Buttons (Accessible aria-label enforced)
            </h4>
            <div className="flex items-center gap-3">
              <IconButton variant="ghost" aria-label="Notifications preview">
                <Bell className="w-4 h-4" />
              </IconButton>
              <IconButton variant="outline" aria-label="Search records">
                <Search className="w-4 h-4" />
              </IconButton>
              <IconButton variant="primary" aria-label="Verify biometrics">
                <ShieldCheck className="w-4 h-4" />
              </IconButton>
              <IconButton variant="subtle" aria-label="Dark mode toggle">
                <Moon className="w-4 h-4" />
              </IconButton>
            </div>
          </div>
        </Card>
      </section>

      {/* ── Section 4: Badges & Status Indicators ── */}
      <section className="space-y-4">
        <SectionHeader title="Badges & Status Pills" subtitle="Color-paired with icons and labels for WCAG compliance" />
        <Card surface="base" className="space-y-5">
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-3">
              Semantic Badges
            </h4>
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge variant="default">Default Neutral</Badge>
              <Badge variant="primary">B.Tech CS6</Badge>
              <Badge variant="success" icon={<CheckCircle2 className="w-3 h-3" />}>
                Verified Liveness
              </Badge>
              <Badge variant="warning" icon={<AlertTriangle className="w-3 h-3" />}>
                71.9% Attendance Risk
              </Badge>
              <Badge variant="danger">Detention Threat</Badge>
              <Badge variant="info">Bus Route 4</Badge>
              <Badge variant="ai" icon={<Sparkles className="w-3 h-3" />}>
                AI Prediction
              </Badge>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-3">
              Status Pills (with optional pulse animation)
            </h4>
            <div className="flex flex-wrap items-center gap-2.5">
              <StatusPill status="success" label="Geofence Armed (4.2m accuracy)" pulse />
              <StatusPill status="warning" label="Review with Academic Dean" />
              <StatusPill status="danger" label="Registration Hold" />
              <StatusPill status="info" label="SLA: 48h Remaining" />
              <StatusPill status="ai" label="CampusAI Speaking" pulse />
            </div>
          </div>
        </Card>
      </section>

      {/* ── Section 5: Metric Cards ── */}
      <section className="space-y-4">
        <SectionHeader title="Smart Metric Cards" subtitle="Zero-jitter tabular figures with count-up animations" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Attendance Score"
            value={86.4}
            decimals={1}
            suffix="%"
            trend={{ value: 2.1, isPositive: true, label: 'this week' }}
            icon={<ShieldCheck className="w-4 h-4 text-emerald-600" />}
          />
          <MetricCard
            label="Cumulative GPA"
            value={8.72}
            decimals={2}
            suffix="/10"
            trend={{ value: 0.18, isPositive: true, label: 'vs sem 5' }}
            icon={<Sparkles className="w-4 h-4 text-indigo-600" />}
          />
          <MetricCard
            label="Tuition Dues"
            value={15000}
            prefix="₹"
            subtitle="Due 15 Oct 2026"
            badge={<Badge variant="warning">Due in 16d</Badge>}
          />
          <MetricCard
            label="Upcoming Exams"
            value={4}
            subtitle="Next: CS601 (Mid-Term)"
            icon={<Calendar className="w-4 h-4 text-violet-600" />}
          />
        </div>
      </section>

      {/* ── Section 6: Step Timelines ── */}
      <section className="space-y-4">
        <SectionHeader title="Step Timelines" subtitle="Shared by SmartAttend, Canteen Tracker, & Credentials" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card surface="base">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-4">
              Vertical Orientation (SmartAttend Audit)
            </h4>
            <StepTimeline steps={sampleSteps} orientation="vertical" />
          </Card>
          <Card surface="base">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-6">
              Horizontal Orientation (Certificate Workflow)
            </h4>
            <StepTimeline steps={sampleSteps} orientation="horizontal" />
          </Card>
        </div>
      </section>

      {/* ── Section 7: Form Controls ── */}
      <section className="space-y-4">
        <SectionHeader title="Form Controls & Inputs" subtitle="Standardized focus rings, icons, and validation" />
        <Card surface="base" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Student Enrollment ID
              </label>
              <input
                type="text"
                value={textInputVal}
                onChange={(e) => setTextInputVal(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Global Campus Search Input
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search courses, attendance, fees..."
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* ── Section 8: Motion Choreography ── */}
      <section className="space-y-4">
        <SectionHeader
          title="Motion Tokens & Reduced Motion Support"
          subtitle="Micro (120ms), Standard (200ms), Surface (320ms). Automatically honors prefers-reduced-motion."
        />
        <Card surface="base" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                System Reduced Motion State:{' '}
                <strong className={shouldReduceMotion ? 'text-amber-500' : 'text-emerald-500'}>
                  {shouldReduceMotion ? 'Active (Motion Suppressed)' : 'Standard Springs Active'}
                </strong>
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                Micro: {durations.micro}s • Standard: {durations.standard}s • Surface: {durations.surface}s
              </p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setMotionTrigger((p) => p + 1)}
              leftIcon={<Activity className="w-3.5 h-3.5 text-indigo-500" />}
            >
              Test Spring Bounce
            </Button>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-center justify-center">
            <motion.div
              key={motionTrigger}
              initial={{ scale: shouldReduceMotion ? 1 : 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={spring}
              className="p-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg flex items-center gap-3 text-xs font-semibold"
            >
              <Sparkles className="w-4 h-4" />
              <span>Campus Aurora Spring Physics ({spring.stiffness} stiffness / {spring.damping} damping)</span>
            </motion.div>
          </div>
        </Card>
      </section>

      {/* ── Section 9: Feedback Fallbacks ── */}
      <section className="space-y-4">
        <SectionHeader title="Graceful Fallback States" subtitle="Skeletons, empty states, and human error banners" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card surface="base" className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-2">
              Skeleton Shimmer
            </h4>
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-20 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-24" />
            </div>
          </Card>

          <EmptyState
            title="No canteen orders placed"
            description="Your pre-order basket is empty. Browse today's live menu at Central Food Court."
            action={{ label: 'Explore Menu', onClick: () => {}, icon: <Plus className="w-3.5 h-3.5" /> }}
          />

          <ErrorState
            message="Unable to communicate with the University Attendance Gateway."
            onRetry={() => {}}
          />
        </div>
      </section>
    </div>
  );
};
