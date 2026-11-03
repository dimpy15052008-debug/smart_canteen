import React, { useState } from 'react';
import {
  Users, CheckCircle2, XCircle, Clock, Calendar,
  FileText, ExternalLink, Search, Filter
} from 'lucide-react';

interface StudentRequest {
  id: string;
  studentName: string;
  rollNumber: string;
  type: 'On-Duty (OD)' | 'Medical Leave' | 'Internship Clearance' | 'Lab Access';
  reason: string;
  dates: string;
  attachment: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  timestamp: string;
}

const INITIAL_REQUESTS: StudentRequest[] = [
  {
    id: 'REQ-101',
    studentName: 'Aarav Sharma',
    rollNumber: 'CS2023-042',
    type: 'On-Duty (OD)',
    reason: 'Smart India Hackathon 2026 Grand Finale - Hardware Prototype Deployment',
    dates: '12 Oct - 14 Oct 2026',
    attachment: 'SIH_Selection_Letter.pdf',
    status: 'Pending',
    timestamp: '2 hours ago'
  },
  {
    id: 'REQ-102',
    studentName: 'Diya Patel',
    rollNumber: 'CS2023-088',
    type: 'Medical Leave',
    reason: 'Acute Gastroenteritis with doctor advised 3-day bed rest',
    dates: '01 Oct - 03 Oct 2026',
    attachment: 'Apollo_Prescription.pdf',
    status: 'Pending',
    timestamp: '5 hours ago'
  },
  {
    id: 'REQ-103',
    studentName: 'Rohan Verma',
    rollNumber: 'CS2023-115',
    type: 'Lab Access',
    reason: 'GPU Cluster access request for Deep Learning seminar paper training',
    dates: 'Weekends (Oct 2026)',
    attachment: 'Guide_Endorsement.pdf',
    status: 'Approved',
    timestamp: '1 day ago'
  },
  {
    id: 'REQ-104',
    studentName: 'Sneha Reddy',
    rollNumber: 'CS2023-071',
    type: 'Internship Clearance',
    reason: 'Google Summer of Code off-campus mid-evaluations meeting',
    dates: '18 Oct 2026',
    attachment: 'Offer_Letter.pdf',
    status: 'Pending',
    timestamp: '1 day ago'
  }
];

export const FacultyRequests: React.FC = () => {
  const [requests, setRequests] = useState<StudentRequest[]>(INITIAL_REQUESTS);
  const [filter, setFilter] = useState<'ALL' | 'Pending' | 'Approved' | 'Rejected'>('ALL');
  const [search, setSearch] = useState('');

  const updateStatus = (id: string, newStatus: 'Approved' | 'Rejected') => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  const filtered = requests.filter(r => {
    const matchFilter = filter === 'ALL' || r.status === filter;
    const matchSearch = r.studentName.toLowerCase().includes(search.toLowerCase()) ||
                        r.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
                        r.type.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-400" />
            Student Requests & Approvals
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review and digitally endorse student On-Duty (OD) permissions, medical leaves, and lab passes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(['ALL', 'Pending', 'Approved', 'Rejected'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                filter === tab
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(req => (
          <div
            key={req.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                    {req.type}
                  </span>
                  <h3 className="text-base font-bold text-white mt-2">{req.studentName}</h3>
                  <p className="text-xs font-mono text-slate-400">{req.rollNumber}</p>
                </div>
                <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  req.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  req.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                  'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {req.status === 'Approved' && <CheckCircle2 className="w-3 h-3" />}
                  {req.status === 'Rejected' && <XCircle className="w-3 h-3" />}
                  {req.status === 'Pending' && <Clock className="w-3 h-3" />}
                  {req.status}
                </span>
              </div>

              <p className="text-xs text-slate-300 mt-3 bg-slate-950 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                "{req.reason}"
              </p>

              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {req.dates}
                </span>
                <button
                  onClick={() => alert(`Opening certificate attachment: ${req.attachment}`)}
                  className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  <FileText className="w-3.5 h-3.5" />
                  {req.attachment}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[10px] text-slate-500">{req.timestamp}</span>

              {req.status === 'Pending' ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateStatus(req.id, 'Rejected')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg text-xs font-semibold transition"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Reject
                  </button>
                  <button
                    onClick={() => updateStatus(req.id, 'Approved')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md transition"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Approve
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'Pending' } : r))}
                  className="text-[11px] text-slate-500 hover:text-slate-300 transition"
                >
                  Re-evaluate
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
