import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { TrendingUp, ArrowDownCircle, PieChart, IndianRupee, Wallet, Loader2, Sparkles } from "lucide-react";

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
      const { data: pData, error: pError } = await supabase.from("payments").select("amount, payment_date");
      const { data: eData, error: eError } = await supabase.from("expenses").select("*");

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

      const sortedData = Object.values(monthlyMap);
      setReportData(sortedData);

    } catch (err) {
      console.error("Error fetching financials:", err);
    } finally {
      setLoading(false);
    }
  }

  const profit = totals.income - totals.expenses;

  return (
    <div className="p-3 md:p-8 space-y-6 md:space-y-10 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-row justify-between items-center gap-4 bg-white/50 p-2 rounded-2xl md:bg-transparent md:p-0">
        <div>
          <h2 className="text-xl md:text-3xl font-black text-slate-900 italic uppercase tracking-tighter flex items-center gap-2 md:gap-3">
            <Sparkles className="text-blue-600 w-5 h-5 md:w-8 md:h-8" /> 
            <span className="leading-none">Financial Intelligence</span>
          </h2>
          <p className="text-slate-400 text-[8px] md:text-xs font-black uppercase tracking-[0.2em] mt-1">Real-time Performance Metrics</p>
        </div>
        <button 
          onClick={fetchFinancials}
          className="bg-white border border-slate-200 p-2.5 md:p-3 rounded-xl md:rounded-2xl hover:bg-slate-50 transition-all shadow-sm active:scale-95"
        >
          <Loader2 className={`${loading ? 'animate-spin' : ''} text-slate-400`} size={18} />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
        {/* Income Card */}
        <div className="bg-white p-6 md:p-8 rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-lg shadow-slate-100 flex items-center justify-between group hover:border-emerald-200 transition-all">
          <div className="space-y-1 md:space-y-2">
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <p className="text-slate-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest">Gross Revenue</p>
            </div>
            <h3 className="text-2xl md:text-4xl font-black text-slate-900 italic flex items-center">
              <IndianRupee size={20} mdSize={28} strokeWidth={3} className="text-emerald-500" />
              {totals.income.toLocaleString()}
            </h3>
          </div>
          <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-50 text-emerald-500 rounded-2xl md:rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <TrendingUp size={24} mdSize={32} />
          </div>
        </div>

        {/* Expense Card */}
        <div className="bg-white p-6 md:p-8 rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-lg shadow-slate-100 flex items-center justify-between group hover:border-rose-200 transition-all">
          <div className="space-y-1 md:space-y-2">
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
               <p className="text-slate-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest">Total Burn</p>
            </div>
            <h3 className="text-2xl md:text-4xl font-black text-slate-900 italic flex items-center">
              <IndianRupee size={20} mdSize={28} strokeWidth={3} className="text-rose-500" />
              {totals.expenses.toLocaleString()}
            </h3>
          </div>
          <div className="w-12 h-12 md:w-16 md:h-16 bg-rose-50 text-rose-500 rounded-2xl md:rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <ArrowDownCircle size={24} mdSize={32} />
          </div>
        </div>

        {/* Profit Card - Full width on small tablets */}
        <div className="sm:col-span-2 lg:col-span-1 bg-slate-900 p-6 md:p-8 rounded-[24px] md:rounded-[32px] shadow-2xl shadow-blue-200 flex items-center justify-between group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
          <div className="space-y-1 md:space-y-2 relative z-10">
            <p className="text-blue-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest">Net Profit/Loss</p>
            <h3 className={`text-2xl md:text-4xl font-black italic flex items-center ${profit >= 0 ? 'text-white' : 'text-rose-400'}`}>
              <IndianRupee size={20} mdSize={28} strokeWidth={3} className="opacity-50" />
              {profit.toLocaleString()}
            </h3>
          </div>
          <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-600 text-white rounded-2xl md:rounded-3xl flex items-center justify-center relative z-10">
            <Wallet size={24} mdSize={32} />
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-5 md:p-12 rounded-[32px] md:rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 md:mb-12">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 rounded-xl md:rounded-2xl flex items-center justify-center">
              <PieChart className="text-blue-600" size={20} mdSize={24} />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-black text-slate-800 italic uppercase">Cash Flow Analytics</h3>
              <p className="text-slate-400 text-[8px] md:text-[10px] font-bold uppercase tracking-widest">Monthly Comparison</p>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-emerald-50 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[9px] md:text-[10px] font-black uppercase text-emerald-700">Income</span>
            </div>
            <div className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-rose-50 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-[9px] md:text-[10px] font-black uppercase text-rose-700">Expense</span>
            </div>
          </div>
        </div>

        {/* Responsive Chart Height */}
        <div className="h-[300px] md:h-[450px] w-full">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-blue-600" size={40} />
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Crunching Numbers...</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} 
                />
                <Tooltip 
                  cursor={{fill: '#f8fafc', radius: 8}}
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    padding: '12px',
                    background: '#ffffff'
                  }}
                  itemStyle={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '9px' }}
                />
                <Bar 
                  dataKey="income" 
                  fill="#10b981" 
                  radius={[6, 6, 0, 0]} 
                  name="Income" 
                  barSize={window.innerWidth < 768 ? 12 : 32} 
                />
                <Bar 
                  dataKey="expense" 
                  fill="#ef4444" 
                  radius={[6, 6, 0, 0]} 
                  name="Expense" 
                  barSize={window.innerWidth < 768 ? 12 : 32} 
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