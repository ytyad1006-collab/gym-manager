import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Plus, Trash2, IndianRupee, Loader2, Calendar, Tag, Wallet, AlertCircle, PieChart, TrendingDown } from "lucide-react";

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [form, setForm] = useState({ 
    title: "", 
    amount: "", 
    category: "Maintenance", 
    expense_date: new Date().toISOString().split('T')[0] 
  });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { fetchExpenses(); }, []);

  async function fetchExpenses() {
    try {
      setLoading(true);

      // ✅ Fix: Get current logged-in user to prevent seeing others' data
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user.id) // ✅ Filter by user_id so owner sees only their expenses
        .order("expense_date", { ascending: false });
      
      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error("Error fetching:", error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setBtnLoading(true);

    try {
      // ✅ Security: Get user ID for insertion
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("expenses")
        .insert([{ 
          title: form.title, 
          amount: parseFloat(form.amount), 
          category: form.category, 
          expense_date: form.expense_date,
          user_id: user.id // ✅ Assign current user ID to the new record
        }]);

      if (error) throw error;

      setForm({ 
        title: "", 
        amount: "", 
        category: "Maintenance", 
        expense_date: new Date().toISOString().split('T')[0] 
      });
      setShowForm(false);
      fetchExpenses();
    } catch (error) {
      alert("Error saving expense: " + error.message);
    } finally {
      setBtnLoading(false);
    }
  }

  async function handleDelete(id) {
    if (confirm("Delete this expense?")) {
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) alert(error.message);
      else fetchExpenses();
    }
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const categoryTotals = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + Number(curr.amount);
    return acc;
  }, {});

  return (
    <div className="p-4 md:p-10 space-y-6 md:space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* 🚀 Summary Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 text-red-50/50 group-hover:text-red-50 transition-colors">
            <TrendingDown size={120} strokeWidth={3} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Total Cash Outflow</p>
          <div className="flex items-center text-4xl font-black text-red-600 italic">
            <IndianRupee size={32} strokeWidth={3} />
            {totalExpenses.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <PieChart size={14} /> Spending Breakdown
          </p>
          <div className="flex flex-wrap gap-3">
            {Object.entries(categoryTotals).map(([cat, amt]) => (
              <div key={cat} className="bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{cat}</p>
                <p className="text-sm font-black text-slate-800">₹{amt.toLocaleString()}</p>
              </div>
            ))}
            {expenses.length === 0 && <p className="text-slate-300 text-xs italic">No data to analyze</p>}
          </div>
        </div>
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
            <Wallet size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tight">Expense Logs</h2>
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1">
               Official Business Outgoings
            </p>
          </div>
        </div>
        
        <button 
          onClick={() => setShowForm(!showForm)} 
          className={`${showForm ? 'bg-slate-800' : 'bg-red-600 hover:bg-red-700'} text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-2 transition-all shadow-lg active:scale-95 w-full md:w-auto justify-center`}
        >
          {showForm ? "Close Panel" : <><Plus size={18} strokeWidth={3}/> Add Expense</>}
        </button>
      </div>

      {/* Add Expense Form */}
      {showForm && (
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-2xl animate-in zoom-in-95 duration-200">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Expense Title</label>
              <input 
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-red-500/10 focus:bg-white focus:border-red-500 transition-all font-bold text-slate-700 placeholder:text-slate-300" 
                placeholder="e.g. New Dumbbells" 
                value={form.title} 
                onChange={e => setForm({...form, title: e.target.value})} 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Amount (₹)</label>
              <input 
                type="number" 
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-red-500/10 focus:bg-white focus:border-red-500 transition-all font-black text-slate-700" 
                placeholder="0.00" 
                value={form.amount || ""} 
                onChange={e => setForm({...form, amount: e.target.value})} 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Category</label>
              <select 
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-red-500/10 focus:bg-white font-black text-slate-700 appearance-none cursor-pointer" 
                value={form.category} 
                onChange={e => setForm({...form, category: e.target.value})}
              >
                <option>Rent</option>
                <option>Electricity</option>
                <option>Salary</option>
                <option>Maintenance</option>
                <option>Marketing</option>
                <option>Equipments</option>
              </select>
            </div>
            <button 
              disabled={btnLoading}
              className="w-full bg-red-600 text-white p-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] hover:bg-red-700 transition-all disabled:bg-slate-400 shadow-xl shadow-red-100 flex items-center justify-center gap-2"
            >
              {btnLoading ? <Loader2 className="animate-spin" size={18} /> : "Record Expense"}
            </button>
          </form>
        </div>
      )}

      {/* Expense List Table */}
      <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-24 text-center text-slate-400 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-red-500" size={40} />
            <span className="font-black uppercase text-[10px] tracking-[0.3em]">Auditing Ledgers...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Billing Date</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Expense Details</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Classification</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Amount</th>
                  <th className="px-8 py-5 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {expenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-slate-50 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
                        <Calendar size={14} className="text-slate-300" />
                        {new Date(exp.expense_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-black text-slate-800 text-sm uppercase tracking-tight">{exp.title}</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="bg-white text-slate-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200 inline-flex items-center gap-1 shadow-sm">
                        <Tag size={10} strokeWidth={3} /> {exp.category}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-black text-red-600 text-lg italic flex items-center">
                        <IndianRupee size={16} strokeWidth={3} />
                        {exp.amount.toLocaleString('en-IN')}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => handleDelete(exp.id)} 
                        className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                      >
                        <Trash2 size={18}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {expenses.length === 0 && !loading && (
          <div className="py-24 text-center flex flex-col items-center gap-4 opacity-30">
            <AlertCircle size={60} strokeWidth={1} />
            <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.4em]">Zero Outflows Recorded</p>
          </div>
        )}
      </div>
    </div>
  );
}