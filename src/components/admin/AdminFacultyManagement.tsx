import React, { useState } from 'react';
import { Plus, DoorOpen, FileSignature, UserCheck2, Search, X } from 'lucide-react';

interface Faculty {
  id: string; name: string; empId: string; department: string; rank: string;
  courses: string[]; rfidAccess: boolean; naacSigner: boolean; invigilator: boolean; cabin: string;
}

const FACULTY: Faculty[] = [
  { id: 'FAC-001', name: 'Prof. Rajesh Sharma',   empId: 'FAC-2026-002', department: 'CSE',        rank: 'Associate Professor & HOD', courses: ['CS601','CS603'], rfidAccess: true,  naacSigner: true,  invigilator: true,  cabin: 'A-412' },
  { id: 'FAC-002', name: 'Dr. Anita Krishnamurthy',empId: 'FAC-2026-007', department: 'AI/DS',     rank: 'Professor',                 courses: ['AI501','ML502'], rfidAccess: true,  naacSigner: true,  invigilator: true,  cabin: 'B-204' },
  { id: 'FAC-003', name: 'Mr. Suresh Patil',       empId: 'FAC-2026-014', department: 'ECE',        rank: 'Assistant Professor',       courses: ['EC401'],        rfidAccess: true,  naacSigner: false, invigilator: true,  cabin: 'C-108' },
  { id: 'FAC-004', name: 'Ms. Deepa Menon',        empId: 'FAC-2026-019', department: 'Mechanical', rank: 'Assistant Professor',       courses: ['ME301','ME302'], rfidAccess: false, naacSigner: false, invigilator: true,  cabin: 'D-012' },
  { id: 'FAC-005', name: 'Prof. Vikram Nair',      empId: 'FAC-2026-003', department: 'Civil',      rank: 'Professor & HOD',           courses: ['CV501'],        rfidAccess: true,  naacSigner: true,  invigilator: false, cabin: 'E-301' },
];

export const AdminFacultyManagement: React.FC = () => {
  const [faculty, setFaculty] = useState<Faculty[]>(FACULTY);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newFaculty, setNewFaculty] = useState({ name: '', department: 'CSE', rank: 'Assistant Professor', cabin: '' });

  const toggle = (id: string, key: 'rfidAccess' | 'naacSigner' | 'invigilator') => {
    setFaculty(prev => prev.map(f => f.id === id ? { ...f, [key]: !f[key] } : f));
  };

  const filtered = faculty.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) || f.empId.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!newFaculty.name) return;
    const newId = `FAC-${Date.now()}`;
    setFaculty(prev => [...prev, {
      id: newId, empId: `FAC-2026-0${30 + prev.length}`,
      name: newFaculty.name, department: newFaculty.department, rank: newFaculty.rank,
      courses: [], rfidAccess: false, naacSigner: false, invigilator: false, cabin: newFaculty.cabin
    }]);
    setShowModal(false);
    setNewFaculty({ name: '', department: 'CSE', rank: 'Assistant Professor', cabin: '' });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white">Faculty Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">Employee roster · Clearance tiers · Course assignments</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add New Faculty
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search faculty…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500" />
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(f => (
          <div key={f.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-sm">
                  {f.name.split(' ').slice(-1)[0][0]}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{f.name}</h3>
                  <p className="text-[11px] text-slate-400">{f.rank}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-[10px] text-indigo-400 bg-indigo-950 px-1.5 py-0.5 rounded border border-indigo-900/40">{f.empId}</span>
                    <span className="text-[10px] text-slate-500">{f.department} · Cabin {f.cabin}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Course tags */}
            <div className="flex flex-wrap gap-1.5">
              {f.courses.map(c => (
                <span key={c} className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-mono">{c}</span>
              ))}
              {f.courses.length === 0 && <span className="text-[11px] text-slate-600">No courses assigned</span>}
            </div>

            {/* Clearance Toggles */}
            <div className="grid grid-cols-3 gap-2">
              {([
                { key: 'rfidAccess' as const,  label: 'RFID Access',   icon: DoorOpen },
                { key: 'naacSigner' as const,   label: 'NAAC Signer',   icon: FileSignature },
                { key: 'invigilator' as const,  label: 'Invigilator',   icon: UserCheck2 },
              ]).map(({ key, label, icon: Icon }) => (
                <button key={key} onClick={() => toggle(f.id, key)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-[10px] font-semibold transition-all ${
                    f[key]
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                      : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add Faculty Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">Add New Faculty Member</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            {[
              { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Prof. First Last' },
              { label: 'Cabin Number', key: 'cabin', type: 'text', placeholder: 'e.g. A-412' },
            ].map(field => (
              <div key={field.key} className="space-y-1">
                <label className="text-xs text-slate-400">{field.label}</label>
                <input value={(newFaculty as Record<string, string>)[field.key]}
                  onChange={e => setNewFaculty(prev => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder} type={field.type}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Department</label>
                <select value={newFaculty.department} onChange={e => setNewFaculty(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {['CSE', 'AI/DS', 'ECE', 'Mechanical', 'Civil', 'Management'].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Academic Rank</label>
                <select value={newFaculty.rank} onChange={e => setNewFaculty(prev => ({ ...prev, rank: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {['Professor & HOD', 'Professor', 'Associate Professor', 'Assistant Professor'].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <button onClick={handleAdd}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-colors"
            >Add Faculty Member</button>
          </div>
        </div>
      )}
    </div>
  );
};
