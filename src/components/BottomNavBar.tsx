'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Search, User, Phone, TrendingUp, ClipboardCheck, Car } from 'lucide-react';

export default function BottomNavBar() {
  const pathname = usePathname();
  const router = useRouter();

  // Hide bottom navigation on login, registration, and admin login pages
  const isAuthPage = 
    pathname === '/login' || 
    pathname === '/register' || 
    pathname === '/admin/login';

  if (isAuthPage) return null;

  const isAdminPath = pathname.startsWith('/admin');

  // Customer navigation items
  const customerTabs = [
    {
      label: 'Explore',
      icon: Search,
      path: '/',
    },
    {
      label: 'Bookings',
      icon: User,
      path: '/dashboard',
    },
    {
      label: 'Contact',
      icon: Phone,
      path: '/contact',
    },
  ];

  // Admin navigation items
  const adminTabs = [
    {
      label: 'Analytics',
      icon: TrendingUp,
      path: '/admin/dashboard',
    },
    {
      label: 'Bookings',
      icon: ClipboardCheck,
      path: '/admin/bookings',
    },
    {
      label: 'Fleet',
      icon: Car,
      path: '/admin/cars',
    },
  ];

  const activeTabs = isAdminPath ? adminTabs : customerTabs;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-lg border-t border-white/5 md:hidden safe-bottom pb-safe shadow-2xl">
      <div className="flex justify-around items-center h-16 px-4">
        {activeTabs.map((tab) => {
          const isActive = tab.path === '/' 
            ? pathname === '/' 
            : pathname.startsWith(tab.path);
          
          const Icon = tab.icon;

          return (
            <button
              key={tab.label}
              onClick={() => router.push(tab.path)}
              className="flex flex-col items-center justify-center flex-1 h-full py-2 transition-all duration-300 relative group cursor-pointer"
            >
              <Icon 
                className={`w-5 h-5 transition-all duration-300 ${
                  isActive 
                    ? 'text-yellow-400 scale-105 filter drop-shadow-[0_0_8px_rgba(250,202,21,0.4)]' 
                    : 'text-gray-500 group-hover:text-gray-300'
                }`}
              />
              <span 
                className={`text-[9px] font-bold mt-1 tracking-wider uppercase transition-all duration-300 ${
                  isActive 
                    ? 'text-yellow-400 font-extrabold' 
                    : 'text-gray-500 group-hover:text-gray-300'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-yellow-400 animate-in fade-in duration-300"></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
