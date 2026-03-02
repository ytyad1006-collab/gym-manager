import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Search, Loader2, MoreVertical, MessageCircle, Edit2, RefreshCw, Eye, Trash2, X, IndianRupee, Download, Send, Phone, Calendar, User, Mail } from "lucide-react";
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
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto animate-page">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[24px] shadow-sm border border-slate-100">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{gymName} Crew</h3>
          <p className="text-sm text-slate-400 font-medium">Total: {filteredMembers.length} Members</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search name or phone..." 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm font-medium" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <button 
            onClick={exportToExcel} 
            className="flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-5 py-2.5 rounded-xl text-sm font-bold transition-all w-full sm:w-auto"
          >
            <Download size={18} /> Export
          </button>
        </div>
      </div>

      {/* Members Table/Grid */}
      <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-4">
             <Loader2 className="animate-spin text-blue-600" size={40} />
             <p className="text-slate-400 font-medium animate-pulse text-sm">Loading Members...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Member Info</th>
                  <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest hidden md:table-cell">Contact</th>
                  <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm shrink-0 uppercase border border-white shadow-sm">
                          {m.name.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{m.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium italic">Joined: {m.created_at?.split('T')[0]}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5"><Phone size={12} className="text-slate-400"/> {m.phone}</span>
                        {m.email && <span className="text-[10px] text-slate-400 flex items-center gap-1.5"><Mail size={12}/> {m.email}</span>}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${m.expiry_date >= today ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${m.expiry_date >= today ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}></span>
                        {m.expiry_date >= today ? "Active" : "Expired"}
                      </span>
                    </td>
                    <td className="p-4 text-right relative">
                      <button 
                        onClick={() => setActiveMenu(activeMenu === m.id ? null : m.id)}
                        className="p-2 hover:bg-white rounded-lg transition-all text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-100"
                      >
                        <MoreVertical size={20} />
                      </button>
                      
                      {activeMenu === m.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)}></div>
                          <div className="absolute right-12 mt-0 w-52 bg-white border border-slate-100 rounded-2xl shadow-2xl z-20 overflow-hidden py-1 animate-in fade-in zoom-in duration-200">
                            <button onClick={() => { setSelectedMember(m); setShowViewModal(true); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors"><Eye size={16} className="text-slate-400"/> View Profile</button>
                            <button onClick={() => { setSelectedMember(m); setShowWhatsAppModal(true); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-green-50 text-green-600 text-sm font-bold transition-colors"><MessageCircle size={16}/> WhatsApp</button>
                            <button onClick={() => { setSelectedMember(m); setShowEditModal(true); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 text-blue-600 text-sm font-medium transition-colors"><Edit2 size={16}/> Edit Details</button>
                            <button onClick={() => { setSelectedMember(m); setShowRenewModal(true); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-emerald-50 text-emerald-600 text-sm font-bold transition-colors"><RefreshCw size={16}/> Renew & Pay</button>
                            <div className="h-px bg-slate-100 my-1"></div>
                            <button onClick={() => {deleteMember(m.id); setActiveMenu(null);}} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-rose-50 text-rose-500 text-sm font-medium transition-colors"><Trash2 size={16}/> Delete Member</button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* VIEW MODAL */}
      {showViewModal && selectedMember && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-8 pb-4 flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xl font-bold uppercase">
                  {selectedMember.name.substring(0,2)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{selectedMember.name}</h2>
                  <p className="text-sm font-medium text-blue-600 uppercase tracking-wider">{selectedMember.membership_plans?.name}</p>
                </div>
              </div>
              <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20}/></button>
            </div>
            
            <div className="p-8 pt-4 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Joining Date</p>
                  <p className="font-bold text-slate-700 flex items-center gap-2"><Calendar size={14} className="text-slate-400"/> {selectedMember.created_at?.split('T')[0]}</p>
                </div>
                <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100">
                  <p className="text-[10px] font-bold text-rose-400 uppercase mb-1">Expiry Date</p>
                  <p className="font-bold text-rose-600 flex items-center gap-2"><Calendar size={14}/> {selectedMember.expiry_date}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                   <span className="text-xs font-bold text-slate-400 uppercase">Phone Number</span>
                   <span className="text-sm font-bold text-slate-700">{selectedMember.phone}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                   <span className="text-xs font-bold text-slate-400 uppercase">Email ID</span>
                   <span className="text-sm font-bold text-slate-700">{selectedMember.email || "—"}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                   <span className="text-xs font-bold text-slate-400 uppercase">Outstanding Due</span>
                   <span className="text-lg font-black text-rose-500 italic">₹{selectedMember.due_amount}</span>
                </div>
              </div>
              
              <button onClick={() => setShowViewModal(false)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-xl shadow-slate-200">Close Profile</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedMember && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in">
          <form onSubmit={handleUpdate} className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-xl font-bold text-slate-900">Edit Member</h2>
               <button type="button" onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-900"><X /></button>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Full Name</label>
                <input className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white font-medium" value={selectedMember.name} onChange={(e) => setSelectedMember({...selectedMember, name: e.target.value})} placeholder="Full Name" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Phone Number</label>
                <input className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white font-medium" value={selectedMember.phone} onChange={(e) => setSelectedMember({...selectedMember, phone: e.target.value})} placeholder="Phone Number" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Email (Optional)</label>
                <input className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white font-medium" value={selectedMember.email || ""} onChange={(e) => setSelectedMember({...selectedMember, email: e.target.value})} placeholder="Email ID" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Expiry Date</label>
                <input type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white font-medium" value={selectedMember.expiry_date} onChange={(e) => setSelectedMember({...selectedMember, expiry_date: e.target.value})} />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 bg-slate-100 text-slate-600 py-3.5 rounded-xl font-bold text-sm">Cancel</button>
                <button type="submit" className="flex-1 bg-slate-900 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-blue-600 transition-all shadow-lg">Save Changes</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* WHATSAPP MODAL */}
      {showWhatsAppModal && selectedMember && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-[32px] w-full max-w-sm p-8 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
            <h2 className="text-xl font-bold mb-1 text-slate-900 flex items-center gap-2">WhatsApp Alert</h2>
            <p className="text-xs text-slate-400 font-medium mb-6">Messaging @{selectedMember.name}</p>
            
            <div className="space-y-2">
              <button onClick={() => sendWhatsAppMessage("welcome", selectedMember)} className="w-full text-left p-4 border border-slate-100 bg-slate-50 rounded-2xl hover:bg-green-50 hover:border-green-200 transition-all font-bold text-slate-700 text-xs">Welcome Onboard 🎉</button>
              <button onClick={() => sendWhatsAppMessage("expiry", selectedMember)} className="w-full text-left p-4 border border-slate-100 bg-slate-50 rounded-2xl hover:bg-green-50 hover:border-green-200 transition-all font-bold text-slate-700 text-xs">Expiry Reminder 📅</button>
              <button onClick={() => sendWhatsAppMessage("payment", selectedMember)} className="w-full text-left p-4 border border-slate-100 bg-slate-50 rounded-2xl hover:bg-green-50 hover:border-green-200 transition-all font-bold text-slate-700 text-xs text-rose-500">Fee Due Alert 💰</button>
              
              <div className="mt-6 space-y-2">
                <textarea 
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-green-500/20 focus:bg-white font-medium resize-none" 
                  rows="3" 
                  placeholder="Or type a custom message here..." 
                  value={customMessage} 
                  onChange={(e) => setCustomMessage(e.target.value)}
                ></textarea>
                <button 
                  onClick={() => sendWhatsAppMessage("custom", selectedMember)} 
                  className="w-full bg-green-600 text-white py-4 rounded-2xl flex justify-center items-center gap-2 font-bold text-xs hover:bg-green-700 transition-all"
                >
                  <Send size={14}/> Send Custom
                </button>
              </div>
            </div>
            <button onClick={() => setShowWhatsAppModal(false)} className="w-full mt-4 text-slate-400 font-bold text-[10px] uppercase tracking-widest">Close</button>
          </div>
        </div>
      )}

      {/* RENEW MODAL */}
      {showRenewModal && selectedMember && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl">
            <h2 className="text-xl font-bold mb-1 text-slate-900 italic">RENEW MEMBERSHIP</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Choose a new plan for {selectedMember.name}</p>
            
            <div className="space-y-3 max-h-72 overflow-y-auto mb-6 pr-2 custom-scrollbar">
              {plans.map(plan => (
                <div key={plan.id} className="p-4 border border-slate-100 rounded-[20px] bg-slate-50 group hover:bg-white hover:border-emerald-500 transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-slate-800">{plan.name}</span>
                    <span className="text-emerald-600 font-black italic">₹{plan.price}</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                      <input type="number" placeholder="Amt Paid" className="w-full pl-6 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold" id={`pay-${plan.id}`} />
                    </div>
                    <button onClick={() => {
                      const amt = document.getElementById(`pay-${plan.id}`).value;
                      handleRenewWithPayment(plan.id, amt || 0);
                    }} className="bg-emerald-600 text-white px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-emerald-100">Renew</button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowRenewModal(false)} className="w-full py-3.5 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Go Back</button>
          </div>
        </div>
      )}
    </div>
  );
}