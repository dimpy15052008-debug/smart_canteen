import React, { useState, useEffect } from 'react';
import { Radio, Wifi, QrCode, Users, AlertTriangle, CheckCircle2, Clock, Hash } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const COURSES = [
  { code: 'CS601', name: 'Distributed Systems',    room: 'Tech Block - Room 402', bssid: 'eduroam-TB4-AP02', enrolled: 64 },
  { code: 'CS603', name: 'Machine Learning & NLP', room: 'Lecture Hall 1',         bssid: 'eduroam-LH1-AP01', enrolled: 58 },
];

function generateQR(): string {
  const chars = '0123456789ABCDEF';
  return '0x' + Array.from({ length: 16 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export const FacultySessionLauncher: React.FC = () => {
  const { facultySessionActive, setFacultySessionActive } = useApp();
  const [selectedCourse, setSelectedCourse] = useState(COURSES[0]);
  const [countdown, setCountdown] = useState(900); // 15 min
  const [qrCode, setQrCode] = useState(generateQR());
  const [checkins, setCheckins] = useState({ present: 0, absent: 0, proxy: 0 });

  useEffect(() => {
    if (!facultySessionActive) { setCountdown(900); return; }
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 0) { setFacultySessionActive(false); return 900; }
        return prev - 1;
      });
      // Simulate student checkins
      if (Math.random() > 0.7) {
        setCheckins(prev => ({
          ...prev,
          present: Math.min(selectedCourse.enrolled, prev.present + 1),
        }));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [facultySessionActive, selectedCourse.enrolled, setFacultySessionActive]);

  // Rotate QR every 30 seconds
  useEffect(() => {
    if (!facultySessionActive) return;
    const interval = setInterval(() => setQrCode(generateQR()), 30000);
    return () => clearInterval(interval);
  }, [facultySessionActive]);

  const minutes = Math.floor(countdown / 60).toString().padStart(2, '0');
  const seconds = (countdown % 60).toString().padStart(2, '0');

  const handleOpen = () => {
    setCheckins({ present: 0, absent: selectedCourse.enrolled, proxy: 0 });
    setQrCode(generateQR());
    setFacultySessionActive(true);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      <div>
        <h1 className="text-xl font-extrabold text-white">Session & Beacon Launcher</h1>
        <p className="text-xs text-slate-400 mt-0.5">Open attendance window · Broadcast Wi-Fi BSSID beacon · Generate rotating session QR</p>
      </div>

      {/* Course selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <h2 className="text-xs font-bold text-white">Select Active Course</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {COURSES.map(c => (
            <button key={c.code} onClick={() => { setSelectedCourse(c); setFacultySessionActive(false); }}
              className={`p-4 rounded-xl border text-left transition-all ${
                selectedCourse.code === c.code
                  ? 'border-indigo-500/50 bg-indigo-500/10'
                  : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
              }`}
            >
              <span className="font-mono text-[10px] text-indigo-400">{c.code}</span>
              <p className="text-xs font-bold text-white mt-1">{c.name}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{c.room} · {c.enrolled} enrolled</p>
            </button>
          ))}
        </div>
      </div>

      {/* Session control */}
      <div className={`border rounded-2xl p-6 space-y-5 transition-colors ${
        facultySessionActive ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className={`w-5 h-5 ${facultySessionActive ? 'text-emerald-400 animate-pulse' : 'text-slate-600'}`} />
            <h2 className="text-sm font-bold text-white">{facultySessionActive ? 'Session Active' : 'Session Closed'}</h2>
          </div>
          {facultySessionActive && (
            <div className="flex items-center gap-2 font-mono text-2xl font-extrabold text-emerald-400">
              <Clock className="w-5 h-5" />
              {minutes}:{seconds}
            </div>
          )}
        </div>

        {facultySessionActive && (
          <div className="space-y-4">
            {/* BSSID beacon info */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800 border border-slate-700">
              <Wifi className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400">Broadcasting Wi-Fi Geofence Beacon</p>
                <p className="text-xs font-mono font-bold text-indigo-300">{selectedCourse.bssid}</p>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[10px] text-emerald-400 font-semibold">Live</span>
              </div>
            </div>

            {/* QR Code */}
            <div className="bg-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center">
                <QrCode className="w-16 h-16 text-slate-900" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Rotating Session QR Code</p>
                <p className="text-[11px] text-slate-400 mt-1">Refreshes every 30 seconds. Students scan to verify presence.</p>
                <p className="text-[10px] font-mono text-indigo-400 mt-2 break-all">{qrCode}</p>
              </div>
            </div>

            {/* Live check-in counter */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Present',  val: checkins.present,                     color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25', icon: CheckCircle2 },
                { label: 'Absent',   val: selectedCourse.enrolled - checkins.present - checkins.proxy, color: 'text-rose-400 bg-rose-500/10 border-rose-500/25', icon: Clock },
                { label: 'Proxy 🚨', val: checkins.proxy,                      color: 'text-amber-400 bg-amber-500/10 border-amber-500/25', icon: AlertTriangle },
              ].map(s => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className={`rounded-xl border p-3 text-center ${s.color}`}>
                    <Icon className="w-4 h-4 mx-auto mb-1" />
                    <p className="text-xl font-extrabold font-mono">{s.val}</p>
                    <p className="text-[10px] font-semibold">{s.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          {!facultySessionActive ? (
            <button onClick={handleOpen}
              className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-600/30 transition-all"
            >
              Open Attendance Window (15 min)
            </button>
          ) : (
            <button onClick={() => setFacultySessionActive(false)}
              className="flex-1 py-3 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 text-sm font-bold transition-all"
            >
              Close Session
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
