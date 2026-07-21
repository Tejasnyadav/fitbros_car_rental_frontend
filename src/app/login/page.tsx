'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Award, AlertTriangle } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all credentials.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please verify credentials.');
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#0A0A0A]">
      <div className="w-full max-w-md glass-panel rounded-2xl p-8 relative overflow-hidden shadow-2xl border border-white/5">
        
        {/* Glow ambient background element */}
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-yellow-400/5 blur-3xl pointer-events-none"></div>

        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 flex items-center justify-center mb-3">
            <img src="/logo.svg" alt="FitBros Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="font-luxury font-bold text-2xl text-white tracking-wide">Welcome Back</h2>
          <p className="text-xs text-gray-400 mt-1 font-medium">Log in to manage bookings and active trips</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#171717]/85 border border-white/10 text-sm text-white focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all font-medium placeholder-gray-600"
              placeholder="e.g. driver@fitbros.com"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Secret Password</label>
            </div>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#171717]/85 border border-white/10 text-sm text-white focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all font-medium placeholder-gray-600"
              placeholder="Enter password"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-white hover:bg-yellow-400 text-black font-bold text-sm transition-all duration-300 transform active:scale-95 cursor-pointer disabled:opacity-50 disabled:pointer-events-none mt-2"
          >
            {submitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-gray-400 font-medium">
          Don&apos;t have an account?{' '}
          <a href="/register" className="text-yellow-400 hover:text-yellow-300 font-bold transition-colors">
            Register Here
          </a>
        </div>
      </div>
    </div>
  );
}
