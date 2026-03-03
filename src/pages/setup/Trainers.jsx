import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { UserPlus, Phone, Award, DollarSign, Loader2, Edit2, Trash2, Eye, X, Save, ShieldCheck, Briefcase, CreditCard, CheckCircle2 } from "lucide-react";

function Trainers() {
  const [trainers, setTrainers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(null); // Track specific trainer payment
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [modalType, setModalType] = useState(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    specialty: "",
    salary: "",
  });

  useEffect(() => {
    fetchTrainers();
  }, []);

  // ✅ FIX: Isolated fetching
  async function fetchTrainers() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("trainers")
      .select("*")
      .eq("user_id", user.id) // Secure filter
      .order("created_at", { ascending: false });
    
    if (error) console.error("Error:", error);
    else setTrainers(data || []);
  }

  // ✅ NEW: Record Salary in Expenses Table
  async function recordSalaryPayment(trainer) {
    if (!window.confirm(`Record ₹${trainer.salary} as salary expense for ${trainer.name}?`)) return;
    
    setPayLoading(trainer.id);
    const { data: { user } } = await supabase.auth.getUser();

    const expensePayload = {
      title: `Salary: ${trainer.name}`,
      amount: parseFloat(trainer.salary),
      category: "Salary",
      date: new Date().toISOString().split('T')[0],
      user_id: user.id,
      notes: `Staff ID: ${trainer.id} | Phone: ${trainer.phone}`
    };

    const { error } = await supabase.from("expenses").insert([expensePayload]);

    if (error) {
      alert("Error recording expense: " + error.message);
    } else {
      alert(`Salary for ${trainer.name} recorded in Expenses!`);
    }
    setPayLoading(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    const payload = { 
      ...form, 
      salary: parseFloat(form.salary),
      user_id: user.id // Attach owner ID
    };

    const { error } = await supabase.from("trainers").insert([payload]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      setForm({ name: "", phone: "", specialty: "", salary: "" });
      setShowForm(false);
      fetchTrainers();
    }
    setLoading(false);
  }

  async function handleDelete(id) {
    if (window.confirm("Are you sure you want to remove this trainer?")) {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("trainers")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id); // Secure delete
      
      if (error) alert(error.message);
      else fetchTrainers();
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("trainers")
      .update({
        name: selectedTrainer.name,
        phone: selectedTrainer.phone,
        specialty: selectedTrainer.specialty,
        salary: parseFloat(selectedTrainer.salary)
      })
      .eq("id", selectedTrainer.id)
      .eq("user_id", user.id); // Secure update

    if (error) {
      alert(error.message);
    } else {
      setModalType(null);
      fetchTrainers();
    }
    setLoading(false);
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-xl shadow-slate-100 border border-slate-100 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h3 className="text-2xl font-black text-slate-800 italic uppercase tracking-tight flex items-center gap-2">
            <ShieldCheck className="text-blue-600" /> Professional Staff
          </h3>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Private Trainer Management & Payroll</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className={`w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl transition-all font-bold shadow-lg active:scale-95 ${
            showForm ? "bg-slate-100 text-slate-600" : "bg-blue-600 text-white shadow-blue-100 hover:bg-blue-700"
          }`}
        >
          {showForm ? <X size={20} /> : <><UserPlus size={20} /> Add Trainer</>}
        </button>
      </div>

      {/* Add Trainer Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12 p-8 bg-slate-50 rounded-[24px] border border-slate-200 animate-in slide-in-from-top-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
            <input className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 font-medium" placeholder="Rahul Sharma" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact No.</label>
            <input className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 font-medium" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expertise</label>
            <input className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 font-medium" placeholder="e.g. Yoga, HIIT" value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} required />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Salary (₹)</label>
            <input className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 font-bold" placeholder="Salary" type="number" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} required />
          </div>
          <div className="flex items-end pb-0.5">
            <button disabled={loading} className="w-full bg-slate-900 text-white rounded-xl py-3.5 font-black uppercase text-xs tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Save Profile"}
            </button>
          </div>
        </form>
      )}

      {/* Trainers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainers.map((trainer) => (
          <div key={trainer.id} className="group flex flex-col p-6 border border-slate-100 rounded-[28px] hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-50 transition-all bg-white relative">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-lg font-black italic shadow-lg">
                  {trainer.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-black text-slate-800 text-lg uppercase italic tracking-tight">{trainer.name}</h4>
                  <div className="flex items-center gap-1 text-slate-400 text-xs font-bold uppercase tracking-widest">
                    <Briefcase size={12} /> {trainer.specialty}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-2xl space-y-3 mb-6 relative overflow-hidden">
              <div className="flex items-center justify-between">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly Salary</span>
                 <div className="flex items-center gap-1 font-black text-blue-600 italic text-lg tracking-tighter">
                   ₹{trainer.salary.toLocaleString()}
                 </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                  <Phone size={14} className="text-slate-300" /> {trainer.phone}
                </div>
                {/* SALARY FETCH BUTTON */}
                <button 
                  onClick={() => recordSalaryPayment(trainer)}
                  disabled={payLoading === trainer.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-[10px] font-black uppercase tracking-tighter hover:bg-emerald-600 transition-all shadow-md active:scale-95 disabled:opacity-50"
                  title="Push to Expenses"
                >
                  {payLoading === trainer.id ? <Loader2 className="animate-spin" size={12}/> : <CreditCard size={12}/>}
                  Pay Salary
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => { setSelectedTrainer(trainer); setModalType('view'); }} className="flex-1 py-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest">
                <Eye size={16}/> Details
              </button>
              <button onClick={() => { setSelectedTrainer(trainer); setModalType('edit'); }} className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
                <Edit2 size={18}/>
              </button>
              <button onClick={() => handleDelete(trainer.id)} className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all">
                <Trash2 size={18}/>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modern Modal Section */}
      {modalType && selectedTrainer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex justify-center items-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] w-full max-w-md p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setModalType(null)} className="absolute right-6 top-6 p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-all"><X size={20}/></button>
            <h2 className="text-2xl font-black text-slate-800 italic uppercase tracking-tighter mb-8 flex items-center gap-2">
              <div className={`p-2 rounded-xl ${modalType === 'edit' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                {modalType === 'edit' ? <Edit2 size={24}/> : <Eye size={24}/>}
              </div>
              {modalType} Profile
            </h2>

            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Trainer Name</label>
                <input disabled={modalType === 'view'} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold" value={selectedTrainer.name} onChange={(e) => setSelectedTrainer({...selectedTrainer, name: e.target.value})} required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Phone</label>
                <input disabled={modalType === 'view'} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold" value={selectedTrainer.phone} onChange={(e) => setSelectedTrainer({...selectedTrainer, phone: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expertise</label>
                  <input disabled={modalType === 'view'} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold uppercase" value={selectedTrainer.specialty} onChange={(e) => setSelectedTrainer({...selectedTrainer, specialty: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Salary (₹)</label>
                  <input type="number" disabled={modalType === 'view'} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-black text-blue-600" value={selectedTrainer.salary} onChange={(e) => setSelectedTrainer({...selectedTrainer, salary: e.target.value})} />
                </div>
              </div>

              {modalType === 'edit' && (
                <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-xl mt-4 flex items-center justify-center gap-2 active:scale-95">
                  {loading ? <Loader2 className="animate-spin" size={20}/> : <><Save size={20}/> Update Profile</>}
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Trainers;