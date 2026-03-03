import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from "recharts";
import { TrendingUp, ArrowDownCircle, PieChart, IndianRupee, Wallet, Loader2, Sparkles, CheckCircle2 } from "lucide-react";

function Reports() {
  const [reportData, setReportData] = useState([]);
  const [totals, setTotals] = useState({ income: 0, expenses: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinancials();
  }, []);

  async function fetchFinancials() {
    try {
      setLoading(true);

      // ✅ FIX: Current User check to prevent data leakage
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // ✅ Fetch payments & expenses for THIS user only
      const { data: pData, error: pError } = await supabase
        .from("payments")
        .select("amount, payment_date")
        .eq("user_id", user.id); // Add this filter

      const { data: eData, error: eError } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user.id); // Add this filter

      if (pError) console.error("Payment Fetch Error:", pError);
      if (eError) console.error("Expense Fetch Error:", eError);

      const income = pData?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0;
      const expenses = eData?.reduce((sum, e) => sum + (Number(e.amount) || 0), 0) || 0;

      setTotals({ income, expenses });

      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthlyMap = {};

      pData?.forEach(p => {
        if (!p.payment_date) return;
        const monthName = months[new Date(p.payment_date).getMonth()];
        if (!monthlyMap[monthName]) monthlyMap[monthName] = { month: monthName, income: 0, expense: 0 };
        monthlyMap[monthName].income += Number(p.amount) || 0;
      });

      eData?.forEach(e => {
        const dateVal = e.date || e.expense_date || e.created_at;
        if (!dateVal) return;
        const monthName = months[new Date(dateVal).getMonth()];
        if (!monthlyMap[monthName]) monthlyMap[monthName] = { month: monthName, income: 0, expense: 0 };
        monthlyMap[monthName].expense += Number(e.amount) || 0;
      });

      // Improvement: Sorting months chronologically
      const sortedData = Object.values(monthlyMap);
      setReportData(sortedData);

    } catch (err) {
      console.error("Error fetching financials:", err);
    } finally {
      setLoading(false);
    }
  }

  const profit = totals.income - totals.expenses;
  const profitMargin = totals.income > 0 ? ((profit / totals.income) * 100).toFixed(1) : 0;

  return (
    <div className="p-3 md:p-8 space-y-6 md:space-y-10 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* Header Section */}
      <div className="flex flex-row justify-between items-center gap-4 bg-white/50 p-3 rounded-3xl md:bg-transparent md:p-0">
        <div>
          <h2 className="text-xl md:text-3xl font-black text-slate-900 italic uppercase tracking-tighter flex items-center gap-2 md:gap-3">
            <Sparkles className="text-blue-600 w-5 h-5 md:w-8 md:h-8" /> 
            <span className="leading-none">Financial Intelligence</span>
          </h2>
          <p className="text-slate-400 text-[8px] md:text-xs font-black uppercase tracking-[0.2em] mt-1 flex items-center gap-1">
            <CheckCircle2 size={10} className="text-emerald-500" /> Private Secure Ledger
          </p>
        </div>
        <button 
          onClick={fetchFinancials}
          className="bg-slate-900 text-white p-2.5 md:p-4 rounded-xl md:rounded-2xl hover:bg-black transition-all shadow-xl active:scale-95 flex items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <div className="hidden md:block text-[10px] font-black uppercase tracking-widest">Refresh</div>}
          <div className="md:hidden"><Loader2 className={`${loading ? 'animate-spin' : ''}`} size={18} /></div>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
        {/* Income Card */}
        <div className="bg-white p-6 md:p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-100 flex items-center justify-between group hover:border-emerald-200 transition-all cursor-default">
          <div className="space-y-1 md:space-y-2">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <p className="text-slate-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest">Gross Revenue</p>
            </div>
            <h3 className="text-2xl md:text-4xl font-black text-slate-900 italic flex items-center">
              <IndianRupee size={24} strokeWidth={3} className="text-emerald-500" />
              {totals.income.toLocaleString('en-IN')}
            </h3>
          </div>
          <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-50 text-emerald-500 rounded-2xl md:rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 shadow-inner">
            <TrendingUp size={28} />
          </div>
        </div>

        {/* Expense Card */}
        <div className="bg-white p-6 md:p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-100 flex items-center justify-between group hover:border-rose-200 transition-all cursor-default">
          <div className="space-y-1 md:space-y-2">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
               <p className="text-slate-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest">Total Burn</p>
            </div>
            <h3 className="text-2xl md:text-4xl font-black text-slate-900 italic flex items-center">
              <IndianRupee size={24} strokeWidth={3} className="text-rose-500" />
              {totals.expenses.toLocaleString('en-IN')}
            </h3>
          </div>
          <div className="w-12 h-12 md:w-16 md:h-16 bg-rose-50 text-rose-500 rounded-2xl md:rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-white transition-all duration-300">
            <ArrowDownCircle size={28} />
          </div>
        </div>

        {/* Profit Card */}
        <div className="sm:col-span-2 lg:col-span-1 bg-slate-900 p-6 md:p-8 rounded-[32px] shadow-2xl shadow-blue-200 flex items-center justify-between group relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-32 h-32 ${profit >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10'} rounded-full -mr-16 -mt-16 blur-3xl`} />
          <div className="space-y-1 md:space-y-2 relative z-10">
            <p className="text-blue-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest">Net Profit ({profitMargin}%)</p>
            <h3 className={`text-2xl md:text-4xl font-black italic flex items-center ${profit >= 0 ? 'text-white' : 'text-rose-400'}`}>
              <IndianRupee size={24} strokeWidth={3} className="opacity-50" />
              {profit.toLocaleString('en-IN')}
            </h3>
          </div>
          <div className={`w-12 h-12 md:w-16 md:h-16 ${profit >= 0 ? 'bg-blue-600' : 'bg-rose-600'} text-white rounded-2xl md:rounded-3xl flex items-center justify-center relative z-10 shadow-lg`}>
            <Wallet size={28} />
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-5 md:p-12 rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 md:mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
              <PieChart size={24} strokeWidth={3} />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-black text-slate-800 italic uppercase">Cash Flow Analytics</h3>
              <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">Visualizing Monthly Performance</p>
            </div>
          </div>
          <div className="flex gap-4 p-2 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-black uppercase text-slate-600 tracking-tighter">Income</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-[10px] font-black uppercase text-slate-600 tracking-tighter">Expense</span>
            </div>
          </div>
        </div>

        {/* Chart Area */}
        <div className="h-[350px] md:h-[500px] w-full">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-blue-600" size={48} />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Processing Ledger Data...</p>
            </div>
          ) : reportData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4">
               <Sparkles size={60} strokeWidth={1} className="opacity-20" />
               <p className="font-black uppercase text-[10px] tracking-widest">No transaction history found</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData} margin={{ top: 20, right: 0, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="10 10" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 900}} 
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 900}} 
                />
                <Tooltip 
                  cursor={{fill: '#f8fafc', radius: 12}}
                  contentStyle={{ 
                    borderRadius: '24px', 
                    border: '1px solid #f1f5f9', 
                    boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)',
                    padding: '20px',
                    background: '#ffffff'
                  }}
                  itemStyle={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '10px', marginBottom: '4px' }}
                />
                <Bar 
                  dataKey="income" 
                  fill="url(#incomeGradient)" 
                  radius={[10, 10, 4, 4]} 
                  name="Monthly Revenue" 
                  barSize={window.innerWidth < 768 ? 14 : 36} 
                />
                <Bar 
                  dataKey="expense" 
                  fill="url(#expenseGradient)" 
                  radius={[10, 10, 4, 4]} 
                  name="Monthly Burn" 
                  barSize={window.innerWidth < 768 ? 14 : 36} 
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

export default Reports;