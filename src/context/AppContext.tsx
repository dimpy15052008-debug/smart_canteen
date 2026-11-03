import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  UserRole,
  AttendanceRecord,
  CourseSchedule,
  CanteenMenuItem,
  CanteenOrder,
  CertificateRequest,
  HelpdeskTicket,
  ExamRecord,
  FeeInvoice,
  BusRoute,
  AuditLog,
  NotificationItem
} from '../types';
import {
  MOCK_STUDENT,
  MOCK_FACULTY,
  MOCK_ADMIN,
  MOCK_CANTEEN_STAFF,
  MOCK_COURSES,
  MOCK_ATTENDANCE_RECORDS,
  MOCK_CANTEEN_MENU,
  MOCK_CANTEEN_ORDERS,
  MOCK_CERTIFICATES,
  MOCK_HELPDESK_TICKETS,
  MOCK_EXAMS,
  MOCK_FEES,
  MOCK_BUS_ROUTES,
  MOCK_NOTIFICATIONS,
  MOCK_AUDIT_LOGS
} from '../mock/campusData';

interface AppContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentUser: UserProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  
  // Data states
  courses: CourseSchedule[];
  attendanceRecords: AttendanceRecord[];
  canteenMenu: CanteenMenuItem[];
  canteenOrders: CanteenOrder[];
  certificateRequests: CertificateRequest[];
  helpdeskTickets: HelpdeskTicket[];
  exams: ExamRecord[];
  feeInvoices: FeeInvoice[];
  busRoutes: BusRoute[];
  notifications: NotificationItem[];
  auditLogs: AuditLog[];

  // Action methods
  markAttendance: (record: Omit<AttendanceRecord, 'id'>) => AttendanceRecord;
  createCanteenOrder: (items: { itemId: string; name: string; price: number; quantity: number }[], pickupTime: string, paymentMethod: 'UPI' | 'Card' | 'CampusWallet') => CanteenOrder;
  updateOrderStatus: (orderId: string, status: CanteenOrder['status']) => void;
  createCertificateRequest: (type: CertificateRequest['certificateType'], purpose: string) => CertificateRequest;
  approveCertificate: (certificateId: string) => void;
  createHelpdeskTicket: (ticket: Omit<HelpdeskTicket, 'id' | 'ticketNumber' | 'createdAt' | 'status' | 'escalationCount'>) => HelpdeskTicket;
  resolveHelpdeskTicket: (ticketId: string, notes: string) => void;
  payFees: (invoiceId: string, amount: number) => void;
  markNotificationRead: (id: string) => void;
  
  // Faculty attendance session state
  facultySessionActive: boolean;
  setFacultySessionActive: (active: boolean) => void;
  activeCourseId: string;
  setActiveCourseId: (courseId: string) => void;
  
  // Judge Demo Tour
  isJudgeTourOpen: boolean;
  setIsJudgeTourOpen: (open: boolean) => void;
  startDemoTour: () => void;

  // Theme
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRoleState] = useState<UserRole>(() => {
    try {
      const stored = localStorage.getItem('smartuni_role');
      if (stored === 'faculty' || stored === 'admin' || stored === 'canteen' || stored === 'student') {
        return stored as UserRole;
      }
    } catch {
      // ignore
    }
    return 'student';
  });

  const setCurrentRole = (role: UserRole) => {
    setCurrentRoleState(role);
    try {
      localStorage.setItem('smartuni_role', role);
      if (!localStorage.getItem('smartuni_token')) {
        localStorage.setItem('smartuni_token', `smartuni-jwt-${role}-${Date.now()}`);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const handleRoleChange = (e: Event) => {
      const customEvent = e as CustomEvent<UserRole>;
      const newRole = customEvent.detail;
      if (newRole && ['student', 'faculty', 'admin', 'canteen'].includes(newRole)) {
        setCurrentRoleState(newRole);
      }
    };
    window.addEventListener('smartuni:rolechange', handleRoleChange);
    return () => window.removeEventListener('smartuni:rolechange', handleRoleChange);
  }, []);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isJudgeTourOpen, setIsJudgeTourOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('smartuni_theme');
      return saved === 'light' || saved === 'dark' ? saved : 'dark';
    } catch (e) {
      return 'dark';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('smartuni_theme', theme);
    } catch (e) {
      // ignore
    }
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Data collections
  const [courses] = useState<CourseSchedule[]>(MOCK_COURSES);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(MOCK_ATTENDANCE_RECORDS);
  const [canteenMenu, setCanteenMenu] = useState<CanteenMenuItem[]>(MOCK_CANTEEN_MENU);
  const [canteenOrders, setCanteenOrders] = useState<CanteenOrder[]>(MOCK_CANTEEN_ORDERS);
  const [certificateRequests, setCertificateRequests] = useState<CertificateRequest[]>(MOCK_CERTIFICATES);
  const [helpdeskTickets, setHelpdeskTickets] = useState<HelpdeskTicket[]>(MOCK_HELPDESK_TICKETS);
  const [exams] = useState<ExamRecord[]>(MOCK_EXAMS);
  const [feeInvoices, setFeeInvoices] = useState<FeeInvoice[]>(MOCK_FEES);
  const [busRoutes, setBusRoutes] = useState<BusRoute[]>(MOCK_BUS_ROUTES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);

  // Faculty session
  const [facultySessionActive, setFacultySessionActive] = useState<boolean>(true);
  const [activeCourseId, setActiveCourseId] = useState<string>('CS601');

  // Compute active user profile based on role
  const currentUser: UserProfile =
    currentRole === 'student'
      ? MOCK_STUDENT
      : currentRole === 'faculty'
      ? MOCK_FACULTY
      : currentRole === 'admin'
      ? MOCK_ADMIN
      : MOCK_CANTEEN_STAFF;

  // Real-time bus simulation (subtle coordinates and ETA changes)
  useEffect(() => {
    const timer = setInterval(() => {
      setBusRoutes(prev =>
        prev.map(b => ({
          ...b,
          speedKmH: Math.floor(28 + Math.random() * 12),
          coordinates: {
            lat: b.coordinates.lat + (Math.random() - 0.5) * 0.0005,
            lng: b.coordinates.lng + (Math.random() - 0.5) * 0.0005,
          },
        }))
      );
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  // Action: Mark Attendance
  const markAttendance = (recordData: Omit<AttendanceRecord, 'id'>): AttendanceRecord => {
    const newRecord: AttendanceRecord = {
      ...recordData,
      id: `att-${Date.now()}`,
    };
    setAttendanceRecords(prev => [newRecord, ...prev]);

    // Add Audit Log
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      action: 'ATTENDANCE_VERIFIED_GEO_FACE',
      performedBy: `${newRecord.studentName} (${currentRole})`,
      role: currentRole,
      targetEntity: 'AttendanceSession',
      entityId: `${newRecord.courseId}-${newRecord.date}`,
      details: `Geofence Verified: ${newRecord.locationVerified}. Face Score: ${newRecord.faceConfidence}%. Liveness: ${newRecord.livenessVerified}`,
      timestamp: `${newRecord.date} ${newRecord.time}`,
      ipAddress: '10.24.112.92 (Room 402 Biometric Terminal)',
    };
    setAuditLogs(prev => [newLog, ...prev]);

    // Push Notification
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: 'Attendance Confirmed ✅',
        message: `Successfully marked present for ${newRecord.courseName} with Face & Geo verification!`,
        type: 'attendance',
        timestamp: 'Just now',
        read: false,
        actionLink: 'smart-attend',
      },
      ...prev,
    ]);

    return newRecord;
  };

  // Action: Create Canteen Order
  const createCanteenOrder = (
    items: { itemId: string; name: string; price: number; quantity: number }[],
    pickupTime: string,
    paymentMethod: 'UPI' | 'Card' | 'CampusWallet'
  ): CanteenOrder => {
    const tokenNum = `A-${Math.floor(106 + Math.random() * 40)}`;
    const total = items.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

    const newOrder: CanteenOrder = {
      id: `ord-${Date.now()}`,
      tokenNumber: tokenNum,
      studentId: currentUser.id,
      studentName: currentUser.name,
      items,
      totalAmount: total,
      pickupTime,
      orderTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'new',
      paymentStatus: 'paid',
      paymentMethod,
      qrCodeValue: `SMARTUNI-ORDER-${tokenNum}-${currentUser.id}`,
      counterNumber: Math.random() > 0.5 ? 1 : 2,
    };

    setCanteenOrders(prev => [newOrder, ...prev]);

    // Add Audit Log
    setAuditLogs(prev => [
      {
        id: `log-${Date.now()}`,
        action: 'CANTEEN_PREORDER_PLACED',
        performedBy: currentUser.name,
        role: currentRole,
        targetEntity: 'CanteenOrder',
        entityId: newOrder.tokenNumber,
        details: `Pre-ordered ${items.length} item(s) for ₹${total} via ${paymentMethod}. Pickup at ${pickupTime}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        ipAddress: '10.24.110.15',
      },
      ...prev,
    ]);

    // Push notification
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: `Order Placed: Token #${tokenNum}`,
        message: `Your food order has been sent to the Central Canteen. Pickup scheduled for ${pickupTime}.`,
        type: 'canteen',
        timestamp: 'Just now',
        read: false,
        actionLink: 'canteen',
      },
      ...prev,
    ]);

    return newOrder;
  };

  // Action: Update Order Status
  const updateOrderStatus = (orderId: string, status: CanteenOrder['status']) => {
    setCanteenOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          const updated = { ...ord, status };
          // Push notification if ready
          if (status === 'ready') {
            setNotifications(n => [
              {
                id: `notif-${Date.now()}`,
                title: `Order Ready! 🍔 Token #${ord.tokenNumber}`,
                message: `Please collect your food at Counter #${ord.counterNumber || 1}. Show your QR code.`,
                type: 'canteen',
                timestamp: 'Just now',
                read: false,
                actionLink: 'canteen',
              },
              ...n,
            ]);
          }
          return updated;
        }
        return ord;
      })
    );
  };

  // Action: Create Certificate Request
  const createCertificateRequest = (
    certificateType: CertificateRequest['certificateType'],
    purpose: string
  ): CertificateRequest => {
    const newReq: CertificateRequest = {
      id: `crt-${Date.now()}`,
      studentId: currentUser.id,
      studentName: currentUser.name,
      rollNumber: currentUser.rollNumber || '0827CS221045',
      program: currentUser.program || 'B.Tech CSE',
      certificateType,
      purpose,
      requestedDate: new Date().toISOString().split('T')[0],
      status: 'pending_verification',
      qrVerificationUrl: `https://smartuni.ai/verify-certificate?id=CRT-${Date.now()}`,
      documentHash: `SHA256:${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      academicYear: '2025 - 2026',
    };

    setCertificateRequests(prev => [newReq, ...prev]);

    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: `Certificate Requested: ${certificateType}`,
        message: 'Application submitted. Automatically forwarded to Dean of Academics for digital sign-off.',
        type: 'certificate',
        timestamp: 'Just now',
        read: false,
        actionLink: 'certificates',
      },
      ...prev,
    ]);

    return newReq;
  };

  // Action: Approve Certificate (Admin)
  const approveCertificate = (certificateId: string) => {
    setCertificateRequests(prev =>
      prev.map(c => {
        if (c.id === certificateId) {
          return {
            ...c,
            status: 'ready_for_download',
            verifiedBy: 'Dr. Sunita Verma (Dean of Academics)',
            approvedDate: new Date().toISOString().split('T')[0],
          };
        }
        return c;
      })
    );

    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: 'Certificate Approved & Signed 📜',
        message: 'Your official certificate has been signed and is ready for high-resolution download with verifiable QR code.',
        type: 'certificate',
        timestamp: 'Just now',
        read: false,
        actionLink: 'certificates',
      },
      ...prev,
    ]);
  };

  // Action: Create Helpdesk Ticket
  const createHelpdeskTicket = (
    ticketData: Omit<HelpdeskTicket, 'id' | 'ticketNumber' | 'createdAt' | 'status' | 'escalationCount'>
  ): HelpdeskTicket => {
    const ticketNo = `TKT-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newTicket: HelpdeskTicket = {
      ...ticketData,
      id: `tkt-${Date.now()}`,
      ticketNumber: ticketNo,
      createdAt: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      status: 'open',
      escalationCount: 0,
    };

    setHelpdeskTickets(prev => [newTicket, ...prev]);

    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: `Grievance Logged: ${ticketNo}`,
        message: `Assigned to ${ticketData.assignedDepartment} with SLA: ${ticketData.slaDeadline}.`,
        type: 'helpdesk',
        timestamp: 'Just now',
        read: false,
        actionLink: 'helpdesk',
      },
      ...prev,
    ]);

    return newTicket;
  };

  // Action: Resolve Helpdesk Ticket
  const resolveHelpdeskTicket = (ticketId: string, notes: string) => {
    setHelpdeskTickets(prev =>
      prev.map(t => {
        if (t.id === ticketId) {
          return {
            ...t,
            status: 'resolved',
            resolutionNotes: notes,
            resolvedAt: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
          };
        }
        return t;
      })
    );
  };

  // Action: Pay Fees
  const payFees = (invoiceId: string, amount: number) => {
    const txn = `TXN-UPI-${Math.floor(10000000 + Math.random() * 90000000)}`;
    setFeeInvoices(prev =>
      prev.map(inv => {
        if (inv.id === invoiceId) {
          const newPaid = inv.paidAmount + amount;
          return {
            ...inv,
            paidAmount: newPaid,
            status: newPaid >= inv.totalAmount ? 'paid' : 'partial',
            paymentDate: new Date().toISOString().split('T')[0],
            transactionId: txn,
          };
        }
        return inv;
      })
    );

    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: 'Fee Payment Successful 💳',
        message: `₹${amount.toLocaleString()} received under Txn #${txn}. Official receipt is now downloadable.`,
        type: 'system',
        timestamp: 'Just now',
        read: false,
        actionLink: 'fees',
      },
      ...prev,
    ]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const startDemoTour = () => {
    setIsJudgeTourOpen(true);
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        currentUser,
        activeTab,
        setActiveTab,
        courses,
        attendanceRecords,
        canteenMenu,
        canteenOrders,
        certificateRequests,
        helpdeskTickets,
        exams,
        feeInvoices,
        busRoutes,
        notifications,
        auditLogs,
        markAttendance,
        createCanteenOrder,
        updateOrderStatus,
        createCertificateRequest,
        approveCertificate,
        createHelpdeskTicket,
        resolveHelpdeskTicket,
        payFees,
        markNotificationRead,
        facultySessionActive,
        setFacultySessionActive,
        activeCourseId,
        setActiveCourseId,
        isJudgeTourOpen,
        setIsJudgeTourOpen,
        startDemoTour,
        theme,
        toggleTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
