import React, { useState, useEffect } from 'react';
import { supabase } from "../lib/supabase"; 
import { Users, Clock, Calendar, CheckCircle, AlertCircle, Play, Loader2, ShieldCheck, Search, Fingerprint, Zap, Phone, Mail, User, X, LogIn, LogOut } from 'lucide-react';

export default function Attendance() {
  const [showOverlay, setShowOverlay] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [attendance, setAttendance] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState('member'); 
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [allPeople, setAllPeople] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [markingId, setMarkingId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('present');

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("attendance")
        .select(`
          *,
          members (name, phone, email),
          trainers (name, phone)
        `)
        .eq("user_id", user.id) 
        .eq("type", activeTab)
        .gte('created_at', `${selectedDate}T00:00:00.000Z`)
        .lte('created_at', `${selectedDate}T23:59:59.999Z`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAttendance(data || []);
    } catch (err) {
      console.error("Attendance fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Handle Check-Out Logic
  const handleCheckOut = async (id) => {
    try {
      const { error } = await supabase
        .from("attendance")
        .update({ check_out: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      fetchAttendance();
    } catch (err) {
      alert("Check-out failed: " + err.message);
    }
  };

  // ✅ NEW: Duration Calculation
  const calculateDuration = (inTime, outTime) => {
    if (!outTime) return "In Gym";
    const diff = new Date(outTime) - new Date(inTime);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    return `${hours}h ${mins}m`;
  };

  const fetchPeopleForCheckIn = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const table = activeTab === 'member' ? 'members' : 'trainers';
    const { data } = await supabase.from(table).select("*").eq("user_id", user.id);
    setAllPeople(data || []);
  };

  useEffect(() => {
    fetchAttendance();
  }, [activeTab, selectedDate]);

  const filteredAttendance = attendance.filter(item => {
    const person = activeTab === 'member' ? item.members : item.trainers;
    if (!person) return false;
    return (
      person.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.phone?.includes(searchTerm)
    );
  });

  const markAttendance = async (person) => {
    try {
      setMarkingId(person.id);
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("attendance").insert([{
        user_id: user.id,
        member_id: activeTab === 'member' ? person.id : null,
        trainer_id: activeTab === 'trainer' ? person.id : null,
        type: activeTab,
        status: selectedStatus,
        check_in: new Date().toISOString() // In time set automatically
      }]);
      if (error) throw error;
      setShowCheckInModal(false);
      setSelectedStatus('present'); 
      fetchAttendance(); 
    } catch (err) {
      alert(err.message);
    } finally {
      setMarkingId(null);
    }
  };

  const handleAction = () => {
    setShowOverlay(true);
    setTimeout(() => setShowOverlay(false), 3000);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'present': return 'bg-emerald-100 text-emerald-600';
      case 'late': return 'bg-amber-100 text-amber-600';
      case 'absent': return 'bg-rose-100 text-rose-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="relative min-h-[80vh] p-4 space-y-6 md:p-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 opacity-5"><ShieldCheck size={100} /></div>
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 uppercase tracking-tight italic flex items-center gap-2">Daily Attendance</h2>
          <div className="flex bg-slate-100 p-1 rounded-2xl w-fit border border-slate-200 mt-3">
            <button onClick={() => setActiveTab('member')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'member' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}><Users size={14} /> Members</button>
            <button onClick={() => setActiveTab('trainer')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'trainer' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}><User size={14} /> Staff / Trainers</button>
          </div>
        </div>
        <div className="flex gap-3 relative z-10">
          <div className="bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100 flex items-center gap-3 shadow-inner group transition-all hover:border-blue-200">
            <Calendar size={20} className="text-blue-600" />
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-transparent font-black text-slate-700 text-sm uppercase tracking-tighter outline-none cursor-pointer" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: `${activeTab === 'member' ? 'Members' : 'Staff'} Present`, value: attendance.length || '0', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Verified Status', value: '100%', icon: ShieldCheck, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Real-time Sync', value: 'Live', icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map((stat, i) => (
          <div key={i} onClick={handleAction} className={`${stat.bg} p-7 rounded-[32px] border-2 border-transparent shadow-sm cursor-pointer transition-all duration-300 group relative overflow-hidden`}>
            <div className="flex justify-between items-center relative z-10">
              <div>
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${stat.color} opacity-60 mb-1`}>{stat.label}</p>
                <h4 className={`text-4xl font-black ${stat.color} italic`}>{stat.value}</h4>
              </div>
              <div className={`p-4 rounded-2xl bg-white shadow-sm`}><stat.icon size={28} className={stat.color} /></div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/30">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-slate-900 rounded-full" />
            <div>
              <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest leading-none italic">{activeTab === 'member' ? 'Member' : 'Trainer'} Logs</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Verified Entry Stream</p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input type="text" placeholder={`SEARCH ${activeTab.toUpperCase()}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black tracking-widest focus:ring-4 focus:ring-blue-500/5 outline-none transition-all uppercase" />
            </div>
            <button onClick={() => { fetchPeopleForCheckIn(); setShowCheckInModal(true); }} className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all">
              <Zap size={14} fill="currentColor" className="text-yellow-400" /> Check-in
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-24 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
            <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">Accessing database...</p>
          </div>
        ) : filteredAttendance.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name & Role</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">In Time</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Out Time</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Duration</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredAttendance.map((log) => {
                  const person = activeTab === 'member' ? log.members : log.trainers;
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black italic text-sm ${activeTab === 'member' ? 'bg-slate-900 text-white' : 'bg-blue-600 text-white'}`}>{person?.name?.substring(0,2).toUpperCase() || '??'}</div>
                          <div>
                            <p className="text-xs font-black text-slate-800 uppercase italic tracking-tight">{person?.name || 'N/A'}</p>
                            <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded-md ${getStatusStyle(log.status)}`}>{log.status}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-1 text-slate-700 font-black text-[10px] italic underline decoration-blue-500/30">
                            <LogIn size={12} className="text-blue-500" />
                            {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center">
                          {log.check_out ? (
                            <div className="flex items-center gap-1 text-slate-700 font-black text-[10px] italic underline decoration-rose-500/30">
                              <LogOut size={12} className="text-rose-500" />
                              {new Date(log.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </div>
                          ) : (
                            <span className="text-[9px] font-black uppercase text-emerald-500 animate-pulse tracking-widest">Active</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 text-[9px] font-black uppercase rounded-lg italic ${log.check_out ? 'bg-slate-100 text-slate-500' : 'bg-blue-600 text-white shadow-md shadow-blue-100'}`}>
                          {calculateDuration(log.created_at, log.check_out)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!log.check_out && (
                          <button 
                            onClick={() => handleCheckOut(log.id)}
                            className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all active:scale-95"
                          >
                            End Shift
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-20 flex flex-col items-center justify-center text-center space-y-6">
            <Fingerprint size={64} className="text-slate-100" />
            <div className="space-y-2">
              <h4 className="text-xl font-black text-slate-800 italic uppercase">Log is Empty</h4>
              <p className="text-slate-400 text-sm max-w-xs mx-auto font-medium tracking-tight">No {activeTab} activity recorded on this date.</p>
            </div>
          </div>
        )}
      </div>

      {/* Modals and Overlays (Unchanged) */}
      {showCheckInModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="font-black uppercase italic tracking-widest text-sm">Select {activeTab}</h3>
              <button onClick={() => setShowCheckInModal(false)}><X size={20}/></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {['present', 'late', 'absent'].map((s) => (
                  <button key={s} onClick={() => setSelectedStatus(s)} className={`py-3 rounded-2xl text-[10px] font-black uppercase border-2 transition-all ${selectedStatus === s ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-md' : 'border-slate-100 text-slate-400'}`}>{s}</button>
                ))}
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input type="text" placeholder="Type name to search..." className="w-full pl-11 pr-4 py-4 bg-slate-50 rounded-2xl text-xs font-bold outline-none" onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                {allPeople.filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase())).map(person => (
                  <div key={person.id} className="flex justify-between items-center p-4 hover:bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all">
                    <div>
                      <p className="text-xs font-black uppercase italic tracking-tight">{person.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{person.phone}</p>
                    </div>
                    <button onClick={() => markAttendance(person)} disabled={markingId === person.id} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase italic shadow-lg shadow-blue-200 active:scale-95 transition-all">
                      {markingId === person.id ? "..." : "Confirm"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showOverlay && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md px-4">
          <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-slate-100 text-center max-w-sm w-full relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600 animate-pulse" />
            <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-[6px] border-slate-100"></div>
                <div className="absolute inset-0 rounded-full border-[6px] border-blue-600 border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center"><Clock className="text-blue-600" size={36} /></div>
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2 italic uppercase">Biometric Hub</h2>
            <p className="text-slate-500 text-sm font-medium leading-relaxed px-2">Our engineers are configuring the <strong>Neural Engine</strong> for contactless biometric check-ins.</p>
          </div>
        </div>
      )}
    </div>
  );
}