import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './auth/AuthProvider';
import { LoginPage } from './auth/LoginPage';
import { ProtectedRoute } from './app/ProtectedRoute';
import { RoleRedirect } from './app/RoleRedirect';

import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { MobileBottomBar } from './components/common/MobileBottomBar';
import { JudgeTourModal } from './components/common/JudgeTourModal';
import { useMotionPreset } from './hooks/useMotionPreset';
import { Skeleton } from './components/ui/Skeleton';

// Portals and Views
import { StudentDashboard } from './components/dashboard/StudentDashboard';
import { FacultyLayout } from './layouts/FacultyLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { CanteenLayout } from './layouts/CanteenLayout';

const CampusAIAssistant = lazy(() =>
  import('./components/campus-ai/CampusAIAssistant').then((m) => ({ default: m.CampusAIAssistant }))
);
const AttendanceOverviewView = lazy(() =>
  import('./components/attendance/AttendanceOverviewView').then((m) => ({ default: m.AttendanceOverviewView }))
);
const SmartAttendView = lazy(() =>
  import('./components/smart-attend/SmartAttendView').then((m) => ({ default: m.SmartAttendView }))
);
const AcademicsView = lazy(() =>
  import('./components/academics/AcademicsView').then((m) => ({ default: m.AcademicsView }))
);
const ExamsView = lazy(() =>
  import('./components/exams/ExamsView').then((m) => ({ default: m.ExamsView }))
);
const FeesView = lazy(() =>
  import('./components/fees/FeesView').then((m) => ({ default: m.FeesView }))
);
const CertificatesView = lazy(() =>
  import('./components/certificates/CertificatesView').then((m) => ({ default: m.CertificatesView }))
);
const SmartCanteenView = lazy(() =>
  import('./components/canteen/SmartCanteenView').then((m) => ({ default: m.SmartCanteenView }))
);
const HelpdeskView = lazy(() =>
  import('./components/helpdesk/HelpdeskView').then((m) => ({ default: m.HelpdeskView }))
);
const TransportHostelView = lazy(() =>
  import('./components/transport/TransportHostelView').then((m) => ({ default: m.TransportHostelView }))
);
const CampusLifeView = lazy(() =>
  import('./components/campus-life/CampusLifeView').then((m) => ({ default: m.CampusLifeView }))
);
const NotificationsView = lazy(() =>
  import('./components/notifications/NotificationsView').then((m) => ({ default: m.NotificationsView }))
);
const ProfileView = lazy(() =>
  import('./components/profile/ProfileView').then((m) => ({ default: m.ProfileView }))
);
const FacultyDashboard = lazy(() =>
  import('./components/faculty/FacultyDashboard').then((m) => ({ default: m.FacultyDashboard }))
);
const AdminDashboard = lazy(() =>
  import('./components/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);
const DesignSystemShowcase = lazy(() =>
  import('./pages/DesignSystemShowcase').then((m) => ({ default: m.DesignSystemShowcase }))
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

const RouteFallback: React.FC = () => (
  <div className="max-w-6xl mx-auto space-y-4 py-6 px-2">
    <Skeleton className="h-8 w-48" />
    <Skeleton className="h-4 w-72" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-28 w-full" />
    </div>
    <Skeleton className="h-64 w-full mt-6" />
  </div>
);

// Student App Shell Layout (Unchanged)
const StudentAppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pageTransition } = useMotionPreset();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased transition-colors duration-200 selection:bg-indigo-500/20 dark:selection:bg-indigo-500/30 selection:text-indigo-800 dark:selection:text-indigo-200">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      {/* Sidebar rendered outside normal flow since it's fixed */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {/* Main content: left padding driven by CSS var --sidebar-w (set by Sidebar) */}
      <div
        className="pb-16 md:pb-0 transition-[padding-left] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] flex-1"
        style={{ paddingLeft: 'var(--sidebar-w, 0px)' }}
      >
        <main
          className="p-3 sm:p-5 lg:p-6 w-full max-w-[1700px] mx-auto focus:outline-none"
          tabIndex={-1}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageTransition as any}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              <Suspense fallback={<RouteFallback />}>{children}</Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <MobileBottomBar onOpenSidebar={() => setSidebarOpen(true)} />
      <JudgeTourModal />
    </div>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Login Route */}
              <Route path="/login" element={<LoginPage />} />

              {/* Faculty Portal Route */}
              <Route
                path="/faculty/*"
                element={
                  <ProtectedRoute allowedRoles={['faculty']}>
                    <FacultyLayout>
                      <Suspense fallback={<RouteFallback />}>
                        <FacultyDashboard />
                      </Suspense>
                    </FacultyLayout>
                  </ProtectedRoute>
                }
              />

              {/* Admin Portal Route */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout>
                      <Suspense fallback={<RouteFallback />}>
                        <AdminDashboard />
                      </Suspense>
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              {/* Canteen Staff Portal Route */}
              <Route
                path="/canteen-staff/*"
                element={
                  <ProtectedRoute allowedRoles={['canteen']}>
                    <CanteenLayout>
                      <Suspense fallback={<RouteFallback />}>
                        <SmartCanteenView />
                      </Suspense>
                    </CanteenLayout>
                  </ProtectedRoute>
                }
              />

              {/* Student Portal & Default Routes */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute allowedRoles={['student', 'faculty', 'admin', 'canteen']}>
                    <RoleRedirect>
                      <StudentAppShell>
                        <Routes>
                          <Route path="/" element={<StudentDashboard />} />
                          <Route path="/campus-ai" element={<CampusAIAssistant />} />
                          <Route path="/attendance" element={<AttendanceOverviewView />} />
                          <Route path="/attendance/verify" element={<SmartAttendView />} />
                          <Route path="/smart-attend" element={<Navigate to="/attendance/verify" replace />} />
                          <Route path="/academics" element={<AcademicsView />} />
                          <Route path="/exams" element={<ExamsView />} />
                          <Route path="/fees" element={<FeesView />} />
                          <Route path="/certificates" element={<CertificatesView />} />
                          <Route path="/canteen" element={<SmartCanteenView />} />
                          <Route path="/helpdesk" element={<HelpdeskView />} />
                          <Route path="/transport-hostel" element={<TransportHostelView />} />
                          <Route path="/transport" element={<Navigate to="/transport-hostel" replace />} />
                          <Route path="/campus-life" element={<CampusLifeView />} />
                          <Route path="/notifications" element={<NotificationsView />} />
                          <Route path="/profile" element={<ProfileView />} />
                          <Route path="/design-system" element={<DesignSystemShowcase />} />
                          <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                      </StudentAppShell>
                    </RoleRedirect>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </AppProvider>
    </QueryClientProvider>
  );
}
