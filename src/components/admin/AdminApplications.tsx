import React, { useState } from 'react';
import { CheckCircle2, XCircle, FileText, ChevronDown } from 'lucide-react';

type AppType = 'Medical Leave' | 'OD Request' | 'Scholarship' | 'Transfer Certificate';
type AppStatus = 'Pending' | 'Approved' | 'Rejected';

interface Application {
  id: string; refNo: string; name: string; rollNo: string; type: AppType;
  description: string; submittedAt: string; status: AppStatus; remarks: string;
}

const APPLICATIONS: Application[] = [
  { id: 'A1', refNo: 'APP-2026-0091', name: 'Rohit Verma',     rollNo: '0827AI221033', type: 'Medical Leave',        description: 'Medical leave request for 5 days due to dengue fever — doctor certificate attached.',  submittedAt: '2026-10-01', status: 'Pending',  remarks: '' },
  { id: 'A2', refNo: 'APP-2026-0089', name: 'Faizan Ali',      rollNo: '0827CS221045', type: 'OD Request',           description: 'On-Duty request for Smart India Hackathon national finals at IIT Bombay (3 days).', submittedAt: '2026-09-30', status: 'Pending',  remarks: '' },
  { id: 'A3', refNo: 'APP-2026-0085', name: 'Kavya Reddy',     rollNo: '0827AI221055', type: 'Scholarship',          description: 'Merit-cum-means scholarship application for academic year 2026-27.',                submittedAt: '2026-09-28', status: 'Approved', remarks: 'Approved. Scholarship disbursed to bank account on file.' },
  { id: 'A4', refNo: 'APP-2026-0082', name: 'Siddharth Kulkarni', rollNo: '0827ME221088', type: 'Transfer Certificate', description: 'Transfer certificate required for admission to Maharashtra Institute of Technology.', submittedAt: '2026-09-25', status: 'Rejected', remarks: 'Rejected — outstanding library dues of ₹450. Please clear and reapply.' },
  { id: 'A5', refNo: 'APP-2026-0079', name: 'Anjali Mehta',    rollNo: '0827ECE221011', type: 'Medical Leave',        description: 'Retroactive medical leave for 2 days — hospital admission records attached.',         submittedAt: '2026-09-24', status: 'Approved', remarks: 'Approved retroactively. Attendance updated.' },
];

const TYPE_COLOR: Record<AppType, string> = {
  'Medical Leave':        'bg-sky-500/15 text-sky-400 border-sky-500/30',
  'OD Request':           'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  'Scholarship':          'bg-amber-500/15 text-amber-400 border-amber-500/30',
  'Transfer Certificate': 'bg-purple-500/15 text-purple-400 border-purple-500/30',
};

export const AdminApplications: React.FC = () => {
  const [apps, setApps] = useState<Application[]>(APPLICATIONS);
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<string | null>(null);

  const decide = (id: string, decision: 'Approved' | 'Rejected') => {
    setApps(prev => prev.map(a => a.id === id ? { ...a, status: decision, remarks: remarks[id] || '' } : a));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-xl font-extrabold text-white">Applications & Approvals</h1>
        <p className="text-xs text-slate-400 mt-0.5">Medical leave · OD requests · Scholarships · Transfer certificates</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending',  val: apps.filter(a => a.status === 'Pending').length,  color: 'text-amber-400' },
          { label: 'Approved', val: apps.filter(a => a.status === 'Approved').length, color: 'text-emerald-400' },
          { label: 'Rejected', val: apps.filter(a => a.status === 'Rejected').length, color: 'text-rose-400' },
        ].map(s => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
            <p className={`text-2xl font-extrabold font-mono ${s.color}`}>{s.val}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {apps.map(a => (
          <div key={a.id} className={`bg-slate-900 border rounded-2xl overflow-hidden transition-colors ${
            a.status === 'Pending' ? 'border-slate-700' : 'border-slate-800'
          }`}>
            <button
              onClick={() => setExpanded(expanded === a.id ? null : a.id)}
              className="w-full flex items-center gap-3 p-4 text-left"
            >
              <FileText className="w-4 h-4 text-slate-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${TYPE_COLOR[a.type]}`}>{a.type}</span>
                  <span className={`text-[10px] font-bold ${a.status === 'Pending' ? 'text-amber-400' : a.status === 'Approved' ? 'text-emerald-400' : 'text-rose-400'}`}>{a.status}</span>
                </div>
                <p className="text-xs font-semibold text-white mt-0.5">{a.name} <span className="text-slate-500 font-normal">· {a.rollNo}</span></p>
              </div>
              <div className="flex items-center gap-2 shrink-0 text-[11px] text-slate-500">
                <span>{a.submittedAt}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${expanded === a.id ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {expanded === a.id && (
              <div className="border-t border-slate-800 p-4 space-y-3">
                <div className="bg-slate-800/50 rounded-xl p-3 text-xs text-slate-300 leading-relaxed">
                  {a.description}
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Ref: {a.refNo}</span>

                {a.status === 'Pending' && (
                  <div className="space-y-2">
                    <textarea
                      value={remarks[a.id] || ''}
                      onChange={e => setRemarks(prev => ({ ...prev, [a.id]: e.target.value }))}
                      placeholder="Add remarks (optional)…"
                      rows={2}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => decide(a.id, 'Approved')}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                      ><CheckCircle2 className="w-4 h-4" /> Approve</button>
                      <button onClick={() => decide(a.id, 'Rejected')}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
                      ><XCircle className="w-4 h-4" /> Reject</button>
                    </div>
                  </div>
                )}

                {a.status !== 'Pending' && a.remarks && (
                  <div className={`p-3 rounded-xl text-xs border ${a.status === 'Approved' ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300' : 'bg-rose-500/10 border-rose-500/25 text-rose-300'}`}>
                    <strong>Remarks:</strong> {a.remarks}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
