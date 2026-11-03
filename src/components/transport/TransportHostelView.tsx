import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../ui/PageHeader';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  Bus,
  Home,
  MapPin,
  Clock,
  Phone,
  Users,
  Navigation,
  FileCheck,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Calendar,
  Utensils,
  Wrench,
  Wifi,
  Zap,
  Droplets,
  Star,
  Check,
  QrCode,
  Download
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

interface MessMeal {
  type: 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner';
  timing: string;
  items: string[];
  dietary: 'Vegetarian' | 'Jain-Friendly' | 'Special Feast';
  rating: number;
}

const mockMessMenu: Record<string, MessMeal[]> = {
  Today: [
    {
      type: 'Breakfast',
      timing: '07:30 AM - 09:15 AM',
      items: ['Aloo Paratha with Curd', 'Poha with Sev', 'Boiled Eggs', 'Tea / Masala Milk'],
      dietary: 'Vegetarian',
      rating: 4.4,
    },
    {
      type: 'Lunch',
      timing: '12:30 PM - 02:15 PM',
      items: ['Paneer Butter Masala', 'Dal Tadka', 'Jeera Rice', 'Tandoori Roti', 'Gulab Jamun'],
      dietary: 'Special Feast',
      rating: 4.8,
    },
    {
      type: 'Snacks',
      timing: '05:00 PM - 06:15 PM',
      items: ['Samosa with Mint Chutney', 'Filter Coffee', 'Biscuits'],
      dietary: 'Vegetarian',
      rating: 4.2,
    },
    {
      type: 'Dinner',
      timing: '08:00 PM - 09:45 PM',
      items: ['Mix Veg Handi', 'Rajma Masala', 'Steamed Rice', 'Phulka', 'Fruit Custard'],
      dietary: 'Vegetarian',
      rating: 4.5,
    },
  ],
};

export const TransportHostelView: React.FC = () => {
  const { busRoutes, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'transport' | 'hostel'>('transport');
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route-4');
  const [isGatePassModalOpen, setIsGatePassModalOpen] = useState(false);
  const [gatePassReason, setGatePassReason] = useState('Weekend Visit to Family / Local Guardian');
  const [gatePassReturnDate, setGatePassReturnDate] = useState('2026-10-04 08:00 PM');
  const [generatedPass, setGeneratedPass] = useState<any>(null);

  // Maintenance Service State
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [maintenanceCategory, setMaintenanceCategory] = useState<'Electrical' | 'Plumbing' | 'Wi-Fi / Internet' | 'Carpentry'>('Electrical');
  const [maintenanceDesc, setMaintenanceDesc] = useState('');
  const [maintenanceSuccess, setMaintenanceSuccess] = useState(false);

  const activeBus = busRoutes.find((b) => b.id === selectedRouteId) || busRoutes[0];

  const handleApplyGatePass = (e: React.FormEvent) => {
    e.preventDefault();
    const pass = {
      passId: `GP-${Math.floor(1000 + Math.random() * 9000)}`,
      studentName: currentUser.name,
      rollNumber: currentUser.rollNumber || '0827CS221045',
      room: currentUser.hostelRoom || 'Block B - 304',
      reason: gatePassReason,
      returnTime: gatePassReturnDate,
      issuedAt: new Date().toLocaleString(),
      status: 'APPROVED (Warden Auto-Clearance)',
    };
    setGeneratedPass(pass);
    setIsGatePassModalOpen(false);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#10b981'],
      });
    } catch (e) {
      // ignore
    }
  };

  const handleMaintenanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMaintenanceSuccess(true);
    setTimeout(() => {
      setMaintenanceSuccess(false);
      setIsMaintenanceModalOpen(false);
      setMaintenanceDesc('');
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* 1. Page Header */}
      <PageHeader
        title="Transport Fleet & Hostel Services"
        subtitle="Live campus shuttle telemetry, route GPS coordinates, room allocation, mess menu, and automated gate passes."
        badge={<Badge variant="primary">Campus Logistics</Badge>}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMaintenanceModalOpen(true)}
              leftIcon={<Wrench className="w-3.5 h-3.5" />}
            >
              Report Room Issue
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsGatePassModalOpen(true)}
              leftIcon={<FileCheck className="w-3.5 h-3.5" />}
            >
              Apply Gate Pass
            </Button>
          </div>
        }
      />

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('transport')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'transport'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Bus className="w-4 h-4" />
          <span>Campus Transit Fleet</span>
        </button>
        <button
          onClick={() => setActiveTab('hostel')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'hostel'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Hostel Living & Mess Menu</span>
        </button>
      </div>

      {activeTab === 'transport' && (
        <div className="space-y-6">
          {/* Active Bus Telemetry Hero */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Bus Live Telemetry (8 cols) */}
            <Card surface="elevated" className="lg:col-span-8 p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Bus className="w-5 h-5 text-indigo-500" />
                    <span>Live GPS Transit Telemetry</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Automated transponder broadcast (Refreshes every 8s)</p>
                </div>

                {/* Route Selector */}
                <div className="flex gap-2">
                  {busRoutes.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setSelectedRouteId(b.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        selectedRouteId === b.id
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {b.routeNumber}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Row */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60">
                    {activeBus.vehicleNumber}
                  </span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base mt-1">
                    {activeBus.routeName}
                  </h4>
                  <span className="text-xs text-slate-500">
                    Driver: {activeBus.driverName} • Contact: {activeBus.driverPhone}
                  </span>
                </div>

                <div className="flex items-center gap-3 sm:text-right">
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono block uppercase font-bold">
                      Arriving at Main Gate in
                    </span>
                    <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                      ~{activeBus.etaMinutes} MINS
                    </span>
                  </div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping shrink-0" />
                </div>
              </div>

              {/* Vehicle Status Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Current Speed</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5 block">
                    {activeBus.speedKmH} km/h
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Seat Capacity</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5 block">
                    {activeBus.occupiedSeats} / {activeBus.capacity} Seats
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Next Stop</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs mt-0.5 truncate block">
                    {activeBus.nextStop.split('(')[0]}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Telemetry Health</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-xs mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> GPS Online
                  </span>
                </div>
              </div>

              {/* Transit Stops Timeline */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Transit Waypoints & Estimated Timings:
                </span>
                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                  {activeBus.stops.map((stop, i) => (
                    <div key={i} className="relative flex items-center justify-between text-xs">
                      <div
                        className={`absolute -left-6 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          stop.passed
                            ? 'bg-emerald-500 border-emerald-300'
                            : 'bg-white dark:bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/20'
                        }`}
                      />
                      <span className={stop.passed ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-slate-200 font-semibold'}>
                        {stop.name}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">{stop.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Quick Gate Pass Preview & Shuttle Advice (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <Card surface="elevated" className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <span>Hostel Gate Pass</span>
                  </h4>
                  <Badge variant={generatedPass ? 'success' : 'default'}>
                    {generatedPass ? 'Active Pass' : 'None Active'}
                  </Badge>
                </div>

                {generatedPass ? (
                  <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2 text-xs">
                    <div className="flex justify-between font-mono">
                      <span className="text-emerald-700 dark:text-emerald-300 font-bold">{generatedPass.passId}</span>
                      <span className="text-[10px] text-emerald-600 font-bold">AUTHORIZED</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">
                      <strong>Reason:</strong> {generatedPass.reason}
                    </p>
                    <p className="text-slate-500">
                      Return Before: <strong>{generatedPass.returnTime}</strong>
                    </p>
                    <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400">Warden Clearance: Valid</span>
                      <QrCode className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center text-xs text-slate-500 space-y-2">
                    <p>No active night/weekend gate pass issued.</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsGatePassModalOpen(true)}
                      className="w-full"
                    >
                      Apply Gate Pass
                    </Button>
                  </div>
                )}
              </Card>

              {/* Shuttle Guidelines */}
              <Card surface="base" className="p-4 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <span className="font-bold text-slate-900 dark:text-white block">Transit Regulations:</span>
                <p>• University bus service is free with student smart RFID identity card.</p>
                <p>• Routes depart accurately on schedule from Gate 1 Main Terminal.</p>
                <p>• For urgent shuttle assistance, contact transport officer at <strong>+91 98260 11928</strong>.</p>
              </Card>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'hostel' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Room Allocation Info (5 cols) */}
            <Card surface="elevated" className="lg:col-span-5 p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Hostel Allotment & Facilities
                  </h3>
                </div>
                <Badge variant="success">Allotted</Badge>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-500">Hostel Residence:</span>
                  <span className="font-bold text-slate-900 dark:text-white">Aryabhatta Hostel (Block B)</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-500">Room Number:</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {currentUser.hostelRoom || 'Room 304 (Double Occupancy)'}
                  </span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-500">Chief Warden:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">Dr. R. K. Mishra</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-500">Night Curfew:</span>
                  <span className="font-mono font-bold text-amber-600">09:30 PM Strictly</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-500">Campus Wi-Fi:</span>
                  <span className="font-mono font-bold text-emerald-600">eduroam-hostel-b3 (Gigabit)</span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsMaintenanceModalOpen(true)}
                  className="w-full"
                  leftIcon={<Wrench className="w-3.5 h-3.5" />}
                >
                  Report Plumbing / Electrical Issue
                </Button>
              </div>
            </Card>

            {/* Daily Mess Menu (7 cols) */}
            <Card surface="elevated" className="lg:col-span-7 p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Today's Mess Menu (Central Dining Hall 2)
                  </h3>
                </div>
                <Badge variant="primary">Dietary Audited</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {mockMessMenu.Today.map((meal) => (
                  <div
                    key={meal.type}
                    className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white text-xs">
                        {meal.type}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{meal.timing}</span>
                    </div>

                    <ul className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
                      {meal.items.map((item) => (
                        <li key={item} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="text-emerald-600 font-semibold">{meal.dietary}</span>
                      <span className="flex items-center gap-1 text-amber-600 font-mono font-bold">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {meal.rating}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* GATE PASS MODAL */}
      <AnimatePresence>
        {isGatePassModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-indigo-600" />
                  <span>Hostel Gate Pass Request</span>
                </h3>
                <button
                  onClick={() => setIsGatePassModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleApplyGatePass} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Purpose / Reason for Pass:
                  </label>
                  <input
                    type="text"
                    value={gatePassReason}
                    onChange={(e) => setGatePassReason(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Expected Return Date & Time:
                  </label>
                  <input
                    type="text"
                    value={gatePassReturnDate}
                    onChange={(e) => setGatePassReturnDate(e.target.value)}
                    placeholder="e.g. 2026-10-04 08:00 PM"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 text-slate-600 dark:text-slate-300 text-[11px]">
                  Automatic SMS notification will be dispatched to parent / guardian upon campus security gate exit scan.
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsGatePassModalOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="flex-1"
                  >
                    Issue Digital Pass
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ROOM MAINTENANCE MODAL */}
      <AnimatePresence>
        {isMaintenanceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-indigo-600" />
                  <span>Report Hostel Maintenance Issue</span>
                </h3>
                <button
                  onClick={() => setIsMaintenanceModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  ✕
                </button>
              </div>

              {maintenanceSuccess ? (
                <div className="p-6 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Maintenance Ticket Logged
                  </h4>
                  <p className="text-xs text-slate-500">
                    Hostel estate electrician/technician assigned to Room 304 within 2 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleMaintenanceSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Issue Category:
                    </label>
                    <select
                      value={maintenanceCategory}
                      onChange={(e) => setMaintenanceCategory(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                    >
                      <option value="Electrical">Electrical (Fan / Switch / Light Fixture)</option>
                      <option value="Plumbing">Plumbing (Washroom / Tap / Geyser)</option>
                      <option value="Wi-Fi / Internet">Wi-Fi / LAN Port Connectivity</option>
                      <option value="Carpentry">Carpentry (Bed / Desk / Wardrobe Lock)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Problem Description:
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={maintenanceDesc}
                      onChange={(e) => setMaintenanceDesc(e.target.value)}
                      placeholder="Specify the exact issue in Room 304..."
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsMaintenanceModalOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      className="flex-1"
                    >
                      Dispatch Technician
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
