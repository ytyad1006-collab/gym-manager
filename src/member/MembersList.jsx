import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Search, Loader2, MoreVertical, MessageCircle, Edit2, RefreshCw, Eye, Trash2, X, Download, Send, Phone, Calendar, Mail } from "lucide-react";
import * as XLSX from 'xlsx';

export default function MembersList() {
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeMenu, setActiveMenu] = useState(null);
  const [gymName, setGymName] = useState("Our Gym");
  
  const [selectedMember, setSelectedMember] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showDueModal, setShowDueModal] = useState(false); // Added back
  const [duePayment, setDuePayment] = useState(""); // Added back
  const [customMessage, setCustomMessage] = useState("");

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => { 
    fetchMembers();
    getGymInfo();
  }, []);

  const getGymInfo = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.user_metadata?.gym_name) setGymName(user.user_metadata.gym_name);
  };

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data: membersData } = await supabase.from("members").select("*").order("created_at", { ascending: false });
      const { data: plansData } = await supabase.from("membership_plans").select("*");

      setPlans(plansData || []);
      const mergedData = (membersData || []).map(member => ({
        ...member,
        membership_plans: plansData?.find(plan => plan.id === member.plan_id) || { name: "No Plan", price: 0 }
      }));
      setMembers(mergedData);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  // Collect Due Logic Added Back
  const handleCollectDue = async () => {
    const amount = Number(duePayment);
    if (amount <= 0 || amount > selectedMember.due_amount) {
      alert("Please enter a valid amount within the due limit.");
      return;
    }

    const { error } = await supabase.from("members").update({
      due_amount: selectedMember.due_amount - amount,
      paid_amount: (selectedMember.paid_amount || 0) + amount
    }).eq("id", selectedMember.id);

    if (!error) {
      await supabase.from("payments").insert([{
        member_id: selectedMember.id,
        amount: amount,
        payment_date: today,
        payment_mode: "Due Collection"
      }]);
      fetchMembers();
      setShowDueModal(false);
      setDuePayment("");
    }
  };

  const deleteMember = async (id) => {
    if (window.confirm("Are you sure? This will remove the member permanently.")) {
      const { error } = await supabase.from("members").delete().eq("id", id);
      if (!error) fetchMembers();
    }
  };

  const exportToExcel = () => {
    const exportData = filteredMembers.map(m => ({
      "Name": m.name, "Phone": m.phone, "Email": m.email, "Join Date": m.created_at?.split('T')[0],
      "Expiry": m.expiry_date, "Plan": m.membership_plans?.name, "Due": m.due_amount
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Members");
    XLSX.writeFile(wb, `${gymName}_Members.xlsx`);
  };

  const sendWhatsAppMessage = (type, member) => {
    let msg = "";
    if (type === "welcome") msg = `Hi ${member.name}, Welcome to ${gymName}! 💪 We are glad to have you.`;
    else if (type === "expiry") msg = `Hi ${member.name}, your membership at ${gymName} expires on ${member.expiry_date}. Please renew to continue.`;
    else if (type === "payment") msg = `Hi ${member.name}, a friendly reminder from ${gymName} to clear your pending due of ₹${member.due_amount}.`;
    else msg = `${customMessage} - Regards, ${gymName}`;
    
    window.open(`https://wa.me/91${member.phone}?text=${encodeURIComponent(msg)}`, "_blank");
    setShowWhatsAppModal(false);
    setCustomMessage("");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from("members").update({
        name: selectedMember.name,
        phone: selectedMember.phone,
        email: selectedMember.email,
        expiry_date: selectedMember.expiry_date 
    }).eq("id", selectedMember.id);
    if (!error) { fetchMembers(); setShowEditModal(false); }
  };

  const handleRenewWithPayment = async (planId, amountPaid) => {
    const plan = plans.find(p => p.id === planId);
    const newExpiry = new Date();
    newExpiry.setMonth(newExpiry.getMonth() + 1); 
    
    const newDue = Math.max(0, plan.price - amountPaid);

    const { error } = await supabase.from("members").update({
      plan_id: planId,
      expiry_date: newExpiry.toISOString().split('T')[0],
      due_amount: newDue,
      paid_amount: (selectedMember.paid_amount || 0) + Number(amountPaid)
    }).eq("id", selectedMember.id);

    if (!error) {
      await supabase.from("payments").insert([{
        member_id: selectedMember.id,
        amount: amountPaid,
        payment_date: today,
        payment_mode: "Cash/Online"
      }]);
      fetchMembers();
      setShowRenewModal(false);
    }
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.phone?.includes(searchTerm)
  );

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6 max-w-7xl mx-auto animate-page overflow-x-hidden">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 md:p-6 rounded-[24px] shadow-sm border border-slate-100">
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight italic uppercase">{gymName} CREW</h3>
          <p className="text-xs md:text-sm text-slate-400 font-medium tracking-wide">Total: {filteredMembers.length} Active Souls</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search name or phone..." 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-xs font-bold" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <button 
            onClick={exportToExcel} 
            className="flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all w-full sm:w-auto border border-emerald-100 shadow-sm"
          >
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* Members List */}
      <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-4">
             <Loader2 className="animate-spin text-blue-600" size={40} />
             <p className="text-slate-400 font-medium animate-pulse text-sm">Synchronizing Data...</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Member Info</th>
                    <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Details</th>
                    <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-black uppercase shadow-lg shadow-slate-200 flex-shrink-0">
                            {m.name.substring(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 text-sm truncate">{m.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Plan: {m.membership_plans?.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5"><Phone size={12} className="text-blue-500"/> {m.phone}</span>
                          {m.email && <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5"><Mail size={12}/> {m.email}</span>}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${m.expiry_date >= today ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"}`}>
                          {m.expiry_date >= today ? "Active" : "Expired"}
                        </span>
                      </td>
                      <td className="p-4 text-right relative">
                        <button 
                          onClick={() => setActiveMenu(activeMenu === m.id ? null : m.id)}
                          className="p-2 hover:bg-white rounded-lg transition-all text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-100"
                        >
                          <MoreVertical size={18} />
                        </button>
                        
                        {activeMenu === m.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)}></div>
                            <div className="absolute right-12 top-0 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl z-20 overflow-hidden py-1 animate-in fade-in zoom-in duration-200 text-left">
                              <button onClick={() => { setSelectedMember(m); setShowViewModal(true); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors border-b border-slate-50"><Eye size={14} className="text-blue-500"/> View Profile</button>
                              <button onClick={() => { setSelectedMember(m); setShowDueModal(true); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 text-orange-600 text-xs font-black transition-colors border-b border-slate-50"><Download size={14} className="rotate-180"/> Collect Due</button>
                              <button onClick={() => { setSelectedMember(m); setShowWhatsAppModal(true); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-green-50 text-green-600 text-xs font-black transition-colors border-b border-slate-50"><MessageCircle size={14}/> WhatsApp</button>
                              <button onClick={() => { setSelectedMember(m); setShowEditModal(true); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 text-blue-600 text-xs font-bold transition-colors border-b border-slate-50"><Edit2 size={14}/> Edit Info</button>
                              <button onClick={() => { setSelectedMember(m); setShowRenewModal(true); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-emerald-50 text-emerald-600 text-xs font-black transition-colors border-b border-slate-50"><RefreshCw size={14}/> Renew & Pay</button>
                              <button onClick={() => {deleteMember(m.id); setActiveMenu(null);}} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-rose-50 text-rose-500 text-xs font-bold transition-colors"><Trash2 size={14}/> Remove</button>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Optimized Card View */}
            <div className="md:hidden grid grid-cols-1 divide-y divide-slate-100">
              {filteredMembers.map((m) => (
                <div key={m.id} className="p-4 flex items-center justify-between gap-3 group active:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-black border-2 ${m.expiry_date >= today ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                      {m.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-black text-slate-800 text-sm truncate">{m.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{m.phone}</p>
                      <div className="mt-1 flex items-center gap-2 flex-wrap">
                         <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${m.expiry_date >= today ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                           {m.expiry_date >= today ? "Active" : "Expired"}
                         </span>
                         {m.due_amount > 0 && <span className="text-[8px] font-black px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded uppercase">Due: ₹{m.due_amount}</span>}
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative flex-shrink-0">
                    <button 
                      onClick={() => setActiveMenu(activeMenu === m.id ? null : m.id)}
                      className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-full text-slate-400 border border-slate-100 shadow-sm"
                    >
                      <MoreVertical size={18} />
                    </button>
                    {activeMenu === m.id && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setActiveMenu(null)}></div>
                        <div className="absolute right-0 top-12 w-44 bg-white border border-slate-100 rounded-2xl shadow-2xl z-40 overflow-hidden py-1 animate-in slide-in-from-top-2">
                           <button onClick={() => { setSelectedMember(m); setShowViewModal(true); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-700"><Eye size={14}/> View</button>
                           <button onClick={() => { setSelectedMember(m); setShowDueModal(true); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black text-orange-600 border-t border-slate-50"><Download size={14} className="rotate-180"/> Collect Due</button>
                           <button onClick={() => { setSelectedMember(m); setShowWhatsAppModal(true); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black text-green-600 border-t border-slate-50"><MessageCircle size={14}/> WhatsApp</button>
                           <button onClick={() => { setSelectedMember(m); setShowRenewModal(true); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black text-emerald-600 border-t border-slate-50"><RefreshCw size={14}/> Renew</button>
                           <button onClick={() => {deleteMember(m.id); setActiveMenu(null);}} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-rose-500 border-t border-slate-50"><Trash2 size={14}/> Delete</button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* VIEW MODAL */}
      {showViewModal && selectedMember && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 animate-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">
            <div className="p-6 md:p-8 pb-4 flex justify-between items-start sticky top-0 bg-white z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-lg font-black uppercase">
                  {selectedMember.name.substring(0,2)}
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 italic tracking-tight">{selectedMember.name}</h2>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{selectedMember.membership_plans?.name}</p>
                </div>
              </div>
              <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20}/></button>
            </div>
            
            <div className="p-6 md:p-8 pt-4 space-y-6">
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Joined On</p>
                  <p className="font-black text-slate-700 text-xs flex items-center gap-2 tracking-tighter"><Calendar size={12} className="text-blue-500"/> {selectedMember.created_at?.split('T')[0]}</p>
                </div>
                <div className={`p-4 rounded-2xl border ${selectedMember.expiry_date >= today ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                  <p className={`text-[9px] font-black uppercase mb-1 ${selectedMember.expiry_date >= today ? 'text-emerald-400' : 'text-rose-400'}`}>Expiry Date</p>
                  <p className={`font-black text-xs flex items-center gap-2 tracking-tighter ${selectedMember.expiry_date >= today ? 'text-emerald-600' : 'text-rose-600'}`}><Calendar size={12}/> {selectedMember.expiry_date}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                   <span className="text-[10px] font-black text-slate-400 uppercase">WhatsApp</span>
                   <span className="text-sm font-bold text-slate-700 tracking-tight">{selectedMember.phone}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100 overflow-hidden">
                   <span className="text-[10px] font-black text-slate-400 uppercase">Email</span>
                   <span className="text-sm font-bold text-slate-700 truncate ml-4">{selectedMember.email || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                   <span className="text-[10px] font-black text-slate-400 uppercase">Pending Due</span>
                   <span className="text-xl font-black text-rose-500 italic">₹{selectedMember.due_amount}</span>
                </div>
              </div>
              
              <button onClick={() => setShowViewModal(false)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200">Close Profile</button>
            </div>
          </div>
        </div>
      )}

      {/* COLLECT DUE MODAL - ADDED BACK */}
      {showDueModal && selectedMember && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-[32px] w-full max-w-sm p-6 md:p-8 shadow-2xl animate-in zoom-in duration-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCw size={30} />
              </div>
              <h2 className="text-xl font-black text-slate-900 italic uppercase">Clear Pending Due</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Member: {selectedMember.name}</p>
            </div>
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase">Total Outstanding</span>
                <span className="text-lg font-black text-rose-500 italic">₹{selectedMember.due_amount}</span>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Amount Receiving Now</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-sm">₹</span>
                  <input type="number" autoFocus className="w-full pl-8 pr-4 py-4 bg-slate-50 border-2 border-orange-100 rounded-2xl outline-none focus:border-orange-500 font-black text-lg transition-all" placeholder="0.00" value={duePayment} onChange={(e) => setDuePayment(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowDueModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase">Cancel</button>
                <button onClick={handleCollectDue} className="flex-1 py-4 bg-orange-500 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-orange-100 hover:bg-orange-600 transition-all">Update</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedMember && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <form onSubmit={handleUpdate} className="bg-white rounded-[32px] w-full max-w-md p-6 md:p-8 shadow-2xl animate-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-slate-900 italic">EDIT MEMBER</h2>
                <button type="button" onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-900"><X /></button>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Full Name</label>
                <input className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm" value={selectedMember.name} onChange={(e) => setSelectedMember({...selectedMember, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">WhatsApp No.</label>
                <input className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm" value={selectedMember.phone} onChange={(e) => setSelectedMember({...selectedMember, phone: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Email</label>
                <input className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm" value={selectedMember.email || ""} onChange={(e) => setSelectedMember({...selectedMember, email: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Adjust Expiry</label>
                <input type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm" value={selectedMember.expiry_date} onChange={(e) => setSelectedMember({...selectedMember, expiry_date: e.target.value})} />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 bg-slate-100 text-slate-500 py-3.5 rounded-xl font-black text-[10px] uppercase">Cancel</button>
                <button type="submit" className="flex-1 bg-slate-900 text-white py-3.5 rounded-xl font-black text-[10px] uppercase hover:bg-blue-600 transition-all shadow-lg shadow-blue-100">Save Changes</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* WHATSAPP MODAL */}
      {showWhatsAppModal && selectedMember && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-[32px] w-full max-w-sm p-6 md:p-8 shadow-2xl overflow-hidden relative">
            <h2 className="text-lg font-black mb-1 text-slate-900 flex items-center gap-2 uppercase italic tracking-tighter"><MessageCircle size={20} className="text-green-500"/> WhatsApp Alert</h2>
            <p className="text-[10px] text-slate-400 font-bold mb-6 uppercase">To: {selectedMember.name}</p>
            <div className="space-y-2">
              <button onClick={() => sendWhatsAppMessage("welcome", selectedMember)} className="w-full text-left p-4 border border-slate-100 bg-slate-50 rounded-2xl hover:bg-green-50 transition-all font-black text-slate-700 text-[10px] uppercase">Welcome Onboard 🎉</button>
              <button onClick={() => sendWhatsAppMessage("expiry", selectedMember)} className="w-full text-left p-4 border border-slate-100 bg-slate-50 rounded-2xl hover:bg-green-50 transition-all font-black text-slate-700 text-[10px] uppercase">Expiry Reminder 📅</button>
              <button onClick={() => sendWhatsAppMessage("payment", selectedMember)} className="w-full text-left p-4 border border-rose-100 bg-rose-50 rounded-2xl hover:bg-rose-100 transition-all font-black text-rose-600 text-[10px] uppercase">Fee Due Alert 💰</button>
              <div className="mt-6 space-y-2">
                <textarea className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-green-500/10 font-bold resize-none" rows="3" placeholder="Custom message..." value={customMessage} onChange={(e) => setCustomMessage(e.target.value)}></textarea>
                <button onClick={() => sendWhatsAppMessage("custom", selectedMember)} className="w-full bg-green-600 text-white py-4 rounded-2xl flex justify-center items-center gap-2 font-black text-xs uppercase tracking-widest hover:bg-green-700 shadow-lg shadow-green-100"><Send size={14}/> Send Now</button>
              </div>
            </div>
            <button onClick={() => setShowWhatsAppModal(false)} className="w-full mt-4 text-slate-400 font-black text-[9px] uppercase tracking-[0.3em]">Cancel</button>
          </div>
        </div>
      )}

      {/* RENEW MODAL */}
      {showRenewModal && selectedMember && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <h2 className="text-xl font-black mb-1 text-slate-900 italic uppercase">Renew Membership</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Select Plan for {selectedMember.name}</p>
            <div className="space-y-3 overflow-y-auto mb-6 pr-2 custom-scrollbar flex-1">
              {plans.map(plan => (
                <div key={plan.id} className="p-4 border border-slate-100 rounded-[20px] bg-slate-50 group hover:bg-white hover:border-emerald-500 transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-black text-slate-800 text-sm uppercase">{plan.name}</span>
                    <span className="text-emerald-600 font-black italic">₹{plan.price}</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-black">₹</span>
                      <input type="number" placeholder="Paid" className="w-full pl-6 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-white outline-none font-black" id={`pay-${plan.id}`} />
                    </div>
                    <button onClick={() => {
                      const amt = document.getElementById(`pay-${plan.id}`).value;
                      handleRenewWithPayment(plan.id, amt || 0);
                    }} className="bg-emerald-600 text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-tighter hover:bg-slate-900 transition-all">Renew</button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowRenewModal(false)} className="w-full py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest">Go Back</button>
          </div>
        </div>
      )}
    </div>
  );
}