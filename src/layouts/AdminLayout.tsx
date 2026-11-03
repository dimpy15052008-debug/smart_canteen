import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { RouteTransition } from '../components/common/RouteTransition';
import { useAuth } from '../auth/useAuth';
import { useApp } from '../context/AppContext';
import { SmartUniLogo } from '../components/common/SmartUniLogo';
import {
  LogOut,
  ArrowLeft,
  Users,
  UserCheck,
  Building2,
  GraduationCap,
  AlertCircle,
  FileText,
  BarChart3,
  Server,
  User,
  Menu,
  X,
  ShieldCheck,
  MoreHorizontal,
} from 'lucide-react';

export interface AdminNavItem {
  id: string;
  label: string;
  shortLabel?: string;
  path: string;
  icon: React.FC<{ className?: string }>;
  badge?: string;
  badgeTone?: 'live' | 'warning' | 'info' | 'neutral';
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    id: 'students',
    label: 'Student Management',
    shortLabel: 'Students',
    path: '/admin/students',
    icon: Users,
    badge: '4,820',
    badgeTone: 'neutral',
  },
  {
    id: 'faculty',
    label: 'Faculty Management',
    shortLabel: 'Faculty',
    path: '/admin/faculty',
    icon: UserCheck,
    badge: '240 Active',
    badgeTone: 'info',
  },
  {
    id: 'departments',
    label: 'Departments',
    shortLabel: 'Depts',
    path: '/admin/departments',
    icon: Building2,
    badge: '8 Depts',
    badgeTone: 'neutral',
  },
  {
    id: 'examination',
    label: 'Examination',
    shortLabel: 'Exams',
    path: '/admin/examination',
    icon: GraduationCap,
    badge: 'Mid-Sem',
    badgeTone: 'neutral',
  },
  {
    id: 'complaints',
    label: 'Complaints',
    shortLabel: 'Grievances',
    path: '/admin/complaints',
    icon: AlertCircle,
    badge: '4 Open',
    badgeTone: 'warning',
  },
  {
    id: 'applications',
    label: 'Applications',
    shortLabel: 'Apps',
    path: '/admin/applications',
    icon: FileText,
    badge: '12 Pending',
    badgeTone: 'warning',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    shortLabel: 'Analytics',
    path: '/admin/analytics',
    icon: BarChart3,
    badge: 'Live',
    badgeTone: 'live',
  },
  {
    id: 'operations',
    label: 'Campus Operations',
    shortLabel: 'Ops',
    path: '/admin/operations',
    icon: Server,
    badge: '99.9%',
    badgeTone: 'live',
  },
  {
    id: 'profile',
    label: 'Profile',
    shortLabel: 'Profile',
    path: '/admin/profile',
    icon: User,
    badge: 'Root',
    badgeTone: 'neutral',
  },
];

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, devLogin } = useAuth();
  const { setCurrentRole } = useApp();
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

  const isItemActive = (item: AdminNavItem) => {
    if (item.id === 'students') {
      return (
        currentPath === '/admin' ||
        currentPath === '/admin/' ||
        currentPath.startsWith('/admin/students') ||
        currentPath.startsWith('/admin/student')
      );
    }
    return currentPath.startsWith(item.path);
  };

  const handleNavItemClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  // Top 4 quick items for mobile bottom navigation
  const mobileQuickItems = [
    ADMIN_NAV_ITEMS[0], // Students
    ADMIN_NAV_ITEMS[1], // Faculty
    ADMIN_NAV_ITEMS[6], // Analytics
    ADMIN_NAV_ITEMS[4], // Complaints
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-white relative">
      {/* ── Top Identity Header ────────────────────────────────────────── */}
      <header className="h-14 sm:h-16 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-2.5 sm:px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none focus:ring-1 focus:ring-amber-400 min-w-[40px] min-h-[40px] flex items-center justify-center shrink-0"
            aria-label="Toggle Admin Navigation Drawer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link
            to="/admin"
            className="flex items-center gap-2 sm:gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-xl"
            aria-label="SmartUni.Ai Admin Governance"
          >
            <SmartUniLogo
              variant="full"
              showTagline={true}
              className="h-7 xs:h-8 sm:h-9 md:h-10 w-auto max-w-[130px] xs:max-w-[160px] sm:max-w-[240px] shrink-0"
            />
            <div className="hidden md:block h-6 w-px bg-slate-800" />
            <div className="hidden md:block">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                Admin Control Room
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">System Oversight & Governance</p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2.5 text-xs shrink-0">
          {/* Switch to Student View */}
          <button
            onClick={handleSwitchToStudent}
            className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium transition-colors min-h-[38px]"
            title="Switch persona to student view for evaluation"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Student View</span>
          </button>

          {/* Admin Profile Capsule (Tablet/Desktop) */}
          <button
            onClick={() => navigate('/admin/profile')}
            className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-amber-500/50 transition-all text-left group min-h-[38px]"
            title="View Administrator Profile"
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'}
              alt={user?.name || 'Administrator'}
              className="w-5 h-5 rounded-full object-cover group-hover:ring-2 group-hover:ring-amber-400 transition-all"
            />
            <div className="truncate max-w-[130px]">
              <span className="text-slate-300 group-hover:text-white text-xs font-medium truncate block">
                {user?.name || 'Dr. Sunita Verma'}
              </span>
            </div>
          </button>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/70 border border-rose-800/50 text-rose-300 text-xs font-semibold transition-colors min-h-[38px]"
            title="Sign out of Admin Portal"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      {/* ── Main Workspace with Left Admin Side Navigation Bar ─────────── */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)]">
        {/* Mobile Backdrop Overlay */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden transition-opacity"
            aria-hidden="true"
          />
        )}

        {/* ── Side Navigation Bar ───────────────────────────────────────── */}
        <aside
          aria-label="Admin Dashboard Side Navigation Bar"
          className={`fixed lg:sticky top-0 lg:top-16 left-0 z-50 lg:z-30 w-72 sm:w-80 lg:w-64 xl:w-72 bg-slate-900/98 backdrop-blur-lg border-r border-slate-800 flex flex-col justify-between p-4 h-full lg:h-[calc(100vh-4rem)] overflow-y-auto transition-transform duration-200 ease-in-out ${
            mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          {/* Top Section of Side Nav Bar */}
          <div className="space-y-4">
            <div className="px-2 pt-2 lg:pt-1 pb-3 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
                  Admin side nav bar
                </span>
                <p className="text-xs text-slate-300 font-medium mt-0.5">
                  Institutional Governance Tree
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

            {/* Tree Structure Navigation */}
            <div className="space-y-1">
              {/* Root branch connector label */}
              <div className="px-2 text-slate-500 font-mono text-xs select-none">
                <span className="text-amber-500/60 font-bold">│</span>
              </div>

              {/* Core 8 Institutional Modules */}
              <nav className="space-y-1 relative" aria-label="Governance Modules">
                {ADMIN_NAV_ITEMS.slice(0, 8).map((item, index) => {
                  const Icon = item.icon;
                  const active = isItemActive(item);
                  const isLastModule = index === 7;
                  const branchSymbol = isLastModule ? '└──' : '├──';

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavItemClick(item.path)}
                      className={`w-full group relative flex items-center justify-between px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 select-none text-left min-h-[40px] ${
                        active
                          ? 'bg-amber-500/15 text-amber-200 border border-amber-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className={`font-mono text-xs select-none shrink-0 ${
                            active ? 'text-amber-400 font-bold' : 'text-slate-600 group-hover:text-slate-400'
                          }`}
                        >
                          {branchSymbol}
                        </span>
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            active ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-200'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {/* Badge */}
                      {item.badge && (
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ml-1.5 shrink-0 transition-colors ${
                            item.badgeTone === 'live'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1'
                              : item.badgeTone === 'warning'
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              : item.badgeTone === 'info'
                              ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {item.badgeTone === 'live' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          )}
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Profile Node below the tree */}
              <div className="pt-2 mt-2 border-t border-slate-800/80">
                {ADMIN_NAV_ITEMS.slice(8).map((item) => {
                  const Icon = item.icon;
                  const active = isItemActive(item);

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavItemClick(item.path)}
                      className={`w-full group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 select-none text-left min-h-[42px] ${
                        active
                          ? 'bg-amber-500/15 text-amber-200 border border-amber-500/40 shadow-sm'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div className="p-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="truncate capitalize font-semibold">{item.label}</span>
                      </div>

                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        {item.badge || 'Root'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Card in Side Nav Bar */}
          <div className="pt-4 border-t border-slate-800 space-y-3 pb-[env(safe-area-inset-bottom)]">
            {/* SuperAdmin Authority Clearance Card */}
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider font-bold">
                  Level 5 Clearance
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-xs font-bold text-white">Root Governance CA</p>
              <p className="text-[10px] text-slate-500 font-mono">Zero-Trust Telemetry Active</p>
            </div>

            {/* Mobile-only Student View switch button */}
            <button
              onClick={handleSwitchToStudent}
              className="lg:hidden w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-colors min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Switch to Student View</span>
            </button>
          </div>
        </aside>

        {/* ── Main Content Workspace ────────────────────────────────────── */}
        <main className="flex-1 p-3 sm:p-5 lg:p-6 pb-24 lg:pb-8 max-w-7xl w-full mx-auto min-w-0">
          <RouteTransition>{children}</RouteTransition>
        </main>
      </div>

      {/* ── Mobile Bottom Navigation Bar for Admin ───────────────────────── */}
      <nav
        aria-label="Admin Mobile Bottom Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-xl safe-bottom"
      >
        {mobileQuickItems.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item);

          return (
            <button
              key={item.id}
              onClick={() => handleNavItemClick(item.path)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-w-[54px] min-h-[46px] select-none ${
                active ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`p-1 rounded-lg relative transition-transform ${
                  active ? 'bg-amber-950/80 text-amber-400 scale-105' : 'text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">
                {item.shortLabel || item.label}
              </span>
            </button>
          );
        })}

        {/* 5th slot: More button toggling the full side drawer */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-w-[54px] min-h-[46px] select-none ${
            isItemActive(ADMIN_NAV_ITEMS[2]) ||
            isItemActive(ADMIN_NAV_ITEMS[3]) ||
            isItemActive(ADMIN_NAV_ITEMS[5]) ||
            isItemActive(ADMIN_NAV_ITEMS[7]) ||
            isItemActive(ADMIN_NAV_ITEMS[8])
              ? 'text-amber-400 font-bold'
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
