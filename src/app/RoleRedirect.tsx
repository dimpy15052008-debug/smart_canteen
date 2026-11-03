import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

export const RoleRedirect: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Non-student roles redirect to their own portal — their layout is handled there
  if (user.role === 'faculty') {
    return <Navigate to="/faculty" replace />;
  }

  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  if (user.role === 'canteen') {
    return <Navigate to="/canteen-staff" replace />;
  }

  // Student: shell is already provided by StudentAppShell in App.tsx — just render children
  return <>{children}</>;
};
