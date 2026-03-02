import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Plus, Trash2, Loader2, Edit2, Eye, X, Save, Clock, IndianRupee, Layers } from "lucide-react";

function MembershipPlans() {
  const [plans, setPlans] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [modalType, setModalType] = useState(null);

  const [form, setForm] = useState({ name: "", duration_months: "", price: "" });

  useEffect(() => { fetchPlans(); }, []);

  async function fetchPlans() {
    const { data, error } = await supabase
      .from("membership_plans")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    else setPlans(data || []);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const payload = { name: form.name, duration_months: parseInt(form.duration_months), price: parseFloat(form.price) };
    const { error } = await supabase.from("membership_plans").insert([payload]);
    if (!error) { 
      setForm({ name: "", duration_months: "", price: "" }); 
      setShowForm(false); 
      fetchPlans(); 
    }
    setLoading(false);
  }

  async function handleDelete(id) {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      await supabase.from("membership_plans").delete().eq("id", id);
      fetchPlans();
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase
      .from("membership_plans")
      .update({
        name: selectedPlan.name,
        duration_months: parseInt(selectedPlan.duration_months),
        price: parseFloat(selectedPlan.price)
      })
      .eq("id", selectedPlan.id);
    if (!error) { setModalType(null); fetchPlans(); }
    setLoading(false);
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-slate-100 border border-slate-100 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h3 className="text-2xl font-black text-slate-800 italic uppercase tracking-tight">Membership Plans</h3>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Configure your gym packages</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg active:scale-95 ${showForm ? 'bg-slate-100 text-slate-600' : 'bg-blue-600 text-white shadow-blue-100 hover:bg-blue-700'}`}
        >
          {showForm ? <X size={18} /> : <Plus size={18} />} 
          {showForm ? "Cancel" : "Create Plan"}
        </button>
      </div>

      {/* Add Plan Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10 p-6 bg-slate-50 rounded-[24px] border-2 border-dashed border-slate-200 animate-in slide-in-from-top-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Plan Name</label>
            <input className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium" placeholder="Silver, Gold, etc." value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Months</label>
            <input className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium" placeholder="Duration" type="number" value={form.duration_months} onChange={(e) => setForm({ ...form, duration_months: e.target.value })} required />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Price (₹)</label>
            <input className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" placeholder="Amount" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          </div>
          <div className="flex items-end">
            <button disabled={loading} className="w-full bg-slate-900 text-white rounded-xl py-3.5 font-black uppercase text-xs tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <><Save size={16}/> Save Plan</>}
            </button>
          </div>
        </form>
      )}

      {/* Plans List */}
      <div className="grid grid-cols-1 gap-4">
        {plans.length > 0 ? plans.map((plan) => (
          <div key={plan.id} className="group flex flex-wrap justify-between items-center p-5 border border-slate-100 rounded-[24px] bg-white hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50/50 transition-all">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-blue-600 transition-colors">
                <Layers size={20} />
              </div>
              <div>
                <p className="font-black text-slate-800 text-lg italic uppercase">{plan.name}</p>
                <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-tighter">
                  <Clock size={12} /> {plan.duration_months} Months Duration
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-6 mt-4 md:mt-0">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Price</span>
                <span className="text-2xl font-black text-blue-600 italic flex items-center tracking-tighter">
                  <IndianRupee size={18} strokeWidth={3} />{plan.price.toLocaleString()}
                </span>
              </div>
              
              <div className="flex bg-slate-50 p-1.5 rounded-2xl gap-1">
                <button onClick={() => { setSelectedPlan(plan); setModalType('view'); }} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all" title="View Details">
                  <Eye size={20}/>
                </button>
                <button onClick={() => { setSelectedPlan(plan); setModalType('edit'); }} className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-white rounded-xl transition-all" title="Edit Plan">
                  <Edit2 size={18}/>
                </button>
                <button onClick={() => handleDelete(plan.id)} className="p-3 text-slate-400 hover:text-red-600 hover:bg-white rounded-xl transition-all" title="Delete Plan">
                  <Trash2 size={20}/>
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="text-center py-20 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
             <Layers className="mx-auto text-slate-200 mb-4" size={48} />
             <p className="text-slate-400 font-black uppercase text-xs tracking-[0.2em]">No membership plans created yet</p>
          </div>
        )}
      </div>

      {/* Modern Modal Section */}
      {modalType && selectedPlan && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[40px] w-full max-w-md p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button onClick={() => setModalType(null)} className="absolute right-6 top-6 p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-all"><X size={20}/></button>
            
            <div className="flex items-center gap-3 mb-8">
               <div className={`p-3 rounded-2xl ${modalType === 'edit' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                  {modalType === 'edit' ? <Edit2 size={24}/> : <Eye size={24}/>}
               </div>
               <h2 className="text-2xl font-black text-slate-800 italic uppercase tracking-tight">{modalType} Plan</h2>
            </div>

            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Plan Name</label>
                <input disabled={modalType === 'view'} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-600 font-bold transition-all" value={selectedPlan.name} onChange={(e) => setSelectedPlan({...selectedPlan, name: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Duration (Months)</label>
                  <input type="number" disabled={modalType === 'view'} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-600 font-bold transition-all" value={selectedPlan.duration_months} onChange={(e) => setSelectedPlan({...selectedPlan, duration_months: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Price (₹)</label>
                  <input type="number" disabled={modalType === 'view'} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-600 font-bold transition-all text-blue-600" value={selectedPlan.price} onChange={(e) => setSelectedPlan({...selectedPlan, price: e.target.value})} />
                </div>
              </div>
              
              {modalType === 'edit' && (
                <button disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200 mt-4 flex items-center justify-center gap-2">
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