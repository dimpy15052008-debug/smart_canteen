import {
  UserProfile,
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

export const MOCK_STUDENT: UserProfile = {
  id: 'STU-8842',
  name: 'Faizan Ali',
  email: 'faizan.ali@smartuni.edu.in',
  role: 'student',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  phone: '+91 98765 43210',
  department: 'Computer Science & Engineering',
  rollNumber: '0827CS221045',
  enrollmentId: 'ENR-2022-CSE-0145',
  semester: 6,
  program: 'Bachelor of Technology (Computer Science)',
  batch: '2022 - 2026',
  cgpa: 8.74,
  hostelRoom: 'Block B - Room 304 (Bed 1)',
  busRoute: 'Route #4 (North Campus Express)'
};

export const MOCK_FACULTY: UserProfile = {
  id: 'FAC-102',
  name: 'Prof. Rajesh Sharma',
  email: 'rajesh.sharma@smartuni.edu.in',
  role: 'faculty',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  phone: '+91 98112 34567',
  department: 'Computer Science & Engineering',
  designation: 'Associate Professor & Lab Director',
  assignedCourses: ['CS601: Distributed Systems', 'CS603: Machine Learning & NLP'],
  cabinNumber: 'Academic Block A - Room 412'
};

export const MOCK_ADMIN: UserProfile = {
  id: 'ADM-001',
  name: 'Dr. Sunita Verma',
  email: 'sunita.verma@smartuni.edu.in',
  role: 'admin',
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  department: 'Academic Affairs & Digital Governance',
  designation: 'Dean of Academics & Controller of Examinations'
};

export const MOCK_CANTEEN_STAFF: UserProfile = {
  id: 'CAN-007',
  name: 'Ramesh Kumar',
  email: 'ramesh.canteen@smartuni.edu.in',
  role: 'canteen',
  avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  department: 'University Central Food Court',
  designation: 'Head Chef & Kitchen Operations Lead'
};

export const MOCK_COURSES: CourseSchedule[] = [
  {
    id: 'c1',
    code: 'CS601',
    name: 'Distributed Systems & Cloud Computing',
    faculty: 'Prof. Rajesh Sharma',
    credits: 4,
    room: 'Room 402 - Tech Block',
    day: 'Monday',
    startTime: '10:00 AM',
    endTime: '11:15 AM',
    totalClasses: 36,
    attendedClasses: 32,
    attendancePercent: 88.9,
    syllabusCovered: 78,
    isCurrentClass: true
  },
  {
    id: 'c2',
    code: 'CS602',
    name: 'Database Management & Advanced SQL',
    faculty: 'Dr. Arvind Mehra',
    credits: 4,
    room: 'Lab 2B - IT Center',
    day: 'Monday',
    startTime: '11:30 AM',
    endTime: '12:45 PM',
    totalClasses: 35,
    attendedClasses: 33,
    attendancePercent: 94.3,
    syllabusCovered: 82,
    isCurrentClass: false
  },
  {
    id: 'c3',
    code: 'CS603',
    name: 'Machine Learning & Deep Neural Networks',
    faculty: 'Prof. Ananya Sen',
    credits: 4,
    room: 'Seminar Hall 1',
    day: 'Monday',
    startTime: '01:45 PM',
    endTime: '03:00 PM',
    totalClasses: 34,
    attendedClasses: 29,
    attendancePercent: 85.3,
    syllabusCovered: 70,
    isCurrentClass: false
  },
  {
    id: 'c4',
    code: 'CS604',
    name: 'Software Engineering & Agile Architectures',
    faculty: 'Prof. Vikas Gupta',
    credits: 3,
    room: 'Room 305 - Main Block',
    day: 'Tuesday',
    startTime: '09:00 AM',
    endTime: '10:15 AM',
    totalClasses: 32,
    attendedClasses: 23,
    attendancePercent: 71.9, // Warning threshold!
    syllabusCovered: 65,
    isCurrentClass: false
  },
  {
    id: 'c5',
    code: 'CS605',
    name: 'Information Security & Cryptography',
    faculty: 'Dr. Neha Saxena',
    credits: 3,
    room: 'Room 401 - Tech Block',
    day: 'Wednesday',
    startTime: '02:00 PM',
    endTime: '03:15 PM',
    totalClasses: 30,
    attendedClasses: 26,
    attendancePercent: 86.7,
    syllabusCovered: 74,
    isCurrentClass: false
  }
];

export const MOCK_ATTENDANCE_RECORDS: AttendanceRecord[] = [
  {
    id: 'att-101',
    studentId: 'STU-8842',
    studentName: 'Faizan Ali',
    rollNumber: '0827CS221045',
    courseId: 'CS601',
    courseName: 'Distributed Systems & Cloud Computing',
    facultyId: 'FAC-102',
    date: '2026-09-26',
    time: '10:04 AM',
    status: 'present',
    verificationMethod: 'geo_face_liveness',
    locationVerified: true,
    coordinates: { lat: 23.2599, lng: 77.4126, accuracy: 4.2 },
    faceConfidence: 98.4,
    livenessVerified: true,
    notes: 'Geo-fence pass (Tech Block Room 402) + Face landmark match 98.4%'
  },
  {
    id: 'att-100',
    studentId: 'STU-8842',
    studentName: 'Faizan Ali',
    rollNumber: '0827CS221045',
    courseId: 'CS602',
    courseName: 'Database Management & Advanced SQL',
    facultyId: 'FAC-105',
    date: '2026-09-25',
    time: '11:32 AM',
    status: 'present',
    verificationMethod: 'geo_face_liveness',
    locationVerified: true,
    faceConfidence: 97.9,
    livenessVerified: true
  },
  {
    id: 'att-099',
    studentId: 'STU-8842',
    studentName: 'Faizan Ali',
    rollNumber: '0827CS221045',
    courseId: 'CS604',
    courseName: 'Software Engineering & Agile Architectures',
    facultyId: 'FAC-109',
    date: '2026-09-24',
    time: '09:05 AM',
    status: 'absent',
    verificationMethod: 'geo_face_liveness',
    locationVerified: false,
    faceConfidence: 0,
    livenessVerified: false,
    notes: 'No check-in recorded before attendance window closed at 09:15 AM'
  },
  {
    id: 'att-098',
    studentId: 'STU-8842',
    studentName: 'Faizan Ali',
    rollNumber: '0827CS221045',
    courseId: 'CS603',
    courseName: 'Machine Learning & Deep Neural Networks',
    facultyId: 'FAC-102',
    date: '2026-09-23',
    time: '01:50 PM',
    status: 'present',
    verificationMethod: 'geo_face_liveness',
    locationVerified: true,
    faceConfidence: 99.1,
    livenessVerified: true
  }
];

export const MOCK_CANTEEN_MENU: CanteenMenuItem[] = [
  {
    id: 'm1',
    name: 'Paneer Butter Masala Thali',
    category: 'Lunch & Meals',
    price: 130,
    prepTimeMinutes: 12,
    isVeg: true,
    calories: 620,
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300&auto=format&fit=crop&q=80',
    available: true,
    description: 'Fresh cottage cheese in creamy tomato gravy with 3 rotis, jeera rice, salad & gulab jamun.',
    rating: 4.8
  },
  {
    id: 'm2',
    name: 'Grilled Veggie Club Sandwich',
    category: 'Snacks & Bites',
    price: 75,
    prepTimeMinutes: 8,
    isVeg: true,
    calories: 340,
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=300&auto=format&fit=crop&q=80',
    available: true,
    description: 'Toasted multigrain bread loaded with bell peppers, zucchini, cucumber, mint chutney and cheese.',
    rating: 4.6
  },
  {
    id: 'm3',
    name: 'South Indian Masala Dosa',
    category: 'Breakfast',
    price: 65,
    prepTimeMinutes: 7,
    isVeg: true,
    calories: 290,
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=300&auto=format&fit=crop&q=80',
    available: true,
    description: 'Crispy fermented crepe stuffed with spiced potato filling, served with coconut chutney & sambar.',
    rating: 4.9
  },
  {
    id: 'm4',
    name: 'Protein Quinoa & Sprout Bowl',
    category: 'Healthy Bowls',
    price: 90,
    prepTimeMinutes: 5,
    isVeg: true,
    calories: 240,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&auto=format&fit=crop&q=80',
    available: true,
    description: 'Steamed organic sprouts, tricolor quinoa, pomegranate pearls, roasted seeds and lemon dressing.',
    rating: 4.7
  },
  {
    id: 'm5',
    name: 'Iced Hazelnut Cold Coffee',
    category: 'Beverages',
    price: 55,
    prepTimeMinutes: 4,
    isVeg: true,
    calories: 180,
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=300&auto=format&fit=crop&q=80',
    available: true,
    description: 'Espresso blend shaken with cold milk, crushed ice, and roasted hazelnut syrup.',
    rating: 4.9
  },
  {
    id: 'm6',
    name: 'Crispy Samosa Chaat (2 pcs)',
    category: 'Snacks & Bites',
    price: 50,
    prepTimeMinutes: 6,
    isVeg: true,
    calories: 380,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300&auto=format&fit=crop&q=80',
    available: true,
    description: 'Crushed spiced potato samosas topped with tangy tamarind chutney, curd and crispy sev.',
    rating: 4.7
  },
  {
    id: 'm7',
    name: 'Chicken Biryani Bowl',
    category: 'Lunch & Meals',
    price: 150,
    prepTimeMinutes: 10,
    isVeg: false,
    calories: 680,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&auto=format&fit=crop&q=80',
    available: true,
    description: 'Dum-cooked aromatic basmati rice layered with tender marinated chicken pieces and boiled egg.',
    rating: 4.8
  },
  {
    id: 'm8',
    name: 'Fresh Mosambi (Sweet Lime) Juice',
    category: 'Beverages',
    price: 45,
    prepTimeMinutes: 3,
    isVeg: true,
    calories: 110,
    image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=300&auto=format&fit=crop&q=80',
    available: true,
    description: 'Pure cold-pressed sweet lime juice with a dash of black salt and mint.',
    rating: 4.6
  }
];

export const MOCK_CANTEEN_ORDERS: CanteenOrder[] = [
  {
    id: 'ord-801',
    tokenNumber: 'A-104',
    studentId: 'STU-8842',
    studentName: 'Faizan Ali',
    items: [
      { itemId: 'm2', name: 'Grilled Veggie Club Sandwich', price: 75, quantity: 1 },
      { itemId: 'm5', name: 'Iced Hazelnut Cold Coffee', price: 55, quantity: 1 }
    ],
    totalAmount: 130,
    pickupTime: '11:15 AM (Morning Recess)',
    orderTime: '10:48 AM',
    status: 'preparing',
    paymentStatus: 'paid',
    paymentMethod: 'UPI',
    qrCodeValue: 'SMARTUNI-ORDER-A104-STU8842',
    counterNumber: 2
  },
  {
    id: 'ord-802',
    tokenNumber: 'A-102',
    studentId: 'STU-8911',
    studentName: 'Priya Sharma',
    items: [{ itemId: 'm1', name: 'Paneer Butter Masala Thali', price: 130, quantity: 1 }],
    totalAmount: 130,
    pickupTime: '11:15 AM',
    orderTime: '10:40 AM',
    status: 'ready',
    paymentStatus: 'paid',
    paymentMethod: 'CampusWallet',
    qrCodeValue: 'SMARTUNI-ORDER-A102-STU8911',
    counterNumber: 1
  },
  {
    id: 'ord-803',
    tokenNumber: 'A-101',
    studentId: 'STU-8750',
    studentName: 'Rohan Verma',
    items: [{ itemId: 'm3', name: 'South Indian Masala Dosa', price: 65, quantity: 2 }],
    totalAmount: 130,
    pickupTime: '11:00 AM',
    orderTime: '10:35 AM',
    status: 'completed',
    paymentStatus: 'paid',
    paymentMethod: 'UPI',
    qrCodeValue: 'SMARTUNI-ORDER-A101-STU8750',
    counterNumber: 3
  },
  {
    id: 'ord-804',
    tokenNumber: 'A-105',
    studentId: 'STU-8899',
    studentName: 'Aarav Patel',
    items: [{ itemId: 'm7', name: 'Chicken Biryani Bowl', price: 150, quantity: 1 }],
    totalAmount: 150,
    pickupTime: '01:30 PM (Lunch Break)',
    orderTime: '10:52 AM',
    status: 'new',
    paymentStatus: 'paid',
    paymentMethod: 'UPI',
    qrCodeValue: 'SMARTUNI-ORDER-A105-STU8899',
    counterNumber: 2
  }
];

export const MOCK_CERTIFICATES: CertificateRequest[] = [
  {
    id: 'crt-901',
    certificateNumber: 'CRT-2026-9041',
    studentId: 'STU-8842',
    studentName: 'Faizan Ali',
    rollNumber: '0827CS221045',
    program: 'B.Tech Computer Science & Engineering',
    certificateType: 'Bonafide Certificate',
    purpose: 'Application for Madhya Pradesh State Higher Education Merit Scholarship & State Bus Concession',
    requestedDate: '2026-09-24',
    status: 'ready_for_download',
    verifiedBy: 'Dr. Sunita Verma (Dean of Academics)',
    approvedDate: '2026-09-25',
    qrVerificationUrl: 'https://smartuni.ai/verify-certificate?id=CRT-2026-9041',
    documentHash: 'SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    academicYear: '2025 - 2026'
  },
  {
    id: 'crt-902',
    certificateNumber: 'CRT-2026-9042',
    studentId: 'STU-8842',
    studentName: 'Faizan Ali',
    rollNumber: '0827CS221045',
    program: 'B.Tech Computer Science & Engineering',
    certificateType: 'Internship NOC',
    purpose: 'Summer AI Engineering Internship at ISRO National Remote Sensing Centre',
    requestedDate: '2026-09-26',
    status: 'pending_verification',
    qrVerificationUrl: 'https://smartuni.ai/verify-certificate?id=CRT-2026-9042',
    documentHash: 'SHA256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    academicYear: '2025 - 2026'
  }
];

export const MOCK_HELPDESK_TICKETS: HelpdeskTicket[] = [
  {
    id: 'tkt-401',
    ticketNumber: 'TKT-2026-881',
    studentId: 'STU-8842',
    studentName: 'Faizan Ali',
    rollNumber: '0827CS221045',
    subject: 'Hostel Block B 3rd Floor Wi-Fi Access Point frequent disconnects',
    description: 'The Wi-Fi access point in corridor 3 near room 304 keeps dropping DNS resolution every 15 minutes, affecting project lab submissions.',
    category: 'IT & Wi-Fi',
    priority: 'High',
    aiSentiment: 'Frustrated',
    assignedDepartment: 'Campus Network & IT Infrastructure Cell',
    status: 'in_progress',
    createdAt: '2026-09-25 04:30 PM',
    slaDeadline: '2026-09-27 04:30 PM',
    resolutionNotes: 'Hardware switch reboot scheduled. Technician Mr. Ankit assigned.',
    escalationCount: 0
  },
  {
    id: 'tkt-402',
    ticketNumber: 'TKT-2026-724',
    studentId: 'STU-8842',
    studentName: 'Faizan Ali',
    rollNumber: '0827CS221045',
    subject: 'Minor discrepancy in Semester 5 elective credit marksheet upload',
    description: 'My NPTEL Cloud Computing course certificate grade is reflected as 3 credits instead of 4 credits on the university portal.',
    category: 'Examinations',
    priority: 'Medium',
    aiSentiment: 'Polite',
    assignedDepartment: 'Controller of Examinations Division',
    status: 'resolved',
    createdAt: '2026-09-20 11:15 AM',
    slaDeadline: '2026-09-23 11:15 AM',
    resolutionNotes: 'Verified against NPTEL portal master sheet. Credit corrected to 4.0.',
    resolvedAt: '2026-09-22 02:45 PM',
    escalationCount: 0
  }
];

export const MOCK_EXAMS: ExamRecord[] = [
  {
    id: 'ex-1',
    courseCode: 'CS601',
    courseName: 'Distributed Systems & Cloud Computing',
    examType: 'Mid-Semester',
    date: '2026-10-06',
    time: '10:00 AM - 12:00 PM',
    hallNumber: 'Tech Block Hall 401',
    seatNumber: 'B-24',
    maxMarks: 50,
    status: 'Upcoming'
  },
  {
    id: 'ex-2',
    courseCode: 'CS602',
    courseName: 'Database Management & Advanced SQL',
    examType: 'Mid-Semester',
    date: '2026-10-08',
    time: '10:00 AM - 12:00 PM',
    hallNumber: 'Main Block Hall 202',
    seatNumber: 'A-18',
    maxMarks: 50,
    status: 'Upcoming'
  },
  {
    id: 'ex-3',
    courseCode: 'CS603',
    courseName: 'Machine Learning & Deep Neural Networks',
    examType: 'Mid-Semester',
    date: '2026-10-10',
    time: '02:00 PM - 04:00 PM',
    hallNumber: 'Tech Block Hall 402',
    seatNumber: 'C-05',
    maxMarks: 50,
    status: 'Upcoming'
  },
  {
    id: 'ex-4',
    courseCode: 'CS501',
    courseName: 'Computer Networks & Protocols',
    examType: 'End-Semester Theory',
    date: '2026-05-18',
    time: '09:30 AM - 12:30 PM',
    hallNumber: 'Central Exam Hall C',
    seatNumber: 'D-12',
    maxMarks: 100,
    obtainedMarks: 89,
    grade: 'A+',
    status: 'Completed'
  },
  {
    id: 'ex-5',
    courseCode: 'CS502',
    courseName: 'Operating System Internals & Linux Kernel',
    examType: 'End-Semester Theory',
    date: '2026-05-22',
    time: '09:30 AM - 12:30 PM',
    hallNumber: 'Central Exam Hall C',
    seatNumber: 'D-12',
    maxMarks: 100,
    obtainedMarks: 91,
    grade: 'O',
    status: 'Completed'
  }
];

export const MOCK_FEES: FeeInvoice[] = [
  {
    id: 'inv-2026-6',
    invoiceNumber: 'INV-SEM6-8842',
    semester: 'Semester 6',
    academicYear: '2025 - 2026',
    dueDate: '2026-10-15',
    tuitionFee: 55000,
    developmentFee: 10000,
    examFee: 5000,
    hostelFee: 15000,
    totalAmount: 85000,
    paidAmount: 70000,
    status: 'partial',
    paymentDate: '2026-08-10',
    transactionId: 'TXN-MP-98421094'
  },
  {
    id: 'inv-2025-5',
    invoiceNumber: 'INV-SEM5-8842',
    semester: 'Semester 5',
    academicYear: '2025 - 2026',
    dueDate: '2025-10-15',
    tuitionFee: 55000,
    developmentFee: 10000,
    examFee: 5000,
    hostelFee: 15000,
    totalAmount: 85000,
    paidAmount: 85000,
    status: 'paid',
    paymentDate: '2025-08-04',
    transactionId: 'TXN-MP-77219033'
  }
];

export const MOCK_BUS_ROUTES: BusRoute[] = [
  {
    id: 'route-4',
    routeNumber: 'Route 4',
    routeName: 'North Campus Express (Airport Road -> Campus Gate 1)',
    driverName: 'Sukhdev Singh',
    driverPhone: '+91 94250 11223',
    vehicleNumber: 'MP-04-E-4421',
    currentStop: 'Gandhi Nagar Square',
    nextStop: 'University Main Gate (Arriving in 6 mins)',
    etaMinutes: 6,
    capacity: 48,
    occupiedSeats: 39,
    speedKmH: 34,
    coordinates: { lat: 23.2845, lng: 77.3821 },
    stops: [
      { name: 'Airport Road Depot', time: '07:45 AM', passed: true },
      { name: 'Karond Chouraha', time: '08:05 AM', passed: true },
      { name: 'Gandhi Nagar Square', time: '08:22 AM', passed: true },
      { name: 'University Main Gate', time: '08:30 AM', passed: false },
      { name: 'Hostel Block Quadrangle', time: '08:35 AM', passed: false }
    ]
  },
  {
    id: 'route-2',
    routeNumber: 'Route 2',
    routeName: 'South City Metro Link (MP Nagar -> Campus Gate 3)',
    driverName: 'Mohanlal Yadav',
    driverPhone: '+91 98261 44556',
    vehicleNumber: 'MP-04-E-3312',
    currentStop: 'Board Office Square',
    nextStop: 'Link Road Stop 2',
    etaMinutes: 14,
    capacity: 52,
    occupiedSeats: 48,
    speedKmH: 28,
    coordinates: { lat: 23.2332, lng: 77.4341 },
    stops: [
      { name: 'MP Nagar Zone 1', time: '07:40 AM', passed: true },
      { name: 'Board Office Square', time: '07:55 AM', passed: true },
      { name: 'Link Road Stop 2', time: '08:15 AM', passed: false },
      { name: 'University Sports Complex', time: '08:35 AM', passed: false }
    ]
  }
];

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n-1',
    title: 'SmartAttend AI Session Active',
    message: 'Prof. Rajesh Sharma has started attendance for CS601 in Room 402. Verification window closes in 12 mins.',
    type: 'attendance',
    timestamp: '10:01 AM',
    read: false,
    actionLink: 'smart-attend'
  },
  {
    id: 'n-2',
    title: 'Canteen Order Token #A-104',
    message: 'Your order is currently being prepared in Kitchen Counter 2. Estimated pickup: 11:15 AM.',
    type: 'canteen',
    timestamp: '10:48 AM',
    read: false,
    actionLink: 'canteen'
  },
  {
    id: 'n-3',
    title: 'Attendance Risk Alert (CS604)',
    message: 'Software Engineering attendance is 71.9% (below 75% requirement). Attend the next 3 lectures to recover eligibility.',
    type: 'system',
    timestamp: 'Yesterday',
    read: true,
    actionLink: 'academics'
  },
  {
    id: 'n-4',
    title: 'Bonafide Certificate Approved',
    message: 'Your Bonafide Certificate request has been digitally signed by the Dean. Ready for QR download.',
    type: 'certificate',
    timestamp: '2 days ago',
    read: true,
    actionLink: 'certificates'
  }
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-501',
    action: 'ATTENDANCE_VERIFIED_GEO_FACE',
    performedBy: 'Faizan Ali (Student)',
    role: 'student',
    targetEntity: 'AttendanceSession',
    entityId: 'CS601-20260926',
    details: 'Geofence validated within 4.2m. Face confidence 98.4%. Liveness passed. Cryptographic hash recorded.',
    timestamp: '2026-09-26 10:04:12',
    ipAddress: '10.24.112.84 (Campus Wi-Fi)'
  },
  {
    id: 'log-502',
    action: 'CERTIFICATE_DIGITALLY_SIGNED',
    performedBy: 'Dr. Sunita Verma',
    role: 'admin',
    targetEntity: 'CertificateRequest',
    entityId: 'CRT-2026-9041',
    details: 'Approved Bonafide Certificate for Faizan Ali. Verified zero fee dues and 86.4% aggregate attendance.',
    timestamp: '2026-09-25 15:40:02',
    ipAddress: '10.20.10.4 (Admin Intranet)'
  },
  {
    id: 'log-503',
    action: 'CANTEEN_ORDER_STATUS_CHANGE',
    performedBy: 'Ramesh Kumar (Kitchen Staff)',
    role: 'canteen',
    targetEntity: 'CanteenOrder',
    entityId: 'ord-801 (Token #A-104)',
    details: 'Advanced order status from NEW to PREPARING. Counter 2 assigned.',
    timestamp: '2026-09-26 10:50:18',
    ipAddress: '10.24.8.12 (POS Terminal 1)'
  },
  {
    id: 'log-504',
    action: 'FEE_PAYMENT_PROCESSED',
    performedBy: 'Faizan Ali (Student)',
    role: 'student',
    targetEntity: 'FeeInvoice',
    entityId: 'INV-SEM6-8842',
    details: 'Received ₹70,000 via UPI (TXN-MP-98421094). Remaining balance ₹15,000.',
    timestamp: '2026-08-10 14:22:50',
    ipAddress: '10.24.110.15'
  }
];
