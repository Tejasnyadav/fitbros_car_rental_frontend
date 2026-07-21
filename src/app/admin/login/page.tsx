'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Shield, AlertTriangle } from 'lucide-react';

export default function AdminLoginPage() {
  const { adminLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in administrative credentials.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await adminLogin({ email, password });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Admin authentication failed. Access Denied.');
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#0A0A0A]">
      <div className="w-full max-w-md glass-panel rounded-2xl p-8 relative overflow-hidden shadow-2xl border border-red-500/10">
        
        {/* Glow ambient background element */}
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-red-500/5 blur-3xl pointer-events-none"></div>

        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center mb-3">
            <Shield className="w-6 h-6 text-red-500" />
          </div>
          <h2 className="font-luxury font-bold text-2xl text-white tracking-wide">Admin Control Portal</h2>
          <p className="text-xs text-red-500/80 mt-1 font-bold uppercase tracking-wider">Authorized Personnel Only</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-red-400 uppercase tracking-wider">Admin Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#171717]/85 border border-white/10 text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-medium placeholder-gray-700"
              placeholder="admin@fitbros.com"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-red-400 uppercase tracking-wider">Secret Key</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#171717]/85 border border-white/10 text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-medium placeholder-gray-700"
              placeholder="Enter secret key"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-all duration-300 transform active:scale-95 cursor-pointer disabled:opacity-50 disabled:pointer-events-none mt-2"
          >
            {submitting ? 'Verifying access rights...' : 'Access Admin Panel'}
          </button>
        </form>
      </div>
    </div>
  );
}
