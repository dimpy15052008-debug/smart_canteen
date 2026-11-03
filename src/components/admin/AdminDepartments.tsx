import React from 'react';
import { Users, GraduationCap, FlaskConical, Wallet } from 'lucide-react';

const DEPARTMENTS = [
  { code: 'CSE',  name: 'Computer Science & Engineering', hod: 'Prof. Rajesh Sharma',    faculty: 24, students: 480, labs: 6, budget: '₹48L', color: 'indigo', ratio: '1:20' },
  { code: 'AI',   name: 'AI & Data Science',              hod: 'Dr. Anita Krishnamurthy', faculty: 18, students: 320, labs: 4, budget: '₹42L', color: 'violet', ratio: '1:18' },
  { code: 'ECE',  name: 'Electronics & Communication',    hod: 'Prof. Harish Babu',       faculty: 20, students: 310, labs: 5, budget: '₹36L', color: 'sky',    ratio: '1:16' },
  { code: 'MECH', name: 'Mechanical Engineering',         hod: 'Prof. Sunil Joshi',       faculty: 22, students: 240, labs: 4, budget: '₹52L', color: 'orange', ratio: '1:11' },
  { code: 'CIVIL',name: 'Civil Engineering',              hod: 'Prof. Vikram Nair',       faculty: 16, students: 200, labs: 3, budget: '₹30L', color: 'emerald',ratio: '1:13' },
  { code: 'MBA',  name: 'Management Studies',             hod: 'Dr. Preeta Rao',          faculty: 12, students: 180, labs: 2, budget: '₹24L', color: 'amber',  ratio: '1:15' },
];

const COLOR_MAP: Record<string, string> = {
  indigo: 'bg-indigo-500/10 border-indigo-500/25 text-indigo-400',
  violet: 'bg-violet-500/10 border-violet-500/25 text-violet-400',
  sky:    'bg-sky-500/10    border-sky-500/25    text-sky-400',
  orange: 'bg-orange-500/10 border-orange-500/25 text-orange-400',
  emerald:'bg-emerald-500/10 border-emerald-500/25 text-emerald-400',
  amber:  'bg-amber-500/10  border-amber-500/25  text-amber-400',
};

export const AdminDepartments: React.FC = () => (
  <div className="space-y-6 max-w-7xl mx-auto pb-12">
    <div>
      <h1 className="text-xl font-extrabold text-white">Departments</h1>
      <p className="text-xs text-slate-400 mt-0.5">HOD mapping · Faculty–student ratio · Lab capacity · Operational budget</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {DEPARTMENTS.map(dept => {
        const colorCls = COLOR_MAP[dept.color];
        return (
          <div key={dept.code} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition-colors">
            <div className="flex items-start justify-between">
              <div className={`px-2.5 py-1 rounded-xl border text-xs font-extrabold font-mono ${colorCls}`}>{dept.code}</div>
              <span className="text-[10px] text-slate-500 font-mono">{dept.ratio} ratio</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">{dept.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">HOD: <span className="text-slate-300 font-medium">{dept.hod}</span></p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Users,         val: dept.faculty,  label: 'Faculty'  },
                { icon: GraduationCap, val: dept.students, label: 'Students' },
                { icon: FlaskConical,  val: dept.labs,     label: 'Labs'     },
              ].map(({ icon: Icon, val, label }) => (
                <div key={label} className="bg-slate-800 rounded-xl p-2.5 text-center">
                  <Icon className="w-4 h-4 mx-auto text-slate-400 mb-1" />
                  <p className="text-sm font-bold text-white">{val}</p>
                  <p className="text-[10px] text-slate-500">{label}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between bg-slate-800/60 rounded-xl px-3 py-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Wallet className="w-3.5 h-3.5 text-amber-400" />
                Annual Budget
              </div>
              <span className="text-sm font-extrabold text-amber-400 font-mono">{dept.budget}</span>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);
