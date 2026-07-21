'use client';

import React, { useState, useEffect } from 'react';
import { carService } from '../../../services/api';
import { Car } from '../../../types';
import { Car as CarIcon, Plus, Pencil, Trash2, X, Settings, Users, Fuel, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function AdminFleetCrudPage() {
  const { admin, loading: authLoading } = useAuth();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  // Form overlay modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [type, setType] = useState('Sedan');
  const [transmission, setTransmission] = useState('Automatic');
  const [pricePerDay, setPricePerDay] = useState('');
  const [image, setImage] = useState('');
  const [status, setStatus] = useState<'AVAILABLE' | 'MAINTENANCE'>('AVAILABLE');
  
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchCars = async () => {
    setLoading(true);
    try {
      const list = await carService.adminList();
      setCars(list);
    } catch (err) {
      console.error('Failed to query admin fleet', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && admin) {
      fetchCars();
    }
  }, [authLoading, admin]);

  const openAddModal = () => {
    setEditingCar(null);
    setName('');
    setType('Sedan');
    setTransmission('Automatic');
    setPricePerDay('');
    setImage('');
    setStatus('AVAILABLE');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (car: Car) => {
    setEditingCar(car);
    setName(car.name);
    setType(car.type);
    setTransmission(car.transmission);
    setPricePerDay(car.pricePerDay.toString());
    setImage(car.image);
    setStatus(car.status);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this vehicle from the active rental fleet?')) return;
    try {
      await carService.adminDelete(id);
      alert('Vehicle successfully deleted.');
      fetchCars();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete vehicle. It may be locked in an active booking.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !pricePerDay || !image) {
      setFormError('Name, price per day, and image URL are required.');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    const payload = {
      name,
      type: type as any,
      transmission: transmission as any,
      pricePerDay: parseFloat(pricePerDay),
      image,
      status
    };

    try {
      if (editingCar) {
        await carService.adminUpdate(editingCar.id, payload);
        alert('Vehicle details updated successfully.');
      } else {
        await carService.adminCreate(payload);
        alert('Vehicle added to active fleet.');
      }
      setIsModalOpen(false);
      fetchCars();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to submit form.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0A0A0A] text-white">
        <span>Loading active fleet console...</span>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <div className="flex-1 bg-[#0A0A0A] py-8 sm:py-12 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto w-full flex flex-col gap-6 sm:gap-8">
      
      {/* Title */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h2 className="font-luxury font-bold text-xl text-white tracking-wide flex items-center gap-2">
            <CarIcon className="w-5 h-5 text-yellow-400" /> Active Fleet Repository
          </h2>
          <p className="text-xs text-gray-400 mt-1 font-medium">Add, modify, and manage car specifications and pricing</p>
        </div>
        
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-xs uppercase tracking-widest rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg shadow-yellow-400/10"
        >
          <Plus className="w-4 h-4" /> Add Vehicle
        </button>
      </div>

      {/* Fleet Catalog Grid */}
      {loading ? (
        <div className="text-center py-12 text-xs text-gray-500">Loading fleet catalog repository...</div>
      ) : cars.length === 0 ? (
        <div className="glass-panel rounded-2xl p-16 text-center text-xs text-gray-500 border border-white/5">
          Active fleet is empty. Click &quot;Add Vehicle&quot; to seed initial fleet data.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cars.map((car) => (
            <div key={car.id} className="glass-panel rounded-2xl overflow-hidden flex flex-col group border border-white/5 hover:border-white/10 transition-all">
              
              {/* Image Frame */}
              <div className="h-48 w-full relative bg-neutral-900 overflow-hidden">
                <img 
                  src={car.image} 
                  alt={car.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[600ms]"
                />
                
                {/* Float tags */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-black/75 backdrop-blur-md text-[8px] uppercase tracking-widest text-white px-2.5 py-1 rounded font-extrabold border border-white/5">
                    {car.type}
                  </span>
                  <span className={`text-[8px] uppercase tracking-widest px-2.5 py-1 rounded font-extrabold border ${
                    car.status === 'AVAILABLE' 
                      ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                      : 'bg-red-500/10 text-red-500 border-red-500/20'
                  }`}>
                    {car.status}
                  </span>
                </div>
              </div>

              {/* Data Panel */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-luxury font-bold text-base text-white">{car.name}</h3>
                    <div className="text-right">
                      <span className="font-luxury font-extrabold text-sm text-white">₹{car.pricePerDay}</span>
                      <span className="block text-[8px] uppercase text-gray-500 tracking-wider">Per Day</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-4 border-t border-white/5 pt-3 text-[10px] text-gray-400 font-semibold">
                    <span className="flex items-center gap-1">
                      <Settings className="w-3.5 h-3.5 text-yellow-400/80" /> {car.transmission}
                    </span>
                    <span className="flex items-center gap-1">
                      <Fuel className="w-3.5 h-3.5 text-yellow-400/80" /> Petrol/Diesel
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-yellow-400/80" /> 5 Seats
                    </span>
                  </div>
                </div>

                {/* Operations CRUD actions */}
                <div className="flex gap-3 mt-6 border-t border-white/5 pt-4">
                  <button
                    onClick={() => openEditModal(car)}
                    className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-yellow-400/50 hover:bg-yellow-400/10 text-gray-200 hover:text-yellow-400 font-bold text-[10px] uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(car.id)}
                    className="py-2 px-3 rounded-xl bg-red-600/10 border border-red-600/20 hover:bg-red-600 hover:text-white text-red-500 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

            </div>
          ))}
        </div>
      )}

      {/* CRUD Add/Edit Overlay Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg glass-panel rounded-2xl overflow-hidden border border-white/10 flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 bg-[#171717] max-h-[90vh]">
            
            {/* Modal Head */}
            <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center bg-[#0A0A0A]/40 flex-shrink-0">
              <h3 className="font-luxury font-bold text-white text-base">
                {editingCar ? 'Modify Vehicle details' : 'Register New Fleet Vehicle'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/5 text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body form */}
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 flex flex-col gap-4 overflow-y-auto min-h-0">
              {formError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vehicle Name</label>
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-[#0A0A0A] border border-white/5 text-xs text-white focus:outline-none focus:border-yellow-400 font-semibold"
                  placeholder="e.g. Porsche 911 Carrera"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="px-4 py-2.5 rounded-xl bg-[#0A0A0A] border border-white/5 text-xs text-white focus:outline-none focus:border-yellow-400 font-semibold cursor-pointer"
                  >
                    <option value="Hatchback">Hatchback</option>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Luxury">Luxury</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gearbox Transmission</label>
                  <select
                    value={transmission}
                    onChange={(e) => setTransmission(e.target.value)}
                    className="px-4 py-2.5 rounded-xl bg-[#0A0A0A] border border-white/5 text-xs text-white focus:outline-none focus:border-yellow-400 font-semibold cursor-pointer"
                  >
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Price Per Day (INR)</label>
                  <input 
                    type="number"
                    min={1}
                    value={pricePerDay}
                    onChange={(e) => setPricePerDay(e.target.value)}
                    className="px-4 py-2.5 rounded-xl bg-[#0A0A0A] border border-white/5 text-xs text-white focus:outline-none focus:border-yellow-400 font-semibold"
                    placeholder="e.g. 25000"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Operational Status</label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="px-4 py-2.5 rounded-xl bg-[#0A0A0A] border border-white/5 text-xs text-white focus:outline-none focus:border-yellow-400 font-semibold cursor-pointer"
                  >
                    <option value="AVAILABLE">AVAILABLE (Operational)</option>
                    <option value="MAINTENANCE">MAINTENANCE (Offline)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vehicle Image URL</label>
                <input 
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-[#0A0A0A] border border-white/5 text-xs text-white focus:outline-none focus:border-yellow-400 font-semibold"
                  placeholder="https://images.unsplash.com/photo-..."
                  required
                />
              </div>

              {/* Modal footer */}
              <div className="flex justify-end gap-3 mt-4 border-t border-white/5 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-neutral-900 border border-white/5 rounded-xl text-gray-400 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-yellow-400 text-black hover:bg-yellow-300 rounded-xl font-bold text-xs uppercase tracking-widest transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Saving Changes...' : 'Save Fleet Info'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
