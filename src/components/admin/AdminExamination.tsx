import React, { useState } from 'react';
import { AlertTriangle, Calendar, Hash, CheckCircle2, Shield, Lock } from 'lucide-react';

interface ExamSchedule {
  id: string; course: string; code: string; type: string;
  date: string; time: string; hall: string; invigilator: string;
  lowAttendance: number; totalStudents: number;
}

const SCHEDULE: ExamSchedule[] = [
  { id: 'E1', course: 'Distributed Systems',     code: 'CS601', type: 'Mid-Semester',         date: '2026-10-15', time: '09:00 AM', hall: 'Hall A',     invigilator: 'Prof. Rajesh Sharma',   lowAttendance: 3,  totalStudents: 64 },
  { id: 'E2', course: 'Machine Learning & NLP',  code: 'CS603', type: 'Mid-Semester',         date: '2026-10-16', time: '02:00 PM', hall: 'Hall B',     invigilator: 'Dr. Anita Krishnamurthy',lowAttendance: 1,  totalStudents: 58 },
  { id: 'E3', course: 'Computer Networks',        code: 'CS604', type: 'End-Semester Theory',  date: '2026-11-10', time: '09:00 AM', hall: 'Hall A & C', invigilator: 'Mr. Suresh Patil',      lowAttendance: 7,  totalStudents: 62 },
  { id: 'E4', course: 'AI Ethics & Governance',  code: 'AI501', type: 'End-Semester Theory',  date: '2026-11-12', time: '02:00 PM', hall: 'Hall D',     invigilator: 'Prof. Vikram Nair',     lowAttendance: 0,  totalStudents: 44 },
  { id: 'E5', course: 'OS Lab',                  code: 'CS691', type: 'Practical Lab',        date: '2026-10-20', time: '10:00 AM', hall: 'Lab 4',      invigilator: 'Ms. Deepa Menon',       lowAttendance: 2,  totalStudents: 30 },
];

export const AdminExamination: React.FC = () => {
  const [signed, setSigned] = useState<string[]>([]);
  const [published, setPublished] = useState<string[]>([]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-xl font-extrabold text-white">Examination Portal</h1>
        <p className="text-xs text-slate-400 mt-0.5">Schedules · Room allotment · Invigilation roster · 75% eligibility enforcement</p>
      </div>

      {/* Eligibility alert */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
        <div>
          <p className="text-xs font-bold text-amber-300">Attendance Eligibility Threshold: 75% Rule Active</p>
          <p className="text-[11px] text-amber-400/70">Students below 75% are automatically flagged and de-registered from hall-ticket issuance until Dean approval.</p>
        </div>
      </div>

      <div className="space-y-3">
        {SCHEDULE.map(ex => (
          <div key={ex.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[10px] text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-900/40">{ex.code}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    ex.type === 'Mid-Semester' ? 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                    : ex.type === 'Practical Lab' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                  }`}>{ex.type}</span>
                </div>
                <h3 className="text-sm font-bold text-white">{ex.course}</h3>
                <div className="flex flex-wrap gap-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{ex.date} · {ex.time}</span>
                  <span className="flex items-center gap-1"><Hash className="w-3 h-3" />{ex.hall}</span>
                  <span>Invigilator: <span className="text-slate-300">{ex.invigilator}</span></span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <p className="text-xs font-bold text-white">{ex.totalStudents} registered</p>
                  {ex.lowAttendance > 0 && (
                    <p className="text-[11px] text-rose-400 flex items-center gap-1 justify-end">
                      <AlertTriangle className="w-3 h-3" />{ex.lowAttendance} flagged
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSigned(prev => prev.includes(ex.id) ? prev : [...prev, ex.id])}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  signed.includes(ex.id)
                    ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                {signed.includes(ex.id) ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                {signed.includes(ex.id) ? 'Gradebook Signed' : 'Cryptographic Sign Gradebook'}
              </button>
              <button
                onClick={() => {
                  setSigned(prev => prev.includes(ex.id) ? prev : [...prev, ex.id]);
                  setPublished(prev => prev.includes(ex.id) ? prev : [...prev, ex.id]);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  published.includes(ex.id)
                    ? 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                {published.includes(ex.id) ? <Lock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                {published.includes(ex.id) ? 'Results Published' : 'Publish Results'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
