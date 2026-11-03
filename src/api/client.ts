/**
 * SmartUni.Ai Unified API Client
 * Type-safe HTTP client targeting FastAPI backend (/api/v1/*) with
 * JWT auth management and graceful fallback to local campus seed data.
 */

import {
  UserProfile,
  UserRole,
  CourseSchedule,
  AttendanceRecord,
  CanteenMenuItem,
  CanteenOrder,
  CertificateRequest,
  HelpdeskTicket,
  ExamRecord,
  FeeInvoice,
  BusRoute,
  AuditLog,
  NotificationItem,
} from '../types';

import {
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
  MOCK_STUDENT,
  MOCK_FACULTY,
  MOCK_ADMIN,
  MOCK_CANTEEN_STAFF,
} from '../mock/campusData';

const API_BASE = (import.meta as any).env?.VITE_API_URL || '';
const TOKEN_KEY = 'smartuni_token';
const ROLE_KEY = 'smartuni_role';

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // ignore
  }
}

export function getStoredRole(): UserRole {
  try {
    const r = localStorage.getItem(ROLE_KEY);
    if (r === 'faculty' || r === 'admin' || r === 'canteen') return r;
  } catch {
    // ignore
  }
  return 'student';
}

export function setStoredRole(role: UserRole): void {
  try {
    localStorage.setItem(ROLE_KEY, role);
  } catch {
    // ignore
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  fallbackData?: T
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE}${path}`;

  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      const message = errBody?.error?.message || errBody?.detail || `HTTP ${res.status}: ${res.statusText}`;
      throw new Error(message);
    }
    return (await res.json()) as T;
  } catch (err) {
    if (fallbackData !== undefined) {
      console.warn(`[API] Fallback used for ${path}:`, err);
      return fallbackData;
    }
    throw err;
  }
}

// ── Auth Module ──────────────────────────────────────────────────────────────
export const authApi = {
  async devLogin(role: UserRole): Promise<{ token: string; profile: UserProfile }> {
    try {
      const res = await request<{
        accessToken: string;
        user: any;
      }>('/api/v1/auth/dev-login', {
        method: 'POST',
        body: JSON.stringify({ role }),
      });
      setToken(res.accessToken);
      setStoredRole(role);

      const profile: UserProfile = {
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        role: res.user.role as UserRole,
        avatar: res.user.avatar || '',
        phone: res.user.phone,
        department: res.user.departmentName || 'Computer Science & Engineering',
        rollNumber: res.user.rollNumber,
        semester: res.user.semester,
        program: res.user.program,
        cgpa: res.user.cgpa,
      };
      return { token: res.accessToken, profile };
    } catch (e) {
      // Offline fallback
      setStoredRole(role);
      const mockUser =
        role === 'student'
          ? MOCK_STUDENT
          : role === 'faculty'
          ? MOCK_FACULTY
          : role === 'admin'
          ? MOCK_ADMIN
          : MOCK_CANTEEN_STAFF;
      return { token: 'mock-dev-token', profile: mockUser };
    }
  },

  async getMe(): Promise<UserProfile> {
    return request<UserProfile>('/api/v1/auth/me', {}, MOCK_STUDENT);
  },

  async getStatus(): Promise<{ authenticated: boolean; mode: string }> {
    return request('/api/v1/auth/status', {}, { authenticated: true, mode: 'dev' });
  },
};

// ── Academics & Students ─────────────────────────────────────────────────────
export const academicsApi = {
  async getCourses(): Promise<CourseSchedule[]> {
    return request<CourseSchedule[]>('/api/v1/courses/me', {}, MOCK_COURSES);
  },

  async getExams(): Promise<ExamRecord[]> {
    return request<ExamRecord[]>('/api/v1/exams/me', {}, MOCK_EXAMS);
  },

  async getAttendanceSummary(): Promise<any> {
    return request('/api/v1/attendance/summary/me', {}, null);
  },

  async getAttendanceHistory(): Promise<AttendanceRecord[]> {
    return request<AttendanceRecord[]>('/api/v1/attendance/history/me', {}, MOCK_ATTENDANCE_RECORDS);
  },

  async getStudentDashboard(): Promise<any> {
    return request('/api/v1/students/me', {}, null);
  },
};

// ── Smart Attend ─────────────────────────────────────────────────────────────
export const attendanceApi = {
  async markAttendance(payload: {
    sessionId: string;
    latitude?: number;
    longitude?: number;
    faceConfidence?: number;
    livenessVerified?: boolean;
    verificationMethod?: string;
  }): Promise<AttendanceRecord> {
    return request<AttendanceRecord>('/api/v1/attendance/mark', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getActiveSessions(): Promise<any[]> {
    return request<any[]>('/api/v1/attendance/sessions/active', {}, []);
  },

  async createSession(payload: {
    courseId: string;
    roomId: string;
    durationMinutes?: number;
  }): Promise<any> {
    return request('/api/v1/attendance/sessions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async closeSession(sessionId: string): Promise<any> {
    return request(`/api/v1/attendance/sessions/${sessionId}/close`, {
      method: 'POST',
    });
  },

  async overrideAttendance(payload: {
    recordId: string;
    justification: string;
  }): Promise<any> {
    return request('/api/v1/attendance/override', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getRoster(sessionId: string): Promise<any> {
    return request(`/api/v1/attendance/sessions/${sessionId}/roster`, {}, null);
  },
};

// ── Fees & Payments ──────────────────────────────────────────────────────────
export const feesApi = {
  async getInvoices(): Promise<FeeInvoice[]> {
    return request<FeeInvoice[]>('/api/v1/fees/invoices/me', {}, MOCK_FEES);
  },

  async initiatePayment(invoiceId: string, amount: number): Promise<any> {
    return request(`/api/v1/fees/invoices/${invoiceId}/pay`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  },

  async verifyPayment(payload: {
    invoiceId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }): Promise<any> {
    return request('/api/v1/fees/payments/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getReceiptUrl(paymentId: string): string {
    return `${API_BASE}/api/v1/fees/payments/${paymentId}/receipt`;
  },
};

// ── Helpdesk ─────────────────────────────────────────────────────────────────
export const helpdeskApi = {
  async getTickets(): Promise<HelpdeskTicket[]> {
    return request<HelpdeskTicket[]>('/api/v1/helpdesk/tickets', {}, MOCK_HELPDESK_TICKETS);
  },

  async createTicket(payload: {
    subject: string;
    category?: string;
    priority?: string;
    description: string;
  }): Promise<HelpdeskTicket> {
    return request<HelpdeskTicket>('/api/v1/helpdesk/tickets', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async resolveTicket(ticketId: string, notes: string): Promise<any> {
    return request(`/api/v1/helpdesk/tickets/${ticketId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ resolutionNotes: notes }),
    });
  },

  async classifyTicket(description: string): Promise<any> {
    return request('/api/v1/helpdesk/classify', {
      method: 'POST',
      body: JSON.stringify({ description }),
    });
  },

  async getMessages(ticketId: string): Promise<any[]> {
    return request<any[]>(`/api/v1/helpdesk/tickets/${ticketId}/messages`, {}, []);
  },
};

// ── Certificates ─────────────────────────────────────────────────────────────
export const certificatesApi = {
  async getCertificates(): Promise<CertificateRequest[]> {
    return request<CertificateRequest[]>('/api/v1/certificates/me', {}, MOCK_CERTIFICATES);
  },

  async requestCertificate(type: string, purpose: string): Promise<CertificateRequest> {
    return request<CertificateRequest>('/api/v1/certificates/request', {
      method: 'POST',
      body: JSON.stringify({ certificateType: type, purpose }),
    });
  },

  async approve(certificateId: string, notes?: string): Promise<any> {
    return request(`/api/v1/certificates/${certificateId}/action`, {
      method: 'POST',
      body: JSON.stringify({ action: 'approve', remarks: notes || 'Approved' }),
    });
  },

  async reject(certificateId: string, reason: string): Promise<any> {
    return request(`/api/v1/certificates/${certificateId}/action`, {
      method: 'POST',
      body: JSON.stringify({ action: 'reject', remarks: reason }),
    });
  },

  getDownloadUrl(certificateId: string): string {
    return `${API_BASE}/api/v1/certificates/${certificateId}/download`;
  },

  async verifyPublic(code: string): Promise<any> {
    return request(`/api/v1/certificates/verify/${code}`, {}, null);
  },
};

// ── Smart Canteen ────────────────────────────────────────────────────────────
export const canteenApi = {
  async getMenu(category?: string): Promise<CanteenMenuItem[]> {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    return request<CanteenMenuItem[]>(`/api/v1/canteen/menu${query}`, {}, MOCK_CANTEEN_MENU);
  },

  async getOrders(): Promise<CanteenOrder[]> {
    return request<CanteenOrder[]>('/api/v1/canteen/orders/me', {}, MOCK_CANTEEN_ORDERS);
  },

  async createOrder(payload: {
    items: { menuItemId: string; quantity: number }[];
    pickupTime: string;
    paymentMethod: 'CampusWallet' | 'UPI' | 'Card';
  }): Promise<CanteenOrder> {
    return request<CanteenOrder>('/api/v1/canteen/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getQueue(): Promise<CanteenOrder[]> {
    return request<CanteenOrder[]>('/api/v1/canteen/orders/queue', {}, MOCK_CANTEEN_ORDERS);
  },

  async updateOrderStatus(orderId: string, status: CanteenOrder['status']): Promise<any> {
    return request(`/api/v1/canteen/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async getWallet(): Promise<{ balance: number; currency: string; transactions: any[] }> {
    return request('/api/v1/canteen/wallet/me', {}, { balance: 450.0, currency: 'INR', transactions: [] });
  },

  async topupWallet(amount: number): Promise<any> {
    return request('/api/v1/canteen/wallet/topup', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  },

  async verifyQr(qrData: string): Promise<any> {
    return request('/api/v1/canteen/orders/verify-qr', {
      method: 'POST',
      body: JSON.stringify({ qrData }),
    });
  },
};

// ── Notifications ────────────────────────────────────────────────────────────
export const notificationsApi = {
  async getNotifications(unreadOnly = false): Promise<NotificationItem[]> {
    const q = unreadOnly ? '?unreadOnly=true' : '';
    return request<NotificationItem[]>(`/api/v1/notifications${q}`, {}, MOCK_NOTIFICATIONS);
  },

  async markRead(id: string): Promise<any> {
    return request(`/api/v1/notifications/${id}/read`, { method: 'PATCH' });
  },

  async markAllRead(): Promise<any> {
    return request('/api/v1/notifications/read-all', { method: 'POST' });
  },
};

// ── Transport & Hostel ───────────────────────────────────────────────────────
export const transportApi = {
  async getRoutes(): Promise<BusRoute[]> {
    return request<BusRoute[]>('/api/v1/transport/routes', {}, MOCK_BUS_ROUTES);
  },

  async getRoute(id: string): Promise<BusRoute> {
    return request<BusRoute>(`/api/v1/transport/routes/${id}`, {}, MOCK_BUS_ROUTES[0]);
  },
};

// ── Admin Analytics & Audit Logs ─────────────────────────────────────────────
export const adminApi = {
  async getAnalytics(): Promise<any> {
    return request('/api/v1/admin/analytics', {}, null);
  },

  async getAuditLogs(limit = 50, offset = 0): Promise<AuditLog[]> {
    return request<AuditLog[]>(`/api/v1/admin/audit-logs?limit=${limit}&offset=${offset}`, {}, MOCK_AUDIT_LOGS);
  },
};

// ── CampusAI Assistant ───────────────────────────────────────────────────────
export const campusAiApi = {
  async chat(payload: {
    message: string;
    persona?: string;
    conversationId?: string;
    history?: { sender: string; text: string }[];
  }): Promise<{
    reply: string;
    toolCall?: any;
    actionExecuted?: any;
    conversationId?: string;
    modelUsed?: string;
  }> {
    return request('/api/v1/ai/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getConversations(): Promise<any[]> {
    return request('/api/v1/ai/conversations', {}, []);
  },

  async getMessages(conversationId: string): Promise<any[]> {
    return request(`/api/v1/ai/conversations/${conversationId}/messages`, {}, []);
  },
};

// ── ML Early Warning & Student Support ───────────────────────────────────────
export const mlApi = {
  async getMyEarlyWarning(): Promise<any> {
    return request('/api/v1/ml/early-warning/me', {}, null);
  },

  async getStudentEarlyWarning(studentId: string): Promise<any> {
    return request(`/api/v1/ml/early-warning/students/${studentId}`, {}, null);
  },

  async evaluateStudent(studentId: string): Promise<any> {
    return request(`/api/v1/ml/early-warning/evaluate/${studentId}`, { method: 'POST' });
  },

  async batchEvaluate(department?: string): Promise<any> {
    const q = department ? `?department=${encodeURIComponent(department)}` : '';
    return request(`/api/v1/ml/early-warning/batch-evaluate${q}`, { method: 'POST' });
  },

  async getAtRisk(minLevel = 'Medium', department?: string): Promise<any[]> {
    const params = new URLSearchParams({ min_risk_level: minLevel });
    if (department) params.set('department', department);
    return request(`/api/v1/ml/early-warning/at-risk?${params.toString()}`, {}, []);
  },

  async getInterventions(studentId?: string, status?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (studentId) params.set('student_id', studentId);
    if (status) params.set('status', status);
    const q = params.toString() ? `?${params.toString()}` : '';
    return request(`/api/v1/ml/interventions${q}`, {}, []);
  },

  async createIntervention(predictionId: string, notes: string): Promise<any> {
    return request('/api/v1/ml/interventions', {
      method: 'POST',
      body: JSON.stringify({ predictionId, notes }),
    });
  },

  async updateIntervention(id: string, status: string, notes?: string): Promise<any> {
    return request(`/api/v1/ml/interventions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
  },

  async getMyRecommendations(): Promise<any[]> {
    return request('/api/v1/ml/recommendations/me', {}, []);
  },

  async generateRecommendations(studentId: string): Promise<any[]> {
    return request(`/api/v1/ml/recommendations/generate/${studentId}`, { method: 'POST' });
  },
};

export const api = {
  auth: authApi,
  academics: academicsApi,
  attendance: attendanceApi,
  fees: feesApi,
  helpdesk: helpdeskApi,
  certificates: certificatesApi,
  canteen: canteenApi,
  notifications: notificationsApi,
  transport: transportApi,
  admin: adminApi,
  campusAi: campusAiApi,
  ml: mlApi,
};

export default api;
