import React, { useState } from 'react';
import {
  CheckCircle2, XCircle, AlertTriangle, Search, Filter,
  Download, RefreshCw, UserCheck, Clock, ShieldAlert,
  Smartphone, Radio, ChevronDown
} from 'lucide-react';

interface AttendanceRecord {
  id: string;
  studentName: string;
  rollNumber: string;
  course: string;
  status: 'Present' | 'Absent' | 'Late' | 'Proxy Flagged';
  method: 'BLE Beacon' | 'Dynamic QR' | 'Manual Override' | 'Biometric';
  timestamp: string;
  rssi: number;
  confidence: number;
  deviceMatch: boolean;
}

const INITIAL_RECORDS: AttendanceRecord[] = [
  { id: '1', studentName: 'Aarav Sharma', rollNumber: 'CS2023-042', course: 'CS601: Distributed Systems', status: 'Present', method: 'BLE Beacon', timestamp: '09:02:14 AM', rssi: -58, confidence: 99, deviceMatch: true },
  { id: '2', studentName: 'Diya Patel', rollNumber: 'CS2023-088', course: 'CS601: Distributed Systems', status: 'Present', method: 'Dynamic QR', timestamp: '09:03:01 AM', rssi: -62, confidence: 96, deviceMatch: true },
  { id: '3', studentName: 'Rohan Verma', rollNumber: 'CS2023-115', course: 'CS601: Distributed Systems', status: 'Proxy Flagged', method: 'Dynamic QR', timestamp: '09:04:22 AM', rssi: -88, confidence: 42, deviceMatch: false },
  { id: '4', studentName: 'Ananya Iyer', rollNumber: 'CS2023-019', course: 'CS601: Distributed Systems', status: 'Present', method: 'BLE Beacon', timestamp: '09:01:45 AM', rssi: -54, confidence: 100, deviceMatch: true },
  { id: '5', studentName: 'Vikram Malhotra', rollNumber: 'CS2023-144', course: 'CS601: Distributed Systems', status: 'Absent', method: 'Manual Override', timestamp: '--', rssi: 0, confidence: 0, deviceMatch: false },
  { id: '6', studentName: 'Sneha Reddy', rollNumber: 'CS2023-071', course: 'CS601: Distributed Systems', status: 'Late', method: 'Dynamic QR', timestamp: '09:18:10 AM', rssi: -65, confidence: 91, deviceMatch: true },
  { id: '7', studentName: 'Kabir Das', rollNumber: 'CS2023-033', course: 'CS601: Distributed Systems', status: 'Present', method: 'BLE Beacon', timestamp: '09:02:50 AM', rssi: -59, confidence: 98, deviceMatch: true },
  { id: '8', studentName: 'Tanvi Sen', rollNumber: 'CS2023-095', course: 'CS601: Distributed Systems', status: 'Proxy Flagged', method: 'BLE Beacon', timestamp: '09:05:12 AM', rssi: -94, confidence: 38, deviceMatch: false },
];

export const FacultyAttendance: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>(INITIAL_RECORDS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedCourse, setSelectedCourse] = useState('CS601');

  const filtered = records.filter(r => {
    const matchSearch = r.studentName.toLowerCase().includes(search.toLowerCase()) ||
                        r.rollNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const toggleStatus = (id: string) => {
    setRecords(prev => prev.map(r => {
      if (r.id !== id) return r;
      const nextStatus = r.status === 'Present' ? 'Absent' : 'Present';
      return { ...r, status: nextStatus, method: 'Manual Override' };
    }));
  };

  const clearProxyFlag = (id: string) => {
    setRecords(prev => prev.map(r => {
      if (r.id !== id) return r;
      return { ...r, status: 'Present', method: 'Manual Override', confidence: 100 };
    }));
  };

  const presentCount = records.filter(r => r.status === 'Present' || r.status === 'Late').length;
  const proxyCount = records.filter(r => r.status === 'Proxy Flagged').length;
  const attendanceRate = Math.round((presentCount / records.length) * 100);

  return (
    <div className="space-y-6">
      {/* Top Banner / KPIs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Radio className="w-6 h-6 text-indigo-400" />
            Live Attendance Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time biometric & geofenced check-in log with anti-proxy telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
          >
            <option value="CS601">CS601: Distributed Systems (Sec A)</option>
            <option value="CS402">CS402: Operating Systems (Sec B)</option>
            <option value="CS701">CS701: Cloud Architecture (Sec A)</option>
          </select>
          <button
            onClick={() => alert('Attendance report exported as CSV.')}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Enrolled</p>
          <p className="text-2xl font-bold text-white mt-1">{records.length}</p>
          <span className="text-[10px] text-slate-500">Hall 304 capacity: 60</span>
        </div>
        <div className="bg-slate-900/90 border border-emerald-900/40 rounded-xl p-4">
          <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Present Today</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{presentCount}</p>
          <span className="text-[10px] text-emerald-500/80">{attendanceRate}% turn-out</span>
        </div>
        <div className="bg-slate-900/90 border border-amber-900/40 rounded-xl p-4">
          <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">Absent / Late</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{records.length - presentCount}</p>
          <span className="text-[10px] text-amber-500/80">1 late arrival logged</span>
        </div>
        <div className="bg-slate-900/90 border border-rose-900/40 rounded-xl p-4">
          <p className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">Proxy Alerts</p>
          <p className="text-2xl font-bold text-rose-400 mt-1">{proxyCount}</p>
          <span className="text-[10px] text-rose-500/80">BLE RSSI mismatch</span>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {/* Controls */}
        <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/50">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search student or roll number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            {(['ALL', 'Present', 'Absent', 'Late', 'Proxy Flagged'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition ${
                  statusFilter === s
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/70 text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Verification Method</th>
                <th className="py-3 px-4">Check-in Time</th>
                <th className="py-3 px-4">RSSI & Confidence</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-semibold text-white">
                    {r.studentName}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                    {r.rollNumber}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      r.status === 'Present'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : r.status === 'Late'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : r.status === 'Proxy Flagged'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30 animate-pulse'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {r.status === 'Present' && <CheckCircle2 className="w-3 h-3" />}
                      {r.status === 'Late' && <Clock className="w-3 h-3" />}
                      {r.status === 'Proxy Flagged' && <AlertTriangle className="w-3 h-3" />}
                      {r.status === 'Absent' && <XCircle className="w-3 h-3" />}
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      {r.method === 'BLE Beacon' && <Radio className="w-3 h-3 text-indigo-400" />}
                      {r.method === 'Dynamic QR' && <Smartphone className="w-3 h-3 text-purple-400" />}
                      {r.method === 'Manual Override' && <UserCheck className="w-3 h-3 text-amber-400" />}
                      {r.method}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                    {r.timestamp}
                  </td>
                  <td className="py-3 px-4">
                    {r.status !== 'Absent' ? (
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono ${
                          r.rssi > -70 ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {r.rssi} dBm
                        </span>
                        <div className="w-12 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              r.confidence > 75 ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${r.confidence}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500">{r.confidence}%</span>
                      </div>
                    ) : (
                      <span className="text-slate-600 text-[11px]">--</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {r.status === 'Proxy Flagged' && (
                        <button
                          onClick={() => clearProxyFlag(r.id)}
                          className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded text-[10px] font-medium"
                          title="Override false-positive proxy"
                        >
                          Verify ID
                        </button>
                      )}
                      <button
                        onClick={() => toggleStatus(r.id)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-medium border border-slate-700"
                      >
                        {r.status === 'Present' ? 'Mark Absent' : 'Mark Present'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
