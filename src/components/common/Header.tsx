import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { SmartUniLogo } from './SmartUniLogo';
import { CommandPalette } from './CommandPalette';
import { useAuth } from '../../auth/useAuth';
import {
  Menu,
  Moon,
  Sun,
  Bell,
  Search,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  ShieldAlert,
  GraduationCap,
  Briefcase,
  Utensils,
  CheckCircle2,
  X,
  ArrowRight,
  LogOut,
  User as UserIcon,
  ShieldCheck
} from 'lucide-react';
import { UserRole } from '../../types';

interface HeaderProps {
  onToggleSidebar?: () => void;
  contextualAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, contextualAction }) => {
  const navigate = useNavigate();
  const {
    currentRole,
    setCurrentRole,
    currentUser,
    notifications,
    markNotificationRead,
    startDemoTour,
    theme,
    toggleTheme,
  } = useApp();
  const { user: authUser, devLogin, logout } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isDemoControlsOpen, setIsDemoControlsOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const roles: { id: UserRole; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
    { id: 'student', label: 'Student (Faizan)', icon: GraduationCap, desc: 'B.Tech CSE - 6th Sem' },
    { id: 'faculty', label: 'Faculty (Prof. Sharma)', icon: Briefcase, desc: 'CS Dept Head' },
    { id: 'admin', label: 'Campus Admin', icon: ShieldAlert, desc: 'Full System Analytics' },
    { id: 'canteen', label: 'Canteen Staff', icon: Utensils, desc: 'Kitchen Order Queue' },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-md px-2.5 sm:px-4 lg:px-6 py-1.5 sm:py-2 transition-all duration-200 border-b ${
          isScrolled
            ? 'border-slate-200 dark:border-slate-800 shadow-md shadow-slate-900/5'
            : 'border-slate-100 dark:border-slate-900 shadow-none'
        }`}
      >
        <div className="w-full max-w-[1700px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Mobile Toggle & Brand Logo */}
          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0 -ml-1 sm:ml-0">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                aria-label="Toggle Navigation Sidebar"
                className="lg:hidden p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors focus-visible:outline-none shrink-0"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <div
              onClick={() => navigate('/')}
              className="cursor-pointer flex items-center justify-start group select-none transition-transform hover:opacity-95 active:scale-[0.99] py-0.5"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/')}
              aria-label="SmartUni.Ai - Return to Dashboard"
            >
              <SmartUniLogo
                variant="full"
                showTagline={true}
                className="h-8 xs:h-8.5 sm:h-9.5 md:h-10.5 lg:h-11 w-auto max-w-[190px] xs:max-w-[220px] sm:max-w-[260px] md:max-w-[300px] transition-transform duration-200 group-hover:scale-[1.02]"
              />
            </div>
          </div>

          {/* Center: Global Search Trigger Button (Desktop & Tablet) */}
          <div className="hidden md:flex flex-1 max-w-md mx-3">
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs bg-slate-100/80 dark:bg-slate-900/80 hover:bg-slate-200/80 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 transition-all select-none group"
              aria-label="Open search command palette"
            >
              <div className="flex items-center gap-2 truncate">
                <Search className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors shrink-0" />
                <span className="truncate">Search courses, attendance, fees, certificates...</span>
              </div>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 shrink-0 ml-2">
                <span>⌘</span>K
              </kbd>
            </button>
          </div>

          {/* Right: Actions, Demo Controls, Theme Toggle, Notifications & Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Mobile Search Icon Button */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
              aria-label="Open search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Optional Contextual Action Slot */}
            {contextualAction && (
              <div className="hidden sm:block">
                {contextualAction}
              </div>
            )}

            {/* Demo Controls Popover Trigger */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsDemoControlsOpen(!isDemoControlsOpen);
                  setIsNotifDropdownOpen(false);
                }}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 sm:gap-2 transition-all ${
                  isDemoControlsOpen
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'bg-slate-100/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                }`}
                title="Open Judge & Demo Controls"
                aria-expanded={isDemoControlsOpen}
                aria-label="Demo controls"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span className="hidden sm:inline font-semibold">Demo Controls</span>
                <span className="text-[11px] px-1.5 py-0.2 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 capitalize font-mono">
                  {currentRole}
                </span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isDemoControlsOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Compact Demo Controls Popover */}
              <AnimatePresence>
                {isDemoControlsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-3 z-50 space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" />
                          Judge & Demo Controls
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Switch user context or launch guided tour</p>
                      </div>
                      <button
                        onClick={() => setIsDemoControlsOpen(false)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        aria-label="Close controls"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Guided Tour Primary Action */}
                    <button
                      onClick={() => {
                        setIsDemoControlsOpen(false);
                        startDemoTour();
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Start Judge Evaluation Tour</span>
                    </button>

                    {/* Persona Switcher List */}
                    <div className="space-y-1">
                      <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold px-1">
                        Active User Persona
                      </p>
                      <div className="grid grid-cols-1 gap-1">
                        {roles.map((r) => {
                          const Icon = r.icon;
                          const isActive = currentRole === r.id;
                          return (
                            <button
                              key={r.id}
                              onClick={async () => {
                                setIsDemoControlsOpen(false);
                                await devLogin(r.id);
                                setCurrentRole(r.id);
                                if (r.id === 'faculty') navigate('/faculty');
                                else if (r.id === 'admin') navigate('/admin');
                                else if (r.id === 'canteen') navigate('/canteen-staff');
                                else navigate('/');
                              }}
                              className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-left text-xs transition-colors ${
                                isActive
                                  ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800'
                                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-transparent'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div className={`p-1.5 rounded-lg ${isActive ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div>
                                  <span className="block font-medium">{r.label}</span>
                                  <span className="text-[10px] text-slate-400 block">{r.desc}</span>
                                </div>
                              </div>
                              {isActive && <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200/80 dark:border-slate-800 transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle visual theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Notifications Popover Trigger */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsNotifDropdownOpen(!isNotifDropdownOpen);
                  setIsDemoControlsOpen(false);
                }}
                className={`relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200/80 dark:border-slate-800 transition-colors ${
                  isNotifDropdownOpen ? 'bg-slate-100 dark:bg-slate-900' : ''
                }`}
                title="Notifications"
                aria-expanded={isNotifDropdownOpen}
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-950 animate-pulse" />
                )}
              </button>

              {/* Notifications Preview Popover */}
              <AnimatePresence>
                {isNotifDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 sm:w-88 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 font-semibold border border-rose-200 dark:border-rose-900">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setIsNotifDropdownOpen(false);
                          navigate('/notifications');
                        }}
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        <span>View all</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                      {notifications.slice(0, 5).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotificationRead(n.id);
                            if (n.actionLink) {
                              setIsNotifDropdownOpen(false);
                              navigate(n.actionLink);
                            }
                          }}
                          className={`p-3 text-left transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                            !n.read ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                              {n.title}
                            </p>
                            <span className="text-[10px] text-slate-400 font-mono shrink-0">
                              {n.timestamp}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                            {n.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Avatar & Menu Popover */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsProfileDropdownOpen(!isProfileDropdownOpen);
                  setIsDemoControlsOpen(false);
                  setIsNotifDropdownOpen(false);
                }}
                className="flex items-center gap-2 pl-1 cursor-pointer select-none group focus:outline-none"
                aria-expanded={isProfileDropdownOpen}
                aria-label="User Profile and Session Menu"
              >
                <div className="relative">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 object-cover group-hover:ring-2 group-hover:ring-indigo-500/50 transition-all"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-950" />
                </div>
                <div className="hidden lg:block text-left">
                  <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[110px] leading-tight">
                    {currentUser.name}
                  </span>
                  <span className="block text-[10px] text-slate-400 font-mono capitalize">
                    {currentRole} Role
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 hidden sm:block transition-transform duration-200" />
              </button>

              <AnimatePresence>
                {isProfileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 p-3 space-y-3"
                  >
                    {/* User Card */}
                    <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-100 dark:border-slate-800/80">
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-10 h-10 rounded-xl object-cover border border-indigo-500/40"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {currentUser.name}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-mono">
                          {currentUser.email}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 capitalize font-mono">
                            {currentRole}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {currentUser.rollNumber || currentUser.id}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Portal Jump */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold px-1 block">
                        Quick Portal Switch
                      </span>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <button
                          onClick={async () => {
                            setIsProfileDropdownOpen(false);
                            await devLogin('student');
                            setCurrentRole('student');
                            navigate('/');
                          }}
                          className={`px-2 py-1.5 rounded-lg text-left font-medium transition-colors ${
                            currentRole === 'student'
                              ? 'bg-indigo-600 text-white font-semibold'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          Student
                        </button>
                        <button
                          onClick={async () => {
                            setIsProfileDropdownOpen(false);
                            await devLogin('faculty');
                            setCurrentRole('faculty');
                            navigate('/faculty');
                          }}
                          className={`px-2 py-1.5 rounded-lg text-left font-medium transition-colors ${
                            currentRole === 'faculty'
                              ? 'bg-indigo-600 text-white font-semibold'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          Faculty
                        </button>
                        <button
                          onClick={async () => {
                            setIsProfileDropdownOpen(false);
                            await devLogin('admin');
                            setCurrentRole('admin');
                            navigate('/admin');
                          }}
                          className={`px-2 py-1.5 rounded-lg text-left font-medium transition-colors ${
                            currentRole === 'admin'
                              ? 'bg-indigo-600 text-white font-semibold'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          Admin
                        </button>
                        <button
                          onClick={async () => {
                            setIsProfileDropdownOpen(false);
                            await devLogin('canteen');
                            setCurrentRole('canteen');
                            navigate('/canteen-staff');
                          }}
                          className={`px-2 py-1.5 rounded-lg text-left font-medium transition-colors ${
                            currentRole === 'canteen'
                              ? 'bg-indigo-600 text-white font-semibold'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          Canteen
                        </button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs">
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          navigate('/profile');
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-indigo-500" />
                        <span>Profile & Preferences</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          logout();
                          navigate('/login');
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out Session</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Global Command Search Palette Dialog */}
      <CommandPalette open={isCommandPaletteOpen} onOpenChange={setIsCommandPaletteOpen} />
    </>
  );
};
