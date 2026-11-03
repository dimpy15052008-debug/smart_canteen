import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../auth/useAuth';
import {
  Users,
  UserCheck,
  Building2,
  GraduationCap,
  AlertCircle,
  FileText,
  BarChart3,
  Server,
  User,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Download,
  Plus,
  TrendingUp,
  Award,
  Check,
  X,
  FileCheck,
  Eye,
  Send,
  Building,
  Mail,
  Phone,
  Printer,
  QrCode,
  Key,
  Lock,
  Layers,
  Sparkles,
  Wifi,
  Bus,
  Utensils,
  CreditCard,
  Edit3,
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
  ResponsiveContainer,
} from 'recharts';
import confetti from 'canvas-confetti';

export const AdminDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const { auditLogs, certificateRequests, canteenOrders } = useApp();

  // Route / tab detection
  const getActiveTab = (): string => {
    const p = location.pathname.toLowerCase();
    if (p.includes('faculty')) return 'faculty';
    if (p.includes('department')) return 'departments';
    if (p.includes('exam')) return 'examination';
    if (p.includes('complaint')) return 'complaints';
    if (p.includes('application')) return 'applications';
    if (p.includes('analytic')) return 'analytics';
    if (p.includes('operation')) return 'operations';
    if (p.includes('profile')) return 'profile';
    return 'students';
  };

  const activeTab = getActiveTab();

  // ── 1. Student Management State ──────────────────────────────────────────
  const [studentSearch, setStudentSearch] = useState('');
  const [studentDeptFilter, setStudentDeptFilter] = useState('all');
  const [studentStatusFilter, setStudentStatusFilter] = useState('all');
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentRoll, setNewStudentRoll] = useState('');
  const [newStudentDept, setNewStudentDept] = useState('Computer Science & Engineering');
  const [newStudentSem, setNewStudentSem] = useState('6');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const [studentList, setStudentList] = useState([
    {
      id: 'stu-1',
      name: 'Faizan Ali',
      roll: '0827CS221045',
      dept: 'Computer Science & Engineering',
      sem: 6,
      cgpa: 8.74,
      attendance: 86.4,
      feeStatus: 'Paid',
      biometric: 'Verified',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
    {
      id: 'stu-2',
      name: 'Zoya Khan',
      roll: '0827CS221088',
      dept: 'Computer Science & Engineering',
      sem: 6,
      cgpa: 7.92,
      attendance: 68.5,
      feeStatus: 'Paid',
      biometric: 'Verified',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
    {
      id: 'stu-3',
      name: 'Rohan Verma',
      roll: '0827CS221012',
      dept: 'Computer Science & Engineering',
      sem: 6,
      cgpa: 9.42,
      attendance: 94.2,
      feeStatus: 'Paid',
      biometric: 'Verified',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
    {
      id: 'stu-4',
      name: 'Priya Sharma',
      roll: '0827IT221034',
      dept: 'Information Technology',
      sem: 6,
      cgpa: 9.15,
      attendance: 92.1,
      feeStatus: 'Paid',
      biometric: 'Verified',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    },
    {
      id: 'stu-5',
      name: 'Aarav Patel',
      roll: '0827EC221002',
      dept: 'Electronics & Communication',
      sem: 6,
      cgpa: 8.21,
      attendance: 74.0,
      feeStatus: 'Pending',
      biometric: 'Verified',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    },
    {
      id: 'stu-6',
      name: 'Ananya Roy',
      roll: '0827ME221018',
      dept: 'Mechanical Engineering',
      sem: 4,
      cgpa: 8.45,
      attendance: 71.2,
      feeStatus: 'Paid',
      biometric: 'Verified',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    },
  ]);

  const handleEnrollStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentRoll.trim()) return;
    const newRecord = {
      id: `stu-${Date.now()}`,
      name: newStudentName,
      roll: newStudentRoll,
      dept: newStudentDept,
      sem: parseInt(newStudentSem, 10),
      cgpa: 8.0,
      attendance: 100,
      feeStatus: 'Paid',
      biometric: 'Verified',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    };
    setStudentList([newRecord, ...studentList]);
    setEnrollModalOpen(false);
    setNewStudentName('');
    setNewStudentRoll('');
    confetti({ particleCount: 60, spread: 60 });
    setActionSuccessMsg(`New student ${newRecord.name} (${newRecord.roll}) successfully registered into campus database!`);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  // ── 2. Faculty Management State ──────────────────────────────────────────
  const [facultySearch, setFacultySearch] = useState('');
  const [facultyList, setFacultyList] = useState([
    {
      id: 'FAC-1024',
      name: 'Prof. Rajesh Sharma',
      designation: 'Professor & Head of Dept.',
      dept: 'Computer Science & Engineering',
      cabin: 'Tech Block B-402',
      phone: '+91 (0755) 289-4402',
      email: 'rajesh.sharma@smartuni.ac.in',
      papers: 38,
      status: 'Active Window',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
    {
      id: 'FAC-1031',
      name: 'Dr. Anita Desai',
      designation: 'Professor & Head of Dept.',
      dept: 'Information Technology',
      cabin: 'Tech Block A-301',
      phone: '+91 (0755) 289-4301',
      email: 'anita.desai@smartuni.ac.in',
      papers: 24,
      status: 'In Session',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    },
    {
      id: 'FAC-1045',
      name: 'Prof. Manoj Kulkarni',
      designation: 'Professor & Head of Dept.',
      dept: 'Electronics & Communication',
      cabin: 'Tech Block C-202',
      phone: '+91 (0755) 289-4202',
      email: 'manoj.kulkarni@smartuni.ac.in',
      papers: 19,
      status: 'Available',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    },
    {
      id: 'FAC-1052',
      name: 'Dr. Suresh Pillai',
      designation: 'Associate Professor & HOD',
      dept: 'Mechanical Engineering',
      cabin: 'Workshop Block 101',
      phone: '+91 (0755) 289-4101',
      email: 'suresh.pillai@smartuni.ac.in',
      papers: 28,
      status: 'In Lab',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    },
    {
      id: 'FAC-1060',
      name: 'Dr. Neha Kapoor',
      designation: 'Associate Professor & HOD',
      dept: 'Artificial Intelligence & Data Science',
      cabin: 'Research Wing 204',
      phone: '+91 (0755) 289-4504',
      email: 'neha.kapoor@smartuni.ac.in',
      papers: 32,
      status: 'Active Window',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    },
  ]);

  // ── 3. Departments Data ──────────────────────────────────────────────────
  const departments = [
    {
      id: 'cse',
      name: 'Computer Science & Engineering',
      code: 'CSE',
      hod: 'Prof. Rajesh Sharma',
      students: 480,
      faculty: 28,
      labs: 8,
      budget: '₹2.40 Cr',
      utilization: 84,
      accreditation: 'NBA Tier-1 · NAAC A++',
      attendance: 86.4,
    },
    {
      id: 'it',
      name: 'Information Technology',
      code: 'IT',
      hod: 'Dr. Anita Desai',
      students: 360,
      faculty: 22,
      labs: 6,
      budget: '₹1.80 Cr',
      utilization: 81,
      accreditation: 'NBA Tier-1 · NAAC A++',
      attendance: 89.1,
    },
    {
      id: 'ece',
      name: 'Electronics & Communication',
      code: 'ECE',
      hod: 'Prof. Manoj Kulkarni',
      students: 310,
      faculty: 20,
      labs: 6,
      budget: '₹1.65 Cr',
      utilization: 78,
      accreditation: 'NBA Accredited',
      attendance: 82.3,
    },
    {
      id: 'aids',
      name: 'Artificial Intelligence & Data Science',
      code: 'AI&DS',
      hod: 'Dr. Neha Kapoor',
      students: 280,
      faculty: 18,
      labs: 5,
      budget: '₹2.10 Cr',
      utilization: 89,
      accreditation: 'Autonomous Emerging Hub',
      attendance: 88.5,
    },
    {
      id: 'mech',
      name: 'Mechanical Engineering',
      code: 'MECH',
      hod: 'Dr. Suresh Pillai',
      students: 240,
      faculty: 18,
      labs: 7,
      budget: '₹1.95 Cr',
      utilization: 75,
      accreditation: 'NBA Accredited',
      attendance: 79.5,
    },
    {
      id: 'civil',
      name: 'Civil Engineering',
      code: 'CIVIL',
      hod: 'Prof. R. C. Mathur',
      students: 200,
      faculty: 16,
      labs: 5,
      budget: '₹1.40 Cr',
      utilization: 72,
      accreditation: 'NBA Accredited',
      attendance: 84.0,
    },
    {
      id: 'eee',
      name: 'Electrical & Electronics',
      code: 'EEE',
      hod: 'Dr. Sanjay Rao',
      students: 220,
      faculty: 16,
      labs: 5,
      budget: '₹1.50 Cr',
      utilization: 79,
      accreditation: 'NBA Accredited',
      attendance: 83.2,
    },
    {
      id: 'soms',
      name: 'School of Management Studies',
      code: 'MBA',
      hod: 'Dr. Priya Nair',
      students: 190,
      faculty: 14,
      labs: 3,
      budget: '₹1.10 Cr',
      utilization: 85,
      accreditation: 'AICTE & UGC Recognized',
      attendance: 87.8,
    },
  ];

  // ── 4. Complaints & Grievances State ──────────────────────────────────────
  const [complaintList, setComplaintList] = useState([
    {
      id: 'CMP-2026-041',
      studentName: 'Faizan Ali',
      roll: '0827CS221045',
      category: 'Infrastructure & Wi-Fi',
      title: '5 GHz Wi-Fi Access Point Dropping Packets in Tech Block Room 402',
      date: '2026-09-28',
      priority: 'Urgent',
      status: 'In Progress',
      assignedTo: 'Campus IT Network Team',
    },
    {
      id: 'CMP-2026-039',
      studentName: 'Zoya Khan',
      roll: '0827CS221088',
      category: 'Hostel & Mess',
      title: 'Water Cooler Filter Replacement Needed on 3rd Floor East Wing',
      date: '2026-09-27',
      priority: 'Medium',
      status: 'Open',
      assignedTo: 'Estate Maintenance Desk',
    },
    {
      id: 'CMP-2026-035',
      studentName: 'Rohan Verma',
      roll: '0827CS221012',
      category: 'Library',
      title: 'Request for Additional IEEE Xplore Institutional Download Tokens',
      date: '2026-09-26',
      priority: 'Low',
      status: 'Resolved',
      assignedTo: 'Chief Librarian',
    },
    {
      id: 'CMP-2026-031',
      studentName: 'Priya Sharma',
      roll: '0827IT221034',
      category: 'Canteen',
      title: 'Pre-Order Pickup Delay at Counter 2 During 1:15 PM Rush Hour',
      date: '2026-09-25',
      priority: 'Medium',
      status: 'Resolved',
      assignedTo: 'Canteen Operations Lead',
    },
  ]);

  const handleResolveComplaint = (id: string) => {
    setComplaintList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'Resolved' } : c))
    );
    setActionSuccessMsg(`Grievance ${id} successfully resolved and archived with SLA compliance log!`);
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  // ── 5. Applications Queue State ──────────────────────────────────────────
  const [adminApplications, setAdminApplications] = useState([
    {
      id: 'APP-SCH-01',
      applicant: 'Faizan Ali',
      roll: '0827CS221045',
      type: 'National AICTE Merit Scholarship',
      date: '2026-09-28',
      amount: '₹50,000 / Year',
      status: 'Pending Admin Sign',
    },
    {
      id: 'APP-FAC-04',
      applicant: 'Prof. Rajesh Sharma',
      roll: 'FAC-1024',
      type: 'CAPEX Lab Equipment Requisition (VR Lab)',
      date: '2026-09-27',
      amount: '₹8,40,000',
      status: 'Pending Admin Sign',
    },
    {
      id: 'APP-MED-09',
      applicant: 'Zoya Khan',
      roll: '0827CS221088',
      type: 'Medical Condonation Endorsement (HOD Approved)',
      date: '2026-09-27',
      amount: '8 Days Exemption',
      status: 'Pending Admin Sign',
    },
    {
      id: 'APP-MIG-12',
      applicant: 'Arjun Das',
      roll: '0827EC221099',
      type: 'Inter-University Transfer NOC Clearance',
      date: '2026-09-25',
      amount: 'No-Dues Cleared',
      status: 'Approved',
    },
  ]);

  const handleSignAdminApp = (id: string) => {
    setAdminApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'Approved' } : a))
    );
    confetti({ particleCount: 50, spread: 60 });
    setActionSuccessMsg(`Application ${id} digitally signed by Dr. Sunita Verma with University Seal!`);
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  // ── 6. Analytics Telemetry Data ──────────────────────────────────────────
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
    { dept: 'AI&DS', attendance: 88.5, students: 280 },
  ];

  // ── 7. Admin Profile State ───────────────────────────────────────────────
  const [adminBio, setAdminBio] = useState(
    'Chief Administrative Officer and Vice-Chancellor of SmartUni.Ai with 22+ years in academic governance, institutional accreditation leadership, and digital transformation. Supervises university operations across 8 faculties, campus research institutes, and zero-trust digital infrastructure.'
  );
  const [adminCabin, setAdminCabin] = useState('Central Administrative Block Room 101');
  const [adminOfficeHours, setAdminOfficeHours] = useState('Mon - Fri: 10:00 AM – 1:00 PM (Executive Appointments)');
  const [adminPhone, setAdminPhone] = useState('+91 (0755) 289-4001 / Direct VC Secretariat');
  const [isEditingAdminProfile, setIsEditingAdminProfile] = useState(false);
  const [tempAdminBio, setTempAdminBio] = useState(adminBio);
  const [tempAdminCabin, setTempAdminCabin] = useState(adminCabin);
  const [tempAdminPhone, setTempAdminPhone] = useState(adminPhone);
  const [adminIdCardModalOpen, setAdminIdCardModalOpen] = useState(false);

  const handleSaveAdminProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminBio(tempAdminBio);
    setAdminCabin(tempAdminCabin);
    setAdminPhone(tempAdminPhone);
    setIsEditingAdminProfile(false);
    setActionSuccessMsg('Administrator governance profile updated successfully!');
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  // Filtered Students
  const filteredStudents = studentList.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.roll.toLowerCase().includes(studentSearch.toLowerCase());
    if (!matchSearch) return false;
    if (studentDeptFilter !== 'all' && s.dept !== studentDeptFilter) return false;
    if (studentStatusFilter === 'shortage' && s.attendance >= 75) return false;
    if (studentStatusFilter === 'compliant' && s.attendance < 75) return false;
    if (studentStatusFilter === 'fee_pending' && s.feeStatus !== 'Pending') return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Action Notification Alert */}
      {actionSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── 1. STUDENT MANAGEMENT ────────────────────────────────────────── */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          {/* Top Hero Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/20 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                Student Governance Registry
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Student Directory & Enrolment Management
              </h1>
              <p className="text-xs text-slate-300">
                Institutional student records, attendance compliance tracking, and degree audit status.
              </p>
            </div>
            <button
              onClick={() => setEnrollModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-amber-600/30 transition-all self-start md:self-auto min-h-[42px]"
            >
              <Plus className="w-4 h-4" />
              <span>Enroll New Student</span>
            </button>
          </div>

          {/* Student KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Total Enrolled</span>
              <p className="text-2xl font-bold text-white mt-1">4,820</p>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Across 8 Departments</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">Compliant (≥75%)</span>
              <p className="text-2xl font-bold text-emerald-300 mt-1">4,410</p>
              <span className="text-[10px] text-emerald-500/80 font-mono mt-0.5 block">91.5% Eligibility Rate</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400">Shortage (&lt;75%)</span>
              <p className="text-2xl font-bold text-rose-300 mt-1">410</p>
              <span className="text-[10px] text-rose-500/80 font-mono mt-0.5 block">Warning Notices Issued</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400">Fee Clearance</span>
              <p className="text-2xl font-bold text-amber-300 mt-1">93.8%</p>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Spring 2026 Dues</span>
            </div>
          </div>

          {/* Filters & Roster */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search student by name, roll number, or keywords..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                <select
                  value={studentDeptFilter}
                  onChange={(e) => setStudentDeptFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-medium"
                >
                  <option value="all">All Departments</option>
                  <option value="Computer Science & Engineering">Computer Science</option>
                  <option value="Information Technology">Information Tech</option>
                  <option value="Electronics & Communication">Electronics (ECE)</option>
                  <option value="Mechanical Engineering">Mechanical</option>
                </select>

                <select
                  value={studentStatusFilter}
                  onChange={(e) => setStudentStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-medium"
                >
                  <option value="all">All Statuses</option>
                  <option value="compliant">Compliant (≥75%)</option>
                  <option value="shortage">Shortage (&lt;75%)</option>
                  <option value="fee_pending">Fee Pending</option>
                </select>
              </div>
            </div>

            {/* Students List */}
            <div className="space-y-2.5">
              {filteredStudents.map((stu) => (
                <div
                  key={stu.id}
                  className="p-3.5 sm:p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={stu.avatar}
                      alt={stu.name}
                      className="w-11 h-11 rounded-2xl object-cover border border-slate-700 shrink-0"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{stu.name}</span>
                        <span className="text-xs font-mono text-slate-400 font-normal">({stu.roll})</span>
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                        <span>{stu.dept}</span>
                        <span aria-hidden="true">·</span>
                        <span>Sem {stu.sem}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-amber-300 font-bold">CGPA: {stu.cgpa}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    <div className="text-left sm:text-right">
                      <span
                        className={`text-xs font-mono font-bold block ${
                          stu.attendance >= 75 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {stu.attendance}% Attendance
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Fee: <strong className={stu.feeStatus === 'Paid' ? 'text-emerald-400' : 'text-amber-400'}>{stu.feeStatus}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setActionSuccessMsg(`Institutional dossier for ${stu.name} (${stu.roll}) retrieved.`);
                          setTimeout(() => setActionSuccessMsg(null), 3000);
                        }}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        title="View Full Student Dossier"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 2. FACULTY MANAGEMENT ────────────────────────────────────────── */}
      {activeTab === 'faculty' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-bold">
                Academic Staff Registry
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Faculty Governance & Teaching Appointments
              </h1>
              <p className="text-xs text-slate-300">
                240 Full-Time Faculty Members · Teaching loads, research grants & department allocations.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                76.6% Ph.D. Ratio
              </span>
            </div>
          </div>

          {/* Faculty Roster */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {facultyList.map((f) => (
              <div key={f.id} className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors space-y-3">
                <div className="flex items-center gap-3">
                  <img src={f.avatar} alt={f.name} className="w-12 h-12 rounded-2xl object-cover border border-slate-700" />
                  <div className="truncate">
                    <h3 className="text-sm font-bold text-white truncate">{f.name}</h3>
                    <p className="text-xs text-indigo-300 font-medium truncate">{f.designation}</p>
                    <span className="text-[10px] font-mono text-slate-400">{f.id}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 text-xs text-slate-400 space-y-1 font-mono text-[11px]">
                  <p><strong className="text-slate-300">Dept:</strong> {f.dept}</p>
                  <p><strong className="text-slate-300">Cabin:</strong> {f.cabin}</p>
                  <p><strong className="text-slate-300">Phone:</strong> {f.phone}</p>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                  <span className="text-xs font-mono text-amber-300 font-bold">{f.papers} Papers Published</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {f.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 3. DEPARTMENTS ───────────────────────────────────────────────── */}
      {activeTab === 'departments' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
              Academic Divisions
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              8 University Departments & Schools
            </h1>
            <p className="text-xs text-slate-300">
              Departmental budget utilization, outcome-based accreditation standing, and laboratory infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {departments.map((dept) => (
              <div key={dept.id} className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {dept.code}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">{dept.attendance}% Attendance</span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white leading-snug">{dept.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">HOD: <strong className="text-indigo-300">{dept.hod}</strong></p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono py-2 bg-slate-950 rounded-xl">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Students</span>
                    <strong className="text-white">{dept.students}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Faculty</span>
                    <strong className="text-white">{dept.faculty}</strong>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 font-mono space-y-1 pt-1 border-t border-slate-800">
                  <p>Budget: <strong className="text-slate-200">{dept.budget}</strong> ({dept.utilization}% spent)</p>
                  <p className="text-amber-400/90 text-[10px]">{dept.accreditation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 4. EXAMINATION ───────────────────────────────────────────────── */}
      {activeTab === 'examination' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-bold">
                Examination Control Office
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Central Examination Cell & Evaluation Command
              </h1>
              <p className="text-xs text-slate-300">
                Spring 2026 Semester Examinations · Question paper moderation, hall tickets, and flying squads.
              </p>
            </div>
            <button
              onClick={() => {
                setActionSuccessMsg('Official Examination Schedule and Hall Ticket Release Batch executed across student portals!');
                setTimeout(() => setActionSuccessMsg(null), 3000);
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 min-h-[40px]"
            >
              Release Digital Hall Tickets
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Papers Moderated</span>
              <p className="text-2xl font-bold text-white mt-1">22 / 24</p>
              <span className="text-[10px] text-emerald-400 font-mono mt-0.5 block">Approved & Sealed</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Hall Tickets</span>
              <p className="text-2xl font-bold text-emerald-300 mt-1">4,734</p>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">98.2% Issued</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Invigilators</span>
              <p className="text-2xl font-bold text-indigo-300 mt-1">96 Slots</p>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Fully Staffed</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Flying Squads</span>
              <p className="text-2xl font-bold text-amber-300 mt-1">4 Teams</p>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Active Patrol</span>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. COMPLAINTS ────────────────────────────────────────────────── */}
      {activeTab === 'complaints' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/20 rounded-3xl p-5 sm:p-6 shadow-xl space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
              Grievance Redressal Committee
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Institutional Grievance & Complaint Desk
            </h1>
            <p className="text-xs text-slate-300">
              SLA-tracked student and staff complaints across academic, hostel, and infrastructure categories.
            </p>
          </div>

          <div className="space-y-3">
            {complaintList.map((c) => (
              <div key={c.id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-amber-400">{c.id}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                      {c.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      c.priority === 'Urgent' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {c.priority}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{c.title}</h4>
                  <p className="text-xs text-slate-400 font-mono">
                    Raised by: <strong className="text-slate-300">{c.studentName}</strong> ({c.roll}) · Assigned: {c.assignedTo}
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <span className={`text-xs font-mono font-bold ${
                    c.status === 'Resolved' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {c.status}
                  </span>
                  {c.status !== 'Resolved' && (
                    <button
                      onClick={() => handleResolveComplaint(c.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all min-h-[38px]"
                    >
                      Resolve & Close
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 6. APPLICATIONS ──────────────────────────────────────────────── */}
      {activeTab === 'applications' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 rounded-3xl p-5 sm:p-6 shadow-xl space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-bold">
              Central Approval Queue
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Institutional Petitions & Executive Applications
            </h1>
            <p className="text-xs text-slate-300">
              Scholarships, travel grants, and university endorsements requiring Registrar and Vice-Chancellor signature.
            </p>
          </div>

          <div className="space-y-3">
            {adminApplications.map((app) => (
              <div key={app.id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-indigo-400">{app.id}</span>
                    <span className="text-[10px] font-mono text-slate-400">{app.date}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{app.type}</h4>
                  <p className="text-xs text-slate-400">
                    Applicant: <strong className="text-slate-300">{app.applicant}</strong> ({app.roll}) · Scope: {app.amount}
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <span className={`text-xs font-mono font-bold ${
                    app.status === 'Approved' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {app.status}
                  </span>
                  {app.status !== 'Approved' && (
                    <button
                      onClick={() => handleSignAdminApp(app.id)}
                      className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all min-h-[38px]"
                    >
                      Sign & Endorse
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 7. ANALYTICS ─────────────────────────────────────────────────── */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 rounded-3xl p-5 sm:p-6 shadow-xl space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-bold">
              Telemetry & Data Intelligence
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              University Operational Analytics & Cryptographic Telemetry
            </h1>
            <p className="text-xs text-slate-300">
              Cross-departmental attendance telemetry, biometric authentication metrics, and audit records.
            </p>
          </div>

          {/* Recharts Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                    <span>Institutional Attendance Trend (6-Week Window)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Consistently maintains +11.4% above regulatory 75% threshold
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  86.4% Current
                </span>
              </div>

              <div className="h-64 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={attendanceTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="adminAttendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                    <YAxis domain={[70, 95]} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        border: '1px solid rgba(51, 65, 85, 0.5)',
                        borderRadius: '0.75rem',
                        color: '#ffffff',
                        fontSize: '12px',
                      }}
                    />
                    <Area type="monotone" dataKey="rate" stroke="#6366f1" strokeWidth={2.5} fill="url(#adminAttendGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-5 p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-amber-400" />
                  <span>Department Attendance Benchmark</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Comparative student presence across engineering branches
                </p>
              </div>

              <div className="h-64 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="dept" tick={{ fontSize: 11 }} />
                    <YAxis domain={[60, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        border: '1px solid rgba(51, 65, 85, 0.5)',
                        borderRadius: '0.75rem',
                        color: '#ffffff',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="attendance" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 8. CAMPUS OPERATIONS ─────────────────────────────────────────── */}
      {activeTab === 'operations' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
              IoT & Infrastructure Mission Control
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Smart Campus Physical & Digital Infrastructure
            </h1>
            <p className="text-xs text-slate-300">
              Live telemetry for biometric turnstiles, optical networks, canteen order queues, and transport.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Biometric Turnstiles</h3>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-2xl font-bold font-mono text-white">14,200 Scans</p>
              <p className="text-xs text-slate-400">99.8% Geo-Facial Match Accuracy across 12 Main Gate Lanes.</p>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wifi className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white">Campus Optical Core</h3>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-2xl font-bold font-mono text-indigo-300">99.98% Uptime</p>
              <p className="text-xs text-slate-400">10 Gbps redundant uplink powering academic blocks & labs.</p>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bus className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">Transit Bus Fleet</h3>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-2xl font-bold font-mono text-amber-300">18 / 18 In Service</p>
              <p className="text-xs text-slate-400">Real-time GPS telemetry broadcasting to student mobile app.</p>
            </div>
          </div>
        </div>
      )}

      {/* ── 9. ADMIN PROFILE ─────────────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Profile Hero Card */}
          <div className="bg-gradient-to-br from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/20 rounded-3xl p-5 sm:p-7 shadow-xl relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 relative z-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <img
                  src={authUser?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'}
                  alt="Administrator"
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-amber-400/50 shadow-xl shrink-0"
                />
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                      ADM-001
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono">
                      SuperAdmin Clearance Level 5
                    </span>
                  </div>

                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                      <span>Dr. Sunita Verma</span>
                      <span className="text-base text-amber-300 font-normal">Ph.D.</span>
                    </h1>
                    <p className="text-sm text-slate-300 font-medium mt-0.5">
                      Vice Chancellor & Chief Administrative Controller · SmartUni.Ai
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-300 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>vc.office@smartuni.ac.in</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{adminPhone}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{adminCabin}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 self-stretch sm:self-auto">
                <button
                  onClick={() => {
                    setTempAdminBio(adminBio);
                    setTempAdminCabin(adminCabin);
                    setTempAdminPhone(adminPhone);
                    setIsEditingAdminProfile(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/30 transition-all min-h-[44px]"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile & Contact</span>
                </button>

                <button
                  onClick={() => setAdminIdCardModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-all min-h-[44px]"
                >
                  <QrCode className="w-4 h-4 text-amber-400" />
                  <span>Digital Administrator Pass</span>
                </button>
              </div>
            </div>

            <div className="mt-5 pt-5 border-t border-slate-800/80 bg-slate-950/40 rounded-2xl p-4 border">
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold block mb-1">
                Vice Chancellor Governance Statement
              </span>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                "{adminBio}"
              </p>
            </div>
          </div>

          {/* Institutional Credentials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-400">
                <Key className="w-4 h-4" />
                <h4 className="text-xs font-bold text-white">Root CA Signer Key</h4>
              </div>
              <p className="text-xs text-slate-400 font-mono">SHA-256 Validated</p>
              <span className="text-[10px] text-slate-500 font-mono block">Zero-Trust Institutional Master</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400">
                <Lock className="w-4 h-4" />
                <h4 className="text-xs font-bold text-white">Hardware YubiKey 5C</h4>
              </div>
              <p className="text-xs text-emerald-400 font-mono font-bold">FIDO2 Registered</p>
              <span className="text-[10px] text-slate-500 font-mono block">Bound to Master Clearance</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400">
                <Award className="w-4 h-4" />
                <h4 className="text-xs font-bold text-white">Doctoral Pedigree</h4>
              </div>
              <p className="text-xs text-indigo-300 font-mono">IIT Kanpur (2002)</p>
              <span className="text-[10px] text-slate-500 font-mono block">Ph.D. in Systems Engineering</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-purple-400">
                <ShieldCheck className="w-4 h-4" />
                <h4 className="text-xs font-bold text-white">Academic Tenet</h4>
              </div>
              <p className="text-xs text-purple-300 font-mono">NAAC Steering Chair</p>
              <span className="text-[10px] text-slate-500 font-mono block">Senior Academic Senate Head</span>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Enroll New Student ────────────────────────────────────── */}
      {enrollModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                Enroll New Student
              </h3>
              <button
                onClick={() => setEnrollModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEnrollStudent} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Student Full Name</label>
                <input
                  type="text"
                  required
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="e.g. Sameer Malhotra"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">University Roll Number</label>
                <input
                  type="text"
                  required
                  value={newStudentRoll}
                  onChange={(e) => setNewStudentRoll(e.target.value)}
                  placeholder="e.g. 0827CS221099"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Academic Department</label>
                <select
                  value={newStudentDept}
                  onChange={(e) => setNewStudentDept(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Artificial Intelligence & Data Science">AI & Data Science</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Current Semester</label>
                <select
                  value={newStudentSem}
                  onChange={(e) => setNewStudentSem(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="1">Semester 1 (1st Year)</option>
                  <option value="2">Semester 2 (1st Year)</option>
                  <option value="4">Semester 4 (2nd Year)</option>
                  <option value="6">Semester 6 (3rd Year)</option>
                  <option value="8">Semester 8 (4th Year)</option>
                </select>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEnrollModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs min-h-[44px]"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Edit Admin Profile ────────────────────────────────────── */}
      {isEditingAdminProfile && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                Edit Administrator Details
              </h3>
              <button
                onClick={() => setIsEditingAdminProfile(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdminProfile} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Vice Chancellor Governance Statement
                </label>
                <textarea
                  rows={3}
                  required
                  value={tempAdminBio}
                  onChange={(e) => setTempAdminBio(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Office Location</label>
                <input
                  type="text"
                  required
                  value={tempAdminCabin}
                  onChange={(e) => setTempAdminCabin(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Secretariat Hotline</label>
                <input
                  type="text"
                  required
                  value={tempAdminPhone}
                  onChange={(e) => setTempAdminPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditingAdminProfile(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs min-h-[44px]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Digital Administrator Pass ────────────────────────────── */}
      {adminIdCardModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden my-auto space-y-4">
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <QrCode className="w-4 h-4 text-amber-400" />
                Institutional Administrator Master Pass
              </h3>
              <button
                onClick={() => setAdminIdCardModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-4 sm:px-6">
              <div className="bg-gradient-to-br from-amber-950/80 via-slate-900 to-amber-950/80 border-2 border-amber-500/50 rounded-3xl p-5 shadow-2xl relative overflow-hidden space-y-4 text-white">
                <div className="flex items-center justify-between border-b border-amber-800/40 pb-3">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest uppercase text-amber-400 font-bold block">
                      SmartUni.Ai Master Authority
                    </span>
                    <h4 className="text-xs font-extrabold tracking-wider uppercase text-slate-200">
                      Vice Chancellor Credentials
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Clearance: Level 5
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150"
                    alt="Dr. Sunita Verma"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-md shrink-0"
                  />
                  <div className="space-y-0.5 truncate">
                    <h4 className="text-sm font-bold text-white truncate">
                      Dr. Sunita Verma, Ph.D.
                    </h4>
                    <p className="text-[11px] text-amber-300 font-medium truncate">
                      Vice Chancellor & Controller
                    </p>
                    <span className="inline-block text-[10px] font-mono font-bold text-amber-300 bg-amber-500/10 px-1.5 py-0.2 rounded mt-0.5">
                      ID: ADM-001 (Root)
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-2xl border border-amber-950 flex items-center justify-between gap-3 text-[10px] font-mono">
                  <div className="space-y-0.5 text-slate-400">
                    <p><strong className="text-slate-200">Office:</strong> Admin Block 101</p>
                    <p><strong className="text-slate-200">Role:</strong> SuperAdmin Governance</p>
                    <p><strong className="text-slate-200">Authority:</strong> University Root Signer</p>
                    <p className="text-[9px] text-amber-400 pt-0.5">Valid Thru: Permanent Tenure</p>
                  </div>
                  <div className="bg-white p-1.5 rounded-xl shrink-0 shadow">
                    <QrCode className="w-12 h-12 text-slate-950" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-5 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setAdminIdCardModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/30 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Pass</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
