import React, { useState } from 'react';
import { useAuth } from '../../auth/useAuth';
import {
  UserCircle2, Mail, Phone, MapPin, Award, BookOpen,
  Shield, Key, Clock, Radio, CheckCircle2, QrCode, Hash
} from 'lucide-react';

export const FacultyProfile: React.FC = () => {
  const { user } = useAuth();
  const [officeHours, setOfficeHours] = useState('Mon, Wed 03:00 PM - 05:00 PM');
  const [cabin, setCabin] = useState('Faculty Block B - Room 402');
  const [phone, setPhone] = useState('+91 98451 22910');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-3xl font-bold text-indigo-300">
              {user?.name?.slice(0, 2).toUpperCase() || 'FC'}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center" title="Active On Campus">
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-bold text-white">{user?.name || 'Prof. Rajesh Sharma'}</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Senior Associate Professor
              </span>
            </div>
            <p className="text-xs text-slate-400">Department of Computer Science & Engineering</p>
            <p className="text-[11px] font-mono text-slate-500">Employee ID: FAC-CSE-2018-042 • Smart RFID: 0x9B4E38F1</p>

            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-300">
              <span className="flex items-center gap-1 text-slate-400">
                <Mail className="w-3.5 h-3.5 text-indigo-400" /> {user?.email || 'sharma.r@smartuni.edu'}
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {cabin}
              </span>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center shrink-0">
            <QrCode className="w-16 h-16 text-slate-300 mx-auto" />
            <p className="text-[9px] font-mono text-slate-500 mt-1">FACULTY NFC TOKEN</p>
          </div>
        </div>
      </div>

      {/* Grid: Details & Editable Office Hours */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Academic Details */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            Academic Dossier & Credentials
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Highest Qualification</span>
              <span className="text-white font-medium">Ph.D. in Distributed Cloud Systems (IITB)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Research Specialization</span>
              <span className="text-white font-medium">Fault-Tolerant Consensus, Edge IoT</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Indexed Publications</span>
              <span className="text-indigo-400 font-medium">24 IEEE / ACM Transactions</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">H-Index / Citations</span>
              <span className="text-white font-medium">h-14 / 840 citations</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-400">Biometric Clearance</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> High Security Lab Authorized
              </span>
            </div>
          </div>
        </div>

        {/* Office Hours Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-indigo-400" />
            Office Hours & Cabin Details
          </h3>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Cabin Location</label>
              <input
                type="text"
                value={cabin}
                onChange={(e) => setCabin(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Student Consultation Hours</label>
              <input
                type="text"
                value={officeHours}
                onChange={(e) => setOfficeHours(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Emergency Extension / Contact</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              {isSaved ? (
                <span className="text-emerald-400 flex items-center gap-1 text-xs">
                  <CheckCircle2 className="w-4 h-4" /> Updated successfully!
                </span>
              ) : <div />}

              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold shadow-md transition"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
