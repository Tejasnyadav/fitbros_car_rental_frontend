'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../services/api';
import { Award, AlertTriangle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in name, email, and password.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await authService.register({ name, email, phone, password });
      // Redirect to login after successful register
      router.push('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Email might already be taken.');
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#0A0A0A]">
      <div className="w-full max-w-md glass-panel rounded-2xl p-8 relative overflow-hidden shadow-2xl border border-white/5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Glow ambient background element */}
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-yellow-400/5 blur-3xl pointer-events-none"></div>

        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 flex items-center justify-center mb-3">
            <img src="/logo.png" alt="FitBros Logo" className="w-full h-full object-contain rounded-xl" />
          </div>
          <h2 className="font-luxury font-bold text-2xl text-white tracking-wide">Create Account</h2>
          <p className="text-xs text-gray-400 mt-1 font-medium">Join FitBros and search premium rental cars</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Full Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#171717]/85 border border-white/10 text-sm text-white focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all font-medium placeholder-gray-600"
              placeholder="e.g. John Doe"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#171717]/85 border border-white/10 text-sm text-white focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all font-medium placeholder-gray-600"
              placeholder="e.g. driver@fitbros.com"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Mobile Number</label>
            <input 
              type="tel" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#171717]/85 border border-white/10 text-sm text-white focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all font-medium placeholder-gray-600"
              placeholder="e.g. +91 98765 43210"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#171717]/85 border border-white/10 text-sm text-white focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all font-medium placeholder-gray-600"
              placeholder="Min 6 characters"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-white hover:bg-yellow-400 text-black font-bold text-sm transition-all duration-300 transform active:scale-95 cursor-pointer disabled:opacity-50 disabled:pointer-events-none mt-2"
          >
            {submitting ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-400 font-medium">
          Already have an account?{' '}
          <a href="/login" className="text-yellow-400 hover:text-yellow-300 font-bold transition-colors">
            Login here
          </a>
        </div>
      </div>
    </div>
  );
}
