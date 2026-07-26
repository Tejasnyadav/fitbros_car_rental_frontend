'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/navigation';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/api';
import { Notification } from '../types';
import { Bell, User, LogOut, ShieldAlert, Award } from 'lucide-react';

export default function Navbar() {
  const { user, admin, logout, adminLogout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const isAdminPath = pathname.startsWith('/admin');
  const activeUser = isAdminPath ? admin : user;

  // Fetch alerts depending on current routing view
  const fetchAlerts = async () => {
    if (isAdminPath) {
      if (admin) {
        try {
          const list = await notificationService.getAdminAlerts();
          setNotifications(list);
        } catch (err) {
          console.error('Failed to load admin notifications', err);
        }
      } else {
        setNotifications([]);
      }
    } else {
      if (user) {
        try {
          const list = await notificationService.getUserAlerts();
          setNotifications(list);
        } catch (err) {
          console.error('Failed to load user notifications', err);
        }
      } else {
        setNotifications([]);
      }
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 15000); // Check every 15s
    return () => clearInterval(interval);
  }, [user, admin, pathname]);

  // Click outside handlers to close overlays
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    if (isAdminPath) {
      await adminLogout();
    } else {
      await logout();
    }
    setProfileOpen(false);
  };

  const isLoginPage = pathname === '/login' || pathname === '/register' || pathname === '/admin/login';
  if (isLoginPage) return null;

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center bg-[#0A0A0A]/85 backdrop-blur-md">
      {/* Brand logo */}
      <a href={isAdminPath ? '/admin/dashboard' : '/'} className="flex items-center gap-2.5 group cursor-pointer">
        <img 
          src="/logo.png" 
          alt="FitBros Logo" 
          className="h-10 w-auto object-contain rounded-lg group-hover:scale-105 transition-transform duration-300"
        />
        <div>
          <span className="font-luxury font-extrabold text-xl tracking-wider text-white">FITBROS</span>
          <span className="block text-[9px] uppercase tracking-widest text-yellow-400 font-bold -mt-1">Car Rental</span>
        </div>
      </a>

      {/* Desktop navigation */}
      <div className="hidden md:flex items-center gap-8 font-medium">
        {!isAdminPath ? (
          <>
            <a href="/" className={`text-sm hover:text-yellow-400 transition-colors ${pathname === '/' ? 'text-yellow-400' : 'text-gray-300'}`}>Search Cars</a>
            <a href="/contact" className={`text-sm hover:text-yellow-400 transition-colors ${pathname === '/contact' ? 'text-yellow-400' : 'text-gray-300'}`}>Contact Us</a>
            {activeUser && (
              <a href="/dashboard" className={`text-sm hover:text-yellow-400 transition-colors ${pathname === '/dashboard' ? 'text-yellow-400' : 'text-gray-300'}`}>My Dashboard</a>
            )}
          </>
        ) : (
          <>
            <a href="/admin/dashboard" className={`text-sm hover:text-yellow-400 transition-colors ${pathname === '/admin/dashboard' ? 'text-yellow-400' : 'text-gray-300'}`}>Analytics</a>
            <a href="/admin/bookings" className={`text-sm hover:text-yellow-400 transition-colors ${pathname === '/admin/bookings' ? 'text-yellow-400' : 'text-gray-300'}`}>Bookings</a>
            <a href="/admin/cars" className={`text-sm hover:text-yellow-400 transition-colors ${pathname === '/admin/cars' ? 'text-yellow-400' : 'text-gray-300'}`}>Fleet CRUD</a>
          </>
        )}
      </div>

      {/* User settings controls */}
      <div className="flex items-center gap-4">
        {activeUser ? (
          <>
            {/* Notification Bell */}
            <div className="relative" ref={notificationsRef}>
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-full hover:bg-white/5 text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border border-[#0A0A0A]"></span>
                )}
              </button>

              {/* Notifications dropdown panel */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 glass-panel border border-white/10 rounded-xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-3 duration-200">
                  <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <span className="font-semibold text-sm text-white">Notifications</span>
                    <span className="text-[10px] bg-yellow-400/10 text-yellow-400 px-2 py-0.5 rounded-full font-bold">
                      {notifications.length} Alert{notifications.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-xs text-gray-500">
                        No new updates. Enjoy your trip!
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div key={notif.id} className="p-3.5 hover:bg-white/5 transition-colors cursor-default">
                          <p className="text-xs font-semibold text-white">{notif.title}</p>
                          <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{notif.message}</p>
                          <span className="text-[9px] text-gray-500 block mt-2">
                            {new Date(notif.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 pl-3 rounded-full border border-white/10 hover:border-yellow-400/50 hover:bg-white/5 text-gray-300 hover:text-white transition-all cursor-pointer"
              >
                <span className="text-xs hidden md:inline font-medium text-white">{activeUser.name}</span>
                <div className="w-8 h-8 rounded-full bg-yellow-400 text-black flex items-center justify-center font-bold text-xs uppercase tracking-wider">
                  {activeUser.name.substring(0, 2)}
                </div>
              </button>

              {/* Profile options panel */}
              {profileOpen && (
                <div className="absolute right-0 mt-3 w-48 glass-panel border border-white/10 rounded-xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-3 duration-200">
                  <div className="px-4 py-3 border-b border-white/5">
                    <p className="text-xs text-gray-400">Signed in as</p>
                    <p className="text-xs font-bold text-white truncate mt-0.5">{activeUser.email}</p>
                    {activeUser.role === 'ADMIN' && (
                      <span className="inline-flex items-center gap-1 text-[9px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full font-bold mt-2">
                        <ShieldAlert className="w-2.5 h-2.5" /> Fleet Administrator
                      </span>
                    )}
                  </div>
                  <div className="p-1.5 flex flex-col gap-0.5">
                    {!isAdminPath ? (
                      <a href="/dashboard" className="px-3 py-2 text-xs text-gray-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                        Dashboard
                      </a>
                    ) : (
                      <a href="/admin/dashboard" className="px-3 py-2 text-xs text-gray-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                        Admin Console
                      </a>
                    )}
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs text-red-400 hover:text-red-300 rounded-lg hover:bg-red-500/5 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            {isAdminPath ? (
              <a href="/admin/login" className="text-xs text-gray-400 hover:text-white font-medium transition-colors">Admin Login</a>
            ) : (
              <>
                <a href="/login" className="text-xs text-gray-300 hover:text-white font-medium transition-colors">Sign In</a>
                <a 
                  href="/register" 
                  className="text-xs bg-white hover:bg-yellow-400 text-black font-semibold px-4 py-2 rounded-full transition-all hover:scale-105"
                >
                  Join
                </a>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

