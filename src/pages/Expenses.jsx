import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Plus, Trash2, IndianRupee, Loader2, Calendar, Tag, Wallet, AlertCircle } from "lucide-react";

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
    setLoading(true);
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .order("expense_date", { ascending: false });
    
    if (error) console.error("Error fetching:", error);
    else setExpenses(data || []);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setBtnLoading(true);

    const { error } = await supabase
      .from("expenses")
      .insert([{ 
        title: form.title, 
        amount: parseFloat(form.amount), 
        category: form.category, 
        expense_date: form.expense_date 
      }]);

    if (error) {
      alert("Error saving expense: " + error.message);
      console.error(error);
    } else {
      setForm({ 
        title: "", 
        amount: "", 
        category: "Maintenance", 
        expense_date: new Date().toISOString().split('T')[0] 
      });
      setShowForm(false);
      fetchExpenses();
    }
    setBtnLoading(false);
  }

  async function handleDelete(id) {
    if (confirm("Delete this expense?")) {
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) alert(error.message);
      else fetchExpenses();
    }
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
      {/* Header & Stats Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shadow-sm">
            <Wallet size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tight">Expense Tracker</h2>
            <p className="text-slate-500 font-medium text-sm flex items-center gap-1">
               Manage your gym's daily outgoings
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Outflow</span>
            <span className="text-xl font-black text-red-600 italic">₹{totalExpenses.toLocaleString()}</span>
          </div>
          
          <button 
            onClick={() => setShowForm(!showForm)} 
            className={`${showForm ? 'bg-slate-800' : 'bg-red-600 hover:bg-red-700'} text-white px-6 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-red-100 active:scale-95`}
          >
            {showForm ? "Close" : <><Plus size={20}/> Add New</>}
          </button>
        </div>
      </div>

      {/* Add Expense Form */}
      {showForm && (
        <div className="bg-white p-8 rounded-[24px] border border-slate-100 shadow-xl animate-in zoom-in-95 duration-200">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase ml-1 tracking-widest">Title</label>
              <input 
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-red-500/10 focus:bg-white focus:border-red-500 transition-all font-medium text-slate-700" 
                placeholder="e.g. Electricity Bill" 
                value={form.title} 
                onChange={e => setForm({...form, title: e.target.value})} 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase ml-1 tracking-widest">Amount (₹)</label>
              <input 
                type="number" 
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-red-500/10 focus:bg-white focus:border-red-500 transition-all font-bold text-slate-700" 
                placeholder="0" 
                value={form.amount || ""} 
                onChange={e => setForm({...form, amount: e.target.value})} 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase ml-1 tracking-widest">Category</label>
              <select 
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-red-500/10 focus:bg-white font-bold text-slate-700 appearance-none cursor-pointer" 
                value={form.category} 
                onChange={e => setForm({...form, category: e.target.value})}
              >
                <option>Rent</option>
                <option>Electricity</option>
                <option>Salary</option>
                <option>Maintenance</option>
                <option>Marketing</option>
              </select>
            </div>
            <button 
              disabled={btnLoading}
              className="w-full bg-slate-900 text-white p-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] hover:bg-black transition-all disabled:bg-slate-400 shadow-lg flex items-center justify-center gap-2"
            >
              {btnLoading ? <Loader2 className="animate-spin" size={18} /> : "Record Expense"}
            </button>
          </form>
        </div>
      )}

      {/* Expense List Table */}
      <div className="bg-white rounded-[24px] border border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/50">
        {loading ? (
          <div className="p-20 text-center text-slate-400 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-red-500" size={32} />
            <span className="font-black uppercase text-[10px] tracking-widest">Analyzing Accounts...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/80 border-b border-slate-100">
                <tr>
                  <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Date</th>
                  <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Transaction Details</th>
                  <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Category</th>
                  <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Amount</th>
                  <th className="p-5 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {expenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="p-5">
                      <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                        <Calendar size={14} className="text-slate-300" />
                        {new Date(exp.expense_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="font-bold text-slate-800 text-base">{exp.title}</div>
                    </td>
                    <td className="p-5">
                      <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border border-slate-200 flex w-fit items-center gap-1">
                        <Tag size={10} /> {exp.category}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="font-black text-red-600 text-lg flex items-center">
                        <IndianRupee size={16} strokeWidth={3} />
                        {exp.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="p-5 text-right">
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
          <div className="p-20 text-center flex flex-col items-center gap-3">
            <AlertCircle className="text-slate-200" size={48} />
            <p className="text-slate-400 font-black uppercase text-xs tracking-widest italic">No expenses recorded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}