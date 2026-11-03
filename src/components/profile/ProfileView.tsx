import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../auth/useAuth';
import { PageHeader } from '../ui/PageHeader';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  User,
  GraduationCap,
  Mail,
  Phone,
  Shield,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Sparkles,
  Sliders,
  CheckCircle2
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, currentRole, theme, toggleTheme } = useApp();
  const { logout } = useAuth();
  
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <PageHeader
        title="Student Identity & Preferences"
        subtitle="Digital institutional credentials, biometric enrollment status, and accessibility controls."
        badge={<Badge variant="success">Active Matriculation</Badge>}
      />

      {/* Identity Card */}
      <Card surface="elevated" className="p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-20 h-20 rounded-2xl border-2 border-indigo-500 shadow-md object-cover"
          />
          <div className="flex-1 text-center sm:text-left space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {currentUser.name}
              </h2>
              <Badge variant="primary" className="capitalize">
                {currentRole} Role
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-mono">
              Roll No: {currentUser.rollNumber || '0827CS221045'} • Enrollment: {currentUser.enrollmentId || 'ENR-2022-8842'}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {currentUser.program || 'B.Tech Computer Science & Engineering'} • Semester {currentUser.semester || 6}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                {currentUser.email}
              </span>
              <span className="flex items-center gap-1 font-mono">
                <Phone className="w-3.5 h-3.5" />
                {currentUser.phone || '+91 98765 43210'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Academic Credentials Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card surface="base" className="p-4 text-center">
          <span className="text-xs font-semibold text-slate-400 uppercase font-mono">Cumulative CGPA</span>
          <div className="text-2xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400 mt-1">
            {currentUser.cgpa || 8.7} / 10
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">First Division with Distinction</span>
        </Card>

        <Card surface="base" className="p-4 text-center">
          <span className="text-xs font-semibold text-slate-400 uppercase font-mono">Hostel Accommodation</span>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
            {currentUser.hostelRoom || 'Block B, Room 304'}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 block">No Curfew Violations</span>
        </Card>

        <Card surface="base" className="p-4 text-center">
          <span className="text-xs font-semibold text-slate-400 uppercase font-mono">Transit Pass</span>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
            {currentUser.busRoute || 'Route 4 (North Campus)'}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Active Smart NFC Pass</span>
        </Card>
      </div>

      {/* System & Accessibility Preferences */}
      <Card surface="base" className="p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          System & Accessibility Preferences
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {/* Theme switch */}
          <div className="py-3 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                Visual Theme
              </span>
              <span className="text-xs text-slate-400">
                Currently running in {theme} mode
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={toggleTheme}
              leftIcon={theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
            >
              Toggle to {theme === 'dark' ? 'Light' : 'Dark'}
            </Button>
          </div>

          {/* Voice Engine */}
          <div className="py-3 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                CampusAI Web Audio Speech Output
              </span>
              <span className="text-xs text-slate-400">
                Spoken responses with pitch modulation & robotic sound effects
              </span>
            </div>
            <Button
              size="sm"
              variant={voiceEnabled ? 'primary' : 'secondary'}
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              leftIcon={voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            >
              {voiceEnabled ? 'Voice Enabled' : 'Voice Muted'}
            </Button>
          </div>

          {/* Biometrics */}
          <div className="py-3 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                SmartAttend Face Biometric Enrollment
              </span>
              <span className="text-xs text-slate-400">
                Enrolled on 15 Aug 2024 • 128-d vector stored securely
              </span>
            </div>
            <Badge variant="success">Enrolled & Verified</Badge>
          </div>
        </div>
      </Card>

      {/* Account Actions */}
      <Card surface="elevated" className="p-6">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Account Actions</h3>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
              Sign Out
            </span>
            <span className="text-xs text-slate-400">
              End your session and clear local credentials
            </span>
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        </div>
      </Card>
    </div>
  );
};
