import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Search, Loader2, MoreVertical, MessageCircle, Edit2, RefreshCw, Eye, Trash2, X, Download, Send, Phone, Calendar, Mail, Clock, ShieldCheck, Filter, AlertTriangle, Globe, CheckCircle } from "lucide-react";
import * as XLSX from 'xlsx';

export default function MembersList() {
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeMenu, setActiveMenu] = useState(null);
  const [gymName, setGymName] = useState("Our Gym");
  const [filterType, setFilterType] = useState("all");

  const [selectedMember, setSelectedMember] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showDueModal, setShowDueModal] = useState(false);
  const [duePayment, setDuePayment] = useState("");
  const [customMessage, setCustomMessage] = useState("");

  const [editFormData, setEditFormData] = useState({ name: "", phone: "", plan_id: "", email: "" });
  const [renewPlanId, setRenewPlanId] = useState("");

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => { 
    fetchMembers();
    getGymInfo();
  }, []);

  // ✅ QUICK ATTENDANCE LOGIC
  const [attLoading, setAttLoading] = useState(null);

  async function markMemberAttendance(member) {
    try {
      setAttLoading(member.id);
      const { data: { user } } = await supabase.auth.getUser();
      const todayDate = new Date().toISOString().split('T')[0];

      const { data: existing } = await supabase
        .from('attendance')
        .select('*')
        .eq('member_id', member.id)
        .eq('type', 'member')
        .gte('created_at', `${todayDate}T00:00:00`);

      if (existing?.length > 0) {
        alert(`${member.name} ki attendance aaj lag chuki hai! 💪`);
        return;
      }

      const { error } = await supabase.from('attendance').insert([{
        user_id: user.id,
        member_id: member.id,
        type: 'member'
      }]);

      if (error) throw error;
      alert(`${member.name} Checked-in! 🔥`);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setAttLoading(null);
    }
  }

  const getCurrencySymbol = (phone) => {
    if (!phone) return "₹";
    if (phone.startsWith("+1")) return "$";
    if (phone.startsWith("+44")) return "£";
    if (phone.startsWith("+971")) return "AED ";
    if (phone.startsWith("+61")) return "A$";
    return "₹";
  };

  const calculateRemainingDays = (expiryDate) => {
    const todayDate = new Date();
    todayDate.setHours(0,0,0,0);
    const expiry = new Date(expiryDate);
    const diffTime = expiry - todayDate;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const { error } = await supabase.from("members").update({ status: newStatus }).eq("id", id);
    if (!error) {
      setMembers(members.map(m => m.id === id ? { ...m, status: newStatus } : m));
    }
  };

  const getGymInfo = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.user_metadata?.gym_name) setGymName(user.user_metadata.gym_name);
  };

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: membersData } = await supabase.from("members").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      const { data: plansData } = await supabase.from("membership_plans").select("*").eq("user_id", user.id);

      setPlans(plansData || []);
      const mergedData = (membersData || []).map(member => ({
        ...member,
        membership_plans: plansData?.find(plan => plan.id === member.plan_id) || { name: "No Plan", price: 0 }
      }));
      setMembers(mergedData);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleCollectDue = async () => {
    const amount = Number(duePayment);
    if (amount <= 0 || amount > selectedMember.due_amount) {
      alert("Please enter a valid amount.");
      return;
    }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error: updateError } = await supabase.from("members").update({
        due_amount: Number(selectedMember.due_amount) - amount,
        paid_amount: (Number(selectedMember.paid_amount) || 0) + amount
      }).eq("id", selectedMember.id);

      if (updateError) throw updateError;
      await supabase.from("payments").insert([{
        member_id: selectedMember.id,
        user_id: user.id,
        amount: amount,
        plan_price: amount,
        payment_date: today,
        payment_mode: "Due Collection"
      }]);

      alert("Payment Success! 💪");
      fetchMembers();
      setShowDueModal(false);
      setDuePayment("");
    } catch (error) { alert("Error: " + error.message); }
  };

  const handleEditMember = async () => {
    const { error } = await supabase.from("members").update({ 
      name: editFormData.name, phone: editFormData.phone, plan_id: editFormData.plan_id, email: editFormData.email 
    }).eq("id", selectedMember.id);

    if (!error) { alert("Profile updated!"); setShowEditModal(false); fetchMembers(); }
  };

  const handleRenewPlan = async () => {
    const selectedPlan = plans.find(p => p.id === renewPlanId);
    if (!selectedPlan) return alert("Select a plan");
    const newExpiry = new Date();
    newExpiry.setMonth(newExpiry.getMonth() + (selectedPlan.duration || 1));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("members").update({ 
        plan_id: renewPlanId, expiry_date: newExpiry.toISOString().split('T')[0], status: 'active'
      }).eq("id", selectedMember.id);

      await supabase.from("payments").insert([{
        member_id: selectedMember.id, user_id: user.id, amount: selectedPlan.price, plan_price: selectedPlan.price, payment_date: today, payment_mode: "Renewal"
      }]);

      alert("Membership Renewed!"); setShowRenewModal(false); fetchMembers();
    } catch (error) { alert("Error: " + error.message); }
  };

  const deleteMember = async (id) => {
    if (window.confirm("⚠️ Are you sure?")) {
      await supabase.from("payments").delete().eq("member_id", id);
      await supabase.from("members").delete().eq("id", id);
      fetchMembers();
    }
  };

  const exportToExcel = () => {
    const exportData = filteredMembers.map(m => ({
      "Name": m.name, "Phone": m.phone, "Email": m.email, "Expiry": m.expiry_date, "Plan": m.membership_plans?.name, "Due": m.due_amount, "Status": m.status || 'active'
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Members");
    XLSX.writeFile(wb, `${gymName}_Members.xlsx`);
  };

  const handleWhatsAppSend = (type, member = selectedMember) => {
    let msg = "";
    if (type === "welcome") msg = `Hi ${member.name}, Welcome to ${gymName}! 💪`;
    else if (type === "expiry") msg = `Hi ${member.name}, your membership expires on ${member.expiry_date}.`;
    else if (type === "payment") msg = `Hi ${member.name}, pending dues: ₹${member.due_amount}.`;
    else if (type === "custom") msg = customMessage;

    if (msg) {
      const cleanPhone = member.phone.replace(/\+/g, '').replace(/\s/g, '');
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, "_blank");
      if(type === "custom") { setCustomMessage(""); setShowWhatsAppModal(false); }
    }
  };

  const handleEmailSend = (type, member = selectedMember) => {
    if (!member.email) return alert("Email not found!");
    const subject = encodeURIComponent("Gym Update");
    const body = encodeURIComponent(`Hi ${member.name}, Update regarding your gym membership.`);
    window.location.href = `mailto:${member.email}?subject=${subject}&body=${body}`;
  };

  const filteredMembers = members.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.phone?.includes(searchTerm);
    const daysLeft = calculateRemainingDays(m.expiry_date);
    const status = m.status || 'active';
    if (!matchesSearch) return false;
    switch (filterType) {
      case "active": return status === 'active';
      case "inactive": return status === 'inactive';
      case "expiring": return daysLeft > 0 && daysLeft <= 7;
      case "expired": return daysLeft <= 0;
      case "due": return m.due_amount > 0;
      default: return true;
    }
  });

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6 max-w-7xl mx-auto animate-page overflow-x-hidden">
      
      {/* 🚀 Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 md:p-6 rounded-[24px] shadow-sm border border-slate-100">
        <div>
          <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight italic uppercase">{gymName} CREW</h3>
          <p className="text-xs md:text-sm text-slate-400 font-bold tracking-widest uppercase">Showing: {filteredMembers.length} Members</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 w-full sm:w-auto">
            <Filter size={14} className="text-slate-400" />
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="bg-transparent py-2.5 text-[10px] font-black uppercase tracking-wider outline-none cursor-pointer text-slate-700">
              <option value="all">All Members</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive</option>
              <option value="expiring">Expiring Soon (7d)</option>
              <option value="expired">Expired</option>
              <option value="due">Pending Dues</option>
            </select>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-xs font-bold" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <button onClick={exportToExcel} className="flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all w-full sm:w-auto border border-emerald-100">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* 📋 Members List */}
      <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-4 text-center">
              <Loader2 className="animate-spin text-blue-600" size={40} />
              <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Syncing Gym Database...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center">
            <AlertTriangle className="text-slate-200 mb-4" size={48} />
            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No Members Found</p>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Member</th>
                    <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Validity</th>
                    <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status & Info</th>
                    <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.map((m) => {
                    const daysLeft = calculateRemainingDays(m.expiry_date);
                    return (
                      <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-black uppercase">{m.name.substring(0, 2)}</div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm">{m.name}</p>
                              <p className="text-[10px] text-slate-400 font-black uppercase">{m.membership_plans?.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1 w-24">
                            <span className={`text-[9px] font-black uppercase flex items-center gap-1 ${daysLeft <= 5 ? 'text-rose-600 animate-pulse' : 'text-slate-500'}`}>
                              <Clock size={12}/> {daysLeft <= 0 ? "Expired" : `${daysLeft} Days`}
                            </span>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${daysLeft <= 5 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${Math.max(0, Math.min((daysLeft / 30) * 100, 100))}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <p className="text-xs font-bold text-slate-700">{m.phone}</p>
                                {m.email && <Mail size={10} className="text-slate-300" />}
                            </div>
                            <button onClick={() => handleStatusToggle(m.id, m.status || 'active')} className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${m.status === 'inactive' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                             {m.status === 'inactive' ? "● Inactive" : "● Active"}
                            </button>
                        </td>
                        <td className="p-4 text-right relative">
                          <div className="flex items-center justify-end gap-2">
                             {/* ✅ ADDED: Quick Attendance Button (Desktop) */}
                             <button 
                               onClick={() => markMemberAttendance(m)}
                               disabled={attLoading === m.id}
                               className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-100"
                               title="Quick Check-in"
                             >
                               {attLoading === m.id ? <Loader2 className="animate-spin" size={18}/> : <CheckCircle size={18}/>}
                             </button>

                             <button onClick={() => setActiveMenu(activeMenu === m.id ? null : m.id)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><MoreVertical size={18} /></button>
                          </div>
                          
                          {activeMenu === m.id && (
                            <div className="absolute right-12 top-0 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl z-20 py-1 text-left animate-in zoom-in duration-150">
                              <button onClick={() => { setSelectedMember(m); setShowViewModal(true); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-xs font-bold"><Eye size={14} className="text-blue-500"/> View Profile</button>
                              <button onClick={() => { setSelectedMember(m); setEditFormData({name: m.name, phone: m.phone, plan_id: m.plan_id, email: m.email || ""}); setShowEditModal(true); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-xs font-bold border-t border-slate-50"><Edit2 size={14} className="text-slate-500"/> Edit Profile</button>
                              <button onClick={() => { setSelectedMember(m); setShowWhatsAppModal(true); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-green-50 text-green-600 text-xs font-black border-t border-slate-50"><MessageCircle size={14}/> Connect / Reminder</button>
                              <button onClick={() => { setSelectedMember(m); setRenewPlanId(m.plan_id); setShowRenewModal(true); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 text-blue-600 text-xs font-black border-t border-slate-50"><RefreshCw size={14}/> Renew Plan</button>
                              <button onClick={() => { setSelectedMember(m); setShowDueModal(true); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 text-orange-600 text-xs font-black border-t border-slate-50"><Download size={14} className="rotate-180"/> Collect Due</button>
                              <button onClick={() => { deleteMember(m.id); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-rose-50 text-rose-500 text-xs font-bold border-t border-slate-50"><Trash2 size={14}/> Remove</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Mobile View */}
            <div className="md:hidden divide-y divide-slate-100">
               {filteredMembers.map((m) => (
                 <div key={m.id} className="p-4 flex items-center justify-between group">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-black uppercase">{m.name.substring(0, 2)}</div>
                      <div className="min-w-0 flex-1">
                        <p className="font-black text-slate-800 text-sm truncate uppercase">{m.name}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase">{m.membership_plans?.name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                       {/* ✅ ADDED: Quick Attendance Button (Mobile) */}
                       <button 
                         onClick={() => markMemberAttendance(m)}
                         disabled={attLoading === m.id}
                         className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${attLoading === m.id ? 'bg-slate-100' : 'bg-emerald-50 text-emerald-600'}`}
                       >
                         {attLoading === m.id ? <Loader2 className="animate-spin" size={18}/> : <CheckCircle size={20}/>}
                       </button>

                       <button onClick={() => setActiveMenu(activeMenu === m.id ? null : m.id)} className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-full text-slate-400"><MoreVertical size={18} /></button>
                    </div>

                    {activeMenu === m.id && (
                        <div className="absolute right-4 mt-32 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl z-40 py-1">
                          <button onClick={() => { setSelectedMember(m); setShowViewModal(true); setActiveMenu(null); }} className="w-full px-4 py-3 text-xs font-bold text-slate-700 border-b border-slate-50">View Profile</button>
                          <button onClick={() => { setSelectedMember(m); setShowWhatsAppModal(true); setActiveMenu(null); }} className="w-full px-4 py-3 text-xs font-black text-green-600 border-b border-slate-50">WhatsApp / Email</button>
                          <button onClick={() => { setSelectedMember(m); setEditFormData({name: m.name, phone: m.phone, plan_id: m.plan_id, email: m.email || ""}); setShowEditModal(true); setActiveMenu(null); }} className="w-full px-4 py-3 text-xs font-bold text-slate-700 border-b border-slate-50">Edit</button>
                          <button onClick={() => { setSelectedMember(m); setRenewPlanId(m.plan_id); setShowRenewModal(true); setActiveMenu(null); }} className="w-full px-4 py-3 text-xs font-black text-blue-600 border-b border-slate-50">Renew</button>
                          <button onClick={() => { deleteMember(m.id); setActiveMenu(null); }} className="w-full px-4 py-3 text-xs font-bold text-rose-500">Delete</button>
                        </div>
                    )}
                 </div>
               ))}
            </div>
          </>
        )}
      </div>

      {/* 👤 View Modal */}
      {showViewModal && selectedMember && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4">
            <div className="p-6 flex justify-between items-center bg-slate-900 text-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-lg font-black">{selectedMember.name.substring(0,2)}</div>
                <h2 className="text-xl font-black italic uppercase">{selectedMember.name}</h2>
              </div>
              <button onClick={() => setShowViewModal(false)}><X size={20}/></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Status</p>
                  <p className={`font-black text-xs uppercase ${selectedMember.status === 'inactive' ? 'text-rose-600' : 'text-emerald-600'}`}>{selectedMember.status || 'Active'}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Pending Due</p>
                  <p className="font-black text-xs text-rose-500 italic">₹{selectedMember.due_amount}</p>
                </div>
              </div>
              <div className="space-y-4 text-sm font-bold text-slate-600">
                <div className="flex justify-between border-b pb-2"><span>Mobile</span><span>{selectedMember.phone}</span></div>
                <div className="flex justify-between border-b pb-2"><span>Email</span><span className="text-xs truncate max-w-[150px]">{selectedMember.email || "N/A"}</span></div>
                <div className="flex justify-between border-b pb-2"><span>Expiry</span><span>{selectedMember.expiry_date}</span></div>
                <div className="flex justify-between border-b pb-2"><span>Plan</span><span>{selectedMember.membership_plans?.name}</span></div>
              </div>
              <button onClick={() => setShowViewModal(false)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest">Close Profile</button>
            </div>
          </div>
        </div>
      )}

      {/* ✍️ Edit Modal */}
      {showEditModal && selectedMember && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-[32px] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in">
            <h2 className="text-xl font-black text-slate-900 italic uppercase mb-6">Edit Profile</h2>
            <div className="space-y-4">
              <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm" placeholder="Name" value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} />
              <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm" placeholder="Phone" value={editFormData.phone} onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})} />
              <input type="email" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm" placeholder="Email Address" value={editFormData.email} onChange={(e) => setEditFormData({...editFormData, email: e.target.value})} />
              <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm" value={editFormData.plan_id} onChange={(e) => setEditFormData({...editFormData, plan_id: e.target.value})}>
                {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowEditModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-400 rounded-xl font-black text-[10px] uppercase">Cancel</button>
                <button onClick={handleEditMember} className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔄 Renew Modal */}
      {showRenewModal && selectedMember && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-[32px] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4"><RefreshCw size={30} /></div>
              <h2 className="text-xl font-black text-slate-900 italic uppercase">Renew Plan</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase">{selectedMember.name}</p>
            </div>
            <div className="space-y-4">
              <select className="w-full px-4 py-4 bg-slate-50 border-2 border-blue-50 rounded-2xl outline-none focus:border-blue-500 font-black text-sm" value={renewPlanId} onChange={(e) => setRenewPlanId(e.target.value)}>
                <option value="">Choose Plan...</option>
                {plans.map(p => (
                  <option key={p.id} value={p.id}>{p.name} - {getCurrencySymbol(selectedMember.phone)}{p.price}</option>
                ))}
              </select>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowRenewModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase">Cancel</button>
                <button onClick={handleRenewPlan} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-blue-100">Confirm</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 💰 Due Modal */}
      {showDueModal && selectedMember && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-[32px] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4"><Download size={30} className="rotate-180" /></div>
              <h2 className="text-xl font-black text-slate-900 italic uppercase">Collect Due</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase">Outstanding</span>
                <span className="text-lg font-black text-rose-500 italic">{getCurrencySymbol(selectedMember.phone)}{selectedMember.due_amount}</span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-700">{getCurrencySymbol(selectedMember.phone)}</span>
                <input type="number" className="w-full pl-10 pr-4 py-4 bg-slate-50 border-2 border-orange-100 rounded-2xl outline-none focus:border-orange-500 font-black text-lg" placeholder="Amount" value={duePayment} onChange={(e) => setDuePayment(e.target.value)} />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowDueModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase">Cancel</button>
                <button onClick={handleCollectDue} className="flex-1 py-4 bg-orange-500 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-orange-100">Update</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 📱 WhatsApp & Email Modal */}
      {showWhatsAppModal && selectedMember && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-[32px] w-full max-w-sm p-6 shadow-2xl animate-in zoom-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black text-slate-900 uppercase italic">Notifications</h2>
              <button onClick={() => setShowWhatsAppModal(false)} className="text-slate-400"><X size={20}/></button>
            </div>
            <div className="space-y-3">
              <div className="flex gap-2">
                <button onClick={() => handleWhatsAppSend("welcome")} className="flex-1 flex items-center justify-between p-4 bg-slate-50 hover:bg-emerald-50 border border-slate-100 rounded-2xl transition-all">
                    <span className="text-[9px] font-black uppercase text-slate-700">Welcome WA</span>
                    <Send size={14} className="text-emerald-500" />
                </button>
                <button onClick={() => handleEmailSend("welcome")} className="p-4 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all"><Mail size={16} /></button>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleWhatsAppSend("expiry")} className="flex-1 flex items-center justify-between p-4 bg-slate-50 hover:bg-rose-50 border border-slate-100 rounded-2xl transition-all">
                    <span className="text-[9px] font-black uppercase text-slate-700">Expiry WA</span>
                    <Calendar size={14} className="text-rose-500" />
                </button>
                <button onClick={() => handleEmailSend("expiry")} className="p-4 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all"><Mail size={16} /></button>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleWhatsAppSend("payment")} className="flex-1 flex items-center justify-between p-4 bg-slate-50 hover:bg-orange-50 border border-slate-100 rounded-2xl transition-all">
                    <span className="text-[9px] font-black uppercase text-slate-700">Payment WA</span>
                    <ShieldCheck size={14} className="text-orange-500" />
                </button>
                <button onClick={() => handleEmailSend("payment")} className="p-4 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all"><Mail size={16} /></button>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <textarea className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-xs min-h-[80px]" placeholder="Type custom message..." value={customMessage} onChange={(e) => setCustomMessage(e.target.value)} />
                <button onClick={() => handleWhatsAppSend("custom")} className="w-full mt-3 py-3 bg-green-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg shadow-green-100">Send WhatsApp</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}