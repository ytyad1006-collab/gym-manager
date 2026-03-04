import React, { useState, useEffect } from 'react';
import { supabase } from "../lib/supabase"; 
import { Users, Clock, Calendar, CheckCircle, AlertCircle, Play, Loader2, ShieldCheck, Search, Fingerprint, Zap } from 'lucide-react';

export default function Attendance() {
  const [showOverlay, setShowOverlay] = useState(false);
  const [attendance, setAttendance] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("user_id", user.id) 
        .eq("date", new Date().toISOString().split('T')[0]);

      if (!error) setAttendance(data || []);
    } catch (err) {
      console.log("Attendance fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleAction = () => {
    setShowOverlay(true);
    setTimeout(() => setShowOverlay(false), 3000);
  };

  return (
    <div className="relative min-h-[80vh] p-4 space-y-6 md:p-8 max-w-7xl mx-auto">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 opacity-5">
           <ShieldCheck size={100} />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 uppercase tracking-tight italic flex items-center gap-2">
            Daily Attendance
          </h2>
          <p className="text-slate-500 text-sm font-medium flex items-center gap-1">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Live Member Monitoring System
          </p>
        </div>
        <div className="flex gap-3 relative z-10">
          <div className="bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100 flex items-center gap-3 shadow-inner group">
            <Calendar size={20} className="text-blue-600 group-hover:rotate-12 transition-transform" />
            <span className="font-black text-slate-700 text-sm uppercase tracking-tighter">
                {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Present', value: attendance.length || '0', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'hover:border-emerald-200' },
          { label: 'Total Absent', value: '0', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50', border: 'hover:border-rose-200' },
          { label: 'Avg. Check-in', value: '--:--', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50', border: 'hover:border-blue-200' },
        ].map((stat, i) => (
          <div 
            key={i} 
            onClick={handleAction} 
            className={`${stat.bg} p-7 rounded-[32px] border-2 border-transparent ${stat.border} shadow-sm cursor-pointer transition-all duration-300 group relative overflow-hidden`}
          >
            <div className="flex justify-between items-center relative z-10">
              <div>
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${stat.color} opacity-60 mb-1`}>{stat.label}</p>
                <h4 className={`text-4xl font-black ${stat.color} italic`}>{stat.value}</h4>
              </div>
              <div className={`p-4 rounded-2xl bg-white shadow-sm group-hover:scale-110 transition-transform`}>
                <stat.icon size={28} className={stat.color} />
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 opacity-5 group-hover:scale-150 transition-transform duration-700">
               <stat.icon size={100} className={stat.color} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
        {/* Sub-header with Quick Actions */}
        <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/30">
          <div className="flex items-center gap-3">
             <div className="w-1.5 h-8 bg-slate-900 rounded-full" />
             <div>
                <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest leading-none">Access Logs</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Manual & Biometric Sync</p>
             </div>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                <input 
                  type="text"
                  placeholder="SEARCH MEMBER ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black tracking-widest focus:ring-4 focus:ring-blue-500/5 outline-none transition-all uppercase"
                />
            </div>
            <button 
              onClick={handleAction}
              className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all active:scale-95 shadow-xl shadow-slate-200 shrink-0"
            >
              <Zap size={14} fill="currentColor" className="text-yellow-400" /> Check-in
            </button>
          </div>
        </div>
        
        {/* Conditional Content */}
        {loading ? (
          <div className="p-24 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
            <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">Syncing secure logs...</p>
          </div>
        ) : attendance.length > 0 ? (
          <div className="p-4">
             {/* Table Logic Jab data ho (Customizable) */}
          </div>
        ) : (
          <div className="p-20 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-700">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-50 rounded-full scale-[2] blur-3xl opacity-50" />
              <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-2xl relative z-10 group">
                <Fingerprint size={64} className="text-slate-100 group-hover:text-blue-500 transition-colors duration-500" />
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-xl font-black text-slate-800 italic uppercase">Log is Empty</h4>
              <p className="text-slate-400 text-sm max-w-xs mx-auto font-medium">
                No check-in activity detected today. Use the button above to manually record presence.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* --- IN PROCESS OVERLAY (Logic Unchanged) --- */}
      {showOverlay && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300 px-4">
          <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-slate-100 text-center transform animate-in zoom-in duration-300 max-w-sm w-full relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600 animate-pulse" />
            <div className="relative w-24 h-24 mx-auto mb-6">
               <div className="absolute inset-0 rounded-full border-[6px] border-slate-100"></div>
               <div className="absolute inset-0 rounded-full border-[6px] border-blue-600 border-t-transparent animate-spin"></div>
               <div className="absolute inset-0 flex items-center justify-center">
                  <Clock className="text-blue-600" size={36} />
               </div>
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2 italic uppercase">Biometric Hub</h2>
            <div className="inline-block px-4 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black tracking-widest uppercase mb-4">
                Phase 2: Face-ID Syncing
            </div>
            <p className="text-slate-500 text-sm font-medium leading-relaxed px-2">
              Our engineers are configuring the <strong>Neural Engine</strong> for contactless biometric check-ins.
            </p>
            <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center px-4">
               <p className="text-slate-300 text-[9px] font-black uppercase tracking-[0.2em]">Auth v4.2</p>
               <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-blue-200 rounded-full animate-bounce [animation-delay:0.4s]" />
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}