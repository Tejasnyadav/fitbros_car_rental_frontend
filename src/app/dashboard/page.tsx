'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { bookingService } from '../../services/api';
import { Booking, Notification } from '../../types';
import { Award, AlertTriangle, CreditCard, QrCode, FileText, CheckCircle2, ChevronRight, HelpCircle, Users } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

export default function UserDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [bookingHistory, setBookingHistory] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'Cash'>('UPI');
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      const active = await bookingService.getActive();
      setActiveBooking(active);
      const history = await bookingService.getHistory();
      setBookingHistory(history);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchDashboardData();
    }

    // Load Razorpay Checkout SDK Script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [authLoading, user]);

  const handlePay = async () => {
    if (!activeBooking) return;
    setPaying(true);
    setPaymentError(null);

    // Calculate total
    const diff = new Date(activeBooking.toDate).getTime() - new Date(activeBooking.fromDate).getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    const subtotal = activeBooking.car.pricePerDay * days;
    const total = subtotal + Math.round(subtotal * 0.1);

    if (paymentMethod === 'Cash') {
      try {
        await bookingService.pay(activeBooking.id, {
          method: 'Cash',
          amount: total
        });
        await fetchDashboardData();
      } catch (err: any) {
        setPaymentError(err.response?.data?.message || 'Payment processing failed.');
      } finally {
        setPaying(false);
      }
      return;
    }

    // Razorpay Flow
    if (!(window as any).Razorpay) {
      setPaymentError('Razorpay payment gateway is loading, please try again in a moment.');
      setPaying(false);
      return;
    }

    try {
      // 1. Create Razorpay order on backend
      const orderData = await bookingService.createRazorpayOrder(activeBooking.id);

      // 2. Setup checkout options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'FitBros Car Rental',
        description: `Rental Payment for ${activeBooking.car.name}`,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          setPaying(true);
          try {
            await bookingService.verifyRazorpayPayment(activeBooking.id, {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            });
            await fetchDashboardData();
          } catch (verifErr: any) {
            setPaymentError(verifErr.response?.data?.message || 'Payment verification failed.');
          } finally {
            setPaying(false);
          }
        },
        prefill: {
          name: activeBooking.user?.name || '',
          email: activeBooking.user?.email || '',
          contact: activeBooking.user?.phone 
            ? activeBooking.user.phone.replace(/[^0-9]/g, '').slice(-10) 
            : '9999999999'
        },
        theme: {
          color: '#FACC15'
        },
        modal: {
          ondismiss: () => {
            setPaying(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setPaymentError(err.response?.data?.message || 'Failed to initiate online checkout.');
      setPaying(false);
    }
  };

  const getTimelineSteps = (status: Booking['status']) => {
    // Defines step labels and maps if complete
    const steps = [
      { key: 'SUBMITTED', label: 'Request Submitted', isComplete: true },
      { key: 'VERIFIED', label: 'KYC Verification', isComplete: status !== 'PENDING_ADMIN_APPROVAL' && status !== 'REJECTED' },
      { key: 'PAID', label: 'Payment Unlock', isComplete: status === 'CONFIRMED' || status === 'ACTIVE' || status === 'COMPLETED' || status === 'CLOSED' },
      { key: 'ACTIVE', label: 'Active Trip', isComplete: status === 'ACTIVE' || status === 'COMPLETED' || status === 'CLOSED' },
      { key: 'CLOSED', label: 'Completed & Checked', isComplete: status === 'CLOSED' }
    ];
    return steps;
  };

  const downloadReceiptMock = (booking: Booking) => {
    if (!booking.invoice) {
      alert('Invoice generating... Check status panel.');
      return;
    }
    // Simple window print layout simulation or file download alert
    const printContent = `
      ================================================
      FITBROS CAR RENTAL - OFFICIAL RECEIPT & INVOICE
      ================================================
      Invoice Number: ${booking.invoice.invoiceNumber}
      Booking ID: ${booking.id}
      Customer Reference: ${booking.userId}
      ------------------------------------------------
      VEHICLE DETAILS:
      Car Model: ${booking.car.name} (${booking.car.type})
      Transmission: ${booking.car.transmission}
      ------------------------------------------------
      TRIP LOGS:
      Pickup Location: ${booking.pickupLocation}
      Lease Duration: ${new Date(booking.fromDate).toLocaleDateString()} to ${new Date(booking.toDate).toLocaleDateString()}
      Destination: ${booking.destination}
      ------------------------------------------------
      PAYMENT LOG:
      Payment Method: ${booking.payment?.method || 'N/A'}
      Payment Status: ${booking.payment?.status || 'N/A'}
      Total Amount: INR ${booking.payment?.amount || 0}
      ================================================
      Thank you for riding with FitBros! Safe travels.
    `;
    
    const blob = new Blob([printContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FitBros_Invoice_${booking.invoice.invoiceNumber}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (authLoading || (user && loading)) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0A0A0A] text-white">
        <span>Retrieving customer booking dashboard...</span>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex-1 bg-[#0A0A0A] py-8 sm:py-12 px-4 sm:px-6 md:px-12 max-w-6xl mx-auto w-full flex flex-col gap-8 sm:gap-10">
      
      {/* 1. Active Booking Status tracking stepper */}
      {activeBooking ? (
        <div className="flex flex-col gap-6">
          <h2 className="font-luxury font-bold text-xl text-white tracking-wide">Active Booking Status</h2>
          
          <div className="glass-panel rounded-2xl p-4 sm:p-6 md:p-8 border border-white/5 grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Timeline Column */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-xs text-gray-400 font-semibold">Booking Ref: #{activeBooking.id.substring(18)}</span>
                <span className={`text-[10px] uppercase font-extrabold px-3 py-1 rounded-full ${
                  activeBooking.status === 'PENDING_ADMIN_APPROVAL' ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20' :
                  activeBooking.status === 'REJECTED' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                  'bg-green-500/10 text-green-500 border border-green-500/20'
                }`}>
                  {activeBooking.status.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Vertical stepper for tracking progress */}
              <div className="flex flex-col gap-6 relative pl-6 border-l border-neutral-800">
                {getTimelineSteps(activeBooking.status).map((step, idx) => (
                  <div key={idx} className="relative flex items-start gap-4">
                    {/* Circle checkpoint */}
                    <div className={`absolute -left-[31px] w-4 h-4 rounded-full border-2 transition-colors ${
                      step.isComplete 
                        ? 'bg-yellow-400 border-yellow-400 shadow-sm shadow-yellow-400/25' 
                        : 'bg-[#0A0A0A] border-neutral-700'
                    }`}></div>
                    
                    <div>
                      <p className={`text-xs font-bold ${step.isComplete ? 'text-white' : 'text-gray-500'}`}>
                        {step.label}
                      </p>
                      {idx === 1 && activeBooking.status === 'PENDING_ADMIN_APPROVAL' && (
                        <p className="text-[10px] text-gray-400 mt-0.5">Admin verifying driving license & KYC papers...</p>
                      )}
                      {idx === 2 && activeBooking.status === 'APPROVED_PENDING_PAYMENT' && (
                        <p className="text-[10px] text-yellow-400 font-semibold mt-0.5">KYC approved! Complete checkout payment below.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Car Summary Column */}
            <div className="glass-panel rounded-xl overflow-hidden border border-white/5 flex flex-col justify-between">
              <div className="h-32 bg-neutral-900 overflow-hidden">
                <img 
                  src={activeBooking.car.image} 
                  alt={activeBooking.car.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white">{activeBooking.car.name}</h4>
                  <p className="text-[10px] text-gray-400 capitalize font-semibold mt-1">
                    Pickup: {activeBooking.pickupLocation}
                  </p>
                  <p className="text-[10px] text-gray-500 font-medium mt-0.5">
                    {new Date(activeBooking.fromDate).toLocaleDateString()} to {new Date(activeBooking.toDate).toLocaleDateString()}
                  </p>
                </div>

                {activeBooking.invoice && (
                  <button 
                    onClick={() => downloadReceiptMock(activeBooking)}
                    className="w-full py-2.5 bg-white/5 border border-white/10 hover:border-yellow-400/50 hover:bg-yellow-400/10 text-gray-200 hover:text-yellow-400 rounded-lg text-[10px] font-extrabold uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" /> Download Invoice
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* 2. Unlocked Payment Portal interface */}
          {activeBooking.status === 'APPROVED_PENDING_PAYMENT' && (
            <div className="glass-panel rounded-2xl p-4 sm:p-6 md:p-8 border border-yellow-400/10 animate-in fade-in slide-in-from-bottom duration-250">
              <h3 className="font-luxury font-bold text-lg text-white border-b border-white/5 pb-3 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-yellow-400" /> Unlock Vehicle - Make Payment
              </h3>
              
              <p className="text-xs text-gray-400 mt-2 font-medium">
                Admin approved your request. Choose a payment method below to activate the reservation.
              </p>

              {paymentError && (
                <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
                  {paymentError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {/* UPI Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-4 rounded-xl border flex items-center gap-3 text-left transition-all cursor-pointer ${
                    paymentMethod === 'UPI' 
                      ? 'border-yellow-400 bg-yellow-400/5 text-yellow-400' 
                      : 'border-white/5 bg-[#171717]/50 text-gray-400 hover:border-white/10'
                  }`}
                >
                  <QrCode className="w-5 h-5" />
                  <div>
                    <p className="text-xs font-bold text-white">Pay via UPI</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Instant confirmation</p>
                  </div>
                </button>

                {/* Card Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Card')}
                  className={`p-4 rounded-xl border flex items-center gap-3 text-left transition-all cursor-pointer ${
                    paymentMethod === 'Card' 
                      ? 'border-yellow-400 bg-yellow-400/5 text-yellow-400' 
                      : 'border-white/5 bg-[#171717]/50 text-gray-400 hover:border-white/10'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <div>
                    <p className="text-xs font-bold text-white">Credit / Debit Card</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Instant checkout</p>
                  </div>
                </button>

                {/* Cash Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Cash')}
                  className={`p-4 rounded-xl border flex items-center gap-3 text-left transition-all cursor-pointer ${
                    paymentMethod === 'Cash' 
                      ? 'border-yellow-400 bg-yellow-400/5 text-yellow-400' 
                      : 'border-white/5 bg-[#171717]/50 text-gray-400 hover:border-white/10'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  <div>
                    <p className="text-xs font-bold text-white">Cash / Pay at Hub</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Manual admin confirmation</p>
                  </div>
                </button>
              </div>

              {/* Payment details screen */}
              <div className="mt-6 p-5 bg-[#0A0A0A] rounded-xl border border-white/5">
                {(paymentMethod === 'UPI' || paymentMethod === 'Card') && (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-yellow-400 mb-3 animate-pulse">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-white">Online Payment Gateway (Razorpay)</p>
                    <p className="text-[10px] text-gray-400 mt-2 max-w-sm leading-relaxed">
                      You will pay securely via Cards, UPI (GPay, PhonePe, Paytm, BHIM), Netbanking, or Wallets in the secure checkout window.
                    </p>
                  </div>
                )}

                {paymentMethod === 'Cash' && (
                  <div>
                    <p className="text-xs font-bold text-white">Cash / On-site Payment Confirmation</p>
                    <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                      You will pay directly at the preferred hub location during pickup. Admin must manually verify receipt of cash to unlock booking access.
                    </p>
                  </div>
                )}
              </div>


              <div className="flex justify-end mt-6">
                <button
                  onClick={handlePay}
                  disabled={paying}
                  className="w-full sm:w-auto px-6 py-3 bg-yellow-400 text-black font-extrabold text-xs uppercase tracking-widest rounded-xl hover:bg-yellow-300 transition-colors transform active:scale-95 cursor-pointer disabled:opacity-50 text-center justify-center flex"
                >
                  {paying ? 'Verifying payment callback...' : 'Pay & Confirm'}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="glass-panel rounded-2xl p-10 text-center border border-white/5">
          <CheckCircle2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="font-bold text-white text-base">No Active Bookings</h3>
          <p className="text-xs text-gray-500 max-w-xs mx-auto mt-2 leading-relaxed font-medium">
            You don&apos;t have any active rental bookings at the moment. Browse our catalog and book your ride today!
          </p>
          <a href="/" className="inline-block mt-6 px-6 py-2.5 bg-white text-black font-bold text-xs rounded-xl hover:bg-yellow-400">
            Search Premium Cars
          </a>
        </div>
      )}

      {/* 3. Past Rental History logs */}
      <div className="flex flex-col gap-6">
        <h2 className="font-luxury font-bold text-xl text-white tracking-wide">Past Bookings</h2>
        
        {bookingHistory.length === 0 ? (
          <div className="glass-panel rounded-2xl p-10 text-center text-xs text-gray-500 border border-white/5">
            Your booking archive is empty.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookingHistory.map((booking) => (
              <div key={booking.id} className="glass-panel rounded-xl p-5 border border-white/5 flex flex-col justify-between gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-white text-sm">{booking.car.name}</h4>
                    <p className="text-[10px] text-gray-400 mt-1 capitalize font-semibold">
                      Lease: {new Date(booking.fromDate).toLocaleDateString()} – {new Date(booking.toDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded ${
                    booking.status === 'CLOSED' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                    {booking.status}
                  </span>
                </div>

                <div className="flex justify-between items-center border-t border-white/5 pt-3">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-gray-500 block">Total Amount Paid</span>
                    <span className="text-xs font-bold text-white">₹{booking.payment?.amount || 0}</span>
                  </div>
                  {booking.invoice && (
                    <button 
                      onClick={() => downloadReceiptMock(booking)}
                      className="px-3 py-1.5 bg-white/5 hover:bg-yellow-400 text-gray-300 hover:text-black font-bold text-[9px] rounded uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      Receipt <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
