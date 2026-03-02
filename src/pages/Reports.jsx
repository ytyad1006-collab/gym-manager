import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, Cell
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
    <div className="p-4 md:p-8 space-y-10 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter flex items-center gap-3">
            <Sparkles className="text-blue-600" /> Financial Intelligence
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mt-1">Real-time Performance Metrics</p>
        </div>
        <button 
          onClick={fetchFinancials}
          className="bg-white border border-slate-200 p-3 rounded-2xl hover:bg-slate-50 transition-all shadow-sm active:scale-95"
        >
          <Loader2 className={`${loading ? 'animate-spin' : ''} text-slate-400`} size={20} />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Income Card */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-100 flex items-center justify-between group hover:border-emerald-200 transition-all">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Gross Revenue</p>
            </div>
            <h3 className="text-4xl font-black text-slate-900 italic flex items-center">
              <IndianRupee size={28} strokeWidth={3} className="text-emerald-500" />
              {totals.income.toLocaleString()}
            </h3>
          </div>
          <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <TrendingUp size={32} />
          </div>
        </div>

        {/* Expense Card */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-100 flex items-center justify-between group hover:border-rose-200 transition-all">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
               <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Burn</p>
            </div>
            <h3 className="text-4xl font-black text-slate-900 italic flex items-center">
              <IndianRupee size={28} strokeWidth={3} className="text-rose-500" />
              {totals.expenses.toLocaleString()}
            </h3>
          </div>
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <ArrowDownCircle size={32} />
          </div>
        </div>

        {/* Profit Card */}
        <div className="bg-slate-900 p-8 rounded-[32px] shadow-2xl shadow-blue-200 flex items-center justify-between group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
          <div className="space-y-2 relative z-10">
            <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Net Profit/Loss</p>
            <h3 className={`text-4xl font-black italic flex items-center ${profit >= 0 ? 'text-white' : 'text-rose-400'}`}>
              <IndianRupee size={28} strokeWidth={3} className="opacity-50" />
              {profit.toLocaleString()}
            </h3>
          </div>
          <div className="w-16 h-16 bg-blue-600 text-white rounded-3xl flex items-center justify-center relative z-10">
            <Wallet size={32} />
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
              <PieChart className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 italic uppercase">Cash Flow Analytics</h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Monthly Comparison</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-black uppercase text-emerald-700">Income</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-[10px] font-black uppercase text-rose-700">Expense</span>
            </div>
          </div>
        </div>

        <div className="h-[450px] w-full">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-blue-600" size={40} />
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Crunching Numbers...</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 800}} 
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 800}} 
                />
                <Tooltip 
                  cursor={{fill: '#f8fafc', radius: 12}}
                  contentStyle={{ 
                    borderRadius: '24px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    padding: '20px',
                    background: '#ffffff'
                  }}
                  itemStyle={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '10px' }}
                />
                <Bar 
                  dataKey="income" 
                  fill="#10b981" 
                  radius={[12, 12, 0, 0]} 
                  name="Income" 
                  barSize={32} 
                />
                <Bar 
                  dataKey="expense" 
                  fill="#ef4444" 
                  radius={[12, 12, 0, 0]} 
                  name="Expense" 
                  barSize={32} 
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