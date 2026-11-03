import { Router, Request, Response } from 'express';
import {
  UserProfile,
  UserRole,
  AttendanceRecord,
  CanteenOrder,
  CertificateRequest,
  HelpdeskTicket,
  FeeInvoice,
  NotificationItem,
} from './src/types';

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
  MOCK_AUDIT_LOGS,
} from './src/mock/campusData';

export const apiV1Router = Router();

// In-Memory state for mutations
let attendanceList: AttendanceRecord[] = [...MOCK_ATTENDANCE_RECORDS];
let canteenOrderList: CanteenOrder[] = [...MOCK_CANTEEN_ORDERS];
let walletBalance = 450.0;
let certificateList: CertificateRequest[] = [...MOCK_CERTIFICATES];
let ticketList: HelpdeskTicket[] = [...MOCK_HELPDESK_TICKETS];
let notificationList: NotificationItem[] = [...MOCK_NOTIFICATIONS];
let feeInvoices: FeeInvoice[] = [...MOCK_FEES];

let activeSessions: any[] = [
  {
    id: 'ses-active-1',
    courseId: 'CS601',
    courseName: 'Distributed Systems & Cloud Computing',
    facultyId: 'FAC-102',
    facultyName: 'Prof. Rajesh Sharma',
    roomId: 'Room 402 - Tech Block',
    coordinates: { lat: 23.2599, lng: 77.4126, radiusMeters: 50 },
    startTime: new Date().toISOString(),
    status: 'active',
    durationMinutes: 60,
    presentCount: 28,
    totalEnrolled: 36,
  },
];

let interventionsList: any[] = [
  {
    id: 'intv-001',
    predictionId: 'pred-8842',
    studentId: 'STU-8842',
    studentName: 'Faizan Ali',
    riskLevel: 'Medium',
    course: 'CS604: Software Engineering',
    category: 'Attendance Shortage Risk',
    notes: 'Counseling scheduled with academic mentor regarding attendance shortfall in CS604.',
    status: 'In Progress',
    createdAt: new Date().toISOString(),
  },
];

const getUserByRole = (role: string): UserProfile => {
  if (role === 'faculty') return MOCK_FACULTY;
  if (role === 'admin') return MOCK_ADMIN;
  if (role === 'canteen') return MOCK_CANTEEN_STAFF;
  return MOCK_STUDENT;
};

// ── Auth Routes ─────────────────────────────────────────────────────────────
apiV1Router.get('/auth/status', (req: Request, res: Response) => {
  res.json({
    authenticated: true,
    mode: 'dev',
    devLoginEnabled: true,
    platform: 'SmartUni.Ai Core',
  });
});

apiV1Router.post('/auth/dev-login', (req: Request, res: Response) => {
  const role = (req.body?.role as UserRole) || 'student';
  const user = getUserByRole(role);
  const token = `smartuni-jwt-${role}-${Date.now()}`;
  res.json({
    accessToken: token,
    access_token: token,
    tokenType: 'bearer',
    user,
  });
});

apiV1Router.post('/auth/login', (req: Request, res: Response) => {
  const { identifier, password, expectedRole } = req.body || {};
  if (!identifier || !String(identifier).trim()) {
    return res.status(400).json({ detail: 'Identifier (Email, Roll Number, or Staff ID) is required' });
  }
  if (!password || !String(password).trim()) {
    return res.status(400).json({ detail: 'Password is required' });
  }

  let targetRole: UserRole = expectedRole || 'student';
  const idLower = String(identifier).toLowerCase().trim();
  if (idLower.includes('admin') || idLower.includes('sunita') || idLower.startsWith('adm')) {
    targetRole = 'admin';
  } else if (idLower.includes('faculty') || idLower.includes('prof') || idLower.includes('rajesh') || idLower.startsWith('fac')) {
    targetRole = 'faculty';
  } else if (idLower.includes('canteen') || idLower.includes('ramesh') || idLower.startsWith('can')) {
    targetRole = 'canteen';
  } else if (idLower.includes('student') || idLower.includes('faizan') || idLower.startsWith('stu') || idLower.includes('0827cs') || idLower.startsWith('enr')) {
    targetRole = 'student';
  }

  const user = getUserByRole(targetRole);
  const token = `smartuni-jwt-${targetRole}-${Date.now()}`;
  res.json({
    accessToken: token,
    access_token: token,
    tokenType: 'bearer',
    user,
  });
});

apiV1Router.post('/auth/logout', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

apiV1Router.get('/auth/me', (req: Request, res: Response) => {
  const authHeader = (req.headers.authorization || '').toLowerCase();
  const roleHeader = String(req.headers['x-role'] || req.query.role || '').toLowerCase();
  let role = 'student';

  if (roleHeader === 'faculty' || authHeader.includes('faculty')) role = 'faculty';
  else if (roleHeader === 'admin' || authHeader.includes('admin')) role = 'admin';
  else if (roleHeader === 'canteen' || authHeader.includes('canteen')) role = 'canteen';
  else if (roleHeader === 'student' || authHeader.includes('student')) role = 'student';

  res.json(getUserByRole(role));
});

// ── Academics & Students ────────────────────────────────────────────────────
apiV1Router.get('/courses/me', (req: Request, res: Response) => {
  res.json(MOCK_COURSES);
});

apiV1Router.get('/exams/me', (req: Request, res: Response) => {
  res.json(MOCK_EXAMS);
});

apiV1Router.get('/students/me', (req: Request, res: Response) => {
  res.json({
    profile: MOCK_STUDENT,
    gpa: 8.74,
    completedCredits: 112,
    totalCredits: 160,
    semester: 6,
    attendanceOverview: {
      overallPercentage: 86.4,
      totalClasses: 167,
      attendedClasses: 143,
      detentionRiskCount: 1,
    },
    feeStatus: {
      total: 85000,
      paid: 70000,
      pending: 15000,
      dueDate: '2026-10-15',
    },
    nextExam: MOCK_EXAMS[0],
    todayClasses: MOCK_COURSES.slice(0, 3),
  });
});

// ── Attendance Routes ───────────────────────────────────────────────────────
apiV1Router.get('/attendance/summary/me', (req: Request, res: Response) => {
  res.json({
    overallPercentage: 86.4,
    totalLectures: 167,
    attendedLectures: 143,
    status: 'Safe',
    courses: MOCK_COURSES.map(c => ({
      code: c.code,
      name: c.name,
      percentage: c.attendancePercent,
      attended: c.attendedClasses,
      total: c.totalClasses,
      status: c.attendancePercent < 75 ? 'At Risk' : 'Safe',
    })),
  });
});

apiV1Router.get('/attendance/history/me', (req: Request, res: Response) => {
  res.json(attendanceList);
});

apiV1Router.post('/attendance/mark', (req: Request, res: Response) => {
  const { sessionId, latitude, longitude, faceConfidence, livenessVerified, verificationMethod } = req.body || {};
  const isPresent = (livenessVerified ?? true) && (faceConfidence ?? 98) >= 80;

  const newRecord: AttendanceRecord = {
    id: `att-${Date.now()}`,
    studentId: 'STU-8842',
    studentName: 'Faizan Ali',
    rollNumber: '0827CS221045',
    courseId: 'CS601',
    courseName: 'Distributed Systems & Cloud Computing',
    facultyId: 'FAC-102',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: isPresent ? 'present' : 'absent',
    verificationMethod: (verificationMethod as any) || 'geo_face_liveness',
    locationVerified: Boolean(latitude && longitude),
    coordinates: latitude && longitude ? { lat: Number(latitude), lng: Number(longitude), accuracy: 3.5 } : undefined,
    faceConfidence: Number(faceConfidence) || 98.6,
    livenessVerified: Boolean(livenessVerified ?? true),
    notes: isPresent ? `Verified by AI Biometric Liveness & Campus Geofence (${sessionId || 'Live Session'})` : 'Verification failed criteria',
  };

  attendanceList = [newRecord, ...attendanceList];
  res.json(newRecord);
});

apiV1Router.get('/attendance/sessions/active', (req: Request, res: Response) => {
  res.json(activeSessions);
});

apiV1Router.post('/attendance/sessions', (req: Request, res: Response) => {
  const { courseId, roomId, durationMinutes = 60 } = req.body || {};
  const course = MOCK_COURSES.find(c => c.id === courseId || c.code === courseId) || MOCK_COURSES[0];
  const newSession = {
    id: `ses-${Date.now()}`,
    courseId: course.code,
    courseName: course.name,
    facultyId: 'FAC-102',
    facultyName: 'Prof. Rajesh Sharma',
    roomId: roomId || 'Room 402 - Tech Block',
    coordinates: { lat: 23.2599, lng: 77.4126, radiusMeters: 50 },
    startTime: new Date().toISOString(),
    status: 'active',
    durationMinutes: Number(durationMinutes) || 60,
    presentCount: 0,
    totalEnrolled: 36,
  };
  activeSessions = [newSession, ...activeSessions];
  res.json(newSession);
});

apiV1Router.post('/attendance/sessions/:id/close', (req: Request, res: Response) => {
  const { id } = req.params;
  activeSessions = activeSessions.filter(s => s.id !== id);
  res.json({ success: true, message: `Session ${id} closed.` });
});

apiV1Router.post('/attendance/override', (req: Request, res: Response) => {
  const { recordId, justification } = req.body || {};
  const record = attendanceList.find(r => r.id === recordId);
  if (record) {
    record.status = 'present';
    record.notes = `Manual Override by Faculty: ${justification || 'Excused Absence'}`;
  }
  res.json({ success: true, record });
});

apiV1Router.get('/attendance/sessions/:id/roster', (req: Request, res: Response) => {
  res.json({
    sessionId: req.params.id,
    students: [
      { id: 'STU-8842', name: 'Faizan Ali', rollNumber: '0827CS221045', status: 'present', markedAt: '10:04 AM' },
      { id: 'STU-8843', name: 'Aarav Patel', rollNumber: '0827CS221046', status: 'present', markedAt: '10:05 AM' },
      { id: 'STU-8844', name: 'Priya Sharma', rollNumber: '0827CS221047', status: 'absent', markedAt: null },
    ],
  });
});

// ── Fees & Payments ─────────────────────────────────────────────────────────
apiV1Router.get('/fees/invoices/me', (req: Request, res: Response) => {
  res.json(feeInvoices);
});

apiV1Router.post('/fees/invoices/:id/pay', (req: Request, res: Response) => {
  const { id } = req.params;
  const { amount } = req.body || {};
  res.json({
    success: true,
    invoiceId: id,
    razorpayOrderId: `order_${Date.now()}`,
    amount: Number(amount) || 15000,
    currency: 'INR',
    keyId: 'rzp_test_campus_mock',
  });
});

apiV1Router.post('/fees/payments/verify', (req: Request, res: Response) => {
  const { invoiceId, razorpayPaymentId } = req.body || {};
  const invoice = feeInvoices.find(f => f.id === invoiceId);
  if (invoice) {
    invoice.paidAmount = invoice.totalAmount;
    invoice.status = 'paid';
  }
  res.json({
    success: true,
    paymentId: razorpayPaymentId || `pay_${Date.now()}`,
    status: 'Captured',
    message: 'Payment verified and credited to University Treasury.',
  });
});

apiV1Router.get('/fees/payments/:id/receipt', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <html>
      <body style="font-family: sans-serif; padding: 40px; text-align: center;">
        <h2>SmartUni.Ai — Official E-Receipt</h2>
        <p>Payment ID: ${req.params.id}</p>
        <p>Student: Faizan Ali (STU-8842)</p>
        <p>Status: <strong>PAID IN FULL</strong></p>
        <p>Date: ${new Date().toLocaleDateString()}</p>
      </body>
    </html>
  `);
});

// ── Helpdesk ────────────────────────────────────────────────────────────────
apiV1Router.get('/helpdesk/tickets', (req: Request, res: Response) => {
  res.json(ticketList);
});

apiV1Router.post('/helpdesk/tickets', (req: Request, res: Response) => {
  const { subject, category, priority, description } = req.body || {};
  const newTicket: HelpdeskTicket = {
    id: `tkt-${Date.now()}`,
    ticketNumber: `TKT-2026-${Math.floor(100 + Math.random() * 900)}`,
    studentId: 'STU-8842',
    studentName: 'Faizan Ali',
    rollNumber: '0827CS221045',
    subject: subject || 'Campus Inquiry',
    description: description || '',
    category: (category as any) || 'IT & Wi-Fi',
    priority: (priority as any) || 'Medium',
    aiSentiment: 'Neutral',
    assignedDepartment: 'Campus Services Cell',
    status: 'open',
    createdAt: new Date().toISOString(),
    slaDeadline: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    escalationCount: 0,
  };
  ticketList = [newTicket, ...ticketList];
  res.json(newTicket);
});

apiV1Router.post('/helpdesk/tickets/:id/resolve', (req: Request, res: Response) => {
  const { id } = req.params;
  const { resolutionNotes } = req.body || {};
  const ticket = ticketList.find(t => t.id === id);
  if (ticket) {
    ticket.status = 'resolved';
    ticket.resolutionNotes = resolutionNotes || 'Resolved by IT support';
  }
  res.json({ success: true, ticket });
});

apiV1Router.post('/helpdesk/classify', (req: Request, res: Response) => {
  const { description = '' } = req.body || {};
  const lower = String(description).toLowerCase();
  let category = 'General & Campus Maintenance';
  let priority = 'Medium';
  if (lower.includes('wifi') || lower.includes('network') || lower.includes('login') || lower.includes('portal')) {
    category = 'IT & Wi-Fi';
    priority = 'High';
  } else if (lower.includes('fee') || lower.includes('money') || lower.includes('scholarship')) {
    category = 'Finance & Accounts';
    priority = 'High';
  } else if (lower.includes('room') || lower.includes('hostel') || lower.includes('water') || lower.includes('mess')) {
    category = 'Hostel & Residential';
  }
  res.json({ category, priority, sentiment: 'Concerned', estimatedSlaHours: 24 });
});

apiV1Router.get('/helpdesk/tickets/:id/messages', (req: Request, res: Response) => {
  res.json([
    {
      id: 'msg-1',
      sender: 'Faizan Ali',
      role: 'student',
      message: 'Ticket submitted with system logs.',
      timestamp: 'Yesterday at 04:30 PM',
    },
    {
      id: 'msg-2',
      sender: 'Campus Support Team',
      role: 'admin',
      message: 'Investigating with the networking technician.',
      timestamp: 'Today at 09:15 AM',
    },
  ]);
});

// ── Certificates ────────────────────────────────────────────────────────────
apiV1Router.get('/certificates/me', (req: Request, res: Response) => {
  res.json(certificateList);
});

apiV1Router.post('/certificates/request', (req: Request, res: Response) => {
  const { certificateType, purpose } = req.body || {};
  const newCert: CertificateRequest = {
    id: `crt-${Date.now()}`,
    certificateNumber: `CRT-2026-${Math.floor(9000 + Math.random() * 999)}`,
    studentId: 'STU-8842',
    studentName: 'Faizan Ali',
    rollNumber: '0827CS221045',
    program: 'B.Tech Computer Science & Engineering',
    certificateType: (certificateType as any) || 'Bonafide Certificate',
    purpose: purpose || 'Official academic purposes',
    requestedDate: new Date().toISOString().split('T')[0],
    status: 'pending_verification',
    academicYear: '2025 - 2026',
    qrVerificationUrl: `https://smartuni.ai/verify-certificate?id=CRT-${Date.now()}`,
    documentHash: `SHA256:${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`,
  };
  certificateList = [newCert, ...certificateList];
  res.json(newCert);
});

apiV1Router.post('/certificates/:id/action', (req: Request, res: Response) => {
  const { id } = req.params;
  const { action } = req.body || {};
  const cert = certificateList.find(c => c.id === id);
  if (cert) {
    if (action === 'approve') {
      cert.status = 'ready_for_download';
      cert.verifiedBy = 'Dr. Sunita Verma (Dean of Academics)';
      cert.approvedDate = new Date().toISOString().split('T')[0];
    } else {
      cert.status = 'rejected';
    }
  }
  res.json({ success: true, certificate: cert });
});

apiV1Router.get('/certificates/:id/download', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <html>
      <body style="font-family: serif; padding: 50px; border: 4px double #333; max-width: 700px; margin: 40px auto; text-align: center;">
        <h1>SmartUni.Ai Digital University</h1>
        <h3>OFFICIAL BONAFIDE & MERIT CERTIFICATE</h3>
        <p>This is to certify that <strong>Faizan Ali</strong> (Roll No: 0827CS221045) is a bonafide student of Semester 6, B.Tech CSE.</p>
        <p>Certificate ID: ${req.params.id}</p>
        <p>Issued on: ${new Date().toLocaleDateString()}</p>
        <p>Status: Digitally Signed by the Controller of Examinations</p>
      </body>
    </html>
  `);
});

apiV1Router.get('/certificates/verify/:code', (req: Request, res: Response) => {
  res.json({
    verified: true,
    code: req.params.code,
    studentName: 'Faizan Ali',
    program: 'B.Tech CSE',
    status: 'Valid & Cryptographically Verified',
  });
});

// ── Smart Canteen ───────────────────────────────────────────────────────────
apiV1Router.get('/canteen/menu', (req: Request, res: Response) => {
  const { category } = req.query;
  if (category) {
    return res.json(MOCK_CANTEEN_MENU.filter(m => m.category.toLowerCase().includes(String(category).toLowerCase())));
  }
  res.json(MOCK_CANTEEN_MENU);
});

apiV1Router.get('/canteen/orders/me', (req: Request, res: Response) => {
  res.json(canteenOrderList);
});

apiV1Router.get('/canteen/orders/queue', (req: Request, res: Response) => {
  res.json(canteenOrderList.filter(o => o.status !== 'completed' && o.status !== 'cancelled'));
});

apiV1Router.post('/canteen/orders', (req: Request, res: Response) => {
  const { items = [], pickupTime = '12:30 PM', paymentMethod = 'CampusWallet' } = req.body || {};
  const orderItems = items.map((it: any) => {
    const menuItem = MOCK_CANTEEN_MENU.find(m => m.id === it.menuItemId);
    return {
      itemId: it.menuItemId,
      name: menuItem?.name || 'Canteen Item',
      price: menuItem?.price || 50,
      quantity: Number(it.quantity) || 1,
    };
  });

  const total = orderItems.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0);
  if (paymentMethod === 'CampusWallet' && walletBalance >= total) {
    walletBalance -= total;
  }

  const tokenNum = `A-${Math.floor(100 + Math.random() * 900)}`;
  const newOrder: CanteenOrder = {
    id: `ord-${Date.now()}`,
    tokenNumber: tokenNum,
    studentId: 'STU-8842',
    studentName: 'Faizan Ali',
    items: orderItems,
    totalAmount: total,
    pickupTime,
    orderTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'new',
    paymentStatus: 'paid',
    paymentMethod: paymentMethod as any,
    qrCodeValue: `SMARTUNI-ORDER-${tokenNum}-STU8842`,
    counterNumber: (Math.floor(Math.random() * 3) + 1) as 1 | 2 | 3,
  };

  canteenOrderList = [newOrder, ...canteenOrderList];
  res.json(newOrder);
});

apiV1Router.patch('/canteen/orders/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body || {};
  const order = canteenOrderList.find(o => o.id === id);
  if (order && status) {
    order.status = status;
  }
  res.json({ success: true, order });
});

apiV1Router.get('/canteen/wallet/me', (req: Request, res: Response) => {
  res.json({
    balance: walletBalance,
    currency: 'INR',
    transactions: [
      { id: 'tx-1', type: 'debit', amount: 80, desc: 'Grilled Veggie Sandwich', date: 'Today, 10:45 AM' },
      { id: 'tx-2', type: 'credit', amount: 500, desc: 'UPI Auto Top-up', date: 'Yesterday, 02:00 PM' },
    ],
  });
});

apiV1Router.post('/canteen/wallet/topup', (req: Request, res: Response) => {
  const { amount = 100 } = req.body || {};
  walletBalance += Number(amount);
  res.json({ success: true, newBalance: walletBalance });
});

apiV1Router.post('/canteen/orders/verify-qr', (req: Request, res: Response) => {
  const { qrData } = req.body || {};
  const order = canteenOrderList.find(o => o.qrCodeValue === qrData) || canteenOrderList[0];
  res.json({ verified: true, order });
});

// ── Notifications ───────────────────────────────────────────────────────────
apiV1Router.get('/notifications', (req: Request, res: Response) => {
  const { unreadOnly } = req.query;
  if (unreadOnly === 'true') {
    return res.json(notificationList.filter(n => !n.read));
  }
  res.json(notificationList);
});

apiV1Router.patch('/notifications/:id/read', (req: Request, res: Response) => {
  const notif = notificationList.find(n => n.id === req.params.id);
  if (notif) notif.read = true;
  res.json({ success: true });
});

apiV1Router.post('/notifications/read-all', (req: Request, res: Response) => {
  notificationList.forEach(n => { n.read = true; });
  res.json({ success: true });
});

// ── Transport ───────────────────────────────────────────────────────────────
apiV1Router.get('/transport/routes', (req: Request, res: Response) => {
  res.json(MOCK_BUS_ROUTES);
});

apiV1Router.get('/transport/routes/:id', (req: Request, res: Response) => {
  const route = MOCK_BUS_ROUTES.find(r => r.id === req.params.id) || MOCK_BUS_ROUTES[0];
  res.json(route);
});

// ── Admin Analytics & Audit Logs ────────────────────────────────────────────
apiV1Router.get('/admin/analytics', (req: Request, res: Response) => {
  res.json({
    totalStudents: 3420,
    totalFaculty: 148,
    todayAttendanceRate: 88.6,
    feeCollectionRate: 91.2,
    openTickets: ticketList.filter(t => t.status === 'open').length,
    activeBusRoutes: MOCK_BUS_ROUTES.length,
    canteenDailyOrders: canteenOrderList.length + 142,
    atRiskStudentsCount: 14,
    recentAlerts: [
      { id: 'al-1', title: 'CS604 Attendance Drop', detail: '14 students currently below 75% attendance threshold' },
      { id: 'al-2', title: 'Fee Deadline Approaching', detail: '₹4.2L dues pending for Term 2 due Oct 15' },
    ],
  });
});

apiV1Router.get('/admin/audit-logs', (req: Request, res: Response) => {
  res.json(MOCK_AUDIT_LOGS);
});

// ── ML Early Warning & Student Support ──────────────────────────────────────
apiV1Router.get('/ml/early-warning/me', (req: Request, res: Response) => {
  res.json({
    studentId: 'STU-8842',
    name: 'Faizan Ali',
    overallRisk: 'Medium',
    riskScore: 0.32,
    factors: [
      {
        course: 'CS604: Software Engineering',
        attendance: 71.9,
        risk: 'High (Detention Risk)',
        neededLectures: 3,
      },
      {
        course: 'CS601: Distributed Systems',
        attendance: 88.9,
        risk: 'Low (Safe)',
      },
    ],
    predictedGpa: 8.65,
    recommendations: [
      'Attend upcoming Software Engineering classes to eliminate detention flag.',
      'Schedule a peer study session for Raft consensus algorithms before Oct 6th exam.',
    ],
  });
});

apiV1Router.get('/ml/early-warning/students/:id', (req: Request, res: Response) => {
  res.json({
    studentId: req.params.id,
    riskLevel: 'Low',
    attendancePercent: 86.4,
    gpa: 8.74,
  });
});

apiV1Router.post('/ml/early-warning/evaluate/:id', (req: Request, res: Response) => {
  res.json({
    evaluated: true,
    studentId: req.params.id,
    riskScore: 0.28,
    timestamp: new Date().toISOString(),
  });
});

apiV1Router.post('/ml/early-warning/batch-evaluate', (req: Request, res: Response) => {
  res.json({
    evaluatedStudents: 342,
    flaggedAtRisk: 14,
    timestamp: new Date().toISOString(),
  });
});

apiV1Router.get('/ml/early-warning/at-risk', (req: Request, res: Response) => {
  res.json([
    {
      studentId: 'STU-8842',
      name: 'Faizan Ali',
      rollNumber: '0827CS221045',
      program: 'B.Tech CSE',
      semester: 6,
      riskLevel: 'Medium',
      flaggedCourses: ['CS604 (71.9%)'],
    },
    {
      studentId: 'STU-7721',
      name: 'Kavita Nair',
      rollNumber: '0827CS221088',
      program: 'B.Tech CSE',
      semester: 6,
      riskLevel: 'High',
      flaggedCourses: ['CS601 (64.2%)', 'CS604 (62.0%)'],
    },
  ]);
});

apiV1Router.get('/ml/interventions', (req: Request, res: Response) => {
  res.json(interventionsList);
});

apiV1Router.post('/ml/interventions', (req: Request, res: Response) => {
  const { predictionId, notes } = req.body || {};
  const newIntv = {
    id: `intv-${Date.now()}`,
    predictionId: predictionId || 'pred-auto',
    studentId: 'STU-8842',
    studentName: 'Faizan Ali',
    riskLevel: 'Medium',
    course: 'CS604: Software Engineering',
    category: 'Academic Advising',
    notes: notes || 'Mentor follow-up created.',
    status: 'Open',
    createdAt: new Date().toISOString(),
  };
  interventionsList = [newIntv, ...interventionsList];
  res.json(newIntv);
});

apiV1Router.patch('/ml/interventions/:id', (req: Request, res: Response) => {
  const intv = interventionsList.find(i => i.id === req.params.id);
  if (intv) {
    if (req.body.status) intv.status = req.body.status;
    if (req.body.notes) intv.notes = req.body.notes;
  }
  res.json({ success: true, intervention: intv });
});

apiV1Router.get('/ml/recommendations/me', (req: Request, res: Response) => {
  res.json([
    {
      id: 'rec-1',
      title: 'Clear CS604 Attendance Deficit',
      category: 'Attendance Recovery',
      action: 'Attend next 3 consecutive lectures starting Tuesday 09:00 AM',
      priority: 'Urgent',
    },
    {
      id: 'rec-2',
      title: 'CS601 Mid-Semester Prep',
      category: 'Examination',
      action: 'Review CAP theorem & Raft protocol slides in Central Library',
      priority: 'Recommended',
    },
  ]);
});

apiV1Router.post('/ml/recommendations/generate/:id', (req: Request, res: Response) => {
  res.json({ generated: true, recommendationsCount: 2 });
});

// ── AI Conversations & Messages (History stubs) ─────────────────────────────
apiV1Router.get('/ai/conversations', (req: Request, res: Response) => {
  res.json([]);
});

apiV1Router.get('/ai/conversations/:id/messages', (req: Request, res: Response) => {
  res.json([]);
});
