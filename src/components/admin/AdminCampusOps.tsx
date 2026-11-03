import React, { useState } from 'react';
import { Wifi, MapPin, Server, RefreshCcw, CheckCircle2, AlertTriangle, Radio } from 'lucide-react';

interface Beacon {
  id: string; location: string; bssid: string; bleUUID: string;
  lat: number; lng: number; radius: number; status: 'online' | 'offline' | 'degraded';
  lastPing: string;
}

const BEACONS: Beacon[] = [
  { id: 'BLE-01', location: 'Tech Block - Room 402',   bssid: 'eduroam-TB4-AP02', bleUUID: 'F3A2-8C1B-4E92-B017', lat: 18.5204, lng: 73.8567, radius: 3.5, status: 'online',   lastPing: '2 sec ago' },
  { id: 'BLE-02', location: 'Lecture Hall 1',          bssid: 'eduroam-LH1-AP01', bleUUID: 'D8C1-2F4A-9E73-A025', lat: 18.5212, lng: 73.8572, radius: 4.0, status: 'online',   lastPing: '5 sec ago' },
  { id: 'BLE-03', location: 'Central Library',         bssid: 'eduroam-LIB-AP03', bleUUID: 'B6D4-7E3C-1F28-C041', lat: 18.5198, lng: 73.8560, radius: 3.5, status: 'online',   lastPing: '8 sec ago' },
  { id: 'BLE-04', location: 'AI/DS Lab Block',         bssid: 'eduroam-AI-AP01',  bleUUID: 'A1B2-C3D4-E5F6-0011', lat: 18.5220, lng: 73.8580, radius: 3.5, status: 'degraded', lastPing: '45 sec ago' },
  { id: 'BLE-05', location: 'Admin & Office Block',    bssid: 'eduroam-ADM-AP01', bleUUID: '9E8D-7C6B-5A4F-3E2D', lat: 18.5188, lng: 73.8555, radius: 2.5, status: 'offline',  lastPing: '12 min ago' },
];

interface IoTNode {
  id: string; name: string; type: string; battery: number; status: 'healthy' | 'low_battery' | 'offline';
}

const IOT_NODES: IoTNode[] = [
  { id: 'IOT-01', name: 'Tech Block 402 — Entry Gate',   type: 'Biometric Scanner + BLE',  battery: 92, status: 'healthy' },
  { id: 'IOT-02', name: 'Lecture Hall 1 — Main Door',   type: 'Biometric Scanner',         battery: 78, status: 'healthy' },
  { id: 'IOT-03', name: 'Central Library — South Gate', type: 'BLE Beacon + GPS Anchor',   battery: 34, status: 'low_battery' },
  { id: 'IOT-04', name: 'Hostel Block B — Entry',       type: 'RFID + BLE',                battery: 0,  status: 'offline' },
];

const STATUS_STYLE: Record<string, string> = {
  online:      'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  offline:     'bg-rose-500/15 text-rose-400 border-rose-500/30',
  degraded:    'bg-amber-500/15 text-amber-400 border-amber-500/30',
  healthy:     'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  low_battery: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
};

export const AdminCampusOps: React.FC = () => {
  const [beacons, setBeacons] = useState<Beacon[]>(BEACONS);
  const [rebooting, setRebooting] = useState<string[]>([]);

  const reboot = (id: string) => {
    setRebooting(prev => [...prev, id]);
    setTimeout(() => {
      setBeacons(prev => prev.map(b => b.id === id ? { ...b, status: 'online', lastPing: 'Just now' } : b));
      setRebooting(prev => prev.filter(r => r !== id));
    }, 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-xl font-extrabold text-white">Campus Operations</h1>
        <p className="text-xs text-slate-400 mt-0.5">BLE/Wi-Fi geofence beacons · IoT biometric node health · GPS polygon coordinates</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Online',   val: beacons.filter(b => b.status === 'online').length,   color: 'text-emerald-400' },
          { label: 'Degraded', val: beacons.filter(b => b.status === 'degraded').length, color: 'text-amber-400'  },
          { label: 'Offline',  val: beacons.filter(b => b.status === 'offline').length,  color: 'text-rose-400'   },
        ].map(s => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
            <p className={`text-2xl font-extrabold font-mono ${s.color}`}>{s.val}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{s.label} Beacons</p>
          </div>
        ))}
      </div>

      {/* Beacon table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800 flex items-center gap-2">
          <Radio className="w-4 h-4 text-indigo-400" />
          <h2 className="text-xs font-bold text-white">Geofence Beacon Manager</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="border-b border-slate-800">
              <tr className="text-[10px] text-slate-400 uppercase font-mono">
                <th className="px-4 py-3 text-left">Location</th>
                <th className="px-4 py-3 text-left">Wi-Fi BSSID</th>
                <th className="px-4 py-3 text-left">BLE UUID</th>
                <th className="px-4 py-3 text-center">Radius</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Last Ping</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {beacons.map(b => (
                <tr key={b.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
                      <span className="font-medium text-white">{b.location}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono ml-5">{b.lat.toFixed(4)}, {b.lng.toFixed(4)}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-indigo-300 text-[11px]">{b.bssid}</td>
                  <td className="px-4 py-3 font-mono text-slate-400 text-[10px]">{b.bleUUID}</td>
                  <td className="px-4 py-3 text-center font-mono text-slate-300">±{b.radius}m</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_STYLE[b.status]}`}>
                      {b.status === 'online' ? <CheckCircle2 className="w-3 h-3" /> : b.status === 'degraded' ? <AlertTriangle className="w-3 h-3" /> : <Wifi className="w-3 h-3 line-through" />}
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-[11px] text-slate-400 font-mono">{b.lastPing}</td>
                  <td className="px-4 py-3 text-center">
                    {b.status !== 'online' && (
                      <button onClick={() => reboot(b.id)}
                        disabled={rebooting.includes(b.id)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold transition-colors disabled:opacity-50"
                      >
                        <RefreshCcw className={`w-3 h-3 ${rebooting.includes(b.id) ? 'animate-spin' : ''}`} />
                        {rebooting.includes(b.id) ? 'Rebooting…' : 'Reboot'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* IoT Node Health */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800 flex items-center gap-2">
          <Server className="w-4 h-4 text-amber-400" />
          <h2 className="text-xs font-bold text-white">Biometric IoT Node Health</h2>
        </div>
        <div className="divide-y divide-slate-800/60">
          {IOT_NODES.map(node => (
            <div key={node.id} className="px-5 py-3.5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-white">{node.name}</p>
                <p className="text-[11px] text-slate-500">{node.type}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <p className="text-[11px] text-slate-400 font-mono">{node.battery > 0 ? `${node.battery}% battery` : 'No power'}</p>
                  <div className="h-1 w-16 rounded-full bg-slate-800 mt-1">
                    <div className={`h-full rounded-full ${node.battery > 50 ? 'bg-emerald-500' : node.battery > 20 ? 'bg-amber-500' : 'bg-rose-500'}`}
                      style={{ width: `${node.battery}%` }} />
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_STYLE[node.status]}`}>
                  {node.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
