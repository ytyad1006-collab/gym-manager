import React, { useState } from 'react';
import { Users, Clock, Calendar, CheckCircle, AlertCircle, Play } from 'lucide-react';

export default function Attendance() {
  const [showOverlay, setShowOverlay] = useState(false);

  // Click handler jo status dikhayega
  const handleAction = () => {
    setShowOverlay(true);
    // 3 second baad automatically hat jayega
    setTimeout(() => setShowOverlay(false), 3000);
  };

  return (
    <div className="relative min-h-[80vh] p-4 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight italic">Daily Attendance</h2>
          <p className="text-slate-500 text-sm">Manage and track member check-ins</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 flex items-center gap-2">
            <Calendar size={18} className="text-blue-600" />
            <span className="font-bold text-blue-700">{new Date().toDateString()}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Present', value: '0', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Total Absent', value: '0', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Avg. Check-in', value: '--:--', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map((stat, i) => (
          <div key={i} onClick={handleAction} className={`${stat.bg} p-5 rounded-2xl border border-white shadow-sm cursor-pointer hover:scale-105 transition-transform`}>
            <div className="flex justify-between items-center">
              <div>
                <p className={`text-xs font-bold uppercase tracking-widest ${stat.color} opacity-70`}>{stat.label}</p>
                <h4 className={`text-2xl font-black ${stat.color}`}>{stat.value}</h4>
              </div>
              <stat.icon size={32} className={stat.color} />
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-700">Recent Check-ins</h3>
          <button 
            onClick={handleAction}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors"
          >
            <Play size={14} fill="currentColor"/> Mark Attendance
          </button>
        </div>
        
        <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="bg-slate-50 p-6 rounded-full">
            <Users size={48} className="text-slate-300" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-800">No records found for today</h4>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">Click on 'Mark Attendance' to start recording member presence.</p>
          </div>
        </div>
      </div>

      {/* --- IN PROCESS OVERLAY --- */}
      {showOverlay && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-3xl shadow-2xl border-4 border-blue-500 text-center transform animate-in zoom-in duration-300">
            <div className="relative w-20 h-20 mx-auto mb-4">
               <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
               <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
               <Clock className="absolute inset-0 m-auto text-blue-500" size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">In Process...</h2>
            <p className="text-blue-600 font-bold tracking-widest uppercase italic">Coming Soon!</p>
            <p className="text-slate-400 text-xs mt-4">We are working on biometric integration</p>
          </div>
        </div>
      )}
    </div>
  );
}