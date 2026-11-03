import React, { useState } from 'react';
import { AlertTriangle, Clock, CheckCircle2, ChevronRight, ArrowUp } from 'lucide-react';

type Status = 'Reported' | 'Under Review' | 'Faculty Assigned' | 'Resolved';
type Category = 'Anti-Ragging' | 'Academic Appeal' | 'Infrastructure' | 'Hostel';

interface Complaint {
  id: string; ticketNo: string; student: string; rollNo: string;
  category: Category; subject: string; priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: Status; reportedAt: string; slaHours: number; hoursElapsed: number;
}

const COMPLAINTS: Complaint[] = [
  { id: 'C1', ticketNo: 'GRV-2026-0042', student: 'Rohit Verma',    rollNo: '0827AI221033', category: 'Anti-Ragging',    subject: 'Senior student harassment in hostel corridor',    priority: 'Critical', status: 'Under Review',    reportedAt: '2026-10-01 09:15', slaHours: 24,  hoursElapsed: 18 },
  { id: 'C2', ticketNo: 'GRV-2026-0039', student: 'Meera Nair',     rollNo: '0827CS221101', category: 'Academic Appeal',  subject: 'Internal assessment marks dispute — CS603',       priority: 'High',     status: 'Faculty Assigned',reportedAt: '2026-09-30 14:30', slaHours: 48,  hoursElapsed: 32 },
  { id: 'C3', ticketNo: 'GRV-2026-0037', student: 'Arjun Singh',    rollNo: '0827CV221044', category: 'Infrastructure',   subject: 'Lab projector non-functional for 3 weeks',        priority: 'Medium',   status: 'Reported',        reportedAt: '2026-09-29 11:00', slaHours: 72,  hoursElapsed: 48 },
  { id: 'C4', ticketNo: 'GRV-2026-0035', student: 'Anjali Mehta',   rollNo: '0827ECE221011', category: 'Hostel',          subject: 'Water leakage in Block B room 201',               priority: 'High',     status: 'Resolved',        reportedAt: '2026-09-27 08:00', slaHours: 48,  hoursElapsed: 47 },
  { id: 'C5', ticketNo: 'GRV-2026-0031', student: 'Kavya Reddy',    rollNo: '0827AI221055', category: 'Academic Appeal',  subject: 'Request for re-evaluation of AI-501 end-sem',     priority: 'Medium',   status: 'Under Review',    reportedAt: '2026-09-28 16:45', slaHours: 72,  hoursElapsed: 55 },
];

const STATUS_FLOW: Status[] = ['Reported', 'Under Review', 'Faculty Assigned', 'Resolved'];

const PRIORITY_COLOR: Record<string, string> = {
  Critical: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  High:     'bg-orange-500/15 text-orange-400 border-orange-500/30',
  Medium:   'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Low:      'bg-slate-700 text-slate-400 border-slate-600',
};

const CAT_COLOR: Record<Category, string> = {
  'Anti-Ragging':  'text-rose-400',
  'Academic Appeal':'text-indigo-400',
  'Infrastructure':'text-sky-400',
  'Hostel':        'text-emerald-400',
};

export const AdminComplaints: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>(COMPLAINTS);
  const [filter, setFilter] = useState<'All' | Status>('All');

  const advance = (id: string) => {
    setComplaints(prev => prev.map(c => {
      if (c.id !== id || c.status === 'Resolved') return c;
      const idx = STATUS_FLOW.indexOf(c.status);
      return { ...c, status: STATUS_FLOW[idx + 1] };
    }));
  };

  const filtered = filter === 'All' ? complaints : complaints.filter(c => c.status === filter);
  const slaBreached = complaints.filter(c => c.hoursElapsed >= c.slaHours && c.status !== 'Resolved').length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-xl font-extrabold text-white">Complaints & Grievance Cell</h1>
        <p className="text-xs text-slate-400 mt-0.5">Anti-Ragging · Academic Appeals · Infrastructure · Hostel · SLA enforcement</p>
      </div>

      {slaBreached > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <div>
            <p className="text-xs font-bold text-rose-300">{slaBreached} complaint{slaBreached > 1 ? 's' : ''} SLA breached</p>
            <p className="text-[11px] text-rose-400/70">Immediate escalation required per NAAC compliance guidelines.</p>
          </div>
        </div>
      )}

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {(['All', ...STATUS_FLOW] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${filter === s ? 'bg-amber-500 text-black' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'}`}
          >{s}</button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(c => {
          const slaPercent = Math.min(100, Math.round((c.hoursElapsed / c.slaHours) * 100));
          const slaBreached = c.hoursElapsed >= c.slaHours && c.status !== 'Resolved';

          return (
            <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] text-slate-500">{c.ticketNo}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${PRIORITY_COLOR[c.priority]}`}>{c.priority}</span>
                    <span className={`text-[10px] font-semibold ${CAT_COLOR[c.category]}`}>{c.category}</span>
                  </div>
                  <p className="text-sm font-bold text-white">{c.subject}</p>
                  <p className="text-[11px] text-slate-400">{c.student} · {c.rollNo} · Reported {c.reportedAt}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {/* Status pipeline */}
                  {STATUS_FLOW.map((s, i) => (
                    <React.Fragment key={s}>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg ${c.status === s ? 'bg-amber-500 text-black' : STATUS_FLOW.indexOf(c.status) > i ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-600'}`}>
                        {s === 'Reported' ? 'New' : s === 'Under Review' ? 'Review' : s === 'Faculty Assigned' ? 'Assigned' : '✓'}
                      </span>
                      {i < STATUS_FLOW.length - 1 && <ChevronRight className="w-3 h-3 text-slate-700" />}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* SLA bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> SLA: {c.hoursElapsed}h / {c.slaHours}h</span>
                  {slaBreached && <span className="text-rose-400 font-bold flex items-center gap-1"><ArrowUp className="w-3 h-3" />BREACHED</span>}
                </div>
                <div className="h-1.5 rounded-full bg-slate-800">
                  <div className={`h-full rounded-full transition-all ${slaBreached ? 'bg-rose-500' : slaPercent > 75 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${slaPercent}%` }} />
                </div>
              </div>

              {c.status !== 'Resolved' && (
                <button onClick={() => advance(c.id)}
                  className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
                >
                  Advance → {STATUS_FLOW[STATUS_FLOW.indexOf(c.status) + 1]}
                </button>
              )}
              {c.status === 'Resolved' && (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Resolved within SLA
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
