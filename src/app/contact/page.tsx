'use client';

import React, { useState } from 'react';
import { MapPin, Mail, Phone, Clock, Send, CheckCircle2, FileText } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      alert('Please fill in name, email, and message fields.');
      return;
    }
    setSending(true);
    // Mock API call to simulate message sending
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }, 1500);
  };

  return (
    <div className="flex-1 bg-[#0A0A0A] py-8 sm:py-12 px-4 sm:px-6 md:px-12 max-w-6xl mx-auto w-full flex flex-col gap-8 sm:gap-12">
      
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto flex flex-col gap-3">
        <span className="text-[10px] uppercase tracking-widest text-yellow-400 font-extrabold bg-yellow-400/10 px-3 py-1 rounded-full border border-yellow-400/20 w-fit mx-auto">
          Contact Us
        </span>
        <h2 className="font-luxury font-bold text-2xl sm:text-3xl md:text-4xl text-white tracking-wide mt-2">
          Connect With FitBros
        </h2>
        <p className="text-xs text-gray-400 leading-relaxed font-medium">
          Have queries about our luxury fleet, custom subscription plans, or rental locations? Get in touch with our team in Bengaluru.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 items-stretch">
        
        {/* Office Details Column */}
        <div className="flex flex-col gap-6">
          <h3 className="font-luxury font-bold text-xl text-white tracking-wide border-b border-white/5 pb-3">
            Our Hub Office
          </h3>

          {/* Address Box */}
          <div className="glass-panel rounded-xl p-5 border border-white/5 flex gap-4 transition-all duration-300 hover:border-yellow-400/30">
            <div className="w-10 h-10 rounded-lg bg-yellow-400/10 flex items-center justify-center text-yellow-400 flex-shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Office Address</h4>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed font-semibold">
                FitBros Car Rental Headquarters<br />
                51, Dayananda Sagar College Road, 2nd Cross,<br />
                1st Stage, Teachers Colony, Bengaluru, Bengaluru Urban, Karnataka, 560078
              </p>
            </div>
          </div>

          {/* Email Box */}
          <div className="glass-panel rounded-xl p-5 border border-white/5 flex gap-4 transition-all duration-300 hover:border-yellow-400/30">
            <div className="w-10 h-10 rounded-lg bg-yellow-400/10 flex items-center justify-center text-yellow-400 flex-shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Email Address</h4>
              <p className="text-xs text-gray-400 mt-2 font-semibold">
                Email: <a href="mailto:fitbrosindia3@gmail.com" className="text-white hover:text-yellow-400 transition-colors">fitbrosindia3@gmail.com</a>
              </p>
            </div>
          </div>

          {/* Phone Box */}
          <div className="glass-panel rounded-xl p-5 border border-white/5 flex gap-4 transition-all duration-300 hover:border-yellow-400/30">
            <div className="w-10 h-10 rounded-lg bg-yellow-400/10 flex items-center justify-center text-yellow-400 flex-shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Phone Hotline</h4>
              <p className="text-xs text-gray-400 mt-2 font-semibold">
                Phone Number: <span className="text-white">+91 97438 54269</span>
              </p>
            </div>
          </div>

          {/* Clock Box */}
          <div className="glass-panel rounded-xl p-5 border border-white/5 flex gap-4 transition-all duration-300 hover:border-yellow-400/30">
            <div className="w-10 h-10 rounded-lg bg-yellow-400/10 flex items-center justify-center text-yellow-400 flex-shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Business Hours</h4>
              <p className="text-xs text-gray-400 mt-2 font-semibold">
                Monday – Saturday: <span className="text-white">09:00 AM – 09:00 PM</span><br />
                Sunday: <span className="text-white">10:00 AM – 06:00 PM</span>
              </p>
            </div>
          </div>

          {/* GST Box */}
          <div className="glass-panel rounded-xl p-5 border border-white/5 flex gap-4 transition-all duration-300 hover:border-yellow-400/30">
            <div className="w-10 h-10 rounded-lg bg-yellow-400/10 flex items-center justify-center text-yellow-400 flex-shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">GST IN</h4>
              <p className="text-xs text-gray-400 mt-2 font-semibold font-mono">
                29ABTPZ3427C1Z4
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form Column */}
        <div className="glass-panel rounded-2xl p-6 md:p-8 border border-white/5 flex flex-col justify-between">
          <div>
            <h3 className="font-luxury font-bold text-xl text-white tracking-wide border-b border-white/5 pb-3">
              Send Us a Message
            </h3>
            <p className="text-xs text-gray-400 mt-3 leading-relaxed font-medium">
              Fill in the form below and our regional operation managers will get back to you within 2 business hours.
            </p>
          </div>

          {sent ? (
            <div className="my-8 p-6 rounded-xl bg-green-500/10 border border-green-500/20 text-center flex flex-col items-center gap-3 animate-in zoom-in-95 duration-200">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
              <h4 className="font-bold text-white text-sm">Message Sent Successfully!</h4>
              <p className="text-xs text-gray-400 leading-relaxed max-w-xs mt-1">
                Thank you for reaching out. We have logged your query and will contact you shortly.
              </p>
              <button 
                type="button" 
                onClick={() => setSent(false)}
                className="mt-4 px-5 py-2 bg-white text-black text-[10px] uppercase tracking-wider font-extrabold rounded-lg hover:bg-yellow-400 transition-colors"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter name"
                    className="px-4 py-2.5 bg-[#171717]/80 border border-white/5 rounded-xl text-xs text-white placeholder-gray-700 focus:outline-none focus:border-yellow-400"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="px-4 py-2.5 bg-[#171717]/80 border border-white/5 rounded-xl text-xs text-white placeholder-gray-700 focus:outline-none focus:border-yellow-400"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Subject</label>
                <input 
                  type="text" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="How can we help you?"
                  className="px-4 py-2.5 bg-[#171717]/80 border border-white/5 rounded-xl text-xs text-white placeholder-gray-700 focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Your Message</label>
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type message details here..."
                  rows={4}
                  className="px-4 py-2.5 bg-[#171717]/80 border border-white/5 rounded-xl text-xs text-white placeholder-gray-700 focus:outline-none focus:border-yellow-400 resize-none"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={sending}
                className="w-full mt-2 py-3 bg-white hover:bg-yellow-400 text-black font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all duration-300 transform active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {sending ? 'Sending Message...' : <><Send className="w-3.5 h-3.5" /> Send Message</>}
              </button>
            </form>
          )}
        </div>

      </div>

      {/* Visual Hub Location Map */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/5 flex flex-col gap-4">
        <div className="px-6 py-4 border-b border-white/5 bg-white/5">
          <h4 className="text-xs font-bold text-white uppercase tracking-widest">Our Teachers Colony Hub Map Location</h4>
        </div>
        <div className="h-80 relative bg-[#171717] overflow-hidden">
          <iframe 
            src="https://maps.google.com/maps?q=51,%20Dayananda%20Sagar%20College%20Road,%202nd%20Cross,%201st%20Stage,%20Teachers%20Colony,%20Bengaluru,%20Bengaluru%20Urban,%20Karnataka,%20560078&t=&z=16&ie=UTF8&iwloc=B&output=embed"
            title="FitBros Hub Map Location"
            className="w-full h-full border-0 opacity-80 transition-opacity duration-300 hover:opacity-100"
            style={{ filter: 'grayscale(100%) invert(92%) contrast(110%)' }}
            allowFullScreen
            loading="lazy"
          />
        </div>
      </div>


    </div>
  );
}
