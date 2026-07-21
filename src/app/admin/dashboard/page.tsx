'use client';

import React, { useState, useEffect } from 'react';
import { adminDashboardService } from '../../../services/api';
import { DashboardStats } from '../../../types';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Shield, TrendingUp, DollarSign, Car, AlertCircle, CheckCircle2, CalendarDays, Activity } from 'lucide-react';

import { useAuth } from '../../../context/AuthContext';

export default function AdminDashboardPage() {
  const { admin, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [charts, setCharts] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminDashboardService.getStats();
        setStats(data.stats);
        setCharts(data.charts);
      } catch (err) {
        console.error('Failed to load dashboard metrics', err);
      } finally {
        setLoading(false);
      }
    };
    if (!authLoading && admin) {
      fetchStats();
    }
  }, [authLoading, admin]);

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0A0A0A] text-white">
        <span>Compiling administrative analytics data...</span>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  if (loading || !stats || !charts) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0A0A0A] text-white">
        <span>Compiling administrative analytics data...</span>
      </div>
    );
  }

  const COLORS = ['#FACC15', '#22C55E', '#EF4444'];

  return (
    <div className="flex-1 bg-[#0A0A0A] py-12 px-6 md:px-12 max-w-7xl mx-auto w-full flex flex-col gap-10">
      
      {/* Header title */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h2 className="font-luxury font-bold text-2xl text-white tracking-wide flex items-center gap-2">
            <Shield className="w-6 h-6 text-yellow-400" /> Administrative Console
          </h2>
          <p className="text-xs text-gray-400 mt-1 font-medium">Real-time fleet operations analytics dashboard</p>
        </div>
      </div>

      {/* 1. Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Active Bookings */}
        <div className="glass-panel rounded-xl p-5 border border-white/5 flex items-center gap-4 relative overflow-hidden">
          <div className="w-10 h-10 rounded-lg bg-yellow-400/10 flex items-center justify-center text-yellow-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Active Bookings</span>
            <span className="text-lg font-bold text-white mt-1 block">{stats.activeBookings}</span>
          </div>
        </div>

        {/* Current Cars On Road */}
        <div className="glass-panel rounded-xl p-5 border border-white/5 flex items-center gap-4 relative overflow-hidden">
          <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Cars On Road</span>
            <span className="text-lg font-bold text-white mt-1 block">{stats.currentCarsOnRoad}</span>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="glass-panel rounded-xl p-5 border border-white/5 flex items-center gap-4 relative overflow-hidden">
          <div className="w-10 h-10 rounded-lg bg-yellow-400/15 flex items-center justify-center text-yellow-400">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Monthly Revenue</span>
            <span className="text-lg font-bold text-white mt-1 block">₹{stats.monthlyRevenue}</span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="glass-panel rounded-xl p-5 border border-white/5 flex items-center gap-4 relative overflow-hidden">
          <div className="w-10 h-10 rounded-lg bg-yellow-400/15 flex items-center justify-center text-yellow-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Total Revenue</span>
            <span className="text-lg font-bold text-white mt-1 block">₹{stats.totalRevenue}</span>
          </div>
        </div>

        {/* Total Cars */}
        <div className="glass-panel rounded-xl p-5 border border-white/5 flex items-center gap-4 relative overflow-hidden">
          <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center text-white">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Fleet Size</span>
            <span className="text-lg font-bold text-white mt-1 block">{stats.totalCars} Cars</span>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="glass-panel rounded-xl p-5 border border-red-500/10 flex items-center gap-4 relative overflow-hidden">
          <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Pending Approvals</span>
            <span className="text-lg font-bold text-red-500 mt-1 block">{stats.pendingApprovals} Request{stats.pendingApprovals !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Completed Trips */}
        <div className="glass-panel rounded-xl p-5 border border-white/5 flex items-center gap-4 relative overflow-hidden">
          <div className="w-10 h-10 rounded-lg bg-green-500/15 flex items-center justify-center text-green-500">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Completed Trips</span>
            <span className="text-lg font-bold text-white mt-1 block">{stats.completedTrips} Trips</span>
          </div>
        </div>

        {/* Monthly Bookings */}
        <div className="glass-panel rounded-xl p-5 border border-white/5 flex items-center gap-4 relative overflow-hidden">
          <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center text-gray-300">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Monthly Bookings</span>
            <span className="text-lg font-bold text-white mt-1 block">{stats.monthlyBookings} Bookings</span>
          </div>
        </div>

      </div>

      {/* 2. Visualizations Graphs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Revenue chart (Area) */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-white/5">
          <h4 className="text-xs font-bold text-white uppercase tracking-widest border-b border-white/5 pb-3 mb-6">Revenue Progression</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.revenueChart}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FACC15" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#FACC15" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#525252" fontSize={10} tickLine={false} />
                <YAxis stroke="#525252" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="revenue" stroke="#FACC15" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vehicle utilization chart (Pie) */}
        <div className="glass-panel rounded-2xl p-6 border border-white/5">
          <h4 className="text-xs font-bold text-white uppercase tracking-widest border-b border-white/5 pb-3 mb-6">Vehicle Utilization</h4>
          <div className="h-64 flex flex-col justify-between items-center">
            <div className="w-full h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.vehicleChart}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {charts.vehicleChart.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex justify-center gap-4 text-[10px] uppercase font-bold text-gray-400">
              {charts.vehicleChart.map((entry: any, idx: number) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  <span>{entry.status} ({entry.count})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Booking trends chart (Bar) */}
        <div className="lg:col-span-3 glass-panel rounded-2xl p-6 border border-white/5">
          <h4 className="text-xs font-bold text-white uppercase tracking-widest border-b border-white/5 pb-3 mb-6">Monthly Booking Fluctuation</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.bookingChart}>
                <XAxis dataKey="name" stroke="#525252" fontSize={10} tickLine={false} />
                <YAxis stroke="#525252" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }} />
                <Bar dataKey="bookings" fill="#FACC15" radius={[4, 4, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
