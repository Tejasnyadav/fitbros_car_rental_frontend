'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '../types';
import { authService } from '../services/api';

interface AuthContextType {
  user: User | null;
  admin: User | null;
  loading: boolean;
  login: (credentials: any, redirectTo?: string) => Promise<void>;
  adminLogin: (credentials: any) => Promise<void>;
  logout: () => Promise<void>;
  adminLogout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const refreshProfile = async () => {
    try {
      const profiles = await authService.getSessionProfile();
      setUser(profiles.user);
      setAdmin(profiles.admin);
    } catch (err) {
      setUser(null);
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  // Protected Routing Logic
  useEffect(() => {
    if (loading) return;

    const isAdminPath = pathname.startsWith('/admin');
    const isLoginPage = pathname === '/login' || pathname === '/register';

    if (isAdminPath) {
      // Admin Path routing rules
      if (!admin && pathname !== '/admin/login') {
        router.push('/admin/login');
      } else if (admin && pathname === '/admin/login') {
        router.push('/admin/dashboard');
      }
    } else {
      // Customer Path routing rules
      const isProtectedUserPage = pathname === '/dashboard' || pathname.startsWith('/booking');
      
      if (isProtectedUserPage && !user) {
        router.push('/login');
      } else if (user && isLoginPage) {
        router.push('/dashboard');
      }
    }
  }, [user, admin, loading, pathname, router]);

  const login = async (credentials: any, redirectTo?: string) => {
    setLoading(true);
    try {
      const data = await authService.login(credentials);
      setUser(data.user);
      router.push(redirectTo || '/dashboard');
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const adminLogin = async (credentials: any) => {
    setLoading(true);
    try {
      const data = await authService.adminLogin(credentials);
      setAdmin(data.user);
      router.push('/admin/dashboard');
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
      router.push('/');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  const adminLogout = async () => {
    setLoading(true);
    try {
      await authService.logout(); // Clears both token cookies
      setAdmin(null);
      router.push('/admin/login');
    } catch (err) {
      console.error('Admin logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, admin, loading, login, adminLogin, logout, adminLogout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(Auth);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Workaround for TypeScript referencing issue in older react versions
const Auth = AuthContext;
export default AuthContext;
