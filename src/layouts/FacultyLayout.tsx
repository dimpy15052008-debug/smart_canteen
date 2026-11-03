import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../auth/useAuth';
import { RouteTransition } from '../components/common/RouteTransition';
import { useApp } from '../context/AppContext';
import { SmartUniLogo } from '../components/common/SmartUniLogo';
import {
  LogOut,
  ArrowLeft,
  CalendarCheck,
  TrendingUp,
  GraduationCap,
  Bell,
  Send,
  UserCheck,
  Menu,
  X,
  Radio,
  ChevronRight,
  MoreHorizontal,
  User,
} from 'lucide-react';

export interface FacultyNavItem {
  id: string;
  label: string;
  shortLabel?: string;
  path: string;
  icon: React.FC<{ className?: string }>;
  badge?: string;
  badgeTone?: 'live' | 'warning' | 'info' | 'neutral';
}

export const FACULTY_NAV_ITEMS: FacultyNavItem[] = [
  {
    id: 'attendance',
    label: 'Attendance',
    shortLabel: 'Attend',
    path: '/faculty/attendance',
    icon: CalendarCheck,
    badge: 'Live Window',
    badgeTone: 'live',
  },
  {
    id: 'performance',
    label: 'Student Performance',
    shortLabel: 'Scores',
    path: '/faculty/performance',
    icon: TrendingUp,
    badge: 'Analytics',
    badgeTone: 'info',
  },
  {
    id: 'examination',
    label: 'Examination',
    shortLabel: 'Exams',
    path: '/faculty/examination',
    icon: GraduationCap,
    badge: '2 Duties',
    badgeTone: 'neutral',
  },
  {
    id: 'notices',
    label: 'Notices',
    shortLabel: 'Notices',
    path: '/faculty/notices',
    icon: Bell,
    badge: 'Broadcast',
    badgeTone: 'neutral',
  },
  {
    id: 'applications',
    label: 'Applications',
    shortLabel: 'Apps',
    path: '/faculty/applications',
    icon: Send,
    badge: 'Student & Faculty',
    badgeTone: 'info',
  },
  {
    id: 'student-requests',
    label: 'Student Requests',
    shortLabel: 'Requests',
    path: '/faculty/student-requests',
    icon: UserCheck,
    badge: '3 Pending',
    badgeTone: 'warning',
  },
  {
    id: 'profile',
    label: 'Faculty Profile',
    shortLabel: 'Profile',
    path: '/faculty/profile',
    icon: User,
    badge: 'Verified',
    badgeTone: 'neutral',
  },
];

export const FacultyLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, devLogin } = useAuth();
  const { setCurrentRole, facultySessionActive } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const handleSwitchToStudent = async () => {
    await devLogin('student');
    setCurrentRole('student');
    navigate('/');
  };

  const currentPath = location.pathname.toLowerCase();

  const isItemActive = (item: FacultyNavItem) => {
    if (item.id === 'attendance') {
      return (
        currentPath === '/faculty' ||
        currentPath === '/faculty/' ||
        currentPath.startsWith('/faculty/attendance')
      );
    }
    return currentPath.startsWith(item.path);
  };

  const handleNavItemClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  // Top 4 primary tabs for the mobile bottom quick bar
  const mobileQuickItems = FACULTY_NAV_ITEMS.slice(0, 4);

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white relative"
      style={{ '--portal-accent': '#4f46e5' } as React.CSSProperties}
    >
      {/* Top Identity Header */}
      <header className="h-14 sm:h-16 bg-slate-900/95 backdrop-blur-md border-b border-indigo-900/30 px-2.5 sm:px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-400 min-w-[40px] min-h-[40px] flex items-center justify-center shrink-0"
            aria-label="Toggle Side Navigation Drawer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-indigo-400" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link
            to="/faculty"
            className="flex items-center gap-2 sm:gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-xl"
            aria-label="SmartUni.Ai Faculty Portal"
          >
            <SmartUniLogo
              variant="full"
              showTagline={true}
              className="h-7 xs:h-8 sm:h-9 md:h-10 w-auto max-w-[130px] xs:max-w-[160px] sm:max-w-[230px] shrink-0"
            />
            <div className="hidden md:block h-6 w-px bg-slate-800" />
            <div className="hidden md:block">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                Faculty Portal
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">Academic & Course Operations</p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2.5 text-xs shrink-0">
          {/* Switch to Student View */}
          <button
            onClick={handleSwitchToStudent}
            className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-800/60 text-indigo-200 text-xs font-medium transition-colors min-h-[38px]"
            title="Switch persona to student view for evaluation"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Student View</span>
          </button>

          {/* Faculty Profile Capsule (Tablet/Desktop) */}
          <button
            onClick={() => navigate('/faculty/profile')}
            className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-indigo-500/50 transition-all text-left group min-h-[38px]"
            title="View Faculty Profile"
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
              alt={user?.name || 'Faculty'}
              className="w-5 h-5 rounded-full object-cover group-hover:ring-2 group-hover:ring-indigo-400 transition-all"
            />
            <span className="text-slate-300 group-hover:text-white text-xs font-medium truncate max-w-[120px]">
              {user?.name || 'Prof. Rajesh Sharma'}
            </span>
          </button>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/70 border border-rose-800/50 text-rose-300 text-xs font-semibold transition-colors min-h-[38px]"
            title="Sign out of Faculty Portal"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      {/* Main Workspace with Left Side Navigation Bar */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)]">
        {/* Mobile Backdrop Overlay — animated */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              key="faculty-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden"
              aria-hidden="true"
            />
          )}
        </AnimatePresence>

        {/* ── Side Navigation Bar ───────────────────────────────────────── */}
        <aside
          aria-label="Faculty Dashboard Side Navigation Bar"
          className={`fixed lg:sticky top-0 lg:top-16 left-0 z-50 lg:z-30 w-72 sm:w-80 lg:w-64 xl:w-72 bg-slate-900/98 backdrop-blur-lg border-r border-slate-800 flex flex-col justify-between p-4 h-full lg:h-[calc(100vh-4rem)] overflow-y-auto transition-[transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          {/* Top Section of Side Nav Bar */}
          <div className="space-y-4">
            <div className="px-2 pt-2 lg:pt-1 pb-3 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                  Faculty Workspace
                </span>
                <p className="text-xs text-indigo-300 font-medium mt-0.5">
                  Semester 6 Academic Operations
                </p>
              </div>
              {/* Close Button for mobile drawer */}
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Close navigation drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Vertical Navigation Links */}
            <nav className="space-y-1.5">
              {FACULTY_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(item);
                const showLiveIndicator = item.id === 'attendance' && facultySessionActive;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavItemClick(item.path)}
                    className={`w-full group relative flex items-center justify-between px-3.5 py-3 lg:py-2.5 rounded-xl text-xs font-semibold transition-[background-color,border-color,color] duration-150 select-none text-left min-h-[44px] ${
                      active
                        ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          active ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {/* Badge */}
                    {item.badge && (
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ml-2 shrink-0 transition-colors ${
                          showLiveIndicator
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1'
                            : item.badgeTone === 'warning'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : item.badgeTone === 'info'
                            ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {showLiveIndicator && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        )}
                        {showLiveIndicator ? 'Live' : item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Card in Side Nav Bar */}
          <div className="pt-4 border-t border-slate-800 space-y-3 pb-[env(safe-area-inset-bottom)]">
            {/* Faculty Active Session Indicator Card */}
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  Biometric Session
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    facultySessionActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                  }`}
                />
              </div>
              <p className="text-xs font-bold text-white">
                {facultySessionActive ? 'SmartAttend Active' : 'Session Paused'}
              </p>
              <p className="text-[10px] text-slate-500 font-mono">Tech Block Room 402</p>
            </div>

            {/* Mobile-only Student View switch button */}
            <button
              onClick={handleSwitchToStudent}
              className="lg:hidden w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-800/60 text-indigo-200 text-xs font-medium transition-colors min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Switch to Student View</span>
            </button>
          </div>
        </aside>

        {/* ── Main Content Workspace ────────────────────────────────────── */}
        <main className="flex-1 p-3 sm:p-5 lg:p-6 pb-24 lg:pb-6 max-w-7xl w-full mx-auto min-w-0">
          <RouteTransition>{children}</RouteTransition>
        </main>
      </div>

      {/* ── Dedicated Mobile Bottom Navigation Bar for Faculty ─────────── */}
      <nav
        aria-label="Faculty Mobile Bottom Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-xl safe-bottom"
      >
        {mobileQuickItems.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item);
          const showLive = item.id === 'attendance' && facultySessionActive;

          return (
            <button
              key={item.id}
              onClick={() => handleNavItemClick(item.path)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-w-[54px] min-h-[46px] select-none ${
                active ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`p-1 rounded-lg relative transition-transform ${
                  active ? 'bg-indigo-950/80 text-indigo-400 scale-105' : 'text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
                {showLive && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse border border-slate-900" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">
                {item.shortLabel || item.label}
              </span>
            </button>
          );
        })}

        {/* 5th slot: More button toggling the side drawer */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-w-[54px] min-h-[46px] select-none ${
            isItemActive(FACULTY_NAV_ITEMS[4]) || isItemActive(FACULTY_NAV_ITEMS[5])
              ? 'text-indigo-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Open Full Navigation Menu"
        >
          <div className="p-1 rounded-lg relative">
            <MoreHorizontal className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 border border-slate-900" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">More</span>
        </button>
      </nav>
    </div>
  );
};
