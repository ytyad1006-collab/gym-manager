import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase"; 
import { UserPlus, X, Loader2, History, Calendar, Percent, IndianRupee, User, Phone, Users, CreditCard, ShieldCheck, ArrowRight, Smartphone, Banknote, Landmark } from "lucide-react";

function AddMember() {
  const [plans, setPlans] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [members, setMembers] = useState([]);
  const [payments, setPayments] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    gender: "",
    trainer_id: "",
    plan_id: "",
    joining_date: new Date().toISOString().split("T")[0],
    expiry_date: "",
    plan_price: 0,
    discount_type: "Fixed",
    discount_value: 0,
    paid_amount: 0,
    payment_mode: "Cash",
    next_payment_date: "" 
  });

  const fetchPlans = async () => {
    const { data, error } = await supabase.from("membership_plans").select("*");
    if (!error) setPlans(data);
  };

  const fetchTrainers = async () => {
    const { data, error } = await supabase.from("trainers").select("*");
    if (!error) setTrainers(data);
  };

  const fetchMembers = async () => {
    const { data, error } = await supabase.from("members").select("*").order("created_at", { ascending: false });
    if (!error) setMembers(data);
  };

  const fetchPayments = async () => {
    const { data, error } = await supabase
      .from("payments")
      .select(`*, members!fk_member_new(name)`) 
      .order("created_at", { ascending: false })
      .limit(10);
    if (!error) setPayments(data);
  };

  useEffect(() => {
    fetchPlans();
    fetchTrainers();
    fetchMembers();
    fetchPayments();
  }, []);

  const handlePlanChange = (planId) => {
    const selectedPlan = plans.find(p => p.id === planId);
    if (selectedPlan) {
      const duration = selectedPlan.duration_months || selectedPlan.duration || 1;
      const today = new Date(formData.joining_date);
      today.setMonth(today.getMonth() + parseInt(duration));
      
      const formattedExpiry = today.toISOString().split("T")[0];
      setFormData({
        ...formData,
        plan_id: planId,
        plan_price: selectedPlan.price,
        expiry_date: formattedExpiry,
        next_payment_date: formattedExpiry 
      });
    }
  };
  
  const finalPrice = formData.discount_type === "Percentage" 
    ? formData.plan_price - (formData.plan_price * formData.discount_value / 100)
    : formData.plan_price - formData.discount_value;

  const dueAmount = finalPrice - formData.paid_amount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(formData.whatsapp.length !== 10) return alert("WhatsApp number must be exactly 10 digits");
    
    setLoading(true);
    try {
      const { data: member, error: mError } = await supabase
        .from("members")
        .insert([{
          name: formData.name,
          phone: formData.whatsapp,
          gender: formData.gender,
          trainer_id: formData.trainer_id || null,
          plan_id: formData.plan_id,
          joining_date: formData.joining_date,
          expiry_date: formData.next_payment_date, 
          total_amount: finalPrice,
          paid_amount: formData.paid_amount,
          due_amount: dueAmount
        }]).select();

      if (mError) throw mError;

      if (formData.paid_amount > 0 && member && member[0]) {
        const { error: pError } = await supabase.from("payments").insert([{
          member_id: member[0].id,
          amount: formData.paid_amount,
          payment_mode: formData.payment_mode,
          payment_date: formData.joining_date,
          plan_price: formData.plan_price,
          discount_type: formData.discount_type,
          discount_value: formData.discount_value,
          next_payment_date: formData.next_payment_date,
          notes: "Initial registration payment"
        }]);
        if (pError) throw pError;
      }

      alert("Member & Payment recorded successfully! 🎉");
      setFormData({ ...formData, name: "", whatsapp: "", gender: "", paid_amount: 0, discount_value: 0 });
      fetchMembers();
      fetchPayments(); 
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3 md:p-8 space-y-8 md:space-y-12 animate-in fade-in duration-500 overflow-x-hidden">
      <div className="max-w-6xl mx-auto bg-white rounded-[24px] md:rounded-[32px] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden transition-all">
        {/* Header - Fixed for Mobile */}
        <div className="bg-slate-900 p-6 md:p-8 text-white flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40">
              <UserPlus size={24} className="md:size-[28px]" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black tracking-tight italic">NEW REGISTRATION</h2>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Gym Management System</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
             <ShieldCheck className="text-emerald-400" size={16}/>
             <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-tighter">Secure Transaction</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 md:p-12 space-y-8 md:space-y-10">
          {/* Personal Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
              <User className="text-blue-600" size={18} />
              <h3 className="text-xs md:text-sm font-black text-slate-800 uppercase tracking-widest">Personal Profile</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Member Full Name</label>
                <input type="text" className="w-full px-5 py-3 md:py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white font-bold" placeholder="e.g. Rahul Sharma" value={formData.name} required
                  onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">WhatsApp No.</label>
                <input 
                  type="text" 
                  maxLength={10}
                  className="w-full px-5 py-3 md:py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white font-bold" 
                  placeholder="9876543210" 
                  value={formData.whatsapp} 
                  required
                  onChange={(e) => setFormData({...formData, whatsapp: e.target.value.replace(/\D/g, "")})} 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Gender</label>
                <select className="w-full px-5 py-3 md:py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 font-bold appearance-none cursor-pointer" required value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Membership Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
              <Calendar className="text-emerald-600" size={18} />
              <h3 className="text-xs md:text-sm font-black text-slate-800 uppercase tracking-widest">Plan & Validity</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Select Plan</label>
                <select className="w-full px-5 py-3 md:py-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl font-bold" required onChange={(e) => handlePlanChange(e.target.value)}>
                  <option value="">Select Plan</option>
                  {plans.map(p => <option key={p.id} value={p.id}>{p.plan_name || p.name} (₹{p.price})</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Trainer</label>
                <select className="w-full px-5 py-3 md:py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={formData.trainer_id} onChange={(e) => setFormData({...formData, trainer_id: e.target.value})}>
                  <option value="">Self Workout</option>
                  {trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-blue-600 uppercase mb-2 block">Next Payment</label>
                <input type="date" className="w-full px-5 py-3 md:py-4 bg-blue-50 border border-blue-200 rounded-2xl font-bold text-blue-700" required value={formData.next_payment_date} 
                  onChange={(e) => setFormData({...formData, next_payment_date: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block italic">Expiry</label>
                <div className="w-full px-5 py-3 md:py-4 bg-slate-100 border border-slate-200 rounded-2xl font-bold text-slate-400 flex items-center justify-between">
                  {formData.expiry_date || "—"}
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Section - Mobile Optimized Grid */}
          <div className="p-4 md:p-8 bg-slate-50 rounded-[24px] border border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 items-center">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Discount</label>
                  <div className="flex bg-white p-1 rounded-xl border border-slate-200">
                    <button type="button" onClick={() => setFormData({...formData, discount_type: 'Fixed'})} className={`flex-1 py-2 text-[9px] font-black rounded-lg transition-all ${formData.discount_type === 'Fixed' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>FIXED (₹)</button>
                    <button type="button" onClick={() => setFormData({...formData, discount_type: 'Percentage'})} className={`flex-1 py-2 text-[9px] font-black rounded-lg transition-all ${formData.discount_type === 'Percentage' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>PERCENT (%)</button>
                  </div>
                </div>
                <div>
                  <input type="number" className="w-full px-4 py-3 border border-slate-200 rounded-xl font-bold" placeholder="Value"
                    value={formData.discount_value || ""}
                    onChange={(e) => setFormData({...formData, discount_value: Number(e.target.value) || ""})} />
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-5 bg-white rounded-3xl border border-slate-100">
                 <span className="text-[9px] font-black text-slate-300 uppercase mb-1">Final Price</span>
                 <span className="text-2xl md:text-3xl font-black text-slate-900 italic">₹{finalPrice}</span>
              </div>

              <div>
                <label className="text-[10px] font-black text-blue-600 uppercase mb-2 block">Amount Paid Now</label>
                <input type="number" className="w-full px-5 py-3 md:py-4 bg-blue-600 text-white rounded-2xl font-black text-xl placeholder:text-blue-300 shadow-lg shadow-blue-200" placeholder="0" 
                  value={formData.paid_amount || ""}
                  onChange={(e) => setFormData({...formData, paid_amount: Number(e.target.value) || ""})} />
              </div>

              <div className={`flex flex-col items-center justify-center p-5 rounded-3xl border-2 border-dashed ${dueAmount > 0 ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>
                 <span className="text-[9px] font-black uppercase mb-1 opacity-60">Balance Due</span>
                 <span className="text-2xl md:text-3xl font-black italic">₹{dueAmount}</span>
              </div>
            </div>
          </div>

          {/* Footer Actions - Responsive Buttons */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-4">
            <div className="flex flex-wrap items-center justify-center gap-2 bg-slate-100 p-2 rounded-[24px] w-full md:w-auto">
               {[
                 {id: 'Cash', icon: Banknote, color: 'text-orange-500'}, 
                 {id: 'Online', icon: Smartphone, color: 'text-blue-500'}, 
                 {id: 'Card', icon: Landmark, color: 'text-emerald-500'}
               ].map(mode => (
                 <button 
                   key={mode.id} 
                   type="button" 
                   onClick={() => setFormData({...formData, payment_mode: mode.id})} 
                   className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-2xl text-[9px] md:text-[10px] font-black uppercase transition-all ${formData.payment_mode === mode.id ? 'bg-white text-slate-900 shadow-md scale-105' : 'text-slate-400'}`}
                 >
                   <mode.icon size={14} className={formData.payment_mode === mode.id ? mode.color : 'text-slate-300'} />
                   {mode.id}
                 </button>
               ))}
            </div>
            
            <button type="submit" disabled={loading} className="w-full md:w-auto bg-slate-900 text-white px-10 py-4 md:py-5 rounded-2xl font-black text-xs md:text-sm uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3">
              {loading ? <Loader2 className="animate-spin" /> : <>Complete Registration <ArrowRight size={18}/></>}
            </button>
          </div>
        </form>
      </div>

      {/* Tables Section - Safe Scroll for Mobile */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <div className="bg-white rounded-[24px] shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-50 bg-slate-50/50">
            <h3 className="font-black text-slate-800 text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
              <Users size={16} className="text-blue-500" /> Recent Joinees
            </h3>
          </div>
          <div className="overflow-x-auto p-2">
            <table className="w-full text-left text-sm min-w-[300px]">
              <tbody>
                {members.slice(0, 4).map(m => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 md:p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-[9px] font-bold">
                          {m.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-700 text-xs md:text-sm">{m.name}</span>
                      </div>
                    </td>
                    <td className="p-3 md:p-4 text-right">
                      <span className={`px-2 md:px-3 py-1 rounded-full text-[9px] font-black ${m.due_amount > 0 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        ₹{m.due_amount}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-[24px] shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-50 bg-slate-50/50">
            <h3 className="font-black text-slate-800 text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
              <History size={16} className="text-emerald-500" /> Payment Log
            </h3>
          </div>
          <div className="overflow-x-auto p-2">
            <table className="w-full text-left text-sm min-w-[350px]">
              <tbody>
                {payments.slice(0, 4).map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 md:p-4">
                      <div>
                        <div className="font-bold text-slate-700 text-xs md:text-sm">{p.members?.name || 'Deleted'}</div>
                        <div className="text-[9px] text-slate-400 font-medium">{p.payment_date}</div>
                      </div>
                    </td>
                    <td className="p-3 md:p-4">
                       <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-lg uppercase">{p.payment_mode}</span>
                    </td>
                    <td className="p-3 md:p-4 text-right">
                      <span className="font-black text-emerald-600 italic text-xs md:text-sm">₹{p.amount}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddMember;