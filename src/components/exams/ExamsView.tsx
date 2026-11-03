import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../ui/PageHeader';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  Calendar,
  Clock,
  MapPin,
  Bot,
  Sparkles,
  Download,
  AlertCircle,
  QrCode,
  FileText,
  User,
  CheckCircle2,
  X,
  Printer,
  ChevronRight,
  Search,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PastPaper {
  id: string;
  courseCode: string;
  courseName: string;
  year: string;
  examType: 'Mid-Semester' | 'End-Semester';
  hasSolutions: boolean;
  downloads: number;
}

const mockPastPapers: PastPaper[] = [
  {
    id: 'pp-1',
    courseCode: 'CS601',
    courseName: 'Distributed Systems & Cloud Computing',
    year: '2025',
    examType: 'Mid-Semester',
    hasSolutions: true,
    downloads: 342,
  },
  {
    id: 'pp-2',
    courseCode: 'CS601',
    courseName: 'Distributed Systems & Cloud Computing',
    year: '2024',
    examType: 'End-Semester',
    hasSolutions: true,
    downloads: 512,
  },
  {
    id: 'pp-3',
    courseCode: 'CS602',
    courseName: 'Database Management Systems Lab',
    year: '2025',
    examType: 'Mid-Semester',
    hasSolutions: true,
    downloads: 289,
  },
  {
    id: 'pp-4',
    courseCode: 'CS603',
    courseName: 'Machine Learning & Neural Architectures',
    year: '2025',
    examType: 'Mid-Semester',
    hasSolutions: true,
    downloads: 418,
  },
  {
    id: 'pp-5',
    courseCode: 'CS604',
    courseName: 'Software Engineering & Agile Methodologies',
    year: '2024',
    examType: 'End-Semester',
    hasSolutions: false,
    downloads: 198,
  },
];

export const ExamsView: React.FC = () => {
  const navigate = useNavigate();
  const { exams, courses, currentUser } = useApp();

  const [isHallTicketOpen, setIsHallTicketOpen] = useState(false);
  const [isPastPapersOpen, setIsPastPapersOpen] = useState(false);
  const [paperFilter, setPaperFilter] = useState<string>('all');

  // Live Countdown State
  // Target: Monday Oct 6, 2026, 10:00 AM
  const targetDate = new Date('2026-10-06T10:00:00').getTime();
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 6,
    hours: 21,
    minutes: 18,
    seconds: 34,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const diff = Math.max(0, targetDate - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const nextExam = exams[0] || {
    id: 'exam-1',
    courseCode: 'CS601',
    courseName: 'Distributed Systems & Cloud Computing',
    date: '2026-10-06',
    time: '10:00 AM - 12:00 PM',
    hallNumber: 'Tech Block Room 401',
    seatNumber: 'B-24',
    examType: 'Mid-Semester' as const,
    maxMarks: 50,
    status: 'Upcoming' as const,
  };

  const filteredPapers = mockPastPapers.filter((p) => {
    if (paperFilter === 'all') return true;
    return p.courseCode === paperFilter;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      <PageHeader
        title="Examinations & Assessments"
        subtitle="Mid-semester evaluation schedule, official seat numbers, and AI revision guides."
        badge={<Badge variant="primary">Sem 6 Mid-Term 2026</Badge>}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<FileText className="w-3.5 h-3.5" />}
              onClick={() => setIsPastPapersOpen(true)}
            >
              Past Papers Archive
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Download className="w-3.5 h-3.5" />}
              onClick={() => setIsHallTicketOpen(true)}
            >
              View Hall Ticket & Seat Map
            </Button>
          </div>
        }
      />

      {/* Next Exam Hero Card with Live Countdown Clock */}
      <Card surface="elevated" className="p-6 bg-gradient-to-br from-indigo-500/10 via-white to-transparent dark:from-indigo-950/40 dark:via-slate-900 border-indigo-200 dark:border-indigo-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="primary">{nextExam.examType}</Badge>
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                Examination Window: 10:00 AM - 12:00 PM
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {nextExam.courseCode}: {nextExam.courseName}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-300 pt-1">
              <div className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span>Monday, 6th October 2026</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono">
                <Clock className="w-4 h-4 text-indigo-500" />
                <span>{nextExam.time}</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <MapPin className="w-4 h-4 text-indigo-500" />
                <span>{nextExam.hallNumber} • <strong className="text-indigo-600 dark:text-indigo-400">Seat {nextExam.seatNumber}</strong></span>
              </div>
            </div>
          </div>

          {/* Live Countdown Clock Widget */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-900 text-white p-3 rounded-2xl shadow-lg border border-slate-800">
              <div className="text-center px-2">
                <span className="text-xl sm:text-2xl font-bold font-mono text-indigo-400">
                  {timeLeft.days.toString().padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400 block">Days</span>
              </div>
              <span className="text-slate-600 font-bold">:</span>
              <div className="text-center px-2">
                <span className="text-xl sm:text-2xl font-bold font-mono text-white">
                  {timeLeft.hours.toString().padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400 block">Hrs</span>
              </div>
              <span className="text-slate-600 font-bold">:</span>
              <div className="text-center px-2">
                <span className="text-xl sm:text-2xl font-bold font-mono text-white">
                  {timeLeft.minutes.toString().padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400 block">Min</span>
              </div>
              <span className="text-slate-600 font-bold">:</span>
              <div className="text-center px-2">
                <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
                  {timeLeft.seconds.toString().padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400 block">Sec</span>
              </div>
            </div>

            <Button
              variant="ai"
              onClick={() =>
                navigate(
                  `/campus-ai?prompt=${encodeURIComponent(
                    `Please build me a personalized 5-day revision timetable for ${nextExam.courseCode} ${nextExam.courseName}. Focus on high-yield concepts like CAP Theorem, Raft Consensus, and Distributed Caching.`
                  )}`
                )
              }
              leftIcon={<Sparkles className="w-4 h-4" />}
              className="whitespace-nowrap"
            >
              AI Revision Guide
            </Button>
          </div>
        </div>
      </Card>

      {/* Full Examination Timetable */}
      <section className="space-y-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Complete Semester 6 Exam Schedule
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exams.map((exam, index) => {
            const matchedCourse = courses.find((c) => c.code === exam.courseCode);
            const syllabus = matchedCourse?.syllabusCovered || 80;

            return (
              <Card key={exam.id} surface="base" className="p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {exam.courseCode}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                        {exam.courseName}
                      </h4>
                    </div>
                    <Badge variant={index === 0 ? 'primary' : 'default'}>
                      {index === 0 ? 'Next Up' : `Exam ${index + 1}`}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 my-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2.5">
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase font-mono">Date & Time</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{exam.date}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase font-mono">Hall & Assigned Seat</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{exam.hallNumber} ({exam.seatNumber})</span>
                    </div>
                  </div>

                  {/* Syllabus covered bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Syllabus Covered</span>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{syllabus}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${syllabus}%` }} />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-mono">Max Marks: {exam.maxMarks}</span>
                  <button
                    onClick={() =>
                      navigate(
                        `/campus-ai?prompt=${encodeURIComponent(
                          `Explain key exam question predictions for ${exam.courseCode} ${exam.courseName}.`
                        )}`
                      )
                    }
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>Ask AI for Tips</span>
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Official Hall Ticket & Seat Map Modal */}
      <AnimatePresence>
        {isHallTicketOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5 my-8"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Official Examination Hall Ticket & Admit Card
                    </h3>
                    <span className="text-[11px] text-slate-400">Office of the Controller of Examinations</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsHallTicketOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Student Header & QR Pass Card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-16 h-16 rounded-xl border border-indigo-400 object-cover shadow-xs"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {currentUser.name}
                    </h4>
                    <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 block font-semibold">
                      Enrollment: {currentUser.rollNumber || '0827CS221045'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      B.Tech Computer Science & Eng. • Sem 6
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center bg-white p-2 rounded-xl border border-slate-200 shadow-xs shrink-0">
                  <QrCode className="w-20 h-20 text-slate-900" />
                  <span className="text-[8px] font-mono font-bold text-slate-500 mt-1">HALLPASS-VERIFIED</span>
                </div>
              </div>

              {/* Interactive Examination Hall Seat Map */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
                    Hall Seat Layout (Tech Block Room 401)
                  </h4>
                  <span className="text-xs font-mono text-indigo-600 font-bold">
                    Assigned: Desk B-24
                  </span>
                </div>

                {/* Desk Matrix Visualizer */}
                <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
                  <div className="w-full py-1 text-center font-mono text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                    ── [ Invigilator Podium / Whiteboard ] ──
                  </div>

                  <div className="grid grid-cols-6 gap-2 pt-2">
                    {Array.from({ length: 30 }).map((_, i) => {
                      const row = String.fromCharCode(65 + Math.floor(i / 6)); // A, B, C...
                      const col = (i % 6) + 1;
                      const seatCode = `${row}-${Math.floor(i / 6) * 6 + col}`;
                      const isMySeat = i === 13; // Seat B-24

                      return (
                        <div
                          key={seatCode}
                          className={`p-2 rounded-lg text-center font-mono text-[10px] transition-all flex flex-col items-center justify-center ${
                            isMySeat
                              ? 'bg-indigo-600 text-white font-extrabold ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900 scale-105 shadow-lg'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          <span>{isMySeat ? 'B-24' : seatCode}</span>
                          <span className="text-[8px] opacity-75 mt-0.5">
                            {isMySeat ? 'Faizan' : 'Occupied'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Regulations Checklist */}
              <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                <span className="font-bold text-amber-800 dark:text-amber-300 block">
                  Examination Regulations:
                </span>
                <p>1. Candidates must arrive at Tech Block 401 at least 20 minutes prior to exam commencement.</p>
                <p>2. Non-programmable scientific calculators permitted for CS601 and CS603.</p>
                <p>3. Smart watches and cell phones strictly prohibited inside the hall perimeter.</p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  leftIcon={<Printer className="w-3.5 h-3.5" />}
                  className="flex-1"
                >
                  Print / Save PDF
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsHallTicketOpen(false)}
                  className="flex-1"
                >
                  Done
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Past Question Papers Drawer */}
      <AnimatePresence>
        {isPastPapersOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Past Question Papers & Model Solutions
                  </h3>
                </div>
                <button
                  onClick={() => setIsPastPapersOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {['all', 'CS601', 'CS602', 'CS603', 'CS604'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setPaperFilter(f)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-colors ${
                      paperFilter === f
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Papers List */}
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {filteredPapers.map((paper) => (
                  <div
                    key={paper.id}
                    className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-indigo-600">{paper.courseCode}</span>
                        <Badge variant="primary">{paper.year} {paper.examType}</Badge>
                        {paper.hasSolutions && <Badge variant="success">Solved</Badge>}
                      </div>
                      <h5 className="font-semibold text-slate-900 dark:text-white mt-1">
                        {paper.courseName}
                      </h5>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                        {paper.downloads} student downloads
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => alert(`Downloading PDF: ${paper.courseCode}_${paper.year}_${paper.examType}.pdf`)}
                      leftIcon={<Download className="w-3.5 h-3.5" />}
                    >
                      PDF
                    </Button>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsPastPapersOpen(false)}
                  className="w-full"
                >
                  Close Archive
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
