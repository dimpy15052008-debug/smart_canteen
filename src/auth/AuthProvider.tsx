import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, UserRole } from '../types';
import {
  MOCK_STUDENT,
  MOCK_FACULTY,
  MOCK_ADMIN,
  MOCK_CANTEEN_STAFF,
} from '../mock/campusData';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  devLoginEnabled: boolean;
  login: (identifier: string, password: string, expectedRole?: UserRole) => Promise<void>;
  devLogin: (role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function getMockUserByRole(role: UserRole): UserProfile {
  switch (role) {
    case 'faculty':
      return MOCK_FACULTY;
    case 'admin':
      return MOCK_ADMIN;
    case 'canteen':
      return MOCK_CANTEEN_STAFF;
    case 'student':
    default:
      return MOCK_STUDENT;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('smartuni_token');
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [devLoginEnabled, setDevLoginEnabled] = useState<boolean>(true);

  // Bootstrap user from stored token or mock user on startup
  useEffect(() => {
    let isMounted = true;
    const bootstrapAuth = async () => {
      let storedToken: string | null = null;
      let storedRole: UserRole = 'student';
      try {
        storedToken = localStorage.getItem('smartuni_token');
        const role = localStorage.getItem('smartuni_role');
        if (role === 'faculty' || role === 'admin' || role === 'canteen' || role === 'student') {
          storedRole = role as UserRole;
        }
      } catch {
        // ignore
      }

      if (storedToken) {
        try {
          const res = await fetch('/api/v1/auth/me', {
            headers: {
              Authorization: `Bearer ${storedToken}`,
              'x-role': storedRole,
            },
          });
          if (res.ok) {
            const userData: UserProfile = await res.json();
            if (isMounted) {
              setUser(userData);
              setToken(storedToken);
              localStorage.setItem('smartuni_role', userData.role);
              window.dispatchEvent(new CustomEvent('smartuni:rolechange', { detail: userData.role }));
            }
          } else {
            // Token expired or invalid — fallback to mock for demo convenience
            const mockUser = getMockUserByRole(storedRole);
            const fallbackToken = `smartuni-jwt-${storedRole}-${Date.now()}`;
            localStorage.setItem('smartuni_token', fallbackToken);
            localStorage.setItem('smartuni_role', storedRole);
            if (isMounted) {
              setUser(mockUser);
              setToken(fallbackToken);
              window.dispatchEvent(new CustomEvent('smartuni:rolechange', { detail: storedRole }));
            }
          }
        } catch {
          // Server offline fallback for demo/dev mode
          if (isMounted && storedToken) {
            const mockUser = getMockUserByRole(storedRole);
            setUser(mockUser);
            window.dispatchEvent(new CustomEvent('smartuni:rolechange', { detail: storedRole }));
          }
        }
      } else {
        // No stored token: check auth status
        try {
          const statusRes = await fetch('/api/v1/auth/status');
          if (statusRes.ok) {
            const data = await statusRes.json();
            if (isMounted) setDevLoginEnabled(!!data.devLoginEnabled);
          }
        } catch {
          if (isMounted) setDevLoginEnabled(true);
        }
      }

      if (isMounted) setIsLoading(false);
    };

    bootstrapAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (identifier: string, password: string, expectedRole?: UserRole) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, expectedRole }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: 'Authentication failed' }));
        throw new Error(errorData.detail || errorData.message || `Login failed (${res.status})`);
      }

      const data = await res.json();
      const accessToken = data.accessToken || data.access_token || `smartuni-jwt-${data.user?.role || expectedRole || 'student'}-${Date.now()}`;
      const userProfile: UserProfile = data.user || getMockUserByRole(expectedRole || 'student');

      localStorage.setItem('smartuni_token', accessToken);
      localStorage.setItem('smartuni_role', userProfile.role);
      setToken(accessToken);
      setUser(userProfile);
      window.dispatchEvent(new CustomEvent('smartuni:rolechange', { detail: userProfile.role }));
    } catch (err: any) {
      // Fallback for demo when server route encounters network issue
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        const role = expectedRole || 'student';
        const mockUser = getMockUserByRole(role);
        const mockToken = `smartuni-jwt-${role}-${Date.now()}`;
        localStorage.setItem('smartuni_token', mockToken);
        localStorage.setItem('smartuni_role', mockUser.role);
        setToken(mockToken);
        setUser(mockUser);
        window.dispatchEvent(new CustomEvent('smartuni:rolechange', { detail: mockUser.role }));
        return;
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const devLogin = useCallback(async (role: UserRole) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/auth/dev-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });

      if (res.ok) {
        const data = await res.json();
        const accessToken = data.accessToken || data.access_token || `smartuni-jwt-${role}-${Date.now()}`;
        const userProfile: UserProfile = data.user || getMockUserByRole(role);

        localStorage.setItem('smartuni_token', accessToken);
        localStorage.setItem('smartuni_role', userProfile.role);
        setToken(accessToken);
        setUser(userProfile);
        window.dispatchEvent(new CustomEvent('smartuni:rolechange', { detail: userProfile.role }));
        return;
      }
    } catch {
      // Fallthrough to mock
    } finally {
      setIsLoading(false);
    }

    // Mock fallback
    const mockUser = getMockUserByRole(role);
    const mockToken = `smartuni-jwt-${role}-${Date.now()}`;
    localStorage.setItem('smartuni_token', mockToken);
    localStorage.setItem('smartuni_role', mockUser.role);
    setToken(mockToken);
    setUser(mockUser);
    window.dispatchEvent(new CustomEvent('smartuni:rolechange', { detail: mockUser.role }));
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem('smartuni_token');
      localStorage.removeItem('smartuni_role');
      fetch('/api/v1/auth/logout', { method: 'POST' }).catch(() => {});
    } catch {
      // ignore
    }
    setToken(null);
    setUser(null);
    window.dispatchEvent(new CustomEvent('smartuni:rolechange', { detail: 'student' }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        devLoginEnabled,
        login,
        devLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
