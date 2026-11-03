import React, { useState } from 'react';
import { Search, Filter, Download, UserX, Fingerprint, TicketCheck, ChevronDown, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

interface Student {
  id: string; name: string; rollNumber: string; department: string;
  semester: number; cgpa: number; attendance: number;
  biometricStatus: 'enrolled' | 'pending'; hallTicketLocked: boolean; flags: number;
}

const STUDENTS: Student[] = [
  { id: 'STU-001', name: 'Faizan Ali',        rollNumber: '0827CS221045', department: 'CSE',        semester: 6, cgpa: 8.74, attendance: 87.2, biometricStatus: 'enrolled', hallTicketLocked: false, flags: 0 },
  { id: 'STU-002', name: 'Priya Sharma',      rollNumber: '0827CS221062', department: 'CSE',        semester: 6, cgpa: 9.12, attendance: 92.5, biometricStatus: 'enrolled', hallTicketLocked: false, flags: 0 },
  { id: 'STU-003', name: 'Rohit Verma',       rollNumber: '0827AI221033', department: 'AI/DS',      semester: 4, cgpa: 7.40, attendance: 71.3, biometricStatus: 'pending',  hallTicketLocked: true,  flags: 2 },
  { id: 'STU-004', name: 'Anjali Mehta',      rollNumber: '0827ECE221011', department: 'ECE',       semester: 4, cgpa: 8.20, attendance: 83.1, biometricStatus: 'enrolled', hallTicketLocked: false, flags: 0 },
  { id: 'STU-005', name: 'Siddharth Kulkarni',rollNumber: '0827ME221088',  department: 'Mechanical',semester: 2, cgpa: 6.80, attendance: 68.4, biometricStatus: 'pending',  hallTicketLocked: true,  flags: 3 },
  { id: 'STU-006', name: 'Meera Nair',        rollNumber: '0827CS221101', department: 'CSE',        semester: 6, cgpa: 8.90, attendance: 89.7, biometricStatus: 'enrolled', hallTicketLocked: false, flags: 0 },
  { id: 'STU-007', name: 'Arjun Singh',       rollNumber: '0827CV221044', department: 'Civil',      semester: 4, cgpa: 7.15, attendance: 74.0, biometricStatus: 'enrolled', hallTicketLocked: false, flags: 1 },
  { id: 'STU-008', name: 'Kavya Reddy',       rollNumber: '0827AI221055', department: 'AI/DS',      semester: 6, cgpa: 9.40, attendance: 95.2, biometricStatus: 'enrolled', hallTicketLocked: false, flags: 0 },
];

export const AdminStudentManagement: React.FC = () => {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [students, setStudents] = useState<Student[]>(STUDENTS);

  const depts = ['All', 'CSE', 'AI/DS', 'ECE', 'Mechanical', 'Civil'];
  const filtered = students.filter(s =>
    (deptFilter === 'All' || s.department === deptFilter) &&
    (s.name.toLowerCase().includes(search.toLowerCase()) || s.rollNumber.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleLock = (id: string) => setStudents(prev => prev.map(s => s.id === id ? { ...s, hallTicketLocked: !s.hallTicketLocked } : s));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white">Student Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">Registry · Biometric Status · Disciplinary Flags · Hall-Ticket Control</p>
        </div>
        <button
          onClick={() => alert('CSV ledger exported!')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-colors"
        >
          <Download className="w-3.5 h-3.5" /> Export CSV Ledger
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', val: students.length, color: 'text-indigo-400' },
          { label: 'Biometric Enrolled', val: students.filter(s => s.biometricStatus === 'enrolled').length, color: 'text-emerald-400' },
          { label: 'Attendance < 75%', val: students.filter(s => s.attendance < 75).length, color: 'text-rose-400' },
          { label: 'Hall Tickets Locked', val: students.filter(s => s.hallTicketLocked).length, color: 'text-amber-400' },
        ].map(st => (
          <div key={st.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <p className={`text-2xl font-extrabold font-mono ${st.color}`}>{st.val}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{st.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or roll number…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {depts.map(d => (
            <button key={d} onClick={() => setDeptFilter(d)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${deptFilter === d ? 'bg-amber-500 text-black' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'}`}
            >{d}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="border-b border-slate-800">
              <tr className="text-[10px] text-slate-400 uppercase font-mono">
                <th className="px-4 py-3 text-left">Student</th>
                <th className="px-4 py-3 text-left">Roll No.</th>
                <th className="px-4 py-3 text-left">Dept / Sem</th>
                <th className="px-4 py-3 text-right">CGPA</th>
                <th className="px-4 py-3 text-right">Attendance</th>
                <th className="px-4 py-3 text-center">Biometric</th>
                <th className="px-4 py-3 text-center">Flags</th>
                <th className="px-4 py-3 text-center">Hall Ticket</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 text-[10px] font-bold">
                        {s.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <span className="font-semibold text-white">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-300">{s.rollNumber}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">{s.department}</span>
                    <span className="ml-1 text-slate-500">Sem {s.semester}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">{s.cgpa.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-mono font-bold ${s.attendance < 75 ? 'text-rose-400' : 'text-emerald-400'}`}>{s.attendance.toFixed(1)}%</span>
                    {s.attendance < 75 && <AlertTriangle className="inline ml-1 w-3 h-3 text-rose-400" />}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      s.biometricStatus === 'enrolled'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                    }`}>
                      <Fingerprint className="w-3 h-3" />
                      {s.biometricStatus === 'enrolled' ? 'Enrolled' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {s.flags > 0
                      ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/25"><AlertTriangle className="w-3 h-3" />{s.flags}</span>
                      : <span className="text-slate-600 text-[10px]">—</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleLock(s.id)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                        s.hallTicketLocked
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/25 hover:bg-rose-500/25'
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25'
                      }`}
                    >
                      <TicketCheck className="w-3 h-3" />
                      {s.hallTicketLocked ? 'Locked' : 'Active'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => alert(`Biometric reset for ${s.name}`)}
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-[10px] font-semibold transition-colors"
                    >
                      Reset Bio
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-xs">No students match your search.</div>
          )}
        </div>
      </div>
    </div>
  );
};
