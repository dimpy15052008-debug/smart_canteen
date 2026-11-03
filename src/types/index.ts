export type UserRole = 'student' | 'faculty' | 'admin' | 'canteen';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone?: string;
  department: string;
  // Student specifics
  rollNumber?: string;
  enrollmentId?: string;
  semester?: number;
  program?: string;
  batch?: string;
  cgpa?: number;
  hostelRoom?: string;
  busRoute?: string;
  // Faculty specifics
  designation?: string;
  assignedCourses?: string[];
  cabinNumber?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  courseId: string;
  courseName: string;
  facultyId: string;
  date: string;
  time: string;
  status: 'present' | 'absent' | 'failed' | 'manual_override';
  verificationMethod: 'geo_face_liveness' | 'manual_faculty';
  locationVerified: boolean;
  coordinates?: { lat: number; lng: number; accuracy: number };
  faceConfidence: number;
  livenessVerified: boolean;
  notes?: string;
  correctedBy?: string;
  correctedAt?: string;
}

export interface CourseSchedule {
  id: string;
  code: string;
  name: string;
  faculty: string;
  credits: number;
  room: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string;
  endTime: string;
  totalClasses: number;
  attendedClasses: number;
  attendancePercent: number;
  syllabusCovered: number;
  isCurrentClass?: boolean;
}

export interface CanteenMenuItem {
  id: string;
  name: string;
  category: 'Breakfast' | 'Lunch & Meals' | 'Snacks & Bites' | 'Healthy Bowls' | 'Beverages';
  price: number;
  prepTimeMinutes: number;
  isVeg: boolean;
  calories: number;
  image: string;
  available: boolean;
  description: string;
  rating: number;
}

export interface CanteenOrderItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CanteenOrder {
  id: string;
  tokenNumber: string;
  studentId: string;
  studentName: string;
  items: CanteenOrderItem[];
  totalAmount: number;
  pickupTime: string;
  orderTime: string;
  status: 'new' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  paymentStatus: 'paid' | 'pending';
  paymentMethod: 'UPI' | 'Card' | 'CampusWallet';
  qrCodeValue: string;
  counterNumber?: number;
}

export interface CertificateRequest {
  id: string;
  certificateNumber?: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  program: string;
  certificateType: 'Bonafide Certificate' | 'Character Certificate' | 'Internship NOC' | 'Semester Transcript' | 'Fee Clearance';
  purpose: string;
  requestedDate: string;
  status: 'pending_verification' | 'approved' | 'rejected' | 'ready_for_download';
  verifiedBy?: string;
  approvedDate?: string;
  qrVerificationUrl: string;
  documentHash: string;
  academicYear: string;
}

export interface HelpdeskTicket {
  id: string;
  ticketNumber: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  subject: string;
  description: string;
  category: 'Hostel' | 'Academics' | 'Finance' | 'Examinations' | 'IT & Wi-Fi' | 'Campus Infrastructure';
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
  aiSentiment?: 'Frustrated' | 'Neutral' | 'Polite';
  assignedDepartment: string;
  status: 'open' | 'in_progress' | 'resolved' | 'escalated';
  createdAt: string;
  slaDeadline: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  escalationCount: number;
}

export interface ExamRecord {
  id: string;
  courseCode: string;
  courseName: string;
  examType: 'Mid-Semester' | 'End-Semester Theory' | 'Practical Lab';
  date: string;
  time: string;
  hallNumber: string;
  seatNumber: string;
  maxMarks: number;
  obtainedMarks?: number;
  grade?: string;
  status: 'Upcoming' | 'Completed';
}

export interface FeeInvoice {
  id: string;
  invoiceNumber: string;
  semester: string;
  academicYear: string;
  dueDate: string;
  tuitionFee: number;
  developmentFee: number;
  examFee: number;
  hostelFee: number;
  totalAmount: number;
  paidAmount: number;
  status: 'paid' | 'partial' | 'due' | 'overdue';
  paymentDate?: string;
  transactionId?: string;
}

export interface BusRoute {
  id: string;
  routeNumber: string;
  routeName: string;
  driverName: string;
  driverPhone: string;
  vehicleNumber: string;
  currentStop: string;
  nextStop: string;
  etaMinutes: number;
  capacity: number;
  occupiedSeats: number;
  speedKmH: number;
  stops: { name: string; time: string; passed: boolean }[];
  coordinates: { lat: number; lng: number };
}

export interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  role: UserRole;
  targetEntity: string;
  entityId: string;
  details: string;
  timestamp: string;
  ipAddress: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'attendance' | 'exam' | 'canteen' | 'certificate' | 'helpdesk' | 'system';
  timestamp: string;
  read: boolean;
  actionLink?: string;
}
