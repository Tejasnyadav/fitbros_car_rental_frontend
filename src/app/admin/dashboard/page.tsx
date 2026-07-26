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
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminDashboardService.getStats();
      setStats(data.stats);
      setCharts(data.charts);
    } catch (err: any) {
      console.error('Failed to load dashboard metrics', err);
      setError(err.response?.data?.message || err.message || 'Failed to connect to the backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0A0A0A] px-6 text-white">
        <div className="max-w-md w-full glass-panel rounded-2xl p-8 border border-red-500/10 text-center flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base font-luxury">Analytics Error</h3>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed font-semibold">{error}</p>
          </div>
          <button
            onClick={fetchStats}
            className="w-full mt-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer transform active:scale-95"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
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

      {/* Fleet performance details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel rounded-2xl p-6 border border-white/5 flex items-center justify-between relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-32 h-32 rounded-full bg-yellow-400/5 blur-2xl pointer-events-none"></div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-400/10 flex items-center justify-center text-yellow-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Most Booked Vehicle</span>
              <span className="text-base font-bold text-white mt-1 block">{stats.mostBooked?.name || 'N/A'}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-extrabold text-yellow-400 block">{stats.mostBooked?.count || 0}</span>
            <span className="text-[8px] uppercase tracking-wider text-gray-500 font-bold">Total Bookings</span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-white/5 flex items-center justify-between relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-32 h-32 rounded-full bg-red-500/5 blur-2xl pointer-events-none"></div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
              <TrendingUp className="w-6 h-6 rotate-180" />
            </div>
            <div>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Least Booked Vehicle</span>
              <span className="text-base font-bold text-white mt-1 block">{stats.leastBooked?.name || 'N/A'}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-extrabold text-red-500 block">{stats.leastBooked?.count || 0}</span>
            <span className="text-[8px] uppercase tracking-wider text-gray-500 font-bold">Total Bookings</span>
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

      {/* 3. Customer Bookings Directory */}
      <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest font-luxury">Customer Bookings Directory</h4>
            <p className="text-[10px] text-gray-400 mt-1 font-medium font-sans">Registered customers who have placed reservations</p>
          </div>
          <span className="text-[9px] uppercase font-extrabold px-3 py-1 rounded-full bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 font-luxury">
            {stats.userDetails?.length || 0} Customers
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/5 text-[9px] uppercase tracking-wider text-gray-400 font-bold">
                <th className="p-4">Customer Name</th>
                <th className="p-4">Email Address</th>
                <th className="p-4">Mobile Number</th>
                <th className="p-4 text-center">Bookings Count</th>
                <th className="p-4 text-right">Total Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-gray-300">
              {!stats.userDetails || stats.userDetails.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 font-medium">No customer booking records found.</td>
                </tr>
              ) : (
                stats.userDetails.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold text-white">{u.name}</td>
                    <td className="p-4 font-semibold">{u.email}</td>
                    <td className="p-4 text-gray-400 font-semibold">{u.phone}</td>
                    <td className="p-4 text-center font-extrabold text-yellow-400">{u.bookingsCount}</td>
                    <td className="p-4 text-right font-extrabold text-white">₹{u.totalSpend}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
