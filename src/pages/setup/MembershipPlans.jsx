import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
// ✅ Global utilities import kiye
import { formatCurrency } from "../../lib/utils"; 
import { Plus, Trash2, Loader2, Edit2, Eye, X, Save, Clock, Layers, ShieldCheck, Sparkles } from "lucide-react";

function MembershipPlans() {
  const [plans, setPlans] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [modalType, setModalType] = useState(null);

  const [form, setForm] = useState({ name: "", duration_months: "", price: "", badge: "" });

  // 🌍 Dynamic Currency Symbol for labels (e.g., "Price ($)")
  const currencySymbol = formatCurrency(0).replace(/[0-9.,\s]/g, '');

  const badgeOptions = [
    { label: "None", value: "", color: "bg-slate-100 text-slate-500" },
    { label: "Popular", value: "Popular", color: "bg-amber-100 text-amber-700 border-amber-200" },
    { label: "Best Value", value: "Best Value", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    { label: "Limited", value: "Limited", color: "bg-rose-100 text-rose-700 border-rose-200" },
    { label: "New", value: "New", color: "bg-blue-100 text-blue-700 border-blue-200" },
  ];

  useEffect(() => { fetchPlans(); }, []);

  async function fetchPlans() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("membership_plans")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    else setPlans(data || []);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const payload = { 
        ...form, 
        duration_months: parseInt(form.duration_months) || 0, 
        price: parseFloat(form.price) || 0,
        user_id: user.id 
      };

      const { error } = await supabase.from("membership_plans").insert([payload]);
      
      if (error) throw error;

      setForm({ name: "", duration_months: "", price: "", badge: "" }); 
      setShowForm(false); 
      fetchPlans(); 
    } catch (err) {
      console.error(err);
      alert("Error adding plan: " + err.message);
    } finally {
      setLoading(false); 
    }
  }

  async function handleDelete(id) {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("membership_plans").delete().eq("id", id).eq("user_id", user.id);
      fetchPlans();
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const { error } = await supabase
        .from("membership_plans")
        .update({
          name: selectedPlan.name,
          duration_months: parseInt(selectedPlan.duration_months) || 0,
          price: parseFloat(selectedPlan.price) || 0,
          badge: selectedPlan.badge 
        })
        .eq("id", selectedPlan.id)
        .eq("user_id", user.id);
      
      if (error) throw error;
      
      setModalType(null); 
      fetchPlans();
    } catch (err) {
      console.error(err);
      alert("Error updating plan: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white p-4 md:p-8 rounded-[24px] md:rounded-3xl shadow-xl shadow-slate-100 border border-slate-100 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 md:mb-10">
        <div>
          <h3 className="text-xl md:text-2xl font-black text-slate-800 italic uppercase tracking-tight leading-none flex items-center gap-2">
            Membership Plans <ShieldCheck size={18} className="text-emerald-500" />
          </h3>
          <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1">Configure your gym packages</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl md:rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 ${showForm ? 'bg-slate-100 text-slate-600' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
          {showForm ? <X size={16} /> : <Plus size={16} />} {showForm ? "Cancel" : "Create Plan"}
        </button>
      </div>

      {/* Add Plan Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10 p-5 md:p-6 bg-slate-50 rounded-[24px] border-2 border-dashed border-slate-200 animate-in slide-in-from-top-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Plan Name</label>
            <input className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium" placeholder="Silver, Gold..." value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Months</label>
            <input className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium" type="number" value={form.duration_months} onChange={(e) => setForm({ ...form, duration_months: e.target.value })} required />
          </div>
          <div className="space-y-1">
            {/* ✅ Label adjusted for Global Currency */}
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Price ({currencySymbol})</label>
            <input className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Badge</label>
            <select className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-xs" value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })}>
              {badgeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button disabled={loading} className="w-full bg-slate-900 text-white rounded-xl py-3.5 font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <><Save size={16}/> Save Plan</>}
            </button>
          </div>
        </form>
      )}

      {/* Plans List */}
      <div className="grid grid-cols-1 gap-4">
        {plans.length > 0 ? plans.map((plan, index) => (
          <div 
            key={plan.id} 
            style={{ animationDelay: `${index * 50}ms` }}
            className="group flex flex-col md:flex-row justify-between items-start md:items-center p-4 md:p-5 border border-slate-100 rounded-[24px] bg-white hover:border-blue-200 hover:shadow-xl transition-all gap-4 relative overflow-hidden animate-in fade-in slide-in-from-bottom-2"
          >
            <div className="flex items-center gap-4 md:gap-5">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg group-hover:bg-blue-600 transition-colors shrink-0">
                <Layers size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-black text-slate-800 text-base md:text-lg italic uppercase leading-tight">{plan.name}</p>
                  {plan.badge && (
                    <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter border ${badgeOptions.find(b => b.value === plan.badge)?.color || 'bg-slate-100'}`}>
                      {plan.badge}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-tighter mt-0.5">
                  <Clock size={12} /> {plan.duration_months} {plan.duration_months === 1 ? 'Month' : 'Months'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4 md:gap-6 border-t md:border-t-0 pt-4 md:pt-0">
              <div className="flex flex-col items-start md:items-end">
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">Price</span>
                <span className="text-xl md:text-2xl font-black text-blue-600 italic flex items-center tracking-tighter">
                  {/* ✅ Global Currency Formatter used */}
                  {formatCurrency(plan.price)}
                </span>
              </div>
              <div className="flex bg-slate-50 p-1 rounded-2xl gap-1">
                <button onClick={() => { setSelectedPlan(plan); setModalType('view'); }} title="View Plan" className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all"><Eye size={18}/></button>
                <button onClick={() => { setSelectedPlan(plan); setModalType('edit'); }} title="Edit Plan" className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-white rounded-xl transition-all"><Edit2 size={16}/></button>
                <button onClick={() => handleDelete(plan.id)} title="Delete Plan" className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-xl transition-all"><Trash2 size={18}/></button>
              </div>
            </div>
          </div>
        )) : (
          <div className="text-center py-20 bg-slate-50/50 rounded-[32px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
             <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Layers className="text-slate-300" size={32} />
             </div>
             <p className="text-slate-500 font-black uppercase text-sm tracking-widest">No plans found</p>
             <p className="text-slate-400 text-[10px] uppercase font-bold mt-1">Start by adding your first gym package</p>
          </div>
        )}
      </div>

      {/* Modal Section */}
      {modalType && selectedPlan && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[40px] w-full max-w-md p-6 md:p-8 shadow-2xl relative animate-in zoom-in-95">
            <button onClick={() => setModalType(null)} className="absolute right-6 top-6 p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-all"><X size={20}/></button>
            <div className="flex items-center gap-3 mb-8 mt-2">
                <div className={`p-3 rounded-2xl ${modalType === 'edit' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                  {modalType === 'edit' ? <Sparkles size={24}/> : <Eye size={24}/>}
                </div>
                <h2 className="text-2xl font-black text-slate-800 italic uppercase tracking-tight">{modalType} Plan</h2>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan Name</label>
                <input disabled={modalType === 'view'} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold" value={selectedPlan.name} onChange={(e) => setSelectedPlan({...selectedPlan, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Months</label>
                  <input type="number" disabled={modalType === 'view'} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold" value={selectedPlan.duration_months} onChange={(e) => setSelectedPlan({...selectedPlan, duration_months: e.target.value})} />
                </div>
                <div className="space-y-1">
                  {/* ✅ Modal Label adjusted for Global Currency */}
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Price ({currencySymbol})</label>
                  <input type="number" disabled={modalType === 'view'} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-blue-600" value={selectedPlan.price} onChange={(e) => setSelectedPlan({...selectedPlan, price: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Badge</label>
                <select disabled={modalType === 'view'} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-xs" value={selectedPlan.badge} onChange={(e) => setSelectedPlan({...selectedPlan, badge: e.target.value})}>
                  {badgeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              {modalType === 'edit' && (
                <button disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all mt-4 flex items-center justify-center gap-2 shadow-xl shadow-slate-200">
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18}/> Update Settings</>}
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MembershipPlans;