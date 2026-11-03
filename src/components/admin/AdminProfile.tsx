import React from 'react';
import { useAuth } from '../../auth/useAuth';
import { QrCode, Shield, Key, ShieldCheck, Clock, Hash, LogOut, Smartphone } from 'lucide-react';

const AUDIT_TRAIL = [
  { action: 'STUDENT_LOCK',    entity: 'Student',     id: '0827ME221088', by: 'Dr. Sunita Verma', time: '2026-10-02 21:14:33', ip: '10.0.1.52',  detail: 'Hall ticket locked — attendance below threshold.' },
  { action: 'FACULTY_ADD',     entity: 'Faculty',     id: 'FAC-2026-028', by: 'Dr. Sunita Verma', time: '2026-10-02 19:08:11', ip: '10.0.1.52',  detail: 'New faculty onboarded — Ms. Deepa Menon, Mechanical.' },
  { action: 'EXAM_SIGN',       entity: 'Examination', id: 'CS601-MID',    by: 'Dr. Sunita Verma', time: '2026-10-01 17:45:02', ip: '10.0.1.52',  detail: 'Gradebook cryptographically signed for CS601 mid-sem.' },
  { action: 'COMPLAINT_ADV',   entity: 'Complaint',   id: 'GRV-2026-0042',by: 'Dr. Sunita Verma', time: '2026-10-01 11:22:18', ip: '10.0.1.52',  detail: 'Anti-ragging complaint advanced to Under Review.' },
  { action: 'APP_APPROVE',     entity: 'Application', id: 'APP-2026-0085',by: 'Dr. Sunita Verma', time: '2026-09-30 14:10:55', ip: '10.0.1.52',  detail: 'Scholarship application approved for Kavya Reddy.' },
];

export const AdminProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const qrHash = '0x7F4B2A9E3D1C8F56'; // mock cryptographic QR hash

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-xl font-extrabold text-white">Admin Profile Dossier</h1>
        <p className="text-xs text-slate-400 mt-0.5">Identity · Cryptographic verification · Audit trail · Security settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Identity card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-amber-950/60 to-slate-900 border border-amber-700/30 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <img src={user?.avatar} alt={user?.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/40 shadow-lg" />
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px] text-amber-400 font-bold">Super Administrator</span>
              </div>
              <h2 className="text-sm font-extrabold text-white">{user?.name}</h2>
              <p className="text-[11px] text-slate-400">{user?.department}</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            {[
              { label: 'Designation', val: user?.designation || 'Dean of Academics' },
              { label: 'Email',       val: user?.email },
            ].map(row => (
              <div key={row.label} className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-500">{row.label}</span>
                <span className="text-slate-300 font-medium text-right max-w-[55%] truncate">{row.val}</span>
              </div>
            ))}
          </div>

          {/* QR */}
          <div className="bg-slate-900 rounded-xl p-3 space-y-2 text-center">
            <div className="w-16 h-16 mx-auto bg-white rounded-xl flex items-center justify-center">
              <QrCode className="w-10 h-10 text-slate-900" />
            </div>
            <p className="text-[10px] text-slate-400 font-mono break-all">{qrHash}</p>
            <p className="text-[10px] text-amber-400">Cryptographic Identity QR</p>
          </div>
        </div>

        {/* Security panel */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-white flex items-center gap-2"><Shield className="w-4 h-4 text-amber-400" />Security & Credentials</h3>
            {[
              { icon: Smartphone, label: 'Two-Factor Authentication', status: 'Enabled',  color: 'text-emerald-400' },
              { icon: Key,        label: 'Master API Key',            status: '••••••••••••A2F1', color: 'text-slate-300' },
              { icon: Clock,      label: 'Session Timeout',           status: '30 minutes', color: 'text-slate-300' },
            ].map(row => {
              const Icon = row.icon;
              return (
                <div key={row.label} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Icon className="w-3.5 h-3.5" />
                    {row.label}
                  </div>
                  <span className={`text-xs font-semibold font-mono ${row.color}`}>{row.status}</span>
                </div>
              );
            })}
            <button
              onClick={() => alert('Session revocation modal — all sessions cleared.')}
              className="w-full py-2 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-semibold hover:bg-rose-500/20 transition-colors"
            >
              Revoke All Active Sessions
            </button>
          </div>

          {/* Audit trail */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-white flex items-center gap-2"><Hash className="w-4 h-4 text-indigo-400" />Recent Admin Actions</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {AUDIT_TRAIL.map((log, i) => (
                <div key={i} className="bg-slate-800/50 rounded-xl p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-950 px-1.5 py-0.5 rounded border border-indigo-900/40">{log.action}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{log.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{log.detail}</p>
                  <p className="text-[10px] text-slate-600 font-mono">Entity: {log.entity} #{log.id} · IP: {log.ip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button onClick={logout}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
      ><LogOut className="w-4 h-4" />Sign Out of Admin Portal</button>
    </div>
  );
};
