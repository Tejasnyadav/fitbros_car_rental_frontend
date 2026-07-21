'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { carService } from '../services/api';
import { Car } from '../types';
import { useAuth } from '../context/AuthContext';
import { Calendar, Search, SlidersHorizontal, Users, Fuel, Settings, Check, HelpCircle, AlertTriangle } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Search States
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [transmission, setTransmission] = useState('');
  
  // Results States
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [warningMsg, setWarningMsg] = useState<string | null>(null);

  const fetchCars = async () => {
    setLoading(true);
    try {
      const typeParam = selectedTypes.join(',');
      const params = {
        ...(fromDate && { fromDate }),
        ...(toDate && { toDate }),
        ...(typeParam && { type: typeParam }),
        ...(transmission && { transmission })
      };
      
      const list = await carService.searchCars(params);
      setCars(list);
      setSearched(true);
    } catch (err) {
      console.error('Failed to load fleet catalog', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch of available fleet
    fetchCars();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromDate && toDate) {
      const start = new Date(fromDate);
      const end = new Date(toDate);
      if (start >= end) {
        setWarningMsg('Return date must be after pickup date.');
        return;
      }
    }
    fetchCars();
  };

  const handleTypeToggle = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const handleSelectCar = (car: Car) => {
    if (!fromDate || !toDate) {
      setWarningMsg('Please select pickup and return dates in the filters panel to proceed.');
      return;
    }

    const start = new Date(fromDate);
    const end = new Date(toDate);
    if (start >= end) {
      setWarningMsg('Return date must be after pickup date.');
      return;
    }

    if (!user) {
      // Redirect to login if user not logged in
      router.push(`/login?redirect=booking&carId=${car.id}&fromDate=${fromDate}&toDate=${toDate}`);
      return;
    }
    
    router.push(`/booking/checkout?carId=${car.id}&fromDate=${fromDate}&toDate=${toDate}`);
  };

  const carTypes = ['Hatchback', 'Sedan', 'SUV', 'Luxury'];

  return (
    <div className="flex-1 bg-[#0A0A0A] pb-24 md:pb-12">
      {/* Hero Banner Section */}
      <div className="relative h-[280px] sm:h-[360px] md:h-[480px] w-full flex items-center justify-center overflow-hidden">
        {/* Dark background image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-[#0A0A0A] opacity-35 filter brightness-75 scale-105 transition-transform duration-[10s]"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=1600')" }}
        ></div>
        {/* Premium black gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-[#0A0A0A]/40"></div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <span className="text-[9px] sm:text-[10px] tracking-[0.35em] text-yellow-400 font-extrabold uppercase font-luxury">EXPERIENCE EXCELLENCE</span>
          <h1 className="font-luxury font-extrabold text-3xl sm:text-4xl md:text-6xl text-white tracking-tight mt-1 leading-[1.15]">
            THE ART OF MOTION
          </h1>
          <p className="text-gray-400 text-[10px] sm:text-xs md:text-sm max-w-md md:max-w-lg mx-auto mt-2 md:mt-4 font-medium leading-relaxed">
            Premium vehicle rentals curated for discerning drivers. Seamless booking, instant KYC verification, and dynamic availability checks.
          </p>
        </div>
      </div>

      {/* Floating Filter Search Widget */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-12 sm:-mt-20 md:-mt-24 relative z-20">
        <form onSubmit={handleSearch} className="glass-panel rounded-2xl p-4 sm:p-6 md:p-8 flex flex-col gap-5 sm:gap-6 shadow-2xl border border-white/5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            
            {/* Pickup Date */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-yellow-400" /> Pickup Date
              </label>
              <input 
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 rounded-xl bg-[#171717] border border-white/5 text-sm text-white focus:outline-none focus:border-yellow-400 transition-all font-semibold"
              />
            </div>

            {/* Return Date */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-yellow-400" /> Return Date
              </label>
              <input 
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                min={fromDate || new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 rounded-xl bg-[#171717] border border-white/5 text-sm text-white focus:outline-none focus:border-yellow-400 transition-all font-semibold"
              />
            </div>

            {/* Transmission */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-yellow-400" /> Gearbox
              </label>
              <select 
                value={transmission}
                onChange={(e) => setTransmission(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#171717] border border-white/5 text-sm text-white focus:outline-none focus:border-yellow-400 transition-all font-semibold cursor-pointer appearance-none"
              >
                <option value="">All Transmissions</option>
                <option value="Manual">Manual</option>
                <option value="Automatic">Automatic</option>
              </select>
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-yellow-400 text-black font-extrabold text-sm flex items-center justify-center gap-2 hover:bg-yellow-300 transform active:scale-95 transition-all shadow-lg shadow-yellow-400/10 cursor-pointer disabled:opacity-50"
              >
                <Search className="w-4 h-4" /> {loading ? 'Searching...' : 'Search Inventory'}
              </button>
            </div>

          </div>

          {/* Car Type Checkboxes */}
          <div className="border-t border-white/5 pt-4 flex flex-col gap-3">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-yellow-400" /> Filter by Category
            </span>
            <div className="flex flex-wrap gap-3">
              {carTypes.map((type) => {
                const isActive = selectedTypes.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleTypeToggle(type)}
                    className={`px-4 py-2 text-xs rounded-full border flex items-center gap-2 transition-all font-semibold cursor-pointer ${
                      isActive 
                        ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400' 
                        : 'border-white/5 bg-[#171717]/50 text-gray-400 hover:border-white/10 hover:text-white'
                    }`}
                  >
                    {isActive && <Check className="w-3 h-3" />}
                    {type}
                  </button>
                );
              })}
            </div>
          </div>
        </form>
      </div>

      {/* Catalog Grid Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-12 sm:mt-16">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start md:items-center gap-3 mb-8">
          <div>
            <h2 className="font-luxury font-bold text-xl text-white tracking-wide">Available Fleet</h2>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mt-0.5">
              {cars.length} vehicle{cars.length !== 1 ? 's' : ''} listed
            </p>
          </div>
          {fromDate && toDate && (
            <span className="text-[10px] sm:text-xs bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 px-3 py-1.5 rounded-full font-bold self-start sm:self-auto">
              Verification Active: {new Date(fromDate).toLocaleDateString([], { month: 'short', day: 'numeric' })} – {new Date(toDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>

        {cars.length === 0 ? (
          <div className="glass-panel rounded-2xl p-16 text-center border border-white/5">
            <HelpCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="font-bold text-white text-base">No Vehicles Found</h3>
            <p className="text-xs text-gray-500 max-w-xs mx-auto mt-2 leading-relaxed">
              No vehicles matched your search filter criteria. Try adjusting dates or filters to load other options.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {cars.map((car) => {
              const isBlocked = car.isAvailable === false;
              return (
                <div 
                  key={car.id} 
                  className={`glass-panel rounded-2xl overflow-hidden flex flex-col group border border-white/5 transition-all duration-300 relative ${
                    isBlocked ? 'opacity-85' : 'hover:border-white/10 hover:shadow-xl'
                  }`}
                >
                  
                  {/* Car Image container */}
                  <div className="h-48 sm:h-56 w-full relative overflow-hidden bg-neutral-900 flex items-center justify-center">
                    <img 
                      src={car.image} 
                      alt={car.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[600ms]"
                    />
                    
                    {/* Floating tags */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      <span className="bg-black/75 backdrop-blur-md text-[9px] uppercase tracking-widest text-white px-3 py-1.5 rounded-md font-extrabold border border-white/5">
                        {car.type}
                      </span>
                    </div>

                    {isBlocked && (
                      <div className="absolute inset-0 bg-[#0A0A0A]/90 backdrop-blur-[3px] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
                        <span className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-2">
                          <AlertTriangle className="w-5 h-5" />
                        </span>
                        <span className="text-white text-xs font-bold uppercase tracking-wider">Unavailable</span>
                        <span className="text-[10px] text-gray-400 mt-1 max-w-[180px] font-medium leading-normal">
                          Already booked for selected dates
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Car Specs */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-luxury font-bold text-lg text-white group-hover:text-yellow-400 transition-colors">
                          {car.name}
                        </h3>
                        <div className="text-right">
                          <span className="font-luxury font-extrabold text-lg text-white">₹{car.pricePerDay}</span>
                          <span className="block text-[9px] uppercase text-gray-500 tracking-wider">Per Day</span>
                        </div>
                      </div>

                      {/* Attribute Badges */}
                      <div className="flex items-center gap-5 mt-5 border-t border-white/5 pt-4 text-xs text-gray-400 font-medium">
                        <span className="flex items-center gap-1.5">
                          <Settings className="w-3.5 h-3.5 text-yellow-400/80" /> {car.transmission}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Fuel className="w-3.5 h-3.5 text-yellow-400/80" /> Hybrid/Electric
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-yellow-400/80" /> 5 Seats
                        </span>
                      </div>
                    </div>

                    {/* Book Action */}
                    <div className="mt-6">
                      <button
                        onClick={() => handleSelectCar(car)}
                        disabled={isBlocked}
                        className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 transform active:scale-[0.98] cursor-pointer ${
                          isBlocked 
                            ? 'bg-neutral-800 text-gray-600 border border-neutral-700 cursor-not-allowed'
                            : 'bg-white hover:bg-yellow-400 text-black hover:scale-[1.01]'
                        }`}
                      >
                        {isBlocked ? 'Unavailable' : 'Book Vehicle'}
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
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
