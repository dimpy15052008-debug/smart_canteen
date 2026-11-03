import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../ui/PageHeader';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building,
  Lock,
  Layers,
  Sparkles,
  Server,
  Download,
  Filter,
  ArrowDownRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export const AdminAnalyticsView: React.FC = () => {
  const { auditLogs, certificateRequests, canteenOrders } = useApp();
  const [showTableAlt, setShowTableAlt] = useState(false);

  // Time-series attendance trend data
  const attendanceTrendData = [
    { week: 'Week 1', rate: 82.1, benchmark: 75 },
    { week: 'Week 2', rate: 84.5, benchmark: 75 },
    { week: 'Week 3', rate: 83.2, benchmark: 75 },
    { week: 'Week 4', rate: 87.0, benchmark: 75 },
    { week: 'Week 5', rate: 85.8, benchmark: 75 },
    { week: 'Week 6 (Current)', rate: 86.4, benchmark: 75 },
  ];

  const departmentData = [
    { dept: 'CSE', attendance: 86.4, students: 480 },
    { dept: 'IT', attendance: 89.1, students: 360 },
    { dept: 'ECE', attendance: 82.3, students: 310 },
    { dept: 'MECH', attendance: 79.5, students: 240 },
    { dept: 'CIVIL', attendance: 84.0, students: 200 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <PageHeader
        title="University Operational Analytics & Governance"
        subtitle="Cross-departmental attendance telemetry, grievance SLA compliance, and cryptographic audit records."
        badge={<Badge variant="success">All Systems Operational</Badge>}
        action={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowTableAlt(!showTableAlt)}
            >
              {showTableAlt ? 'Show Charts' : 'Accessible Table View'}
            </Button>
            <Button
              size="sm"
              variant="primary"
              leftIcon={<Download className="w-3.5 h-3.5" />}
              onClick={() => alert('Official Institutional Analytics Report exported in CSV format.')}
            >
              Export Report
            </Button>
          </div>
        }
      />

      {/* Anomaly Callout Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
              Department Attendance Anomaly Detected
            </h4>
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Attendance in Mechanical Engineering dropped 2.8% this week. Automated recovery advisory dispatched to department head.
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono font-bold text-amber-700 dark:text-amber-400 shrink-0">
          Threshold: 75% Rule
        </span>
      </div>

      {/* Top 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Campus Overall Attendance', val: '86.4%', sub: '+2.4% vs last week', icon: Users, color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Canteen Daily Volume', val: `${canteenOrders.length * 120} Orders`, sub: 'Peak lunch rush: 1:15 PM', icon: TrendingUp, color: 'text-amber-600 dark:text-amber-400' },
          { label: 'Grievance SLA Compliance', val: '94.2%', sub: 'Avg resolve time 21.4 hrs', icon: CheckCircle2, color: 'text-sky-600 dark:text-sky-400' },
          { label: 'Credentials Issued', val: `${certificateRequests.length} Signed`, sub: 'Zero Dean backlog', icon: ShieldCheck, color: 'text-indigo-600 dark:text-indigo-400' },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <Card key={i} surface="base" className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 uppercase font-mono font-bold">{kpi.label}</span>
                <Icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <p className={`text-2xl font-extrabold font-mono tabular-nums ${kpi.color}`}>{kpi.val}</p>
              <p className="text-[11px] text-slate-400 font-mono">{kpi.sub}</p>
            </Card>
          );
        })}
      </div>

      {/* Recharts Analytics Charts or Accessible Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Attendance Trend Chart */}
        <Card surface="elevated" className="lg:col-span-7 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                <span>Institutional Attendance Trend (6-Week Window)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Consistently maintains +11.4% above regulatory 75% threshold
              </p>
            </div>
            <Badge variant="success">86.4% Current</Badge>
          </div>

          {!showTableAlt ? (
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attendanceTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="attendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                  <YAxis domain={[70, 95]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(51, 65, 85, 0.5)',
                      borderRadius: '0.75rem',
                      color: '#ffffff',
                      fontSize: '12px',
                    }}
                  />
                  <Area type="monotone" dataKey="rate" stroke="#4f46e5" strokeWidth={2.5} fill="url(#attendGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[10px] text-slate-400 uppercase font-mono border-b">
                  <tr>
                    <th className="py-2">Week</th>
                    <th>Attendance %</th>
                    <th>Regulatory Benchmark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {attendanceTrendData.map((row) => (
                    <tr key={row.week}>
                      <td className="py-2 font-medium">{row.week}</td>
                      <td className="font-mono">{row.rate}%</td>
                      <td className="font-mono text-slate-400">{row.benchmark}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Departmental Benchmark Bar Chart */}
        <Card surface="elevated" className="lg:col-span-5 p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-500" />
              <span>Departmental Attendance</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Comparative student presence across engineering branches
            </p>
          </div>

          {!showTableAlt ? (
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="dept" tick={{ fontSize: 11 }} />
                  <YAxis domain={[60, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(51, 65, 85, 0.5)',
                      borderRadius: '0.75rem',
                      color: '#ffffff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="attendance" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[10px] text-slate-400 uppercase font-mono border-b">
                  <tr>
                    <th className="py-2">Branch</th>
                    <th>Attendance %</th>
                    <th>Students</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {departmentData.map((d) => (
                    <tr key={d.dept}>
                      <td className="py-2 font-medium">{d.dept}</td>
                      <td className="font-mono">{d.attendance}%</td>
                      <td className="font-mono">{d.students}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Immutable Security Audit Trail Log */}
      <Card surface="base" className="p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-500" />
              <span>Immutable Institutional Audit Log</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Cryptographic tamper-proof record of biometric verifications, fee receipts, and Dean digital sign-offs.
            </p>
          </div>
          <Badge variant="default">Append-Only Ledger</Badge>
        </div>

        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3.5 text-xs space-y-1.5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    {log.action}
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{log.performedBy}</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">{log.timestamp}</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{log.details}</p>
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-100 dark:border-slate-800">
                <span>Entity: {log.targetEntity} #{log.entityId}</span>
                <span>Node IP: {log.ipAddress}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
