import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bot,
  Calendar,
  CheckCircle2,
  Utensils,
  FileText,
  CreditCard,
  LifeBuoy,
  Bus,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  User,
  GraduationCap
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const { courses } = useApp();
  const [search, setSearch] = useState('');

  // Keyboard shortcut listener (⌘K / Ctrl+K and /)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName))) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  const runCommand = (action: () => void) => {
    onOpenChange(false);
    action();
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Campus Global Command Search"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4 animate-in fade-in duration-150"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Command
          value={search}
          onValueChange={setSearch}
          className="w-full flex flex-col focus:outline-none"
        >
          {/* Search Input Bar */}
          <div className="flex items-center px-4 border-b border-slate-100 dark:border-slate-800">
            <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
            <Command.Input
              autoFocus
              placeholder="Search courses, attendance, fees, certificates, canteen..."
              className="w-full py-4 text-sm bg-transparent border-0 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-0"
            />
            <kbd className="hidden sm:inline-block text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
              ESC
            </kbd>
          </div>

          {/* Results List */}
          <Command.List className="max-h-80 overflow-y-auto p-2 space-y-1">
            <Command.Empty className="py-6 text-center text-sm text-slate-500">
              <p>No direct matching records found.</p>
              {search && (
                <button
                  onClick={() => runCommand(() => navigate(`/campus-ai?prompt=${encodeURIComponent(search)}`))}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Ask CampusAI about "{search}"
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </Command.Empty>

            {/* Quick Actions */}
            <Command.Group heading={<span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2">Primary Pages</span>}>
              <Command.Item
                onSelect={() => runCommand(() => navigate('/'))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
              >
                <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span>Campus Command Center (Dashboard)</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => navigate('/campus-ai'))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-violet-50 dark:hover:bg-slate-800 hover:text-violet-600 dark:hover:text-violet-400 cursor-pointer transition-colors"
              >
                <div className="p-1.5 rounded-lg bg-violet-50 dark:bg-violet-950/40 text-violet-600">
                  <Bot className="w-4 h-4" />
                </div>
                <span>CampusAI 3D Companion</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => navigate('/attendance/verify'))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition-colors"
              >
                <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span>Verify Live Attendance (SmartAttend)</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => navigate('/canteen'))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-slate-800 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition-colors"
              >
                <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600">
                  <Utensils className="w-4 h-4" />
                </div>
                <span>Smart Canteen Order & Live Token</span>
              </Command.Item>
            </Command.Group>

            {/* Courses */}
            <Command.Group heading={<span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 pt-2 block">Enrolled Courses</span>}>
              {courses.map((course) => (
                <Command.Item
                  key={course.id}
                  onSelect={() => runCommand(() => navigate('/academics'))}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <GraduationCap className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">{course.code} - {course.name}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    {course.attendancePercent}% attendance
                  </span>
                </Command.Item>
              ))}
            </Command.Group>

            {/* Services */}
            <Command.Group heading={<span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 pt-2 block">Services & Administration</span>}>
              <Command.Item
                onSelect={() => runCommand(() => navigate('/fees'))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <CreditCard className="w-4 h-4 text-slate-400" />
                <span>Fees & Finance (Pending Due: ₹15,000)</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => navigate('/certificates'))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Certificate Requests & Verifications</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => navigate('/helpdesk'))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <LifeBuoy className="w-4 h-4 text-slate-400" />
                <span>Helpdesk & Grievance AI Routing</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => navigate('/transport-hostel'))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <Bus className="w-4 h-4 text-slate-400" />
                <span>Transport Route 4 & Hostel Gate Passes</span>
              </Command.Item>
            </Command.Group>
          </Command.List>

          {/* Footer Bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 font-mono">
            <span>Use ↑↓ to navigate</span>
            <span>Press Enter to select</span>
          </div>
        </Command>
      </div>
    </div>
  );
};
