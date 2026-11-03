import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Bot,
  Camera,
  Utensils,
  FileText,
  LifeBuoy,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  Play
} from 'lucide-react';

export const JudgeTourModal: React.FC = () => {
  const navigate = useNavigate();
  const {
    isJudgeTourOpen,
    setIsJudgeTourOpen,
    setActiveTab,
    setCurrentRole
  } = useApp();

  const [currentStep, setCurrentStep] = useState(0);

  if (!isJudgeTourOpen) return null;

  const TOUR_STEPS = [
    {
      step: 1,
      title: 'Student Dashboard & Risk Detection',
      tag: 'One Student Identity',
      role: 'student',
      route: '/',
      tab: 'dashboard',
      description: 'Review the unified student dashboard for Faizan Ali (B.Tech CSE). Notice the active lecture alert and the critical attendance detention warning on CS604 (71.9% < 75% threshold) with recovery advice.',
      actionLabel: 'Open Student Dashboard',
    },
    {
      step: 2,
      title: '3D CampusAI Voice Character & Lip-Sync',
      tag: 'Signature Feature #1',
      role: 'student',
      route: '/campus-ai',
      tab: 'campus-ai',
      description: 'Interact with the 3D WebGL avatar featuring procedural audio lip-sync and mouse gaze tracking. Ask authorized campus queries: "What is my attendance?", "When is my next exam?", or "Where is campus bus #4?"',
      actionLabel: 'Launch 3D CampusAI',
    },
    {
      step: 3,
      title: 'SmartAttend AI: Geo-Verified Face Biometrics',
      tag: 'Signature Feature #2',
      role: 'student',
      route: '/attendance/verify',
      tab: 'smart-attend',
      description: 'Experience the full multi-factor verification chain: GPS Geofence Check (Tech Block Room 402) -> Webcam Face Detection HUD -> Liveness Anti-Spoof Challenge -> Instant Attendance Record & Audit Hash.',
      actionLabel: 'Test SmartAttend AI',
    },
    {
      step: 4,
      title: 'Smart Canteen Pre-Order & Pickup Token',
      tag: 'Signature Feature #3',
      role: 'student',
      route: '/canteen',
      tab: 'canteen',
      description: 'Browse the categorized food court menu, configure scheduled pickup slot (e.g. 11:15 AM recess), execute checkout, and receive a digital Token #A-104 with dynamic scannable QR code.',
      actionLabel: 'Pre-Order in Canteen',
    },
    {
      step: 5,
      title: 'Kitchen Staff Order Fulfillment Board',
      tag: 'Canteen Staff Workflow',
      role: 'canteen',
      route: '/canteen',
      tab: 'canteen',
      description: 'Switch to Canteen Manager Ramesh Kumar. Observe the live kitchen Kanban board (New -> Preparing -> Ready -> Completed) and advance orders with 1-click status transitions.',
      actionLabel: 'View Kitchen Staff Board',
    },
    {
      step: 6,
      title: 'Official Digital Credentials & QR Verification',
      tag: 'Zero-Friction Documents',
      role: 'student',
      route: '/certificates',
      tab: 'certificates',
      description: 'Review the Bonafide Certificate workflow with automated library/fee eligibility audit, Dean digital signature, printable seal, and verifiable QR verification endpoint.',
      actionLabel: 'View Digital Certificates',
    },
    {
      step: 7,
      title: 'AI-Classified Grievance Redressal Helpdesk',
      tag: 'Gemini 3.8 Intelligence',
      role: 'student',
      route: '/helpdesk',
      tab: 'helpdesk',
      description: 'File student complaints and see Gemini 3.8 automatically detect category (Wi-Fi/Hostel/Exam), determine urgency, compute SLA resolution targets, and route to the correct campus division.',
      actionLabel: 'Open AI Helpdesk',
    },
    {
      step: 8,
      title: 'Administrative Governance & Audit Trails',
      tag: 'Executive Governance',
      role: 'admin',
      route: '/admin',
      tab: 'admin',
      description: 'Explore institutional KPIs: Campus Attendance (86.4%), Department benchmarks, Grievance SLA health, and immutable cryptographic audit trails recording all biometric verifications and fee transactions.',
      actionLabel: 'Explore Admin Analytics',
    },
  ];

  const activeTour = TOUR_STEPS[currentStep];

  const handleJumpToStep = () => {
    setCurrentRole(activeTour.role as any);
    setActiveTab(activeTour.tab);
    setIsJudgeTourOpen(false);
    navigate(activeTour.route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden animate-in fade-in zoom-in-95">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-500 text-slate-950 font-bold">
              <Sparkles className="w-5 h-5 text-white" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                SmartUni.Ai Hackathon Judge Tour
              </h3>
              <p className="text-xs text-slate-400">
                Official Live MVP Evaluation Walkthrough ({currentStep + 1} of {TOUR_STEPS.length})
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsJudgeTourOpen(false)}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="grid grid-cols-8 gap-1.5">
          {TOUR_STEPS.map((s, idx) => (
            <button
              key={s.step}
              onClick={() => setCurrentStep(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentStep
                  ? 'bg-amber-400 ring-2 ring-amber-400/40'
                  : idx < currentStep
                  ? 'bg-indigo-500'
                  : 'bg-slate-800'
              }`}
              title={`Step ${s.step}: ${s.title}`}
            />
          ))}
        </div>

        {/* Step Content */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold">
              {activeTour.tag}
            </span>
            <span className="text-xs text-slate-400">
              Role: <strong className="text-slate-200 capitalize">{activeTour.role}</strong>
            </span>
          </div>

          <h4 className="text-xl font-bold text-white">
            {activeTour.step}. {activeTour.title}
          </h4>

          <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
            {activeTour.description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              disabled={currentStep === 0}
              onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
              className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold text-slate-300 flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <button
              disabled={currentStep === TOUR_STEPS.length - 1}
              onClick={() => setCurrentStep((prev) => Math.min(TOUR_STEPS.length - 1, prev + 1))}
              className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold text-slate-300 flex items-center justify-center gap-1.5"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleJumpToStep}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-indigo-600 hover:opacity-95 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition-all"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>{activeTour.actionLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
