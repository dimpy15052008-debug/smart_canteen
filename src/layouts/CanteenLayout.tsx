import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { RouteTransition } from '../components/common/RouteTransition';
import { useAuth } from '../auth/useAuth';
import { useApp } from '../context/AppContext';
import { SmartUniLogo } from '../components/common/SmartUniLogo';
import { LogOut, ArrowLeft } from 'lucide-react';

export const CanteenLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, devLogin } = useAuth();
  const { setCurrentRole } = useApp();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const handleSwitchToStudent = async () => {
    await devLogin('student');
    setCurrentRole('student');
    navigate('/');
  };

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white"
      style={{ '--portal-accent': '#f59e0b' } as React.CSSProperties}
    >
      <header className="h-14 sm:h-16 bg-slate-900/95 backdrop-blur-md border-b border-orange-950/60 px-2.5 sm:px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <Link
            to="/canteen-staff"
            className="flex items-center gap-2 sm:gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 rounded-xl"
            aria-label="SmartUni.Ai Canteen Operations"
          >
            <SmartUniLogo
              variant="full"
              showTagline={true}
              className="h-7 xs:h-8 sm:h-9 md:h-10 w-auto max-w-[130px] xs:max-w-[160px] sm:max-w-[240px] shrink-0"
            />
            <div className="hidden md:block h-6 w-px bg-slate-800" />
            <div className="hidden md:block">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-500/15 text-orange-300 border border-orange-500/30 uppercase tracking-wider">
                Canteen & Kitchen Terminal
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">Live KOT & Order Queue Desk</p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 text-xs shrink-0">
          <button
            onClick={handleSwitchToStudent}
            className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium transition-colors min-h-[38px]"
            title="Switch persona to student view for evaluation"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Student View</span>
          </button>

          <span className="text-slate-300 hidden md:inline truncate max-w-[160px]">
            Staff: <strong>{user?.name || 'Ramesh Kumar'}</strong>
          </span>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/70 border border-rose-800/50 text-rose-300 text-xs font-semibold transition-colors min-h-[38px]"
            title="Sign out of Canteen Portal"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>
      <main className="flex-1 p-3 sm:p-5 lg:p-6 pb-[max(2rem,env(safe-area-inset-bottom))] max-w-7xl w-full mx-auto">
        <RouteTransition>{children}</RouteTransition>
      </main>
    </div>
  );
};
