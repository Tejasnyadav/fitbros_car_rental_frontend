'use client';

import React, { useState, useEffect } from 'react';
import { bookingService } from '../../../services/api';
import { Booking } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { Calendar, Users, ClipboardCheck, Award, XSquare, Clock, MapPin, Eye, FileText, CheckCircle2, XCircle, X } from 'lucide-react';

export default function AdminBookingsPage() {
  const { admin, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [dateFilter, setDateFilter] = useState<'All' | 'Today' | 'This Week' | 'This Month' | 'Custom'>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [processing, setProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = {
        ...(dateFilter !== 'All' && { dateFilter }),
        ...(statusFilter !== 'All' && { status: statusFilter }),
        ...(dateFilter === 'Custom' && startDate && endDate && { startDate, endDate })
      };
      const list = await bookingService.adminList(params);
      setBookings(list);
    } catch (err) {
      console.error('Failed to load bookings list', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && admin) {
      fetchBookings();
    }
  }, [dateFilter, statusFilter, startDate, endDate, authLoading, admin]);

  const handleRowClick = async (booking: Booking) => {
    try {
      const details = await bookingService.getDetails(booking.id);
      setSelectedBooking(details);
    } catch (err) {
      alert('Failed to query booking detailed information.');
    }
  };

  // Operations
  const handleApprove = async () => {
    if (!selectedBooking) return;
    setProcessing(true);
    try {
      await bookingService.adminApprove(selectedBooking.id);
      alert('KYC documents approved. User notified to pay.');
      // Refresh details
      const refreshed = await bookingService.getDetails(selectedBooking.id);
      setSelectedBooking(refreshed);
      fetchBookings();
    } catch (err) {
      alert('Verification approval failed.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedBooking) return;
    setProcessing(true);
    try {
      await bookingService.adminReject(selectedBooking.id);
      alert('KYC request rejected.');
      const refreshed = await bookingService.getDetails(selectedBooking.id);
      setSelectedBooking(refreshed);
      fetchBookings();
    } catch (err) {
      alert('Verification rejection failed.');
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmCash = async () => {
    if (!selectedBooking) return;
    setProcessing(true);
    try {
      await bookingService.adminConfirmCash(selectedBooking.id);
      alert('Cash payment confirmed.');
      const refreshed = await bookingService.getDetails(selectedBooking.id);
      setSelectedBooking(refreshed);
      fetchBookings();
    } catch (err) {
      alert('Failed to log cash receipt.');
    } finally {
      setProcessing(false);
    }
  };

  const handleStartTrip = async () => {
    if (!selectedBooking) return;
    setProcessing(true);
    try {
      await bookingService.adminStartTrip(selectedBooking.id);
      alert('Trip set to ACTIVE.');
      const refreshed = await bookingService.getDetails(selectedBooking.id);
      setSelectedBooking(refreshed);
      fetchBookings();
    } catch (err) {
      alert('Failed to register active trip.');
    } finally {
      setProcessing(false);
    }
  };

  const handleEndTrip = async () => {
    if (!selectedBooking) return;
    setProcessing(true);
    try {
      await bookingService.adminEndTrip(selectedBooking.id);
      alert('Trip marked as COMPLETED.');
      const refreshed = await bookingService.getDetails(selectedBooking.id);
      setSelectedBooking(refreshed);
      fetchBookings();
    } catch (err) {
      alert('Failed to log trip completion.');
    } finally {
      setProcessing(false);
    }
  };

  const handleCloseBooking = async () => {
    if (!selectedBooking) return;
    setProcessing(true);
    try {
      await bookingService.adminClose(selectedBooking.id);
      alert('Booking finalized and archived.');
      const refreshed = await bookingService.getDetails(selectedBooking.id);
      setSelectedBooking(refreshed);
      fetchBookings();
    } catch (err) {
      alert('Failed to close booking.');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusStyle = (status: Booking['status']) => {
    switch (status) {
      case 'PENDING_ADMIN_APPROVAL': return 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20';
      case 'REJECTED': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'APPROVED_PENDING_PAYMENT': return 'bg-blue-400/10 text-blue-400 border-blue-400/20';
      case 'CONFIRMED': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'ACTIVE': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'COMPLETED': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'CLOSED': return 'bg-neutral-800 text-gray-400 border-neutral-700';
    }
  };

  const isReadOnly = selectedBooking?.status === 'CLOSED' || selectedBooking?.status === 'REJECTED';

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0A0A0A] text-white">
        <span>Loading bookings management console...</span>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <div className="flex-1 bg-[#0A0A0A] py-8 sm:py-12 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto w-full flex flex-col gap-6 sm:gap-8">
      
      {/* Page Title */}
      <div>
        <h2 className="font-luxury font-bold text-xl text-white tracking-wide">Bookings Management</h2>
        <p className="text-xs text-gray-400 mt-1 font-medium">Verify driver documents, log cash receipt, and monitor trips</p>
      </div>

      {/* Filter widgets */}
      <div className="glass-panel rounded-2xl p-5 border border-white/5 flex flex-wrap gap-6 items-center justify-between">
        
        {/* Status Filters (Tabs) */}
        <div className="flex flex-wrap gap-2">
          {['All', 'PENDING_ADMIN_APPROVAL', 'APPROVED_PENDING_PAYMENT', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'REJECTED', 'CLOSED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                statusFilter === st 
                  ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400' 
                  : 'border-white/5 bg-[#171717]/30 text-gray-400 hover:text-white'
              }`}
            >
              {st === 'All' ? 'All Statuses' : st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {/* Date Filters */}
        <div className="flex items-center gap-3">
          <select
            value={dateFilter}
            onChange={(e: any) => setDateFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#171717] border border-white/5 text-xs text-white focus:outline-none focus:border-yellow-400 font-semibold cursor-pointer"
          >
            <option value="All">All Dates</option>
            <option value="Today">Today</option>
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
            <option value="Custom">Custom Range</option>
          </select>

          {dateFilter === 'Custom' && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right duration-200">
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2 py-1 bg-[#171717] border border-white/5 rounded text-xs text-white" 
              />
              <span className="text-[10px] text-gray-500">to</span>
              <input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2 py-1 bg-[#171717] border border-white/5 rounded text-xs text-white" 
              />
            </div>
          )}
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Bookings Table Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Mobile view cards */}
          <div className="lg:hidden flex flex-col gap-4">
            {loading ? (
              <div className="glass-panel rounded-2xl p-8 text-center text-xs text-gray-500 border border-white/5">
                Loading bookings catalog...
              </div>
            ) : bookings.length === 0 ? (
              <div className="glass-panel rounded-2xl p-8 text-center text-xs text-gray-500 border border-white/5">
                No booking requests matched criteria.
              </div>
            ) : (
              bookings.map((b) => (
                <div
                  key={b.id}
                  onClick={() => handleRowClick(b)}
                  className={`glass-panel rounded-2xl p-5 border transition-all cursor-pointer flex flex-col gap-3.5 relative overflow-hidden ${
                    selectedBooking?.id === b.id 
                      ? 'border-yellow-400/50 bg-[#171717]/80 shadow-md shadow-yellow-400/5' 
                      : 'border-white/5 hover:border-white/10 bg-[#171717]/30'
                  }`}
                >
                  <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                    <span className="font-luxury font-bold text-white text-xs">#{b.id.substring(18)}</span>
                    <span className={`text-[8px] uppercase font-extrabold border px-2 py-0.5 rounded-full ${getStatusStyle(b.status)}`}>
                      {b.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-[11px] font-semibold text-gray-400">
                    <div>
                      <span className="text-[8px] uppercase text-gray-500 block mb-0.5">Customer</span>
                      <span className="text-white font-bold">{b.user?.name}</span>
                    </div>
                    <div>
                      <span className="text-[8px] uppercase text-gray-500 block mb-0.5">Car Model</span>
                      <span className="text-white font-bold">{b.car?.name}</span>
                    </div>
                    <div>
                      <span className="text-[8px] uppercase text-gray-500 block mb-0.5">Pickup</span>
                      <span className="text-white font-medium">{new Date(b.fromDate).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-[8px] uppercase text-gray-500 block mb-0.5">Return</span>
                      <span className="text-white font-medium">{new Date(b.toDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop view table */}
          <div className="hidden lg:block glass-panel rounded-2xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="hidden lg:table w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5 text-[9px] uppercase tracking-wider text-gray-400 font-bold">
                    <th className="p-4">Booking ID</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Car Model</th>
                    <th className="p-4">Pickup Date</th>
                    <th className="p-4">Return Date</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs text-gray-300">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">Loading bookings catalog...</td>
                    </tr>
                  ) : bookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">No booking request matched criteria.</td>
                    </tr>
                  ) : (
                    bookings.map((b) => (
                      <tr 
                        key={b.id} 
                        onClick={() => handleRowClick(b)}
                        className={`hover:bg-white/5 cursor-pointer transition-colors ${
                          selectedBooking?.id === b.id ? 'bg-white/5 border-l-2 border-yellow-400' : ''
                        }`}
                      >
                        <td className="p-4 font-bold text-white">#{b.id.substring(18)}</td>
                        <td className="p-4 font-semibold">{b.user?.name}</td>
                        <td className="p-4">{b.car?.name}</td>
                        <td className="p-4 font-medium">{new Date(b.fromDate).toLocaleDateString()}</td>
                        <td className="p-4 font-medium">{new Date(b.toDate).toLocaleDateString()}</td>
                        <td className="p-4">
                          <span className={`text-[9px] uppercase font-bold border px-2 py-0.5 rounded-full ${getStatusStyle(b.status)}`}>
                            {b.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Selected Booking Details Sidepanel Drawer */}
        <div className="flex flex-col gap-6">
          {selectedBooking ? (
            <div className="glass-panel rounded-2xl p-6 border border-white/5 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
              
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h3 className="font-luxury font-bold text-white text-base">Booking Ref Details</h3>
                <span className={`text-[9px] font-extrabold px-2 py-0.5 border rounded-full ${getStatusStyle(selectedBooking.status)}`}>
                  {selectedBooking.status}
                </span>
              </div>

              {/* Customer Info */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold flex items-center gap-1">
                  <Users className="w-3 h-3 text-yellow-400" /> Customer Information
                </span>
                <p className="text-xs font-bold text-white mt-1">{selectedBooking.user?.name}</p>
                <p className="text-[10px] text-gray-400 font-semibold">{selectedBooking.user?.email}</p>
                <p className="text-[10px] text-gray-400 font-semibold">{selectedBooking.user?.phone || 'No phone logged'}</p>
              </div>

              {/* Trip Logs */}
              <div className="flex flex-col gap-2 border-t border-white/5 pt-4">
                <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-yellow-400" /> Rental Logistics
                </span>
                <div className="grid grid-cols-2 gap-3 text-[10px] font-semibold text-gray-400 mt-1">
                  <div>
                    <span className="block text-[8px] uppercase text-gray-500">Pickup</span>
                    <span className="text-white mt-0.5 block">{new Date(selectedBooking.fromDate).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] uppercase text-gray-500">Return</span>
                    <span className="text-white mt-0.5 block">{new Date(selectedBooking.toDate).toLocaleDateString()}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-[8px] uppercase text-gray-500">Pickup Lounge Hub</span>
                    <span className="text-white mt-0.5 block flex items-center gap-1"><MapPin className="w-3 h-3 text-yellow-400" /> {selectedBooking.pickupLocation}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] uppercase text-gray-500">Destination</span>
                    <span className="text-white mt-0.5 block">{selectedBooking.destination}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] uppercase text-gray-500">Purpose</span>
                    <span className="text-white mt-0.5 block">{selectedBooking.purpose}</span>
                  </div>
                </div>
              </div>

              {/* KYC Document preview cards */}
              {selectedBooking.documents && (
                <div className="flex flex-col gap-2 border-t border-white/5 pt-4">
                  <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold flex items-center gap-1">
                    <Eye className="w-3 h-3 text-yellow-400" /> Identity Documents Previews
                  </span>
                  
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {/* License image popup simulation */}
                    <div className="p-2 bg-[#0A0A0A] border border-white/5 rounded-lg text-[9px] flex flex-col justify-between items-center text-center">
                      <span className="text-gray-400 font-bold">Driving License</span>
                      <button 
                        type="button"
                        onClick={() => {
                          setPreviewUrl(selectedBooking.documents!.license);
                          setPreviewTitle('Driving License');
                        }}
                        className="mt-2 text-yellow-400 font-bold hover:text-yellow-300 flex items-center gap-1 cursor-pointer"
                      >
                        <FileText className="w-3 h-3" /> Preview Document
                      </button>
                    </div>

                    <div className="p-2 bg-[#0A0A0A] border border-white/5 rounded-lg text-[9px] flex flex-col justify-between items-center text-center">
                      <span className="text-gray-400 font-bold">Aadhaar Card</span>
                      <button 
                        type="button"
                        onClick={() => {
                          setPreviewUrl(selectedBooking.documents!.aadhaar);
                          setPreviewTitle('Aadhaar Card');
                        }}
                        className="mt-2 text-yellow-400 font-bold hover:text-yellow-300 flex items-center gap-1 cursor-pointer"
                      >
                        <FileText className="w-3 h-3" /> Preview Document
                      </button>
                    </div>

                    <div className="p-2 bg-[#0A0A0A] border border-white/5 rounded-lg text-[9px] flex flex-col justify-between items-center text-center">
                      <span className="text-gray-400 font-bold">PAN Card</span>
                      <button 
                        type="button"
                        onClick={() => {
                          setPreviewUrl(selectedBooking.documents!.pan);
                          setPreviewTitle('PAN Card');
                        }}
                        className="mt-2 text-yellow-400 font-bold hover:text-yellow-300 flex items-center gap-1 cursor-pointer"
                      >
                        <FileText className="w-3 h-3" /> Preview Document
                      </button>
                    </div>

                    <div className="p-2 bg-[#0A0A0A] border border-white/5 rounded-lg text-[9px] flex flex-col justify-between items-center text-center">
                      <span className="text-gray-400 font-bold">Verification Selfie</span>
                      <button 
                        type="button"
                        onClick={() => {
                          setPreviewUrl(selectedBooking.documents!.selfie);
                          setPreviewTitle('Verification Selfie');
                        }}
                        className="mt-2 text-yellow-400 font-bold hover:text-yellow-300 flex items-center gap-1 cursor-pointer"
                      >
                        <FileText className="w-3 h-3" /> Preview Document
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Agreement electronic signature render */}
              {selectedBooking.agreement && (
                <div className="flex flex-col gap-2 border-t border-white/5 pt-4">
                  <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Agreement E-Signature</span>
                  <div className="p-2 bg-white border border-white/5 rounded-lg flex items-center justify-center h-20">
                    <img 
                      src={selectedBooking.agreement.signature} 
                      alt="Customer drawn signature"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Billing & Payment details */}
              {selectedBooking.payment && (
                <div className="flex flex-col gap-2 border-t border-white/5 pt-4">
                  <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold flex items-center gap-1">
                    <FileText className="w-3 h-3 text-yellow-400" /> Billing & Payment Details
                  </span>
                  <div className="p-4 bg-[#0A0A0A] border border-white/5 rounded-lg text-xs font-semibold text-gray-400 flex flex-col gap-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-[10px]">Payment Status</span>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        selectedBooking.payment.status === 'COMPLETED'
                          ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                          : 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20'
                      }`}>
                        {selectedBooking.payment.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-[10px]">Method</span>
                      <span className="text-white text-[10px]">{selectedBooking.payment.method}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-[10px]">Total Paid</span>
                      <span className="text-yellow-400 text-[11px] font-bold">INR {selectedBooking.payment.amount}</span>
                    </div>
                    {selectedBooking.invoice && (
                      <div className="flex justify-between border-t border-white/5 pt-2 mt-1">
                        <span className="text-gray-500 text-[10px]">Invoice Number</span>
                        <span className="text-white text-[10px] font-mono">#{selectedBooking.invoice.invoiceNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Admin actionable panel state updates */}
              <div className="flex flex-col gap-3 border-t border-white/5 pt-4 mt-2">
                {isReadOnly ? (
                  <span className="text-[10px] text-gray-500 font-medium text-center uppercase tracking-widest bg-white/5 py-3 rounded-lg border border-white/5">
                    Archived (Read Only)
                  </span>
                ) : (
                  <>
                    {/* 1. KYC approval controls */}
                    {selectedBooking.status === 'PENDING_ADMIN_APPROVAL' && (
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={handleReject}
                          disabled={processing}
                          className="py-2.5 rounded-lg bg-red-600/10 border border-red-600/20 hover:bg-red-600 text-red-500 hover:text-white font-extrabold text-[10px] uppercase tracking-widest transition-colors cursor-pointer flex items-center justify-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                        <button
                          onClick={handleApprove}
                          disabled={processing}
                          className="py-2.5 rounded-lg bg-green-600/10 border border-green-600/20 hover:bg-green-600 text-green-500 hover:text-white font-extrabold text-[10px] uppercase tracking-widest transition-colors cursor-pointer flex items-center justify-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                        </button>
                      </div>
                    )}

                    {/* 2. Manual cash payment verification controls */}
                    {selectedBooking.status === 'APPROVED_PENDING_PAYMENT' && selectedBooking.payment?.method === 'Cash' && selectedBooking.payment.status === 'PENDING' && (
                      <button
                        onClick={handleConfirmCash}
                        disabled={processing}
                        className="w-full py-3 bg-yellow-400 text-black font-extrabold text-[10px] uppercase tracking-widest rounded-lg hover:bg-yellow-300 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        Confirm Receipt - Payment Received
                      </button>
                    )}

                    {/* 3. Start trip logic */}
                    {selectedBooking.status === 'CONFIRMED' && (
                      <button
                        onClick={handleStartTrip}
                        disabled={processing}
                        className="w-full py-3 bg-white text-black font-extrabold text-[10px] uppercase tracking-widest rounded-lg hover:bg-yellow-400 transition-colors cursor-pointer"
                      >
                        Handover Keys - Start Trip (Active)
                      </button>
                    )}

                    {/* 4. Complete trip logic */}
                    {selectedBooking.status === 'ACTIVE' && (
                      <button
                        onClick={handleEndTrip}
                        disabled={processing}
                        className="w-full py-3 bg-white text-black font-extrabold text-[10px] uppercase tracking-widest rounded-lg hover:bg-yellow-400 transition-colors cursor-pointer"
                      >
                        Return Vehicle - Trip Completed
                      </button>
                    )}

                    {/* 5. Return check-in closure check log */}
                    {selectedBooking.status === 'COMPLETED' && (
                      <button
                        onClick={handleCloseBooking}
                        disabled={processing}
                        className="w-full py-3 bg-yellow-400 text-black font-extrabold text-[10px] uppercase tracking-widest rounded-lg hover:bg-yellow-300 transition-colors cursor-pointer"
                      >
                        Confirm Fleet Check-in (Close Booking)
                      </button>
                    )}
                  </>
                )}
              </div>

            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-10 text-center text-xs text-gray-500 border border-white/5">
              Select a booking from the database table to review KYC files and transition rental status.
            </div>
          )}
        </div>

      </div>

      {/* Document Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl max-h-[90vh] glass-panel rounded-2xl border border-white/10 p-6 flex flex-col gap-4 overflow-hidden">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="font-luxury font-bold text-white text-base">{previewTitle}</h3>
              <button 
                type="button"
                onClick={() => {
                  setPreviewUrl(null);
                  setPreviewTitle('');
                }}
                className="p-1 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center overflow-auto min-h-0">
              {previewUrl.startsWith('data:application/pdf') ? (
                <iframe 
                  src={previewUrl} 
                  title={previewTitle}
                  className="w-full h-[70vh] rounded-lg bg-white"
                />
              ) : (
                <img 
                  src={previewUrl} 
                  alt={previewTitle} 
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                />
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
