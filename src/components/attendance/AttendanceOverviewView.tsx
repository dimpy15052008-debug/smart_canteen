import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../ui/PageHeader';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { StatusPill } from '../ui/StatusPill';
import { Button } from '../ui/Button';
import {
  ShieldCheck,
  AlertTriangle,
  Camera,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  Sliders,
  FileText,
  Upload,
  Check,
  X,
  TrendingUp,
  Download,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AttendanceOverviewView: React.FC = () => {
  const navigate = useNavigate();
  const { courses, attendanceRecords } = useApp();

  // Aggregate stats
  const totalClasses = courses.reduce((acc, c) => acc + c.totalClasses, 0);
  const attendedClasses = courses.reduce((acc, c) => acc + c.attendedClasses, 0);
  const overallPercent = totalClasses > 0 ? ((attendedClasses / totalClasses) * 100).toFixed(1) : '0.0';

  // What-If Simulator State
  const [selectedCourseId, setSelectedCourseId] = useState(courses[3]?.id || courses[0]?.id);
  const [classesToAttend, setClassesToAttend] = useState<number>(3);
  const [classesToMiss, setClassesToMiss] = useState<number>(0);

  // Dispute Modal State
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);
  const [disputeCourse, setDisputeCourse] = useState(courses[3]?.name || courses[0]?.name);
  const [disputeReason, setDisputeReason] = useState('Medical Leave (with physician certificate)');
  const [disputeRemarks, setDisputeRemarks] = useState('');
  const [disputeSuccess, setDisputeSuccess] = useState(false);

  // Filter logs state
  const [logFilter, setLogFilter] = useState<'all' | 'verified' | 'flagged'>('all');

  // Calculation for the simulator
  const activeSimCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const simTotal = activeSimCourse.totalClasses + classesToAttend + classesToMiss;
  const simAttended = activeSimCourse.attendedClasses + classesToAttend;
  const projectedPercent = simTotal > 0 ? ((simAttended / simTotal) * 100).toFixed(1) : '0.0';
  const isProjectedSafe = Number(projectedPercent) >= 75;

  const handleDisputeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDisputeSuccess(true);
    setTimeout(() => {
      setDisputeSuccess(false);
      setIsDisputeOpen(false);
      setDisputeRemarks('');
    }, 2000);
  };

  const filteredRecords = attendanceRecords.filter((r) => {
    if (logFilter === 'verified') return r.status === 'present';
    if (logFilter === 'flagged') return r.status !== 'present';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      <PageHeader
        title="Attendance & Eligibility Ledger"
        subtitle="Live regulatory tracking against the University 75% mandatory attendance threshold."
        badge={
          Number(overallPercent) >= 75 ? (
            <Badge variant="success">Eligible for Final Examinations</Badge>
          ) : (
            <Badge variant="danger">Detention Shortage</Badge>
          )
        }
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDisputeOpen(true)}
              leftIcon={<FileText className="w-3.5 h-3.5" />}
            >
              File Leave / Dispute
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/attendance/verify')}
              leftIcon={<Camera className="w-3.5 h-3.5 text-white" />}
            >
              Launch SmartAttend
            </Button>
          </div>
        }
      />

      {/* Top Banner KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Overall Percentage Card */}
        <Card surface="elevated" className="flex items-center justify-between p-5">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Aggregate Attendance
            </span>
            <div className="text-3xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
              {overallPercent}%
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {attendedClasses} attended out of {totalClasses} scheduled sessions
            </p>
          </div>
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 border border-indigo-200 dark:border-indigo-800">
            <ShieldCheck className="w-8 h-8" />
          </div>
        </Card>

        {/* 75% Rule Projection Engine */}
        <Card surface="base" className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Risk Watchlist
              </span>
              <Badge variant="warning">1 Subject at Risk</Badge>
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
              CS604: Software Engineering (71.9%)
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              ⚠️ Below 75% threshold. You must attend the next <strong>3 consecutive</strong> lectures to clear detention risk.
            </p>
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            Regulatory Criteria: AICTE / UGC 75% Mandatory Cutoff
          </div>
        </Card>

        {/* Biometric Verification Status */}
        <Card surface="ai" className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-700 dark:text-violet-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SmartAttend Biometric Engine</span>
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
              Next Window: CS601 (10:00 AM)
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Tech Block Room 402 geofence radius (50m) armed with dual-frequency Wi-Fi and liveness validation.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/attendance/verify')}
            className="mt-3 w-full"
            rightIcon={<ArrowRight className="w-3 h-3" />}
          >
            Check In Now
          </Button>
        </Card>
      </div>

      {/* Interactive What-If Attendance Recovery Simulator */}
      <Card surface="elevated" className="p-5 sm:p-6 space-y-4 border-indigo-200/80 dark:border-indigo-900/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>Interactive Attendance Recovery & "What-If" Simulator</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate attending or skipping upcoming sessions to project your final examination eligibility.
            </p>
          </div>
          <Badge variant="primary">Planning Engine</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Controls (~7 cols) */}
          <div className="md:col-span-7 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Select Course to Simulate:
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code}: {c.name} ({c.attendancePercent}%)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                    Attend Next Classes:
                  </span>
                  <span className="font-mono font-bold text-emerald-600">+{classesToAttend}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="12"
                  value={classesToAttend}
                  onChange={(e) => setClassesToAttend(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-rose-700 dark:text-rose-400">
                    Miss Next Classes:
                  </span>
                  <span className="font-mono font-bold text-rose-600">+{classesToMiss}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={classesToMiss}
                  onChange={(e) => setClassesToMiss(Number(e.target.value))}
                  className="w-full accent-rose-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Projection Result Card (~5 cols) */}
          <div className="md:col-span-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
              Simulated Future Standing
            </span>
            <div className="text-3xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
              {projectedPercent}%
            </div>
            <p className="text-xs font-mono text-slate-500">
              {simAttended} attended / {simTotal} total projected
            </p>

            <div className="pt-2">
              {isProjectedSafe ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Clears Regulatory Cutoff (≥75%)</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-800">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Risk of Detention Shortage (&lt;75%)</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Course Breakdown Cards */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Course-Wise Regulatory Breakdown
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((course) => {
            const isAtRisk = course.attendancePercent < 75;
            const classesToSafe = isAtRisk
              ? Math.ceil((0.75 * course.totalClasses - course.attendedClasses) / (1 - 0.75))
              : 0;

            return (
              <Card
                key={course.id}
                surface="base"
                className="p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {course.code}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {course.credits} Credits
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                        {course.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {course.faculty} • {course.room}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-lg font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
                        {course.attendancePercent}%
                      </div>
                      {isAtRisk ? (
                        <StatusPill status="danger" label="At Risk" pulse />
                      ) : (
                        <StatusPill status="success" label="Safe" />
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isAtRisk ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(course.attendancePercent, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 mt-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>
                    {course.attendedClasses} / {course.totalClasses} classes attended
                  </span>
                  {isAtRisk ? (
                    <span className="text-rose-600 dark:text-rose-400 font-semibold font-mono">
                      Must attend +{classesToSafe} classes
                    </span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                      Can miss ~{Math.floor((course.attendedClasses - 0.75 * course.totalClasses) / 0.75)} lectures
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* SmartAttend Biometric Verification History */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Recent Biometric Verification Logs
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setLogFilter('all')}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                logFilter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setLogFilter('verified')}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                logFilter === 'verified'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Verified
            </button>
            <button
              onClick={() => setLogFilter('flagged')}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                logFilter === 'flagged'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Flagged
            </button>
          </div>
        </div>

        <Card surface="base" className="overflow-hidden p-0">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredRecords.map((record) => (
              <div
                key={record.id}
                className="p-3.5 sm:px-4 sm:py-3 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {record.courseName}
                    </div>
                    <div className="text-slate-400 text-[11px] flex items-center gap-2 mt-0.5">
                      <span>{record.date} at {record.time}</span>
                      <span>•</span>
                      <span>Confidence: {(record.faceConfidence * 100).toFixed(0)}%</span>
                      <span>•</span>
                      <span className="font-mono text-[10px]">Hash: 0x{record.id.slice(0, 8)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="success">Geo+Face Verified</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Dispute Filing Modal */}
      <AnimatePresence>
        {isDisputeOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Submit Attendance Dispute / Medical Leave
                  </h3>
                </div>
                <button
                  onClick={() => setIsDisputeOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {disputeSuccess ? (
                <div className="p-6 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Grievance Registered Successfully
                  </h4>
                  <p className="text-xs text-slate-500">
                    Your request has been routed to the Academic Senate for reconciliation.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleDisputeSubmit} className="space-y-3.5">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Affected Course:
                    </label>
                    <select
                      value={disputeCourse}
                      onChange={(e) => setDisputeCourse(e.target.value)}
                      className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    >
                      {courses.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.code} - {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Reason Category:
                    </label>
                    <select
                      value={disputeReason}
                      onChange={(e) => setDisputeReason(e.target.value)}
                      className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    >
                      <option value="Medical Leave">Medical Leave (Doctor Certificate Attached)</option>
                      <option value="Official Institutional Duty">Official University Duty (Hackathon/NSS/Sports)</option>
                      <option value="Technical Gateway Error">Terminal Error / Geofence Glitch</option>
                      <option value="Bereavement">Compassionate / Bereavement Leave</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Description & Statement:
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={disputeRemarks}
                      onChange={(e) => setDisputeRemarks(e.target.value)}
                      placeholder="Explain the reason for absence or provide clinic/event reference number..."
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
                    <Upload className="w-4 h-4 mx-auto mb-1 text-slate-400" />
                    <span>Upload Supporting Certificate (PDF / PNG up to 10MB)</span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsDisputeOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      className="flex-1"
                    >
                      Submit Dispute
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
