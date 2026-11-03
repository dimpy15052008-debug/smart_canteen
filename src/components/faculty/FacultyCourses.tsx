import React, { useState } from 'react';
import {
  BookOpen, Award, CheckCircle2, ChevronRight, Download,
  Plus, Edit3, BarChart2, Users, FileText, Check
} from 'lucide-react';

interface StudentGrade {
  id: string;
  name: string;
  roll: string;
  midTerm: number;
  assignment: number;
  quiz: number;
  total: number;
  grade: string;
}

const INITIAL_STUDENTS: StudentGrade[] = [
  { id: '1', name: 'Aarav Sharma', roll: 'CS2023-042', midTerm: 28, assignment: 19, quiz: 9, total: 56, grade: 'A' },
  { id: '2', name: 'Diya Patel', roll: 'CS2023-088', midTerm: 29, assignment: 20, quiz: 10, total: 59, grade: 'O' },
  { id: '3', name: 'Rohan Verma', roll: 'CS2023-115', midTerm: 18, assignment: 14, quiz: 6, total: 38, grade: 'C' },
  { id: '4', name: 'Ananya Iyer', roll: 'CS2023-019', midTerm: 27, assignment: 18, quiz: 9, total: 54, grade: 'A' },
  { id: '5', name: 'Vikram Malhotra', roll: 'CS2023-144', midTerm: 22, assignment: 16, quiz: 7, total: 45, grade: 'B' },
  { id: '6', name: 'Sneha Reddy', roll: 'CS2023-071', midTerm: 25, assignment: 19, quiz: 8, total: 52, grade: 'A' },
];

export const FacultyCourses: React.FC = () => {
  const [selectedCourse, setSelectedCourse] = useState('CS601');
  const [students, setStudents] = useState<StudentGrade[]>(INITIAL_STUDENTS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ midTerm: number; assignment: number; quiz: number }>({ midTerm: 0, assignment: 0, quiz: 0 });

  const startEdit = (s: StudentGrade) => {
    setEditingId(s.id);
    setEditValues({ midTerm: s.midTerm, assignment: s.assignment, quiz: s.quiz });
  };

  const saveEdit = (id: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id !== id) return s;
      const total = editValues.midTerm + editValues.assignment + editValues.quiz;
      let grade = 'F';
      if (total >= 58) grade = 'O';
      else if (total >= 50) grade = 'A';
      else if (total >= 42) grade = 'B';
      else if (total >= 35) grade = 'C';
      return { ...s, ...editValues, total, grade };
    }));
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            Curriculum & Gradebook
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage course syllabus progress, continuous internal assessments, and grade rosters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('Gradebook exported as official university appraisal report.')}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition"
          >
            <Download className="w-3.5 h-3.5" />
            Export Gradebook
          </button>
        </div>
      </div>

      {/* Course Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { code: 'CS601', title: 'Distributed Systems', section: 'Sec A (4th Year)', syllabus: 78, students: 58 },
          { code: 'CS402', title: 'Operating Systems Kernel', section: 'Sec B (3rd Year)', syllabus: 62, students: 64 },
          { code: 'CS701', title: 'Cloud Microservices', section: 'Sec A (Elective)', syllabus: 90, students: 42 },
        ].map((c) => (
          <div
            key={c.code}
            onClick={() => setSelectedCourse(c.code)}
            className={`p-4 rounded-xl border cursor-pointer transition ${
              selectedCourse === c.code
                ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-950/50'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                {c.code}
              </span>
              <span className="text-[11px] text-slate-400">{c.section}</span>
            </div>
            <h3 className="text-sm font-semibold text-white mt-2">{c.title}</h3>
            <div className="mt-3">
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400">Syllabus Covered</span>
                <span className="text-indigo-400 font-semibold">{c.syllabus}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full"
                  style={{ width: `${c.syllabus}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Grade Ledger */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div>
            <h3 className="text-sm font-bold text-white">Internal Assessment Roster (Max: 60)</h3>
            <p className="text-[11px] text-slate-400">Mid-Term (30) + Assignments (20) + Surprise Quiz (10)</p>
          </div>
          <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md">
            Showing {students.length} candidates
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/70 text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4 text-center">Mid-Term (/30)</th>
                <th className="py-3 px-4 text-center">Assignment (/20)</th>
                <th className="py-3 px-4 text-center">Quiz (/10)</th>
                <th className="py-3 px-4 text-center">Total (/60)</th>
                <th className="py-3 px-4 text-center">Grade</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {students.map((s) => {
                const isEditing = editingId === s.id;
                return (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-semibold text-white">{s.name}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{s.roll}</td>

                    <td className="py-3 px-4 text-center">
                      {isEditing ? (
                        <input
                          type="number"
                          max={30}
                          min={0}
                          value={editValues.midTerm}
                          onChange={(e) => setEditValues({ ...editValues, midTerm: Number(e.target.value) })}
                          className="w-14 bg-slate-950 border border-indigo-500 rounded px-1.5 py-0.5 text-center text-xs text-white"
                        />
                      ) : (
                        <span className="font-semibold text-slate-200">{s.midTerm}</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {isEditing ? (
                        <input
                          type="number"
                          max={20}
                          min={0}
                          value={editValues.assignment}
                          onChange={(e) => setEditValues({ ...editValues, assignment: Number(e.target.value) })}
                          className="w-14 bg-slate-950 border border-indigo-500 rounded px-1.5 py-0.5 text-center text-xs text-white"
                        />
                      ) : (
                        <span className="font-semibold text-slate-200">{s.assignment}</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {isEditing ? (
                        <input
                          type="number"
                          max={10}
                          min={0}
                          value={editValues.quiz}
                          onChange={(e) => setEditValues({ ...editValues, quiz: Number(e.target.value) })}
                          className="w-14 bg-slate-950 border border-indigo-500 rounded px-1.5 py-0.5 text-center text-xs text-white"
                        />
                      ) : (
                        <span className="font-semibold text-slate-200">{s.quiz}</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center font-bold text-indigo-400 font-mono">
                      {isEditing ? editValues.midTerm + editValues.assignment + editValues.quiz : s.total}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.grade === 'O' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        s.grade === 'A' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
                        'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {s.grade}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {isEditing ? (
                        <button
                          onClick={() => saveEdit(s.id)}
                          className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] inline-flex items-center gap-1 px-2"
                        >
                          <Check className="w-3.5 h-3.5" /> Save
                        </button>
                      ) : (
                        <button
                          onClick={() => startEdit(s)}
                          className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] inline-flex items-center gap-1 px-2 border border-slate-700"
                        >
                          <Edit3 className="w-3 h-3" /> Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
