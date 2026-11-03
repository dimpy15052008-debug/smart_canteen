import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../ui/PageHeader';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { StatusPill } from '../ui/StatusPill';
import {
  BookOpen,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Download,
  GraduationCap,
  Sparkles,
  TrendingUp,
  FileCheck,
  ChevronRight,
  Bot,
  Sliders,
  CheckSquare,
  Square,
  FileText,
  Search,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface SyllabusUnit {
  id: string;
  unitNumber: number;
  title: string;
  hours: number;
  completed: boolean;
  topics: { name: string; done: boolean }[];
  referenceNotes: string;
}

const mockSyllabusData: Record<string, SyllabusUnit[]> = {
  CS601: [
    {
      id: 'u1',
      unitNumber: 1,
      title: 'Distributed System Foundations & RPC',
      hours: 8,
      completed: true,
      topics: [
        { name: 'System Models & Architectural Patterns', done: true },
        { name: 'Remote Procedure Calls (gRPC & Protocol Buffers)', done: true },
        { name: 'Time Synchronization (Lamport & Vector Clocks)', done: true },
      ],
      referenceNotes: 'Lecture Notes Set 1: Tanenbaum Chapter 2 & 3',
    },
    {
      id: 'u2',
      unitNumber: 2,
      title: 'Consensus & Coordination Protocols',
      hours: 10,
      completed: true,
      topics: [
        { name: 'Mutual Exclusion & Election Algorithms', done: true },
        { name: 'Paxos and Raft Consensus Protocols', done: true },
        { name: 'Byzantine Fault Tolerance (BFT)', done: true },
      ],
      referenceNotes: 'Lecture Notes Set 2: Ongaro & Ousterhout Raft Paper',
    },
    {
      id: 'u3',
      unitNumber: 3,
      title: 'Distributed Storage & CAP Theorem',
      hours: 10,
      completed: false,
      topics: [
        { name: 'Consistent Hashing & Dynamo Ring', done: true },
        { name: 'CAP Theorem and PACELC Tradeoffs', done: true },
        { name: 'Google Spanner & TrueTime API', done: false },
      ],
      referenceNotes: 'Lecture Notes Set 3: Amazon Dynamo & Spanner Papers',
    },
    {
      id: 'u4',
      unitNumber: 4,
      title: 'Cloud Virtualization & Serverless Platforms',
      hours: 12,
      completed: false,
      topics: [
        { name: 'Containerization and Kubernetes Orchestration', done: false },
        { name: 'Serverless Execution Models & Cold Starts', done: false },
        { name: 'Distributed Observability & OpenTelemetry', done: false },
      ],
      referenceNotes: 'Lecture Notes Set 4: CNCF Whitepapers 2026',
    },
  ],
};

export const AcademicsView: React.FC = () => {
  const navigate = useNavigate();
  const { courses, currentUser } = useApp();
  const [selectedDay, setSelectedDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'>('Monday');
  const [activeTab, setActiveTab] = useState<'curriculum' | 'syllabus' | 'predictor'>('curriculum');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [highlightConflicts, setHighlightConflicts] = useState<boolean>(true);

  // Grade Predictor State
  const [predictedGrades, setPredictedGrades] = useState<Record<string, number>>({
    CS601: 9, // A+
    CS602: 10, // O
    CS603: 9, // A+
    CS604: 8, // A
    CS605: 9, // A+
  });

  // Syllabus tracker expanded state
  const [expandedCourseCode, setExpandedCourseCode] = useState<string>('CS601');
  const [syllabusState, setSyllabusState] = useState(mockSyllabusData);

  const totalClasses = courses.reduce((a, b) => a + b.totalClasses, 0);
  const attendedClasses = courses.reduce((a, b) => a + b.attendedClasses, 0);
  const aggregateAttendance = ((attendedClasses / totalClasses) * 100).toFixed(1);
  const totalCredits = courses.reduce((a, b) => a + b.credits, 0);

  const days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday')[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
  ];

  // SGPA History Data
  const gpaHistory = [
    { sem: 'Sem 1', sgpa: 8.2, cgpa: 8.2 },
    { sem: 'Sem 2', sgpa: 8.5, cgpa: 8.35 },
    { sem: 'Sem 3', sgpa: 8.4, cgpa: 8.37 },
    { sem: 'Sem 4', sgpa: 8.8, cgpa: 8.48 },
    { sem: 'Sem 5', sgpa: 8.9, cgpa: 8.56 },
    { sem: 'Sem 6 (Current)', sgpa: 9.1, cgpa: 8.7 },
  ];

  // Calculate Predicted SGPA
  const calculatedPredictedSgpa = () => {
    let totalGradePoints = 0;
    let totalWeight = 0;
    courses.forEach((c) => {
      const gp = predictedGrades[c.code] ?? 9;
      totalGradePoints += gp * c.credits;
      totalWeight += c.credits;
    });
    return totalWeight > 0 ? (totalGradePoints / totalWeight).toFixed(2) : '9.00';
  };

  const calculatedPredictedCgpa = () => {
    // 5 previous semesters averaged at 8.56 with 110 credits, plus current sem 21 credits
    const pastCredits = 110;
    const pastWeighted = 8.56 * pastCredits;
    const currentCredits = totalCredits;
    const currentWeighted = Number(calculatedPredictedSgpa()) * currentCredits;
    return ((pastWeighted + currentWeighted) / (pastCredits + currentCredits)).toFixed(2);
  };

  const toggleTopic = (unitId: string, topicIndex: number) => {
    setSyllabusState((prev) => {
      const currentList = prev[expandedCourseCode] || [];
      const updated = currentList.map((unit) => {
        if (unit.id === unitId) {
          const nextTopics = [...unit.topics];
          nextTopics[topicIndex] = {
            ...nextTopics[topicIndex],
            done: !nextTopics[topicIndex].done,
          };
          const allDone = nextTopics.every((t) => t.done);
          return { ...unit, topics: nextTopics, completed: allDone };
        }
        return unit;
      });
      return { ...prev, [expandedCourseCode]: updated };
    });
  };

  const todayClasses = courses.filter((c) => c.day === selectedDay || !c.day);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* 1. Page Header */}
      <PageHeader
        title="Curriculum & Academic Performance"
        subtitle="Semester 6 course syllabus, weekly lecture timeline, conflict detection, and SGPA predictor."
        badge={<Badge variant="primary">B.Tech CSE • Sem 6</Badge>}
        action={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
            >
              {viewMode === 'cards' ? 'Table View' : 'Card View'}
            </Button>
            <Button
              size="sm"
              variant="primary"
              leftIcon={<FileCheck className="w-3.5 h-3.5" />}
              onClick={() => alert('Official Academic Transcript generated with institutional digital stamp.')}
            >
              Export Transcript
            </Button>
          </div>
        }
      />

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('curriculum')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'curriculum'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Curriculum & Progression
        </button>
        <button
          onClick={() => setActiveTab('syllabus')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'syllabus'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Interactive Syllabus Tracker
        </button>
        <button
          onClick={() => setActiveTab('predictor')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'predictor'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          CGPA & Grade Predictor
        </button>
      </div>

      {activeTab === 'curriculum' && (
        <>
          {/* 2. Semester Overview Summary Band */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card surface="elevated" className="p-4 space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Enrolled Credits</span>
              <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
                {totalCredits} Credits
              </div>
              <span className="text-xs text-slate-500">5 Registered Core & Lab Courses</span>
            </Card>

            <Card surface="elevated" className="p-4 space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Cumulative CGPA</span>
              <div className="text-2xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400">
                {currentUser.cgpa || 8.7} / 10
              </div>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">+0.14 vs Semester 5</span>
            </Card>

            <Card surface="elevated" className="p-4 space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Aggregate Attendance</span>
              <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
                {aggregateAttendance}%
              </div>
              <span className="text-xs text-slate-500">{attendedClasses} / {totalClasses} Sessions Attended</span>
            </Card>

            <Card surface="elevated" className="p-4 space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Detention Watchlist</span>
              <div className="text-2xl font-extrabold font-mono text-amber-600 dark:text-amber-400">
                1 Course
              </div>
              <span className="text-xs text-amber-600 dark:text-amber-400">CS604 at 71.9% (&lt; 75%)</span>
            </Card>
          </div>

          {/* 3. Subject Insights & SGPA Trend Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Performance Visualization (7 cols) */}
            <Card surface="elevated" className="lg:col-span-7 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-500" />
                    <span>Academic Progression Curve (SGPA vs CGPA)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Continuous upward momentum across 6 semesters</p>
                </div>
                <Badge variant="success">Dean's Honors List</Badge>
              </div>

              <div className="h-56 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={gpaHistory} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="sem" tick={{ fontSize: 11 }} />
                    <YAxis domain={[7.5, 10]} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid rgba(51, 65, 85, 0.5)',
                        borderRadius: '0.75rem',
                        color: '#ffffff',
                        fontSize: '12px',
                      }}
                    />
                    <Line type="monotone" dataKey="sgpa" name="Semester SGPA" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="cgpa" name="Cumulative CGPA" stroke="#10b981" strokeWidth={2} strokeDasharray="4 4" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Strongest Subject & Attention Needed (5 cols) */}
            <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
              <Card surface="base" className="p-4 border-l-4 border-l-emerald-500">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 block">
                  Strongest Performance
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  CS602: Database Management Systems Lab
                </h4>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span>Attendance: <strong className="font-mono text-emerald-600">94.3%</strong></span>
                  <span>•</span>
                  <span>Predicted Grade: <strong className="font-mono text-emerald-600">A+</strong></span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  All practical lab assignments verified and signed off by Dr. Arvind Mehra.
                </p>
              </Card>

              <Card surface="base" className="p-4 border-l-4 border-l-amber-500">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 block">
                  Requires Attendance Attention
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  CS604: Software Engineering & Agile
                </h4>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span>Attendance: <strong className="font-mono text-rose-600">71.9%</strong></span>
                  <span>•</span>
                  <span>Recovery Target: <strong className="font-mono text-amber-600">+3 lectures</strong></span>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Next class: Wednesday 10:00 AM</span>
                  <button
                    onClick={() => navigate('/campus-ai?prompt=How+many+classes+do+I+need+to+attend+in+CS604+to+cross+75%25%3F')}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>AI Advice</span>
                  </button>
                </div>
              </Card>
            </div>
          </div>

          {/* 4. Course Cards / Table View */}
          <section className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Enrolled Courses ({courses.length})
            </h3>

            {viewMode === 'cards' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((course) => {
                  const isAtRisk = course.attendancePercent < 75;

                  return (
                    <Card key={course.id} surface="base" className="p-4 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {course.code}
                          </span>
                          <StatusPill
                            status={isAtRisk ? 'danger' : 'success'}
                            label={`${course.attendancePercent}%`}
                          />
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                          {course.name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {course.faculty} • {course.room}
                        </p>

                        <div className="mt-4 space-y-1.5">
                          <div className="flex justify-between text-xs text-slate-500">
                            <span>Syllabus Covered</span>
                            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                              {course.syllabusCovered}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-indigo-600 h-full rounded-full"
                              style={{ width: `${course.syllabusCovered}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                        <span>{course.credits} Credits</span>
                        <span className="font-mono">{course.startTime} - {course.endTime}</span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card surface="base" className="overflow-hidden p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="text-[10px] text-slate-400 uppercase font-mono bg-slate-50 dark:bg-slate-800/50 border-b">
                      <tr>
                        <th className="py-3 px-4">Code</th>
                        <th>Course Name</th>
                        <th>Credits</th>
                        <th>Faculty</th>
                        <th>Room</th>
                        <th>Attendance</th>
                        <th>Syllabus</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {courses.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-3 px-4 font-mono font-bold text-indigo-600">{c.code}</td>
                          <td className="font-semibold text-slate-900 dark:text-slate-100">{c.name}</td>
                          <td>{c.credits}</td>
                          <td className="text-slate-500">{c.faculty}</td>
                          <td className="text-slate-500 font-mono">{c.room}</td>
                          <td className="font-mono font-bold">
                            <span className={c.attendancePercent < 75 ? 'text-rose-600' : 'text-emerald-600'}>
                              {c.attendancePercent}%
                            </span>
                          </td>
                          <td className="font-mono">{c.syllabusCovered}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </section>

          {/* 5. Weekly Class Schedule Tabs with Conflict Highlighter */}
          <section className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Weekly Class Timetable
                </h3>
                <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer ml-3">
                  <input
                    type="checkbox"
                    checked={highlightConflicts}
                    onChange={(e) => setHighlightConflicts(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span>Highlight Time Conflicts</span>
                </label>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                {days.map((day) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      selectedDay === day
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <Card surface="base" className="divide-y divide-slate-100 dark:divide-slate-800 p-0 overflow-hidden">
              {todayClasses.map((lecture, index) => {
                const hasConflict = highlightConflicts && index === 2 && selectedDay === 'Wednesday';

                return (
                  <div
                    key={lecture.id}
                    className={`p-4 flex items-center justify-between gap-4 text-xs transition-colors ${
                      hasConflict ? 'bg-amber-50/60 dark:bg-amber-950/30 border-l-4 border-l-amber-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-center font-mono w-24 shrink-0">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">{lecture.startTime}</span>
                        <span className="text-[10px] text-slate-400 block">{lecture.endTime}</span>
                      </div>
                      <div className="h-8 w-0.5 bg-slate-200 dark:bg-slate-700 shrink-0" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                            {lecture.code}
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {lecture.name}
                          </span>
                          {hasConflict && (
                            <Badge variant="warning">Room Clash Alert: CS604</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-slate-400 text-[11px] mt-0.5">
                          <span>{lecture.faculty}</span>
                          <span>•</span>
                          <span>{lecture.room}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {index === 0 && <Badge variant="primary">Happening Next</Badge>}
                    </div>
                  </div>
                );
              })}
            </Card>
          </section>
        </>
      )}

      {/* Tab 2: Interactive Syllabus Tracker */}
      {activeTab === 'syllabus' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Course Syllabus Units & Lecture Notes
              </h3>
              <p className="text-xs text-slate-500">
                Track unit-by-unit progression and tick off completed revision topics.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-500">Active Course:</label>
              <select
                value={expandedCourseCode}
                onChange={(e) => setExpandedCourseCode(e.target.value)}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.code}>
                    {c.code}: {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {(syllabusState[expandedCourseCode] || mockSyllabusData.CS601).map((unit) => (
              <Card key={unit.id} surface="base" className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant={unit.completed ? 'success' : 'primary'}>
                        Unit {unit.unitNumber} ({unit.hours} Hours)
                      </Badge>
                      <span className="text-xs font-mono text-slate-400">
                        {unit.topics.filter((t) => t.done).length} / {unit.topics.length} Topics Mastered
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">
                      {unit.title}
                    </h4>
                  </div>

                  <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold shrink-0">
                    {Math.round((unit.topics.filter((t) => t.done).length / unit.topics.length) * 100)}% Complete
                  </span>
                </div>

                {/* Topics Checklist */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {unit.topics.map((t, idx) => (
                    <div
                      key={t.name}
                      onClick={() => toggleTopic(unit.id, idx)}
                      className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer select-none"
                    >
                      {t.done ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span className={t.done ? 'line-through text-slate-400' : 'font-medium'}>
                        {t.name}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{unit.referenceNotes}</span>
                  </span>
                  <button
                    onClick={() =>
                      navigate(
                        `/campus-ai?prompt=${encodeURIComponent(
                          `Please explain unit ${unit.unitNumber}: ${unit.title} of ${expandedCourseCode} with key conceptual examples.`
                        )}`
                      )
                    }
                    className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Explain Unit with AI</span>
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: CGPA & Grade Predictor */}
      {activeTab === 'predictor' && (
        <div className="space-y-6">
          <Card surface="elevated" className="p-6 bg-gradient-to-br from-indigo-500/10 via-white to-transparent dark:from-indigo-950/40 dark:via-slate-900 border-indigo-200 dark:border-indigo-800">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-8 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="ai">Simulation Engine</Badge>
                  <span className="text-xs font-mono text-slate-400">Based on 10-Point UGC Grading Scale</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Semester 6 SGPA & Cumulative CGPA Forecaster
                </h3>
                <p className="text-xs text-slate-500">
                  Adjust expected grades for each subject below to calculate your projected final degree CGPA and Dean's list qualification.
                </p>
              </div>

              <div className="md:col-span-4 flex items-center justify-around bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
                <div className="text-center">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                    Predicted SGPA
                  </span>
                  <span className="text-2xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400">
                    {calculatedPredictedSgpa()}
                  </span>
                </div>
                <div className="h-10 w-px bg-slate-200 dark:bg-slate-800" />
                <div className="text-center">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                    Target CGPA
                  </span>
                  <span className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                    {calculatedPredictedCgpa()}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card surface="base" className="p-5 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Subject Expected Grade Inputs
            </h4>

            <div className="space-y-3">
              {courses.map((course) => {
                const currentGradePoint = predictedGrades[course.code] ?? 9;

                return (
                  <div
                    key={course.id}
                    className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-indigo-600">{course.code}</span>
                        <span className="text-xs font-semibold text-slate-900 dark:text-white">{course.name}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">Weight: {course.credits} Credits</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {[
                          { label: 'O (10)', value: 10 },
                          { label: 'A+ (9)', value: 9 },
                          { label: 'A (8)', value: 8 },
                          { label: 'B+ (7)', value: 7 },
                          { label: 'B (6)', value: 6 },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() =>
                              setPredictedGrades((p) => ({ ...p, [course.code]: opt.value }))
                            }
                            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                              currentGradePoint === opt.value
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                            }`}
                          >
                            {opt.label.split(' ')[0]}
                          </button>
                        ))}
                      </div>

                      <span className="font-mono font-bold text-xs text-slate-700 dark:text-slate-300 w-12 text-right">
                        {currentGradePoint * course.credits} pts
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
