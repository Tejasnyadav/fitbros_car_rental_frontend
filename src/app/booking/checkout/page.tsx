'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { carService, bookingService } from '../../../services/api';
import { Car } from '../../../types';
import { Award, AlertTriangle, User, Calendar, MapPin, ClipboardList, PenTool, UploadCloud, ArrowRight, ArrowLeft } from 'lucide-react';

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const carId = searchParams.get('carId');
  const fromDateQuery = searchParams.get('fromDate') || '';
  const toDateQuery = searchParams.get('toDate') || '';

  const [car, setCar] = useState<Car | null>(null);
  const [loadingCar, setLoadingCar] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Wizard Steps: 1 = Details, 2 = Agreement, 3 = KYC Upload
  const [step, setStep] = useState(1);

  // STEP 1 Form Details
  const [fromDate, setFromDate] = useState(fromDateQuery);
  const [toDate, setToDate] = useState(toDateQuery);
  const [destination, setDestination] = useState('');
  const [purpose, setPurpose] = useState('');
  const [members, setMembers] = useState<number | ''>(1);
  const [pickupLocation, setPickupLocation] = useState('');

  // STEP 2 E-Sign Details
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // STEP 3 KYC Upload Files (Stored as Base64 strings)
  const [license, setLicense] = useState<string | null>(null);
  const [aadhaar, setAadhaar] = useState<string | null>(null);
  const [pan, setPan] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  
  const [submitting, setSubmitting] = useState(false);
  const [warningMsg, setWarningMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!carId) {
      setError('Invalid checkout session. No car selected.');
      setLoadingCar(false);
      return;
    }

    const fetchCar = async () => {
      try {
        const cars = await carService.searchCars({});
        const selected = cars.find((c: Car) => c.id === carId);
        if (selected) {
          setCar(selected);
        } else {
          setError('Selected vehicle could not be found.');
        }
      } catch (err) {
        setError('Failed to query vehicle details.');
      } finally {
        setLoadingCar(false);
      }
    };

    fetchCar();
  }, [carId]);

  // Canvas drawing utilities for E-Signature pad
  useEffect(() => {
    if (step === 2 && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
      }
    }
  }, [step]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if ('touches' in e && e.cancelable) {
      e.preventDefault();
    }
    if (!canvasRef.current) return;
    setIsDrawing(true);
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    const pos = getPos(e);
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if ('touches' in e && e.cancelable) {
      e.preventDefault();
    }
    if (!isDrawing || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    saveSignature();
  };

  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Support mouse and touch
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const clearSignature = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      setSignatureData(null);
    }
  };

  const saveSignature = () => {
    if (!canvasRef.current) return;
    // Check if canvas is empty
    const blank = document.createElement('canvas');
    blank.width = canvasRef.current.width;
    blank.height = canvasRef.current.height;
    const blankCtx = blank.getContext('2d');
    if (blankCtx) {
      blankCtx.fillStyle = '#FFFFFF';
      blankCtx.fillRect(0, 0, blank.width, blank.height);
    }
    if (canvasRef.current.toDataURL() !== blank.toDataURL()) {
      setSignatureData(canvasRef.current.toDataURL());
    }
  };

  // Convert File uploads to base64 string helper
  const handleFileRead = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string | null) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setWarningMsg('Invalid file format. Please upload a PDF, JPG, or PNG.');
      e.target.value = '';
      return;
    }

    // Read base64
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setter(reader.result as string);
    };
  };

  // Cost calculations
  const calculateDays = () => {
    if (!fromDate || !toDate) return 0;
    const start = new Date(fromDate);
    const end = new Date(toDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    const diff = end.getTime() - start.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const days = calculateDays();
  const rentalCost = car ? car.pricePerDay * days : 0;
  const taxes = Math.round(rentalCost * 0.1); // 10% tax
  const totalAmount = rentalCost + taxes;

  const handleNextStep = () => {
    if (step === 1) {
      if (!destination || !purpose || !pickupLocation || !members || members < 1) {
        setWarningMsg('Please fill in all booking details fields with valid values.');
        return;
      }
      if (days <= 0) {
        setWarningMsg('Pickup date and return date must define a positive rental duration.');
        return;
      }
    } else if (step === 2) {
      if (!termsAgreed || !signatureData) {
        setWarningMsg('You must agree to the Terms & Conditions and sign using the E-Signature pad.');
        return;
      }
    }
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleSubmitBooking = async () => {
    if (!license || !aadhaar || !pan || !selfie) {
      setWarningMsg('Please upload all required KYC documents to submit.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload = {
      carId,
      fromDate,
      toDate,
      destination,
      purpose,
      members,
      pickupLocation,
      license,
      aadhaar,
      pan,
      selfie,
      signature: signatureData
    };

    try {
      await bookingService.create(payload);
      router.push('/dashboard'); // Go to tracking screen
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit booking request. Overlap date check failed.');
      setSubmitting(false);
    }
  };

  if (loadingCar) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0A0A0A] text-white">
        <span>Setting up your rental checkout wizard...</span>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0A0A0A] px-6">
        <div className="max-w-md w-full glass-panel rounded-2xl p-8 border border-red-500/10 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="font-bold text-white text-base">Checkout Error</h3>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">{error || 'An unexpected error occurred.'}</p>
          <a href="/" className="inline-block mt-6 px-6 py-2.5 bg-white text-black font-bold text-xs rounded-xl hover:bg-yellow-400">
            Back to Fleet
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#0A0A0A] py-8 sm:py-12 px-4 sm:px-6 md:px-12 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
      
      {/* Checkout Steps Panel (Wizard) */}
      <div className="lg:col-span-2 flex flex-col gap-6 sm:gap-8">
        
        {/* Wizard progress tracker */}
        <div className="glass-panel rounded-2xl p-4 sm:p-6 flex justify-between items-center relative overflow-hidden">
          <div className="absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-neutral-800 -translate-y-1/2 z-0">
            <div 
              className="h-full bg-yellow-400 transition-all duration-300"
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            ></div>
          </div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step >= 1 ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20' : 'bg-neutral-800 text-gray-500'
            }`}>1</div>
            <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold mt-2">Details</span>
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step >= 2 ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20' : 'bg-neutral-800 text-gray-500'
            }`}>2</div>
            <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold mt-2">E-Sign</span>
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step >= 3 ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20' : 'bg-neutral-800 text-gray-500'
            }`}>3</div>
            <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold mt-2">KYC Upload</span>
          </div>
        </div>

        {/* STEP 1: Details Entry */}
        {step === 1 && (
          <div className="glass-panel rounded-2xl p-4 sm:p-6 md:p-8 flex flex-col gap-5 sm:gap-6 animate-in fade-in slide-in-from-left duration-250">
            <h3 className="font-luxury font-bold text-lg text-white border-b border-white/5 pb-3 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-yellow-400" /> 1. Trip Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pickup Date</label>
                <input 
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#171717] border border-white/5 text-sm text-white focus:outline-none focus:border-yellow-400 font-semibold"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Return Date</label>
                <input 
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#171717] border border-white/5 text-sm text-white focus:outline-none focus:border-yellow-400 font-semibold"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Destination</label>
                <input 
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#171717] border border-white/5 text-sm text-white focus:outline-none focus:border-yellow-400 font-medium placeholder-gray-600"
                  placeholder="e.g. Pune Highway / Lonavala"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Purpose of Trip</label>
                <input 
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#171717] border border-white/5 text-sm text-white focus:outline-none focus:border-yellow-400 font-medium placeholder-gray-600"
                  placeholder="e.g. Family Vacation / Business"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Number of Members</label>
                <input 
                  type="number"
                  min={1}
                  max={8}
                  value={members}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setMembers(isNaN(val) ? '' : val);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#171717] border border-white/5 text-sm text-white focus:outline-none focus:border-yellow-400 font-semibold"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Preferred Pickup Location</label>
                <select 
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#171717] border border-white/5 text-sm text-white focus:outline-none focus:border-yellow-400 font-semibold cursor-pointer appearance-none"
                >
                  <option value="">Choose Hub Location</option>
                  <option value="51, Dayananda Sagar College Road, 2nd Cross, 1st Stage, Teachers Colony, Bengaluru, Bengaluru Urban, Karnataka, 560078(office addres)">51, Dayananda Sagar College Road, 2nd Cross, 1st Stage, Teachers Colony, Bengaluru, Bengaluru Urban, Karnataka, 560078(office addres)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end mt-6 border-t border-white/5 pt-6">
              <button 
                onClick={handleNextStep}
                className="w-full sm:w-auto px-6 py-3 bg-white text-black font-extrabold text-xs uppercase tracking-widest rounded-xl hover:bg-yellow-400 flex items-center justify-center gap-2 transform active:scale-95 transition-all cursor-pointer"
              >
                Proceed to Signature <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Agreement & Signature Pad */}
        {step === 2 && (
          <div className="glass-panel rounded-2xl p-4 sm:p-6 md:p-8 flex flex-col gap-5 sm:gap-6 animate-in fade-in slide-in-from-right duration-250">
            <h3 className="font-luxury font-bold text-lg text-white border-b border-white/5 pb-3 flex items-center gap-2">
              <PenTool className="w-5 h-5 text-yellow-400" /> 2. Agreement & Electronic Signature
            </h3>

            <div className="p-4 rounded-xl bg-white/5 border border-white/5 max-h-48 overflow-y-auto text-xs text-gray-400 leading-relaxed font-medium">
              <p className="font-bold text-white mb-2">FITBROS CAR RENTAL STANDARD AGREEMENT</p>
              <p className="mb-2">1. The Renter agrees to operate the vehicle in compliance with traffic laws. Any traffic infractions, toll charges, or parking violations incurred during the lease duration are the sole liability of the renter.</p>
              <p className="mb-2">2. Only the primary driver who undergoes document verification is authorized to drive the vehicle. Subleasing is strictly prohibited.</p>
              <p className="mb-2">3. The vehicle must be returned to the preferred pickup location with a full tank of fuel. Check-out closure checks will be executed by administrative check-in teams.</p>
              <p>4. I certify that all uploaded identity documents are valid and correct.</p>
            </div>

            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                id="terms"
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                className="w-4 h-4 accent-yellow-400 cursor-pointer rounded"
              />
              <label htmlFor="terms" className="text-xs font-bold text-gray-300 cursor-pointer select-none">
                I agree to the Terms & Conditions and certify vehicle usage policies.
              </label>
            </div>

            {/* Signature Pad */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Draw Signature Below</span>
                <button 
                  onClick={clearSignature}
                  className="text-[10px] font-bold text-red-400 hover:text-red-300 uppercase tracking-widest cursor-pointer"
                >
                  Clear Pad
                </button>
              </div>
              <canvas
                ref={canvasRef}
                width={500}
                height={200}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full bg-white border border-white/10 rounded-xl cursor-crosshair touch-none"
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 mt-6 border-t border-white/5 pt-6">
              <button 
                onClick={handlePrevStep}
                className="w-full sm:w-auto px-6 py-3 bg-neutral-900 text-gray-300 font-extrabold text-xs uppercase tracking-widest rounded-xl border border-white/5 hover:text-white flex items-center justify-center gap-2 transform active:scale-95 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button 
                onClick={handleNextStep}
                disabled={!termsAgreed || !signatureData}
                className="w-full sm:w-auto px-6 py-3 bg-white text-black font-extrabold text-xs uppercase tracking-widest rounded-xl hover:bg-yellow-400 flex items-center justify-center gap-2 transform active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                Proceed to KYC <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: KYC Uploads */}
        {step === 3 && (
          <div className="glass-panel rounded-2xl p-4 sm:p-6 md:p-8 flex flex-col gap-5 sm:gap-6 animate-in fade-in slide-in-from-right duration-250">
            <h3 className="font-luxury font-bold text-lg text-white border-b border-white/5 pb-3 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-yellow-400" /> 3. Upload Identity & KYC Documents
            </h3>

            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              Please upload clear documents in PDF, JPG, or PNG format. Ensure the image is legible for admin review.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Driving License */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Driving License</label>
                <div className="relative rounded-xl border border-dashed border-white/10 hover:border-yellow-400/50 bg-[#171717]/50 p-4 transition-all flex flex-col items-center justify-center min-h-32 text-center cursor-pointer">
                  <input 
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileRead(e, setLicense)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="w-8 h-8 text-gray-500 mb-2" />
                  <span className="text-[10px] text-gray-400 font-bold">
                    {license ? '✅ License Captured' : 'Select PDF / JPG / PNG'}
                  </span>
                </div>
              </div>

              {/* Aadhaar Card */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Aadhaar Card</label>
                <div className="relative rounded-xl border border-dashed border-white/10 hover:border-yellow-400/50 bg-[#171717]/50 p-4 transition-all flex flex-col items-center justify-center min-h-32 text-center cursor-pointer">
                  <input 
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileRead(e, setAadhaar)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="w-8 h-8 text-gray-500 mb-2" />
                  <span className="text-[10px] text-gray-400 font-bold">
                    {aadhaar ? '✅ Aadhaar Captured' : 'Select PDF / JPG / PNG'}
                  </span>
                </div>
              </div>

              {/* PAN Card */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">PAN Card</label>
                <div className="relative rounded-xl border border-dashed border-white/10 hover:border-yellow-400/50 bg-[#171717]/50 p-4 transition-all flex flex-col items-center justify-center min-h-32 text-center cursor-pointer">
                  <input 
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileRead(e, setPan)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="w-8 h-8 text-gray-500 mb-2" />
                  <span className="text-[10px] text-gray-400 font-bold">
                    {pan ? '✅ PAN Card Captured' : 'Select PDF / JPG / PNG'}
                  </span>
                </div>
              </div>

              {/* Selfie with License */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Selfie with License</label>
                <div className="relative rounded-xl border border-dashed border-white/10 hover:border-yellow-400/50 bg-[#171717]/50 p-4 transition-all flex flex-col items-center justify-center min-h-32 text-center cursor-pointer">
                  <input 
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileRead(e, setSelfie)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="w-8 h-8 text-gray-500 mb-2" />
                  <span className="text-[10px] text-gray-400 font-bold">
                    {selfie ? '✅ Selfie Captured' : 'Select PDF / JPG / PNG'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 mt-6 border-t border-white/5 pt-6">
              <button 
                onClick={handlePrevStep}
                disabled={submitting}
                className="w-full sm:w-auto px-6 py-3 bg-neutral-900 text-gray-300 font-extrabold text-xs uppercase tracking-widest rounded-xl border border-white/5 hover:text-white flex items-center justify-center gap-2 transform active:scale-95 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button 
                onClick={handleSubmitBooking}
                disabled={submitting || !license || !aadhaar || !pan || !selfie}
                className="w-full sm:w-auto px-8 py-3 bg-yellow-400 text-black font-extrabold text-xs uppercase tracking-widest rounded-xl hover:bg-yellow-300 flex items-center justify-center gap-2 transform active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                {submitting ? 'Submitting Request...' : 'Submit Booking Request'}
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Pricing Summary Sidepanel */}
      <div className="flex flex-col gap-6">
        
        {/* Car Details Card */}
        <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
          <div className="h-40 w-full relative bg-neutral-900">
            <img 
              src={car.image} 
              alt={car.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6">
            <span className="text-[9px] uppercase tracking-widest bg-yellow-400/10 text-yellow-400 px-2 py-0.5 rounded font-bold border border-yellow-400/20">
              {car.type}
            </span>
            <h4 className="font-luxury font-bold text-base text-white mt-3">{car.name}</h4>
            <p className="text-xs text-gray-400 mt-1 font-semibold capitalize flex items-center gap-1">
              Gearbox: {car.transmission}
            </p>
          </div>
        </div>

        {/* Pricing Summary Calculator */}
        <div className="glass-panel rounded-2xl p-6 border border-white/5">
          <h4 className="text-xs font-bold text-white uppercase tracking-widest border-b border-white/5 pb-3">Rental Cost Summary</h4>
          
          <div className="flex flex-col gap-4 mt-5 font-medium text-xs">
            <div className="flex justify-between items-center text-gray-400">
              <span>Duration</span>
              <span className="text-white font-bold">{days} Day{days !== 1 ? 's' : ''}</span>
            </div>

            <div className="flex justify-between items-center text-gray-400">
              <span>Rate Per Day</span>
              <span className="text-white font-bold">₹{car.pricePerDay}</span>
            </div>

            <div className="flex justify-between items-center text-gray-400 border-b border-white/5 pb-4">
              <span>Subtotal Cost</span>
              <span className="text-white font-bold">₹{rentalCost}</span>
            </div>

            <div className="flex justify-between items-center text-gray-400">
              <span>Taxes & Fees (10%)</span>
              <span className="text-white font-bold">₹{taxes}</span>
            </div>

            <div className="flex justify-between items-center text-gray-400 border-t border-white/5 pt-4">
              <span className="font-bold text-white">Total Amount</span>
              <span className="text-yellow-400 font-extrabold text-base">₹{totalAmount}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Warning Popup Modal */}
      {warningMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm glass-panel rounded-2xl border border-yellow-500/20 p-6 flex flex-col items-center text-center gap-4 glow-accent">
            <div className="w-12 h-12 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-yellow-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-luxury font-bold text-white text-base">Booking Notification</h3>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed font-semibold">{warningMsg}</p>
            </div>
            <button 
              type="button"
              onClick={() => setWarningMsg(null)}
              className="mt-2 w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer transform active:scale-95"
            >
              Acknowledge & OK
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center bg-[#0A0A0A] text-white">
        <span>Setting up your rental checkout wizard...</span>
      </div>
    }>
      <CheckoutPageContent />
    </Suspense>
  );
}
