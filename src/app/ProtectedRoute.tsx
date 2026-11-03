import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { UserRole } from '../types';
import { BrandSplash } from '../auth/components/BrandSplash';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <BrandSplash message="Verifying institutional session..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // Role Access Check: If user role isn't in allowedRoles, redirect to user's home portal
  if (!allowedRoles.includes(user.role)) {
    const roleHomeMap: Record<UserRole, string> = {
      student: '/',
      faculty: '/faculty',
      admin: '/admin',
      canteen: '/canteen-staff',
    };
    const targetHome = roleHomeMap[user.role] || '/';
    return <Navigate to={targetHome} replace />;
  }

  return <>{children}</>;
};
