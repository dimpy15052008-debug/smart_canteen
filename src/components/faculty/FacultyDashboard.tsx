import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Radio,
  Camera,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Bell,
  BookOpen,
  Calendar,
  Sparkles,
  MapPin,
  Clock,
  TrendingUp,
  GraduationCap,
  FileText,
  Send,
  UserCheck,
  Search,
  Filter,
  Download,
  Check,
  X,
  FileCheck,
  Award,
  ChevronRight,
  ExternalLink,
  Plus,
  ShieldCheck,
  MessageSquare,
  HelpCircle,
  FileSpreadsheet,
  AlertTriangle,
  Eye,
  FileCode,
  Paperclip,
  CheckCheck,
  Printer,
  User,
  Phone,
  Mail,
  Building,
  Key,
  QrCode,
  Lock,
  Edit3,
  Bookmark,
  Shield,
} from 'lucide-react';
import confetti from 'canvas-confetti';

// ── Data Interfaces ─────────────────────────────────────────────────────────

interface StudentPerformanceRecord {
  id: string;
  studentName: string;
  rollNumber: string;
  attendancePercent: number;
  midTermMarks: number; // out of 50
  labMarks: number; // out of 25
  quizMarks: number; // out of 25
  totalMarks: number; // out of 100
  grade: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  mentorNote?: string;
}

interface InvigilationDuty {
  id: string;
  courseCode: string;
  courseName: string;
  examType: string;
  date: string;
  time: string;
  hallNumber: string;
  role: 'Chief Invigilator' | 'Invigilator' | 'Flying Squad Lead';
  candidateCount: number;
  status: 'Scheduled' | 'Completed';
}

interface QuestionPaper {
  id: string;
  courseCode: string;
  courseName: string;
  semester: number;
  examType: string;
  status: 'Approved & Sealed' | 'Under Moderation' | 'Draft Pending';
  submissionDate: string;
  moderatedBy?: string;
  deadline: string;
}

interface DepartmentNotice {
  id: string;
  title: string;
  issuedBy: string;
  date: string;
  category: 'Academics' | 'Examinations' | 'Research' | 'Administration';
  summary: string;
  urgent?: boolean;
}

interface FacultyApplication {
  id: string;
  applicationType: 'Casual Leave' | 'Duty Leave (Conference)' | 'Research Grant' | 'Lab Requisition';
  title: string;
  appliedDate: string;
  duration?: string;
  budgetOrDays?: string;
  substituteFaculty?: string;
  status: 'Approved' | 'Under Review' | 'Submitted';
  approverRemarks?: string;
}

export interface StudentApplicationRecord {
  id: string;
  applicationNumber: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  program: string;
  semester: number;
  cgpa: number;
  attendancePercent: number;
  avatar: string;
  category: 'Internship NOC' | 'Medical Condonation' | 'Recommendation Letter (LOR)' | 'Elective Swap' | 'Scholarship Endorsement' | 'Re-Evaluation';
  title: string;
  submissionDate: string;
  priority: 'Normal' | 'Urgent';
  status: 'Pending Review' | 'Approved' | 'Requires Clarification' | 'Rejected';
  formalLetter: string;
  attachedDocuments: { name: string; size: string; type: string }[];
  facultyEndorsement?: string;
  endorsedAt?: string;
  digitalSealHash?: string;
}

export const FacultyDashboard: React.FC = () => {
  const {
    currentUser,
    courses,
    attendanceRecords,
    markAttendance,
    facultySessionActive,
    setFacultySessionActive,
    activeCourseId,
    setActiveCourseId,
  } = useApp();

  const location = useLocation();
  const navigate = useNavigate();

  // Tab routing detection
  const getActiveTab = (): string => {
    const p = location.pathname.toLowerCase();
    if (p.includes('profile')) return 'profile';
    if (p.includes('performance')) return 'performance';
    if (p.includes('exam')) return 'examination';
    if (p.includes('notice')) return 'notices';
    if (p.includes('application')) return 'applications';
    if (p.includes('request')) return 'student-requests';
    return 'attendance';
  };

  const activeTab = getActiveTab();
  const activeCourse = courses.find((c) => c.id === activeCourseId) || courses[0];

  // ── Section 1: Attendance State ───────────────────────────────────────────
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState<'all' | 'present' | 'absent' | 'override'>('all');
  const [exportNotice, setExportNotice] = useState(false);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [overrideStudentId, setOverrideStudentId] = useState('STU-9011');
  const [overrideStudentName, setOverrideStudentName] = useState('Zoya Khan');
  const [overrideRoll, setOverrideRoll] = useState('0827CS221088');
  const [overrideReason, setOverrideReason] = useState('Authorized university research paper presentation');
  const [overrideSuccessMsg, setOverrideSuccessMsg] = useState<string | null>(null);

  // ── Section 2: Student Performance State ─────────────────────────────────
  const [performanceSearch, setPerformanceSearch] = useState('');
  const [performanceFilter, setPerformanceFilter] = useState<'all' | 'at-risk' | 'top'>('all');
  const [performanceList, setPerformanceList] = useState<StudentPerformanceRecord[]>([
    {
      id: 'perf-1',
      studentName: 'Faizan Ali',
      rollNumber: '0827CS221045',
      attendancePercent: 86.4,
      midTermMarks: 44,
      labMarks: 23,
      quizMarks: 22,
      totalMarks: 89,
      grade: 'A+',
      riskLevel: 'Low',
    },
    {
      id: 'perf-2',
      studentName: 'Priya Sharma',
      rollNumber: '0827CS221034',
      attendancePercent: 92.1,
      midTermMarks: 47,
      labMarks: 25,
      quizMarks: 24,
      totalMarks: 96,
      grade: 'O',
      riskLevel: 'Low',
    },
    {
      id: 'perf-3',
      studentName: 'Zoya Khan',
      rollNumber: '0827CS221088',
      attendancePercent: 68.5,
      midTermMarks: 38,
      labMarks: 20,
      quizMarks: 18,
      totalMarks: 76,
      grade: 'B+',
      riskLevel: 'Medium',
      mentorNote: 'Attendance shortfall due to approved hospital leave. Academic score stable.',
    },
    {
      id: 'perf-4',
      studentName: 'Rohan Verma',
      rollNumber: '0827CS221012',
      attendancePercent: 94.2,
      midTermMarks: 48,
      labMarks: 24,
      quizMarks: 23,
      totalMarks: 95,
      grade: 'O',
      riskLevel: 'Low',
    },
    {
      id: 'perf-5',
      studentName: 'Aarav Patel',
      rollNumber: '0827CS221002',
      attendancePercent: 62.0,
      midTermMarks: 26,
      labMarks: 14,
      quizMarks: 12,
      totalMarks: 52,
      grade: 'C',
      riskLevel: 'High',
      mentorNote: 'Missed 4 consecutive lab sessions. Early-warning alert dispatched to guardian.',
    },
    {
      id: 'perf-6',
      studentName: 'Ananya Singh',
      rollNumber: '0827CS221019',
      attendancePercent: 88.0,
      midTermMarks: 42,
      labMarks: 22,
      quizMarks: 21,
      totalMarks: 85,
      grade: 'A',
      riskLevel: 'Low',
    },
    {
      id: 'perf-7',
      studentName: 'Kabir Mehta',
      rollNumber: '0827CS221055',
      attendancePercent: 74.2,
      midTermMarks: 34,
      labMarks: 19,
      quizMarks: 17,
      totalMarks: 70,
      grade: 'B',
      riskLevel: 'Medium',
      mentorNote: 'Borderline attendance (74.2%). Needs 2 more classes to cross mandatory 75% bar.',
    },
  ]);
  const [counselingActionDone, setCounselingActionDone] = useState<string | null>(null);

  // ── Section 3: Examination State ─────────────────────────────────────────
  const [invigilationDuties] = useState<InvigilationDuty[]>([
    {
      id: 'duty-1',
      courseCode: 'CS601',
      courseName: 'Distributed Systems & Cloud Computing',
      examType: 'Mid-Semester Theory Exam',
      date: '2026-10-06',
      time: '10:00 AM - 12:00 PM',
      hallNumber: 'Tech Block Hall 401',
      role: 'Chief Invigilator',
      candidateCount: 48,
      status: 'Scheduled',
    },
    {
      id: 'duty-2',
      courseCode: 'CS603',
      courseName: 'Machine Learning & Deep Neural Networks',
      examType: 'Mid-Semester Theory Exam',
      date: '2026-10-10',
      time: '02:00 PM - 04:00 PM',
      hallNumber: 'Tech Block Hall 402',
      role: 'Invigilator',
      candidateCount: 36,
      status: 'Scheduled',
    },
    {
      id: 'duty-3',
      courseCode: 'CS502',
      courseName: 'Database Management Systems',
      examType: 'University Flying Squad Inspection',
      date: '2026-10-14',
      time: '09:30 AM - 01:00 PM',
      hallNumber: 'Central Examination Block A & B',
      role: 'Flying Squad Lead',
      candidateCount: 120,
      status: 'Scheduled',
    },
  ]);

  const [questionPapers] = useState<QuestionPaper[]>([
    {
      id: 'qp-1',
      courseCode: 'CS601',
      courseName: 'Distributed Systems & Cloud Computing',
      semester: 6,
      examType: 'Mid-Semester 2026',
      status: 'Approved & Sealed',
      submissionDate: '2026-09-22',
      moderatedBy: 'Board of Studies (External Moderator: Prof. S. K. Roy)',
      deadline: '2026-09-24',
    },
    {
      id: 'qp-2',
      courseCode: 'CS603',
      courseName: 'Machine Learning & NLP',
      semester: 6,
      examType: 'Mid-Semester 2026',
      status: 'Under Moderation',
      submissionDate: '2026-09-28',
      deadline: '2026-09-30 (Today 05:00 PM)',
    },
  ]);

  const [marksFrozen, setMarksFrozen] = useState(false);
  const [marksFreezeNotice, setMarksFreezeNotice] = useState<string | null>(null);

  // ── Section 4: Notices State ─────────────────────────────────────────────
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementCourse, setAnnouncementCourse] = useState('CS601');
  const [announcementSent, setAnnouncementSent] = useState(false);
  const [departmentNotices] = useState<DepartmentNotice[]>([
    {
      id: 'not-1',
      title: 'Submission of Evaluated Mid-Term Answer Scripts by Oct 18',
      issuedBy: 'Controller of Examinations Division',
      date: '2026-09-28',
      category: 'Examinations',
      summary: 'All faculty must submit moderated marks sheets and 10% sample scripts to CoE cell by 5:00 PM, Oct 18.',
      urgent: true,
    },
    {
      id: 'not-2',
      title: 'Faculty Development Programme (FDP) on Generative AI & Quantum Computing',
      issuedBy: 'Dean of Academic Affairs',
      date: '2026-09-26',
      category: 'Academics',
      summary: '5-day AICTE sponsored national workshop in Virtual Classroom 2. Duty leave approved for participants.',
      urgent: false,
    },
    {
      id: 'not-3',
      title: 'NAAC Peer Team Accreditation Review Timetable - Department of CSE',
      issuedBy: 'Internal Quality Assurance Cell (IQAC)',
      date: '2026-09-24',
      category: 'Administration',
      summary: 'Laboratory inspection of Distributed Systems Lab (Room 402) scheduled for Day 2 between 11:30 AM and 01:00 PM.',
      urgent: true,
    },
    {
      id: 'not-4',
      title: 'Faculty Research Seed Grant 2026-27 Phase 2 Proposals Invited',
      issuedBy: 'Dean of Research & Consultancy',
      date: '2026-09-20',
      category: 'Research',
      summary: 'Proposals up to ₹5,00,000 in AI, Cloud, and IoT systems accepted through institutional research ERP portal.',
      urgent: false,
    },
  ]);
  const [noticeFilter, setNoticeFilter] = useState<'all' | 'Academics' | 'Examinations' | 'Research' | 'Administration'>('all');

  // ── Section 5: Applications State (Student & Faculty Applications) ─────────
  const [applicationsSubTab, setApplicationsSubTab] = useState<'student' | 'faculty'>('student');
  const [studentAppSearch, setStudentAppSearch] = useState('');
  const [studentAppCategoryFilter, setStudentAppCategoryFilter] = useState<string>('all');
  const [studentAppStatusFilter, setStudentAppStatusFilter] = useState<string>('all');

  const [studentApplications, setStudentApplications] = useState<StudentApplicationRecord[]>([
    {
      id: 'sapp-1',
      applicationNumber: 'APP-2026-NOC-0842',
      studentId: 'STU-8842',
      studentName: 'Faizan Ali',
      rollNumber: '0827CS221045',
      program: 'B.Tech Computer Science & Engineering',
      semester: 6,
      cgpa: 8.74,
      attendancePercent: 86.4,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      category: 'Internship NOC',
      title: 'Official Institutional NOC for Summer AI Research Internship at ISRO NRSC',
      submissionDate: '2026-09-26',
      priority: 'Urgent',
      status: 'Pending Review',
      formalLetter: `Respected Prof. Rajesh Sharma,\n\nI have been selected for the prestigious 10-week Summer Research Internship at ISRO National Remote Sensing Centre (NRSC), Hyderabad in the Satellite Deep Learning & Hyperspectral Computer Vision Division. The project involves building neural networks for real-time flood monitoring from satellite radar data.\n\nThe internship period is from May 15 to July 25, 2026. As per university norms, I require an institutional No Objection Certificate (NOC) and faculty supervisor endorsement stating my academic clearance and attendance eligibility.\n\nI undertake to complete all coursework requirements and examinations without disruption.\n\nSincerely,\nFaizan Ali (Roll: 0827CS221045)`,
      attachedDocuments: [
        { name: 'ISRO_NRSC_Selection_Offer_Letter_2026.pdf', size: '1.4 MB', type: 'application/pdf' },
        { name: 'Student_Undertaking_and_Course_Clearance.pdf', size: '420 KB', type: 'application/pdf' },
      ],
    },
    {
      id: 'sapp-2',
      applicationNumber: 'APP-2026-MED-0911',
      studentId: 'STU-9011',
      studentName: 'Zoya Khan',
      rollNumber: '0827CS221088',
      program: 'B.Tech Computer Science & Engineering',
      semester: 6,
      cgpa: 7.92,
      attendancePercent: 68.5,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      category: 'Medical Condonation',
      title: 'Medical Attendance Shortage Condonation Application (Dengue Inpatient Care)',
      submissionDate: '2026-09-27',
      priority: 'Urgent',
      status: 'Pending Review',
      formalLetter: `Respected Sir,\n\nI was hospitalized at AIIMS Bhopal from September 12 to September 20, 2026 due to severe Dengue viral fever with critical platelet count drops. Consequently, I was unable to attend 12 lectures across CS601 (Distributed Systems) and CS603 (Machine Learning).\n\nMy current attendance has dropped to 68.5%, falling short of the mandatory 75% semester examination bar. Condonation of these 8 days of medical absence will restore my official attendance to 76.2%.\n\nI request you to approve this condonation under University Academic Regulation Section 4.2.\n\nRespectfully,\nZoya Khan (Roll: 0827CS221088)`,
      attachedDocuments: [
        { name: 'AIIMS_Bhopal_Hospital_Discharge_Summary.pdf', size: '2.1 MB', type: 'application/pdf' },
        { name: 'Government_Medical_Fitness_Certificate.pdf', size: '780 KB', type: 'application/pdf' },
      ],
    },
    {
      id: 'sapp-3',
      applicationNumber: 'APP-2026-LOR-0750',
      studentId: 'STU-8750',
      studentName: 'Rohan Verma',
      rollNumber: '0827CS221012',
      program: 'B.Tech Computer Science & Engineering',
      semester: 6,
      cgpa: 9.42,
      attendancePercent: 94.2,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      category: 'Recommendation Letter (LOR)',
      title: 'Confidential Academic Recommendation Letter for MS in CS at Georgia Tech',
      submissionDate: '2026-09-25',
      priority: 'Normal',
      status: 'Pending Review',
      formalLetter: `Dear Prof. Rajesh Sharma,\n\nI am applying for graduate studies (MS in Computer Science, Fall 2027) at the Georgia Institute of Technology, specializing in Cloud Systems & Distributed Consensus.\n\nHaving served as a research student in your Distributed Computing Lab and co-authoring our student paper on Paxos replication, I kindly request you to provide a Letter of Recommendation highlighting my academic dedication and laboratory contributions.\n\nAttached are my Statement of Purpose draft and academic transcript for your reference.\n\nWarm regards,\nRohan Verma (Roll: 0827CS221012)`,
      attachedDocuments: [
        { name: 'GeorgiaTech_MS_Statement_of_Purpose.pdf', size: '820 KB', type: 'application/pdf' },
        { name: 'IEEE_Student_Paper_Consensus_Preprint.pdf', size: '1.9 MB', type: 'application/pdf' },
      ],
    },
    {
      id: 'sapp-4',
      applicationNumber: 'APP-2026-SWP-0892',
      studentId: 'STU-8911',
      studentName: 'Priya Sharma',
      rollNumber: '0827CS221034',
      program: 'B.Tech Computer Science & Engineering',
      semester: 6,
      cgpa: 9.15,
      attendancePercent: 92.1,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      category: 'Elective Swap',
      title: 'Semester 6 Elective Change from CS604 (Agile) to CS608 (Advanced Robotics)',
      submissionDate: '2026-09-22',
      priority: 'Normal',
      status: 'Approved',
      formalLetter: `Respected Faculty Advisor,\n\nI request permission to change my departmental elective choice for Semester 6 from CS604 (Agile Architectures) to CS608 (Advanced Autonomous Robotics).\n\nI have verified that all prerequisites (Linear Algebra, ROS Lab, Embedded Systems) have been completed with Grade O in Semester 5. The HoD of Robotics has confirmed seat availability in Section B.\n\nThank you,\nPriya Sharma (Roll: 0827CS221034)`,
      attachedDocuments: [
        { name: 'Prerequisite_Grade_Transcript_Sem5.pdf', size: '640 KB', type: 'application/pdf' },
      ],
      facultyEndorsement: 'Approved. Prerequisite coursework in ROS and linear algebra verified with Grade O. Seat allocated in Section B.',
      endorsedAt: '2026-09-23 03:30 PM',
      digitalSealHash: 'SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    },
    {
      id: 'sapp-5',
      applicationNumber: 'APP-2026-REV-0604',
      studentId: 'STU-8899',
      studentName: 'Aarav Patel',
      rollNumber: '0827CS221002',
      program: 'B.Tech Computer Science & Engineering',
      semester: 6,
      cgpa: 6.85,
      attendancePercent: 62.0,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      category: 'Re-Evaluation',
      title: 'Mid-Term 1 Answer Script Totaling Verification Request — CS601',
      submissionDate: '2026-09-27',
      priority: 'Normal',
      status: 'Pending Review',
      formalLetter: `Respected Sir,\n\nOn inspecting my Mid-Semester Answer Script for CS601 Distributed Systems, Question 3(b) regarding Two-Phase Commit recovery scenarios was awarded 6 marks on page 5 but was missed in the front-page tabulation total.\n\nI kindly request verification and tabulation update in the continuous evaluation register.\n\nYours faithfully,\nAarav Patel (Roll: 0827CS221002)`,
      attachedDocuments: [
        { name: 'MidTerm_Script_Scan_Q3_Review.pdf', size: '3.4 MB', type: 'application/pdf' },
      ],
    },
    {
      id: 'sapp-6',
      applicationNumber: 'APP-2026-SCH-0518',
      studentId: 'STU-9067',
      studentName: 'Sneha Deshmukh',
      rollNumber: '0827CS221067',
      program: 'B.Tech Computer Science & Engineering',
      semester: 6,
      cgpa: 8.95,
      attendancePercent: 89.0,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      category: 'Scholarship Endorsement',
      title: 'Faculty Recommendation for National DeepTech AI Research Fellowship 2026',
      submissionDate: '2026-09-28',
      priority: 'Urgent',
      status: 'Pending Review',
      formalLetter: `Respected Lab Director,\n\nI am applying for the National DeepTech AI Research Fellowship sponsored by the Ministry of Electronics & IT (MeitY) for our Edge AI vision pipeline.\n\nThe fellowship application requires endorsement by the Lab Director certifying academic standing, character, and departmental research feasibility.\n\nI request you to sign and endorse the attached Annexure B form.\n\nRegards,\nSneha Deshmukh (Roll: 0827CS221067)`,
      attachedDocuments: [
        { name: 'MeitY_Fellowship_Research_Proposal.pdf', size: '3.8 MB', type: 'application/pdf' },
        { name: 'Recommendation_Form_Annexure_B.pdf', size: '510 KB', type: 'application/pdf' },
      ],
    },
  ]);

  const [facultyApplications, setFacultyApplications] = useState<FacultyApplication[]>([
    {
      id: 'app-1',
      applicationType: 'Duty Leave (Conference)',
      title: 'Duty Leave for IEEE Cloud Computing Summit, Bengaluru',
      appliedDate: '2026-09-24',
      duration: '4 Days (Oct 18 - Oct 21, 2026)',
      budgetOrDays: '4 Days DL',
      substituteFaculty: 'Prof. Vikas Gupta (CS604)',
      status: 'Approved',
      approverRemarks: 'Sanctioned by Dean Academics. Substitute lecture adjustment verified.',
    },
    {
      id: 'app-2',
      applicationType: 'Research Grant',
      title: 'Travel Sponsorship for ACM SIGCOMM Paper Oral Presentation',
      appliedDate: '2026-09-20',
      budgetOrDays: '₹45,000 Sanctioned',
      status: 'Approved',
      approverRemarks: 'Reimbursable under University Faculty Global Travel Grant Scheme.',
    },
    {
      id: 'app-3',
      applicationType: 'Lab Requisition',
      title: 'Procurement of 10x Gigabit Managed Switches for Lab 402',
      appliedDate: '2026-09-15',
      budgetOrDays: '₹1,25,000 (PO Generated)',
      status: 'Approved',
      approverRemarks: 'Purchase order issued to authorized Dell Enterprise vendor. Delivery expected Oct 5.',
    },
    {
      id: 'app-4',
      applicationType: 'Lab Requisition',
      title: '20x VR Headsets & Edge Computing Racks for Metaverse & AI Lab',
      appliedDate: '2026-09-27',
      budgetOrDays: '₹8,40,000 (CAPEX Proposal)',
      status: 'Under Review',
      approverRemarks: 'Forwarded to University Financial Advisory Committee for FY27 budget review.',
    },
  ]);

  const [viewingStudentApp, setViewingStudentApp] = useState<StudentApplicationRecord | null>(null);
  const [appEndorsementRemarks, setAppEndorsementRemarks] = useState('');
  const [appActionSuccessMsg, setAppActionSuccessMsg] = useState<string | null>(null);
  const [previewingDoc, setPreviewingDoc] = useState<string | null>(null);

  const [newAppModalOpen, setNewAppModalOpen] = useState(false);
  const [newAppType, setNewAppType] = useState<FacultyApplication['applicationType']>('Casual Leave');
  const [newAppTitle, setNewAppTitle] = useState('');
  const [newAppDuration, setNewAppDuration] = useState('');
  const [newAppBudget, setNewAppBudget] = useState('');
  const [newAppSubstitute, setNewAppSubstitute] = useState('Prof. Vikas Gupta');

  // ── Section 7: Faculty Profile State ──────────────────────────────────────
  const [profileSubTab, setProfileSubTab] = useState<'overview' | 'research' | 'credentials' | 'security'>('overview');
  const [profileBio, setProfileBio] = useState(
    'Head of Department & Professor of Computer Science at SmartUni.Ai with 14+ years of doctoral research and pedagogy in Distributed Systems, Cloud Infrastructure, and Resilient Edge Computing. Leads the Campus Distributed Computing Lab and coordinates institutional NBA & NAAC accreditation.'
  );
  const [profileCabin, setProfileCabin] = useState('Tech Block B-402');
  const [profileOfficeHours, setProfileOfficeHours] = useState('Mon - Thu: 2:00 PM – 4:00 PM (Walk-in & Digital Appointments)');
  const [profilePhone, setProfilePhone] = useState('+91 (0755) 289-4402 / Direct Ext. 402');
  const [profileEmail] = useState('rajesh.sharma@smartuni.ac.in');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempBio, setTempBio] = useState(profileBio);
  const [tempCabin, setTempCabin] = useState(profileCabin);
  const [tempOfficeHours, setTempOfficeHours] = useState(profileOfficeHours);
  const [tempPhone, setTempPhone] = useState(profilePhone);
  const [profileSavedToast, setProfileSavedToast] = useState(false);
  const [idCardModalOpen, setIdCardModalOpen] = useState(false);

  const handleOpenEditProfile = () => {
    setTempBio(profileBio);
    setTempCabin(profileCabin);
    setTempOfficeHours(profileOfficeHours);
    setTempPhone(profilePhone);
    setIsEditingProfile(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileBio(tempBio);
    setProfileCabin(tempCabin);
    setProfileOfficeHours(tempOfficeHours);
    setProfilePhone(tempPhone);
    setIsEditingProfile(false);
    setProfileSavedToast(true);
    setTimeout(() => setProfileSavedToast(false), 3000);
  };

  // Handlers
  const handleBroadcastAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) return;
    setAnnouncementSent(true);
    setAnnouncementText('');
    setAnnouncementTitle('');
    setTimeout(() => setAnnouncementSent(false), 3500);
  };

  const handleGrantOverride = (e: React.FormEvent) => {
    e.preventDefault();
    markAttendance({
      studentId: overrideStudentId,
      studentName: overrideStudentName,
      rollNumber: overrideRoll,
      courseId: activeCourse.code,
      courseName: activeCourse.name,
      facultyId: currentUser.id,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'manual_override',
      verificationMethod: 'manual_faculty',
      locationVerified: true,
      faceConfidence: 100,
      livenessVerified: true,
      notes: overrideReason,
    });
    setOverrideSuccessMsg(`Manual override recorded for ${overrideStudentName} (${overrideRoll})!`);
    setTimeout(() => {
      setOverrideSuccessMsg(null);
      setOverrideModalOpen(false);
    }, 2000);
  };

  const handleApproveApplication = (appId: string) => {
    const timestamp = new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
    const endorsement =
      appEndorsementRemarks.trim() ||
      `Approved and digitally endorsed by Prof. Rajesh Sharma (${currentUser.designation}). Verified against departmental academic standing.`;
    const seal = `SHA256:${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    setStudentApplications((prev) =>
      prev.map((app) =>
        app.id === appId
          ? {
              ...app,
              status: 'Approved',
              facultyEndorsement: endorsement,
              endorsedAt: timestamp,
              digitalSealHash: seal,
            }
          : app
      )
    );

    if (viewingStudentApp && viewingStudentApp.id === appId) {
      setViewingStudentApp((prev) =>
        prev
          ? {
              ...prev,
              status: 'Approved',
              facultyEndorsement: endorsement,
              endorsedAt: timestamp,
              digitalSealHash: seal,
            }
          : null
      );
    }

    confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } });
    setAppActionSuccessMsg('Application successfully endorsed and digitally sealed!');
    setAppEndorsementRemarks('');
    setTimeout(() => setAppActionSuccessMsg(null), 3000);
  };

  const handleRejectApplication = (appId: string) => {
    const timestamp = new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
    const remark = appEndorsementRemarks.trim() || 'Returned for resubmission: missing required official departmental enclosure.';

    setStudentApplications((prev) =>
      prev.map((app) =>
        app.id === appId
          ? {
              ...app,
              status: 'Requires Clarification',
              facultyEndorsement: remark,
              endorsedAt: timestamp,
            }
          : app
      )
    );

    if (viewingStudentApp && viewingStudentApp.id === appId) {
      setViewingStudentApp((prev) =>
        prev
          ? {
              ...prev,
              status: 'Requires Clarification',
              facultyEndorsement: remark,
              endorsedAt: timestamp,
            }
          : null
      );
    }

    setAppActionSuccessMsg('Application returned to student with clarification notes.');
    setAppEndorsementRemarks('');
    setTimeout(() => setAppActionSuccessMsg(null), 3000);
  };

  const handleCreateNewApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppTitle.trim()) return;
    const newRecord: FacultyApplication = {
      id: `app-${Date.now()}`,
      applicationType: newAppType,
      title: newAppTitle,
      appliedDate: new Date().toISOString().split('T')[0],
      duration: newAppDuration || 'Pending confirmation',
      budgetOrDays: newAppBudget || (newAppType === 'Casual Leave' ? '1 Day' : '₹0'),
      substituteFaculty: newAppSubstitute,
      status: 'Submitted',
      approverRemarks: 'Awaiting initial sign-off from Head of Department.',
    };
    setFacultyApplications((prev) => [newRecord, ...prev]);
    setNewAppModalOpen(false);
    setNewAppTitle('');
    setNewAppDuration('');
    setNewAppBudget('');
  };

  const presentCount = attendanceRecords.filter((r) => r.status === 'present' || r.status === 'manual_override').length;
  const filteredAttendance = attendanceRecords.filter((rec) => {
    const matchesSearch =
      rec.studentName.toLowerCase().includes(attendanceSearch.toLowerCase()) ||
      rec.rollNumber.toLowerCase().includes(attendanceSearch.toLowerCase());
    if (!matchesSearch) return false;
    if (attendanceFilter === 'present') return rec.status === 'present';
    if (attendanceFilter === 'override') return rec.status === 'manual_override';
    if (attendanceFilter === 'absent') return rec.status === 'absent';
    return true;
  });

  const filteredStudentApps = studentApplications.filter((app) => {
    const matchesSearch =
      app.studentName.toLowerCase().includes(studentAppSearch.toLowerCase()) ||
      app.rollNumber.toLowerCase().includes(studentAppSearch.toLowerCase()) ||
      app.title.toLowerCase().includes(studentAppSearch.toLowerCase()) ||
      app.applicationNumber.toLowerCase().includes(studentAppSearch.toLowerCase());
    if (!matchesSearch) return false;
    if (studentAppCategoryFilter !== 'all' && app.category !== studentAppCategoryFilter) return false;
    if (studentAppStatusFilter !== 'all' && app.status !== studentAppStatusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* ── Top Hero Banner ──────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-indigo-400/40 shadow-lg"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                  {currentUser.id}
                </span>
                <span className="text-xs text-indigo-300 font-medium">{currentUser.designation}</span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
                {currentUser.name}
              </h1>
              <div className="flex items-center gap-2 text-xs text-slate-300 mt-0.5">
                <span>{currentUser.department}</span>
                <span aria-hidden="true">·</span>
                <span>Cabin: {currentUser.cabinNumber}</span>
              </div>
            </div>
          </div>

          {/* Quick Active Course Switcher */}
          <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full md:w-auto">
            <div className="w-full sm:w-auto">
              <p className="text-[11px] text-slate-400 font-mono uppercase tracking-wider">Active Classroom</p>
              <select
                value={activeCourseId}
                onChange={(e) => setActiveCourseId(e.target.value)}
                className="mt-1 w-full sm:w-auto bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 sm:py-1.5 text-xs text-white font-bold focus:outline-none focus:ring-1 focus:ring-indigo-400 min-h-[40px] sm:min-h-0"
              >
                {courses.slice(0, 3).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code}: {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="h-8 w-px bg-slate-800 hidden sm:block" />

            <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
              <div>
                <p className="text-[11px] text-slate-400 font-mono">Biometric Session</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      facultySessionActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                    }`}
                  />
                  <span className="text-xs font-bold text-white">
                    {facultySessionActive ? 'Live Window' : 'Paused'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setFacultySessionActive(!facultySessionActive)}
                className={`px-3.5 py-2 sm:py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 min-h-[40px] flex items-center justify-center ${
                  facultySessionActive
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                }`}
              >
                {facultySessionActive ? 'Close Window' : 'Open Window'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Active Section Views ─────────────────────────────────────────── */}

      {/* 1. ATTENDANCE VIEW */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* Metrics Overview Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Total Enrolled</span>
              <p className="text-2xl font-bold text-white mt-1">36 Students</p>
              <span className="text-[11px] text-slate-500 mt-1 block">Semester 6 CSE-A</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400">Present (Live)</span>
              <p className="text-2xl font-bold text-emerald-300 mt-1">{presentCount}</p>
              <span className="text-[11px] text-slate-500 mt-1 block">Geo-facial verified</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-rose-400">Absent</span>
              <p className="text-2xl font-bold text-rose-300 mt-1">{Math.max(0, 36 - presentCount)}</p>
              <span className="text-[11px] text-slate-500 mt-1 block">Unverified candidates</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-400">Attendance Rate</span>
              <p className="text-2xl font-bold text-indigo-300 mt-1">
                {((presentCount / 36) * 100).toFixed(1)}%
              </p>
              <span className="text-[11px] text-slate-500 mt-1 block">Course Target &ge; 75%</span>
            </div>
          </div>

          {/* Roster & Controls Panel */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-400" />
                  Live Classroom Roster: {activeCourse.code} — {activeCourse.name}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <span>Room 402 - Tech Block</span>
                  <span aria-hidden="true">·</span>
                  <span>10:00 AM - 11:15 AM</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-400 font-mono">50m Geofence Active</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOverrideModalOpen(true)}
                  className="px-3 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Manual Exemption Override</span>
                </button>
                <button
                  onClick={() => {
                    setExportNotice(true);
                    setTimeout(() => setExportNotice(false), 2500);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Export CSV notification */}
            {exportNotice && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Attendance roster for {activeCourse.code} exported to CSV! (CS601_Attendance_2026_09_30.csv)</span>
              </div>
            )}

            {/* Filter and search toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search student name or roll number..."
                  value={attendanceSearch}
                  onChange={(e) => setAttendanceSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                {(['all', 'present', 'override', 'absent'] as const).map((filterKey) => (
                  <button
                    key={filterKey}
                    onClick={() => setAttendanceFilter(filterKey)}
                    className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors ${
                      attendanceFilter === filterKey
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {filterKey}
                  </button>
                ))}
              </div>
            </div>

            {/* Roster entries */}
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredAttendance.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-xs text-indigo-400 font-mono">
                      {rec.rollNumber.slice(-3)}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                        {rec.studentName}
                        {rec.status === 'manual_override' && (
                          <span className="text-[10px] font-mono text-purple-300 bg-purple-950/80 px-2 py-0.2 rounded border border-purple-800/50">
                            Exempted
                          </span>
                        )}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                        <span>{rec.rollNumber}</span>
                        <span aria-hidden="true">·</span>
                        <span>{rec.time}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-400 capitalize">{rec.verificationMethod.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <div className="text-left sm:text-right">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          rec.status === 'present'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : rec.status === 'manual_override'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {rec.status === 'present' ? 'Geo+Face Verified' : rec.status.replace('_', ' ')}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        Landmarks: {rec.faceConfidence}% Match
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. STUDENT PERFORMANCE VIEW */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          {/* Header & KPI Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Class Average</span>
              <p className="text-2xl font-bold text-white mt-1">8.12 / 10</p>
              <span className="text-[11px] text-slate-500 mt-1 block">Course CGPA benchmark</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-400">Mid-Term 1 Avg</span>
              <p className="text-2xl font-bold text-indigo-300 mt-1">39.4 / 50</p>
              <span className="text-[11px] text-slate-500 mt-1 block">78.8% aggregate score</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400">At-Risk Students</span>
              <p className="text-2xl font-bold text-amber-300 mt-1">3 Students</p>
              <span className="text-[11px] text-slate-500 mt-1 block">&lt;75% att. or &lt;40% score</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400">Top Rankers (O/A+)</span>
              <p className="text-2xl font-bold text-emerald-300 mt-1">9 Students</p>
              <span className="text-[11px] text-slate-500 mt-1 block">&gt;85% composite score</span>
            </div>
          </div>

          {/* Grade Distribution Bar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-400" />
                Composite Grade Distribution — {activeCourse.code}
              </h3>
              <span className="text-xs text-slate-400 font-mono">36 Candidates Evaluated</span>
            </div>

            <div className="w-full h-3 rounded-full bg-slate-950 flex overflow-hidden border border-slate-800">
              <div style={{ width: '25%' }} className="bg-emerald-500" title="Grade O: 25%" />
              <div style={{ width: '35%' }} className="bg-indigo-500" title="Grade A+: 35%" />
              <div style={{ width: '25%' }} className="bg-cyan-500" title="Grade A: 25%" />
              <div style={{ width: '10%' }} className="bg-amber-500" title="Grade B+: 10%" />
              <div style={{ width: '5%' }} className="bg-rose-500" title="Critical/At-Risk: 5%" />
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500" /> O (Outstanding, 25%)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-indigo-500" /> A+ (Excellent, 35%)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-cyan-500" /> A (Very Good, 25%)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-500" /> B+ (Good, 10%)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-rose-500" /> At-Risk (&lt;75%, 5%)</span>
            </div>
          </div>

          {/* Student Performance Roster Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                  Student Performance & Continuous Evaluation Sheet
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Mid-Semester, Lab Assessments & Early-Warning AI Indicators</p>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                {(['all', 'at-risk', 'top'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setPerformanceFilter(mode)}
                    className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors ${
                      performanceFilter === mode
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {mode === 'all' ? 'All Students' : mode === 'at-risk' ? 'At-Risk Only' : 'Top Performers'}
                  </button>
                ))}
              </div>
            </div>

            {/* Counseling Notice Banner */}
            {counselingActionDone && (
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>{counselingActionDone}</span>
                </div>
                <button
                  onClick={() => setCounselingActionDone(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Performance List */}
            <div className="space-y-3">
              {performanceList
                .filter((p) => {
                  const matchesSearch =
                    p.studentName.toLowerCase().includes(performanceSearch.toLowerCase()) ||
                    p.rollNumber.toLowerCase().includes(performanceSearch.toLowerCase());
                  if (!matchesSearch) return false;
                  if (performanceFilter === 'at-risk') return p.riskLevel !== 'Low';
                  if (performanceFilter === 'top') return p.grade === 'O' || p.grade === 'A+';
                  return true;
                })
                .map((student) => (
                  <div
                    key={student.id}
                    className="bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-xs text-indigo-400 font-mono shrink-0">
                        {student.grade}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{student.studentName}</h4>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.2 rounded-full font-bold ${
                              student.riskLevel === 'High'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                : student.riskLevel === 'Medium'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            }`}
                          >
                            {student.riskLevel} Risk
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
                          <span>{student.rollNumber}</span>
                          <span aria-hidden="true">·</span>
                          <span className={student.attendancePercent < 75 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                            Attendance: {student.attendancePercent}%
                          </span>
                        </div>
                        {student.mentorNote && (
                          <p className="text-[11px] text-amber-300/80 bg-amber-950/30 p-2 rounded-lg border border-amber-900/40 mt-2">
                            ⚠️ {student.mentorNote}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 sm:gap-6 justify-between lg:justify-end">
                      <div className="text-center sm:text-right">
                        <span className="text-[10px] text-slate-400 font-mono block">Mid-Term (50)</span>
                        <span className="text-sm font-bold text-white">{student.midTermMarks}</span>
                      </div>
                      <div className="text-center sm:text-right">
                        <span className="text-[10px] text-slate-400 font-mono block">Lab (25)</span>
                        <span className="text-sm font-bold text-white">{student.labMarks}</span>
                      </div>
                      <div className="text-center sm:text-right">
                        <span className="text-[10px] text-slate-400 font-mono block">Quiz (25)</span>
                        <span className="text-sm font-bold text-white">{student.quizMarks}</span>
                      </div>
                      <div className="text-center sm:text-right">
                        <span className="text-[10px] text-indigo-400 font-mono block">Total Internal</span>
                        <span className="text-base font-extrabold text-indigo-300">{student.totalMarks} / 100</span>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => {
                            setCounselingActionDone(
                              `Academic advisory session scheduled with ${student.studentName} for Thursday 03:00 PM.`
                            );
                          }}
                          className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-semibold transition-colors"
                        >
                          Counseling
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. EXAMINATION VIEW */}
      {activeTab === 'examination' && (
        <div className="space-y-6">
          {/* Invigilation Schedule Section */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-indigo-400" />
                  Assigned Invigilation Duties — Mid-Semester Exams 2026
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Office of the Controller of Examinations (CoE)</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
                2 Upcoming Slots
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {invigilationDuties.map((duty) => (
                <div
                  key={duty.id}
                  className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-950 text-indigo-400 border border-indigo-900/40">
                        {duty.courseCode}
                      </span>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900/40">
                        {duty.role}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white">{duty.courseName}</h4>
                    <p className="text-[11px] text-slate-400">{duty.examType}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 space-y-1 text-xs text-slate-300 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Date:</span>
                      <span>{duty.date}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Timing:</span>
                      <span>{duty.time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Hall:</span>
                      <span className="text-indigo-300 font-bold">{duty.hallNumber}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Candidates:</span>
                      <span>{duty.candidateCount} Students</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Question Paper Moderation & Submissions */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
                  Question Paper Moderation & Scheme of Valuation
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Encrypted Academic Blueprint Submissions</p>
              </div>
            </div>

            <div className="space-y-3">
              {questionPapers.map((qp) => (
                <div
                  key={qp.id}
                  className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-950 text-indigo-400 border border-indigo-900/40">
                        {qp.courseCode}
                      </span>
                      <h4 className="text-sm font-bold text-white">{qp.courseName}</h4>
                    </div>
                    <p className="text-xs text-slate-400">
                      {qp.examType} • Submitted on {qp.submissionDate}
                    </p>
                    {qp.moderatedBy && (
                      <p className="text-[11px] text-emerald-400 font-mono flex items-center gap-1 mt-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {qp.moderatedBy}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold font-mono ${
                        qp.status === 'Approved & Sealed'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {qp.status}
                    </span>
                    <button className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold border border-slate-700 transition-colors">
                      View Blueprint
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Internal Marks Finalization Box */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-indigo-400" />
                  Freeze & Transmit Continuous Internal Assessment (CIA)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Finalize Semester 6 Internal Marks and submit digital ledger to CoE Office
                </p>
              </div>

              <button
                disabled={marksFrozen}
                onClick={() => {
                  setMarksFrozen(true);
                  setMarksFreezeNotice(
                    'Marks successfully encrypted and locked into University Examination Core Ledger! (Ref #COE-CIA-601-2026)'
                  );
                }}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-2 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>{marksFrozen ? 'Ledger Locked & Transmitted' : 'Freeze & Transmit to CoE'}</span>
              </button>
            </div>

            {marksFreezeNotice && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{marksFreezeNotice}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. NOTICES VIEW */}
      {activeTab === 'notices' && (
        <div className="space-y-6">
          {/* Broadcast Tool */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-400" />
                  Broadcast Push Announcement to Students
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Dispatches instant real-time notification to student mobile apps & dashboards</p>
              </div>
            </div>

            <form onSubmit={handleBroadcastAnnouncement} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Target Class</label>
                  <select
                    value={announcementCourse}
                    onChange={(e) => setAnnouncementCourse(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="CS601">CS601: Distributed Systems (36 Students)</option>
                    <option value="CS603">CS603: Machine Learning & NLP (34 Students)</option>
                    <option value="ALL">All Assigned Batches (70 Students)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Notice Headline</label>
                  <input
                    type="text"
                    required
                    value={announcementTitle}
                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                    placeholder="e.g. Lab 4 Assignment Deadline Extended..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Announcement Body</label>
                <textarea
                  rows={3}
                  required
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  placeholder="Detail instructions, reading materials, or room location updates..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {announcementSent && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Push broadcast successfully delivered to enrolled students!</span>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!announcementText.trim() || !announcementTitle.trim()}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Classroom Push Broadcast</span>
                </button>
              </div>
            </form>
          </div>

          {/* Department Circulars Feed */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  Official Department Circulars & Faculty Notices
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Faculty notices issued by Vice Chancellor, Deans & Registrars</p>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                {(['all', 'Academics', 'Examinations', 'Research', 'Administration'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setNoticeFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg capitalize font-medium transition-colors ${
                      noticeFilter === cat
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {departmentNotices
                .filter((n) => noticeFilter === 'all' || n.category === noticeFilter)
                .map((notice) => (
                  <div
                    key={notice.id}
                    className="bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 space-y-2 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {notice.urgent && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                              URGENT
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-900/40">
                            {notice.category}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">{notice.date}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white">{notice.title}</h4>
                      </div>
                      <span className="text-xs text-slate-400 font-mono shrink-0">{notice.issuedBy}</span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{notice.summary}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. APPLICATIONS VIEW (STUDENT APPLICATIONS & FACULTY APPLICATIONS) */}
      {activeTab === 'applications' && (
        <div className="space-y-6">
          {/* Top Sub-Tab View Toggle: Student Applications vs Faculty Applications */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
            <div className="grid grid-cols-2 sm:flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl w-full sm:w-fit">
              <button
                onClick={() => setApplicationsSubTab('student')}
                className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-2 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
                  applicationsSubTab === 'student'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Users className="w-4 h-4 shrink-0" />
                <span className="truncate">Student Apps</span>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-mono bg-white/20 text-white font-bold shrink-0">
                  {studentApplications.length}
                </span>
              </button>

              <button
                onClick={() => setApplicationsSubTab('faculty')}
                className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-2 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
                  applicationsSubTab === 'faculty'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Send className="w-4 h-4 shrink-0" />
                <span className="truncate">Faculty Apps</span>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-mono bg-white/20 text-white font-bold shrink-0">
                  {facultyApplications.length}
                </span>
              </button>
            </div>

            {applicationsSubTab === 'student' ? (
              <span className="text-xs text-slate-400 font-mono">
                Showing {filteredStudentApps.length} of {studentApplications.length} student submissions
              </span>
            ) : (
              <button
                onClick={() => setNewAppModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Submit Faculty Application</span>
              </button>
            )}
          </div>

          {/* ── Sub-Tab A: Student Applications ──────────────────────────── */}
          {applicationsSubTab === 'student' && (
            <div className="space-y-5">
              {/* Filter and Search Bar */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-3">
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search by student name, roll number, application ID, or keywords..."
                      value={studentAppSearch}
                      onChange={(e) => setStudentAppSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                    />
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                    <select
                      value={studentAppCategoryFilter}
                      onChange={(e) => setStudentAppCategoryFilter(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-400 font-medium"
                    >
                      <option value="all">All Categories</option>
                      <option value="Internship NOC">Internship NOC</option>
                      <option value="Medical Condonation">Medical Condonation</option>
                      <option value="Recommendation Letter (LOR)">Recommendation (LOR)</option>
                      <option value="Elective Swap">Elective Swap</option>
                      <option value="Scholarship Endorsement">Scholarship Endorsement</option>
                      <option value="Re-Evaluation">Re-Evaluation</option>
                    </select>

                    <select
                      value={studentAppStatusFilter}
                      onChange={(e) => setStudentAppStatusFilter(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-400 font-medium"
                    >
                      <option value="all">All Statuses</option>
                      <option value="Pending Review">Pending Review</option>
                      <option value="Approved">Approved</option>
                      <option value="Requires Clarification">Requires Clarification</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Toast Alert */}
              {appActionSuccessMsg && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{appActionSuccessMsg}</span>
                  </div>
                  <button onClick={() => setAppActionSuccessMsg(null)} className="text-slate-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Student Applications Cards Grid */}
              <div className="space-y-4">
                {filteredStudentApps.length === 0 ? (
                  <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center space-y-2">
                    <Users className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-sm font-semibold text-slate-300">No student applications match your filter.</p>
                    <p className="text-xs text-slate-500">Try adjusting your search criteria or category filter.</p>
                  </div>
                ) : (
                  filteredStudentApps.map((app) => (
                    <div
                      key={app.id}
                      className="bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 rounded-3xl p-5 shadow-xl transition-all space-y-4"
                    >
                      {/* Top Header Row */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-800/80">
                        <div className="flex items-start gap-3.5">
                          <img
                            src={app.avatar}
                            alt={app.studentName}
                            className="w-12 h-12 rounded-2xl object-cover border border-slate-700 shadow-sm shrink-0"
                          />
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-900/50">
                                {app.category}
                              </span>
                              {app.priority === 'Urgent' && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                                  URGENT
                                </span>
                              )}
                              <span className="text-[11px] text-slate-500 font-mono">
                                Ref: {app.applicationNumber}
                              </span>
                            </div>

                            <h3 className="text-base font-bold text-white mt-1">
                              {app.title}
                            </h3>

                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
                              <span className="font-semibold text-slate-200">{app.studentName}</span>
                              <span aria-hidden="true">·</span>
                              <span>{app.rollNumber}</span>
                              <span aria-hidden="true">·</span>
                              <span>Sem {app.semester}</span>
                              <span aria-hidden="true">·</span>
                              <span className="text-indigo-400 font-bold">CGPA: {app.cgpa}</span>
                              <span aria-hidden="true">·</span>
                              <span className={app.attendancePercent < 75 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                                Att: {app.attendancePercent}%
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold font-mono ${
                              app.status === 'Approved'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : app.status === 'Requires Clarification'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                            }`}
                          >
                            {app.status}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            Submitted: {app.submissionDate}
                          </span>
                        </div>
                      </div>

                      {/* Excerpt Body */}
                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 line-clamp-2">
                        {app.formalLetter.split('\n\n')[1] || app.formalLetter}
                      </p>

                      {/* Attached Documents Tags & Action Footer */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono">
                          <Paperclip className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span>Attachments ({app.attachedDocuments.length}):</span>
                          {app.attachedDocuments.map((doc, idx) => (
                            <span
                              key={idx}
                              onClick={() => setPreviewingDoc(doc.name)}
                              className="px-2 py-0.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-[11px] border border-slate-700/60 cursor-pointer flex items-center gap-1 transition-colors"
                              title="Click to preview attached proof"
                            >
                              <FileText className="w-3 h-3 text-indigo-400" />
                              <span className="truncate max-w-[150px]">{doc.name}</span>
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            onClick={() => setViewingStudentApp(app)}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 text-indigo-400" />
                            <span>View Full Application</span>
                          </button>

                          {app.status === 'Pending Review' && (
                            <button
                              onClick={() => handleApproveApplication(app.id)}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-all"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Endorse</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Endorsement stamp info if approved */}
                      {app.facultyEndorsement && (
                        <div className="text-xs text-emerald-300 font-mono bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-900/40 flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <span className="font-bold">Faculty Endorsement ({app.endorsedAt}):</span>{' '}
                            {app.facultyEndorsement}
                            {app.digitalSealHash && (
                              <span className="block text-[10px] text-emerald-400/70 mt-0.5 font-mono truncate">
                                Digital Seal: {app.digitalSealHash}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ── Sub-Tab B: Faculty Applications ──────────────────────────── */}
          {applicationsSubTab === 'faculty' && (
            <div className="space-y-6">
              {/* Faculty Leave Balances Header */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Casual Leave (CL)</span>
                  <p className="text-2xl font-bold text-white mt-1">8 / 12</p>
                  <span className="text-[11px] text-emerald-400 mt-1 block">8 Days Available</span>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-400">Duty Leave (DL)</span>
                  <p className="text-2xl font-bold text-indigo-300 mt-1">5 / 10</p>
                  <span className="text-[11px] text-slate-500 mt-1 block">Conferences & Academic</span>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400">Medical Leave</span>
                  <p className="text-2xl font-bold text-cyan-300 mt-1">10 / 15</p>
                  <span className="text-[11px] text-slate-500 mt-1 block">Accumulated balance</span>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400">Restricted Holidays</span>
                  <p className="text-2xl font-bold text-amber-300 mt-1">2 / 2</p>
                  <span className="text-[11px] text-slate-500 mt-1 block">RH entitlement</span>
                </div>
              </div>

              {/* Faculty Applications List */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Send className="w-5 h-5 text-indigo-400" />
                      My Faculty Applications & Requisitions
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Faculty leaves, research travel grants, and hardware procurement status</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {facultyApplications.map((app) => (
                    <div
                      key={app.id}
                      className="bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950 text-indigo-400 border border-indigo-900/40">
                            {app.applicationType}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">Applied: {app.appliedDate}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white">{app.title}</h4>
                        <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                          {app.duration && <span>{app.duration}</span>}
                          {app.substituteFaculty && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>Sub: {app.substituteFaculty}</span>
                            </>
                          )}
                        </div>
                        {app.approverRemarks && (
                          <p className="text-[11px] text-slate-400 italic mt-1">
                            &quot;{app.approverRemarks}&quot;
                          </p>
                        )}
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold font-mono ${
                            app.status === 'Approved'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {app.status}
                        </span>
                        {app.budgetOrDays && (
                          <span className="text-xs text-slate-400 font-mono">{app.budgetOrDays}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. STUDENT REQUESTS VIEW */}
      {activeTab === 'student-requests' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-indigo-400" />
                  Student Requests & Approval Queue
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Direct requests submitted by enrolled students requiring academic counselor & lab director action
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => {
                    navigate('/faculty/applications');
                    setApplicationsSubTab('student');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>See All Student Applications</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {studentApplications.map((app) => (
                <div
                  key={app.id}
                  className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 space-y-3 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <img
                        src={app.avatar}
                        alt={app.studentName}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-900/40">
                            {app.category}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">Ref: {app.applicationNumber}</span>
                        </div>
                        <h4 className="text-base font-bold text-white mt-1 flex items-center gap-2">
                          {app.studentName}
                          <span className="text-xs font-mono text-slate-400">({app.rollNumber})</span>
                        </h4>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold font-mono self-start sm:self-auto ${
                        app.status === 'Approved'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : app.status === 'Requires Clarification'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                    <strong className="text-indigo-300 block mb-0.5">{app.title}</strong>
                    {app.formalLetter.split('\n\n')[1] || app.formalLetter}
                  </p>

                  {app.attachedDocuments && app.attachedDocuments.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                      <FileCheck className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{app.attachedDocuments[0].name} ({app.attachedDocuments[0].size})</span>
                    </div>
                  )}

                  {app.facultyEndorsement && (
                    <div className="text-xs text-emerald-300 font-mono bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-900/40">
                      ✓ Faculty Action ({app.endorsedAt}): {app.facultyEndorsement}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-end gap-2">
                    <button
                      onClick={() => setViewingStudentApp(app)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Inspect Application Form</span>
                    </button>

                    {app.status === 'Pending Review' && (
                      <button
                        onClick={() => handleApproveApplication(app.id)}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm shadow-emerald-600/30 flex items-center gap-1.5 transition-all"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Sign & Approve Request</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. FACULTY PROFILE VIEW */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Profile Toast */}
          {profileSavedToast && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Faculty profile and departmental contact details updated successfully!</span>
              </div>
              <button onClick={() => setProfileSavedToast(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Profile Hero Card */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/20 rounded-3xl p-5 sm:p-7 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 relative z-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="relative shrink-0">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-indigo-400/50 shadow-xl"
                  />
                  <span
                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center"
                    title="Active On Campus"
                  >
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                      {currentUser.id}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono">
                      Tenured Professor
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono">
                      Ph.D. Supervisor
                    </span>
                  </div>

                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                      <span>{currentUser.name}</span>
                      <span className="text-base text-indigo-300 font-normal">Ph.D.</span>
                    </h1>
                    <p className="text-sm text-indigo-200/90 font-medium mt-0.5">
                      {currentUser.designation} · {currentUser.department}
                    </p>
                  </div>

                  {/* Contact Badges Row */}
                  <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-300 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <a href={`mailto:${profileEmail}`} className="hover:text-indigo-300 transition-colors">
                        {profileEmail}
                      </a>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>{profilePhone}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>{profileCabin}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>{profileOfficeHours}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 self-stretch sm:self-auto">
                <button
                  onClick={handleOpenEditProfile}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30 transition-all min-h-[44px]"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Bio & Office Hours</span>
                </button>

                <button
                  onClick={() => setIdCardModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-all min-h-[44px]"
                >
                  <QrCode className="w-4 h-4 text-indigo-400" />
                  <span>Digital Faculty ID Card</span>
                </button>
              </div>
            </div>

            {/* Bio summary block */}
            <div className="mt-5 pt-5 border-t border-slate-800/80 bg-slate-950/40 rounded-2xl p-4 border">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">
                Faculty Executive Statement
              </span>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                "{profileBio}"
              </p>
            </div>
          </div>

          {/* Academic & Research Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Experience</span>
              <p className="text-xl font-bold text-white mt-1">14+ Years</p>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Pedagogy & R&D</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Publications</span>
              <p className="text-xl font-bold text-indigo-300 mt-1">38 Papers</p>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">IEEE, ACM & Springer</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">h-Index</span>
              <p className="text-xl font-bold text-emerald-300 mt-1">19.0</p>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">1,420+ Citations</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Research Grants</span>
              <p className="text-xl font-bold text-amber-300 mt-1">₹1.85 Cr</p>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">MeitY, ISRO & DST</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Patents</span>
              <p className="text-xl font-bold text-purple-300 mt-1">2 Granted</p>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Edge AI & Consensus</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Ph.D. Scholars</span>
              <p className="text-xl font-bold text-cyan-300 mt-1">6 Scholars</p>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">3 Awarded, 3 Active</span>
            </div>
          </div>

          {/* Sub-Tab Navigation Bar */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto scrollbar-none">
            {[
              { id: 'overview', label: 'Academic & Courses', icon: BookOpen },
              { id: 'research', label: 'Research & Grants', icon: Award },
              { id: 'credentials', label: 'Qualifications & Honors', icon: GraduationCap },
              { id: 'security', label: 'Biometrics & Security', icon: ShieldCheck },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = profileSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setProfileSubTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all select-none min-h-[42px] ${
                    active
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sub-Tab 1: Academic & Courses */}
          {profileSubTab === 'overview' && (
            <div className="space-y-6">
              {/* Courses Taught This Semester */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-indigo-400" />
                      Active Teaching Load (Spring 2026 Semester)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      3 Course Modules · 11 Credits · 106 Total Enrolled Students
                    </p>
                  </div>
                  <span className="hidden sm:inline-block px-2.5 py-1 rounded-full text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 font-bold">
                    Curriculum Verified
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 hover:border-indigo-500/40 transition-colors space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        CS601 · 4 Credits
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">36 Enrolled</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Distributed Systems & Cloud</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Semester 6 CSE-A · Tech Block 402</p>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono border-t border-slate-800/80 pt-2 flex items-center justify-between">
                      <span>Mon/Wed 10:00 AM</span>
                      <span className="text-indigo-400 font-semibold">Active Classroom</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 hover:border-indigo-500/40 transition-colors space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        CS603 · 4 Credits
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">42 Enrolled</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Machine Learning & Neural Comp</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Semester 6 CSE-B · Tech Block 301</p>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono border-t border-slate-800/80 pt-2 flex items-center justify-between">
                      <span>Tue/Thu 11:30 AM</span>
                      <span className="text-slate-500">Scheduled</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 hover:border-indigo-500/40 transition-colors space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        CS702 · 3 Credits
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">28 Enrolled</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Advanced Cryptography & Consensus</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Semester 8 Elective · Research Lab 102</p>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono border-t border-slate-800/80 pt-2 flex items-center justify-between">
                      <span>Fri 2:00 PM – 5:00 PM</span>
                      <span className="text-slate-500">Lab & Seminar</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Departmental & Mentorship Roles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-indigo-400" />
                    Departmental & Institutional Governance
                  </h3>
                  <div className="space-y-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                      <strong className="text-white block">Chairperson, Board of Studies (CSE)</strong>
                      <span className="text-slate-400 text-[11px]">Leads curriculum revision aligning with AICTE 2026 guidelines</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                      <strong className="text-white block">Chief Coordinator, NBA & NAAC Accreditation</strong>
                      <span className="text-slate-400 text-[11px]">Overseeing institutional outcome-based education (OBE) metrics</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                      <strong className="text-white block">Academic Council Member</strong>
                      <span className="text-slate-400 text-[11px]">SmartUni Senate representative for Engineering & Technology</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-400" />
                    Student Mentorship & Campus Leadership
                  </h3>
                  <div className="space-y-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                      <strong className="text-white block">Faculty Proctor & Mentor (Batch 2022-2026)</strong>
                      <span className="text-slate-400 text-[11px]">18 Designated Student Wards in 3rd Year Computer Science</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                      <strong className="text-white block">Faculty Advisor, ACM Student Chapter</strong>
                      <span className="text-slate-400 text-[11px]">Guiding annual Hackathons, ICPC training camps & technical summits</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                      <strong className="text-white block">Disciplinary & Grievance Appeals Committee</strong>
                      <span className="text-slate-400 text-[11px]">Senior faculty arbiter for student academic appeals</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sub-Tab 2: Research, Patents & Sponsored Grants */}
          {profileSubTab === 'research' && (
            <div className="space-y-6">
              {/* Sponsored Projects Row */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  Government & Industry Funded Research Grants
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-amber-400 font-bold">ISRO NRSC</span>
                      <span className="text-xs font-mono font-bold text-emerald-400">₹48,00,000</span>
                    </div>
                    <h4 className="text-xs font-bold text-white">Geo-Spatial Edge AI for Autonomous Disaster Mapping</h4>
                    <p className="text-[11px] text-slate-400">Principal Investigator · Duration: 2024–2027</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-indigo-400 font-bold">MeitY R&D</span>
                      <span className="text-xs font-mono font-bold text-emerald-400">₹32,00,000</span>
                    </div>
                    <h4 className="text-xs font-bold text-white">High-Performance Zero-Knowledge Verification on Edge MCUs</h4>
                    <p className="text-[11px] text-slate-400">Principal Investigator · Duration: 2023–2026</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-purple-400 font-bold">DST-SERB</span>
                      <span className="text-xs font-mono font-bold text-emerald-400">₹65,00,000</span>
                    </div>
                    <h4 className="text-xs font-bold text-white">Decentralized Byzantine Consensus in Campus Fog Infrastructure</h4>
                    <p className="text-[11px] text-slate-400">Lead Investigator · Completed 2024</p>
                  </div>
                </div>
              </div>

              {/* Notable Publications */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  Selected Peer-Reviewed Research Publications (38 Total)
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      title: 'Fault-Tolerant Byzantine State Machine Replication on Heterogeneous Edge Nodes',
                      venue: 'IEEE Transactions on Cloud Computing (Vol. 13, Issue 2)',
                      year: '2025',
                      citations: 42,
                      doi: '10.1109/TCC.2025.339182',
                      badge: 'IEEE Journal',
                    },
                    {
                      title: 'Hybrid CNN-Transformer Architectures for Multi-Spectral Satellite Image Semantic Segmentation',
                      venue: 'ACM SIGSPATIAL International Conference on Advances in GIS',
                      year: '2024',
                      citations: 78,
                      doi: '10.1145/3604237.3626849',
                      badge: 'ACM Core A*',
                    },
                    {
                      title: 'Decentralized Proof-of-Authority Protocols for Smart Campus IoT Sensor Networks',
                      venue: 'Springer Journal of Supercomputing (Vol. 80, pp. 1120–1145)',
                      year: '2023',
                      citations: 114,
                      doi: '10.1007/s11227-023-05189-x',
                      badge: 'SCI Indexed',
                    },
                    {
                      title: 'Privacy-Preserving Facial Biometric Template Protection Using Homomorphic Signatures',
                      venue: 'Elsevier Computers & Security (Vol. 118, Article 102734)',
                      year: '2022',
                      citations: 186,
                      doi: '10.1016/j.cose.2022.102734',
                      badge: 'Q1 Top Tier',
                    },
                  ].map((pub, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {pub.badge}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">Year: {pub.year}</span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">{pub.title}</h4>
                        <p className="text-xs text-slate-400">{pub.venue}</p>
                        <span className="text-[10px] font-mono text-indigo-400 block">DOI: {pub.doi}</span>
                      </div>
                      <div className="text-left sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                        <span className="text-xs font-mono font-bold text-emerald-400 block">{pub.citations} Citations</span>
                        <span className="text-[10px] text-slate-500 font-mono">Scopus Indexed</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Patents Granted */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  Intellectual Property & Granted Patents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Patent No: IN-2025-410982-A (Granted)
                    </span>
                    <h4 className="text-xs font-bold text-white">System and Method for Tamper-Resistant Geofenced Biometric Proof in Edge Networks</h4>
                    <p className="text-[11px] text-slate-400">Assignee: SmartUni Digital Innovations · Granted: January 2025</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Patent No: IN-2023-110459-B (Granted)
                    </span>
                    <h4 className="text-xs font-bold text-white">Low-Latency Fault Tolerant Consensus Protocol for Distributed Microservices</h4>
                    <p className="text-[11px] text-slate-400">Assignee: SmartUni Digital Innovations · Granted: August 2023</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sub-Tab 3: Academic Qualifications & Honors */}
          {profileSubTab === 'credentials' && (
            <div className="space-y-6">
              {/* Education Timeline */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-indigo-400" />
                  Academic Pedigree & Degrees
                </h3>
                <div className="space-y-4 pt-1">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-900/50 border border-indigo-700/50 flex items-center justify-center font-bold text-indigo-300 font-mono text-xs shrink-0">
                      Ph.D.
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Ph.D. in Computer Science & Engineering</h4>
                      <p className="text-xs text-indigo-300 font-medium">Indian Institute of Technology (IIT) Bombay · 2008 – 2012</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Doctoral Dissertation: "Scalable Fault-Tolerant Consensus Protocols for Heterogeneous Cloud Systems" under Dr. K. Ramanathan.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-900/50 border border-indigo-700/50 flex items-center justify-center font-bold text-indigo-300 font-mono text-xs shrink-0">
                      M.Tech
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">M.Tech in Computer Technology</h4>
                      <p className="text-xs text-indigo-300 font-medium">Indian Institute of Technology (IIT) Delhi · 2005 – 2007</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        First Class with Distinction (CGPA: 9.6/10) · Institute Research Fellowship Awardee.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-900/50 border border-indigo-700/50 flex items-center justify-center font-bold text-indigo-300 font-mono text-xs shrink-0">
                      B.E.
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">B.E. (Hons) in Computer Science & Engineering</h4>
                      <p className="text-xs text-indigo-300 font-medium">National Institute of Technology (NIT) Bhopal · 2001 – 2005</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        University Gold Medalist · Ranked 1st in Graduating Class across all engineering faculties.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Honors & Awards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    Major Honors & Recognitions
                  </h3>
                  <div className="space-y-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <strong className="text-amber-300 block">Distinguished Faculty Award 2024</strong>
                      <span className="text-slate-400 text-[11px]">Conferred by SmartUni Board of Governors for exceptional research leadership</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <strong className="text-amber-300 block">IEEE Best Research Paper Award 2023</strong>
                      <span className="text-slate-400 text-[11px]">IEEE Cloud Computing Summit, Tokyo for Byzantine State Machine replication</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <strong className="text-amber-300 block">Excellence in Teaching & Student Mentorship 2021</strong>
                      <span className="text-slate-400 text-[11px]">Awarded based on student satisfaction survey (Rating: 4.92 / 5.0)</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-indigo-400" />
                    Professional Society Memberships
                  </h3>
                  <div className="space-y-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <strong className="text-white block">Senior Member, IEEE (SMIEEE)</strong>
                      <span className="text-slate-400 text-[11px]">Member ID: 91402894 · IEEE Computer Society & Cloud Community</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <strong className="text-white block">Life Member, Computer Society of India (CSI)</strong>
                      <span className="text-slate-400 text-[11px]">Life Membership No: LM-004829 · Active Voting Member</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <strong className="text-white block">Professional Member, ACM</strong>
                      <span className="text-slate-400 text-[11px]">ACM Member ID: 7492104 · SIGOPS & SIGCOMM Special Interest Groups</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sub-Tab 4: Biometrics & Security Credentials */}
          {profileSubTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Institutional Security & Biometric Trust Profile
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      SmartUni.Ai Zero-Trust Hardware & Biometric Identity Verification
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Security Level 4: Clear
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4 text-indigo-400" />
                        <h4 className="text-xs font-bold text-white">Geo-Facial Biometric Template</h4>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">Enrolled & Active</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      128-dimensional facial landmark embedding stored in secure enclave. Used for instant touchless classroom door unlocking and attendance session authorization.
                    </p>
                    <div className="text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800">
                      Template Hash: SHA256:4b9a8200fe913210bc84...d019
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-amber-400" />
                        <h4 className="text-xs font-bold text-white">Physical RFID Smart Access Badge</h4>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">Issued</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      MIFARE DESFire EV3 High-Security Campus NFC Token. Provides 24/7 access to Tech Block, Faculty Lounge, Server Room 104, and Research Labs.
                    </p>
                    <div className="text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800">
                      Badge Serial: RFID-8829-9941-FAC
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-purple-400" />
                        <h4 className="text-xs font-bold text-white">Multi-Factor Hardware Key (FIDO2)</h4>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">Bound</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Hardware FIDO2 Security Token paired with faculty account. Required for approving degree audits, mark sheets, and financial requisitions.
                    </p>
                    <div className="text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800">
                      Key Identity: YubiKey 5C NFC · Synced
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCheck className="w-4 h-4 text-cyan-400" />
                        <h4 className="text-xs font-bold text-white">Official Digital Signature Seal</h4>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">Valid until 2028</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Institutional cryptographic key used to digitally endorse student applications (NOC, LOR, medical condonations) with tamper-evident audit trails.
                    </p>
                    <div className="text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800">
                      Authority: SmartUni Digital CA Root (Cert #81024)
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setIdCardModalOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all min-h-[44px]"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Launch Digital Faculty ID Card Preview</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── MODAL: Full Student Application Review Dossier ───────────────── */}
      {viewingStudentApp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-5 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
            {/* Modal Official Institutional Header */}
            <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border-b border-indigo-900/40 p-4 sm:p-6 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-600/30 shrink-0">
                  SU
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-bold">
                      Institutional Student Application
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Ref: {viewingStudentApp.applicationNumber}
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-white mt-0.5 leading-snug">
                    {viewingStudentApp.title}
                  </h2>
                </div>
              </div>

              <button
                onClick={() => setViewingStudentApp(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
              {/* Applicant Dossier Box */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={viewingStudentApp.avatar}
                    alt={viewingStudentApp.studentName}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-indigo-500/40 shrink-0"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      {viewingStudentApp.studentName}
                      <span className="text-xs font-mono text-slate-400">({viewingStudentApp.rollNumber})</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {viewingStudentApp.program} • Semester {viewingStudentApp.semester}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <div>
                    <span className="text-slate-500 block text-[10px]">CGPA</span>
                    <span className="text-indigo-400 font-bold text-sm">{viewingStudentApp.cgpa} / 10</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Attendance</span>
                    <span
                      className={`font-bold text-sm ${
                        viewingStudentApp.attendancePercent < 75 ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {viewingStudentApp.attendancePercent}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Status</span>
                    <span
                      className={`font-bold text-xs ${
                        viewingStudentApp.status === 'Approved' ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {viewingStudentApp.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Formal Application Statement */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-indigo-300 font-mono uppercase tracking-wider">
                  Formal Application Letter & Statement of Need
                </h4>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                  {viewingStudentApp.formalLetter}
                </div>
              </div>

              {/* Attached Supporting Documents */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-indigo-300 font-mono uppercase tracking-wider">
                  Attached Official Proof & Documents ({viewingStudentApp.attachedDocuments.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {viewingStudentApp.attachedDocuments.map((doc, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                        <div className="truncate">
                          <p className="text-xs text-white font-medium truncate">{doc.name}</p>
                          <span className="text-[10px] text-slate-500 font-mono">{doc.size}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setPreviewingDoc(doc.name)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 text-xs font-semibold shrink-0"
                      >
                        Preview
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* In-Modal Document Preview Pane if requested */}
              {previewingDoc && (
                <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-900/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5 font-mono">
                      <FileCheck className="w-3.5 h-3.5" />
                      Document Viewer: {previewingDoc}
                    </span>
                    <button
                      onClick={() => setPreviewingDoc(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
                    <p className="text-emerald-400">✓ Digital Signature Verification: SHA-256 Validated</p>
                    <p className="text-slate-400">Issuer: Official Recognized Authority</p>
                    <p className="text-slate-400">File Integrity: Tamper-proof institutional hash match</p>
                    <p className="pt-2 text-slate-300">
                      [Document preview render: {previewingDoc} — Official institution seals and signatures verified by SmartUni Security Engine.]
                    </p>
                  </div>
                </div>
              )}

              {/* Existing Faculty Endorsement / Seal */}
              {viewingStudentApp.facultyEndorsement && (
                <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-900/50 space-y-1.5 text-xs text-emerald-300 font-mono">
                  <div className="flex items-center gap-2">
                    <CheckCheck className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold">Faculty Digital Seal & Approval Endorsement</span>
                  </div>
                  <p className="text-slate-200">{viewingStudentApp.facultyEndorsement}</p>
                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-emerald-400/80 pt-1">
                    <span>Approved At: {viewingStudentApp.endorsedAt}</span>
                    <span aria-hidden="true">·</span>
                    <span>Signatory: Prof. Rajesh Sharma</span>
                    {viewingStudentApp.digitalSealHash && (
                      <span className="block truncate max-w-md">Seal: {viewingStudentApp.digitalSealHash}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Faculty Action Station */}
              {viewingStudentApp.status !== 'Approved' && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <label className="block text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">
                    Add Faculty Endorsement Remarks
                  </label>
                  <textarea
                    rows={2}
                    value={appEndorsementRemarks}
                    onChange={(e) => setAppEndorsementRemarks(e.target.value)}
                    placeholder="Enter official remarks to accompany the faculty digital seal (e.g. Recommended and endorsed based on academic standing)..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleRejectApplication(viewingStudentApp.id)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                    >
                      Request Clarification / Return
                    </button>
                    <button
                      onClick={() => handleApproveApplication(viewingStudentApp.id)}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-all"
                    >
                      <Check className="w-4 h-4" />
                      <span>Digitally Endorse & Approve</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-950 border-t border-slate-800 p-4 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">
                SmartUni.Ai Digital Governance Framework v2.6
              </span>
              <button
                onClick={() => setViewingStudentApp(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Manual Attendance Override ────────────────────────────── */}
      {overrideModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                Faculty Manual Attendance Exemption
              </h3>
              <button
                onClick={() => setOverrideModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGrantOverride} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Student Candidate</label>
                <select
                  value={overrideStudentId}
                  onChange={(e) => {
                    setOverrideStudentId(e.target.value);
                    if (e.target.value === 'STU-9011') {
                      setOverrideStudentName('Zoya Khan');
                      setOverrideRoll('0827CS221088');
                    } else if (e.target.value === 'STU-8842') {
                      setOverrideStudentName('Faizan Ali');
                      setOverrideRoll('0827CS221045');
                    } else {
                      setOverrideStudentName('Aarav Patel');
                      setOverrideRoll('0827CS221002');
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="STU-9011">Zoya Khan (0827CS221088)</option>
                  <option value="STU-8842">Faizan Ali (0827CS221045)</option>
                  <option value="STU-8899">Aarav Patel (0827CS221002)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target Lecture</label>
                <input
                  type="text"
                  disabled
                  value={`${activeCourse.code}: ${activeCourse.name}`}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Formal Department Reason</label>
                <textarea
                  rows={2}
                  required
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="Official exemption reason..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {overrideSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                  {overrideSuccessMsg}
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOverrideModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold min-h-[44px]"
                >
                  Confirm Exemption
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: New Faculty Application ───────────────────────────────── */}
      {newAppModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-indigo-400" />
                Submit New Faculty Application
              </h3>
              <button
                onClick={() => setNewAppModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewApplication} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Application Type</label>
                <select
                  value={newAppType}
                  onChange={(e) => setNewAppType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Casual Leave">Casual Leave (CL)</option>
                  <option value="Duty Leave (Conference)">Duty Leave (Conference / Official)</option>
                  <option value="Research Grant">Research Grant & Travel Sponsorship</option>
                  <option value="Lab Requisition">Lab Equipment Requisition</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Subject / Title</label>
                <input
                  type="text"
                  required
                  value={newAppTitle}
                  onChange={(e) => setNewAppTitle(e.target.value)}
                  placeholder="e.g. Duty leave for presenting paper at IEEE ICC 2026"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Duration / Date Range</label>
                  <input
                    type="text"
                    value={newAppDuration}
                    onChange={(e) => setNewAppDuration(e.target.value)}
                    placeholder="e.g. 3 Days (Nov 4 - Nov 6)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Budget / Days</label>
                  <input
                    type="text"
                    value={newAppBudget}
                    onChange={(e) => setNewAppBudget(e.target.value)}
                    placeholder="e.g. ₹35,000 or 2 Days"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Substitute Faculty In-Charge</label>
                <input
                  type="text"
                  value={newAppSubstitute}
                  onChange={(e) => setNewAppSubstitute(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewAppModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold min-h-[44px]"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Edit Faculty Profile ──────────────────────────────────── */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-400" />
                Edit Faculty Profile & Contact Information
              </h3>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Executive Bio & Research Statement
                </label>
                <textarea
                  rows={4}
                  required
                  value={tempBio}
                  onChange={(e) => setTempBio(e.target.value)}
                  placeholder="Summarize your academic role, research domain, and lab leadership..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Office / Cabin Number</label>
                  <input
                    type="text"
                    required
                    value={tempCabin}
                    onChange={(e) => setTempCabin(e.target.value)}
                    placeholder="e.g. Tech Block B-402"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Direct Phone / Extension</label>
                  <input
                    type="text"
                    required
                    value={tempPhone}
                    onChange={(e) => setTempPhone(e.target.value)}
                    placeholder="e.g. +91 (0755) 289-4402"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Designated Office Hours</label>
                <input
                  type="text"
                  required
                  value={tempOfficeHours}
                  onChange={(e) => setTempOfficeHours(e.target.value)}
                  placeholder="e.g. Mon - Thu: 2:00 PM – 4:00 PM"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 min-h-[44px]"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Digital Faculty ID Card ───────────────────────────────── */}
      {idCardModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden my-auto space-y-4">
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <QrCode className="w-4 h-4 text-indigo-400" />
                Institutional Digital Faculty Pass
              </h3>
              <button
                onClick={() => setIdCardModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated High-Security Digital Card */}
            <div className="px-4 sm:px-6">
              <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 border-2 border-indigo-500/40 rounded-3xl p-5 shadow-2xl relative overflow-hidden space-y-4 text-white">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />

                {/* Card Top: Crest & University Name */}
                <div className="flex items-center justify-between border-b border-indigo-800/40 pb-3">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest uppercase text-indigo-400 font-bold block">
                      SmartUni.Ai Digital Campus
                    </span>
                    <h4 className="text-xs font-extrabold tracking-wider uppercase text-slate-200">
                      Faculty Identification Card
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Active Valid
                  </span>
                </div>

                {/* Middle: Photo & Core Data */}
                <div className="flex items-center gap-4">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-400 shadow-md shrink-0"
                  />
                  <div className="space-y-0.5 truncate">
                    <h4 className="text-sm font-bold text-white truncate">
                      {currentUser.name}, Ph.D.
                    </h4>
                    <p className="text-[11px] text-indigo-300 font-medium truncate">
                      Professor & Head of Dept.
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      Computer Science & Engineering
                    </p>
                    <span className="inline-block text-[10px] font-mono font-bold text-amber-300 bg-amber-500/10 px-1.5 py-0.2 rounded mt-0.5">
                      ID: {currentUser.id}
                    </span>
                  </div>
                </div>

                {/* Bottom: QR Code & Security Specifications */}
                <div className="bg-slate-950/80 p-3 rounded-2xl border border-indigo-950 flex items-center justify-between gap-3 text-[10px] font-mono">
                  <div className="space-y-0.5 text-slate-400">
                    <p><strong className="text-slate-200">Cabin:</strong> {profileCabin}</p>
                    <p><strong className="text-slate-200">Clearance:</strong> Level 4 (Server/Lab)</p>
                    <p><strong className="text-slate-200">RFID:</strong> 8829-9941-FAC</p>
                    <p className="text-[9px] text-indigo-400 pt-0.5">Valid Thru: Dec 2028</p>
                  </div>
                  <div className="bg-white p-1.5 rounded-xl shrink-0 shadow">
                    <QrCode className="w-12 h-12 text-slate-950" />
                  </div>
                </div>

                {/* Microprint security footer */}
                <div className="text-[9px] text-slate-400/80 font-mono text-center">
                  Tamper-evident cryptographically signed by SmartUni Registrar
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 sm:p-5 border-t border-slate-800 flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                NFC & Gate Scan Enabled
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => setIdCardModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Pass</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
