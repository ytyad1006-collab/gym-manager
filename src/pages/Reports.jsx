import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, Legend
} from "recharts";
import { TrendingUp, ArrowDownCircle, PieChart, Wallet, Loader2, Sparkles, CheckCircle2, ShieldCheck, Download, Globe } from "lucide-react";

// ✅ GLOBAL PLAN: Import unified formatting helpers
import { formatCurrency } from "../lib/utils";

function Reports() {
  const [reportData, setReportData] = useState([]);
  const [totals, setTotals] = useState({ income: 0, expenses: 0 });
  const [loading, setLoading] = useState(true);
  
  // ✅ GLOBAL PLAN: Locale detection state (kept for chart formatting sync)
  const [currentLocale, setCurrentLocale] = useState('en-IN');
  const [currencyCode, setCurrencyCode] = useState('INR');

  useEffect(() => {
    fetchFinancials();
    
    // Global Settings Detection
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const isIndia = timezone.includes("Calcutta") || timezone.includes("Kolkata");
    
    if (!isIndia) {
      setCurrencyCode('USD');
      setCurrentLocale('en-US');
    }
  }, []);

  async function fetchFinancials() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: pData, error: pError } = await supabase
        .from("payments")
        .select("amount, payment_date")
        .eq("user_id", user.id);

      const { data: eData, error: eError } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user.id);

      if (pError) console.error("Payment Fetch Error:", pError);
      if (eError) console.error("Expense Fetch Error:", eError);

      const income = pData?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0;
      const expenses = eData?.reduce((sum, e) => sum + (Number(e.amount) || 0), 0) || 0;
      setTotals({ income, expenses });

      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthlyMap = {};
      months.forEach(m => { monthlyMap[m] = { month: m, income: 0, expense: 0 }; });

      pData?.forEach(p => {
        if (!p.payment_date) return;
        const monthName = months[new Date(p.payment_date).getMonth()];
        monthlyMap[monthName].income += Number(p.amount) || 0;
      });

      eData?.forEach(e => {
        const dateVal = e.date || e.expense_date || e.created_at;
        if (!dateVal) return;
        const monthName = months[new Date(dateVal).getMonth()];
        monthlyMap[monthName].expense += Number(e.amount) || 0;
      });

      const sortedData = Object.values(monthlyMap).filter(d => d.income > 0 || d.expense > 0);
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
    <div className="p-4 md:p-8 space-y-6 animate-in fade-in duration-700 max-w-7xl mx-auto">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3 tracking-tight">
            <Sparkles className="text-blue-600 w-6 h-6 md:w-8 md:h-8" /> 
            <span>Financial Intelligence</span>
          </h2>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-1 flex items-center gap-1">
            <ShieldCheck size={14} className="text-emerald-500" /> Secure Cloud Ledger
          </p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <Globe size={12} /> Standard: {currentLocale}
            </div>
            <button onClick={fetchFinancials} className="flex-1 md:flex-none bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wide hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm">
              {loading ? <Loader2 className="animate-spin" size={16} /> : "Sync Data"}
            </button>
            <button className="bg-slate-900 text-white p-3 rounded-xl hover:bg-black transition-all shadow-lg active:scale-95">
              <Download size={18} />
            </button>
        </div>
      </div>

      {/* Stats Cards - ✅ UPDATED with formatCurrency Helper */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex items-center justify-between group">
          <div className="space-y-1">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Revenue</p>
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              {formatCurrency(totals.income, currencyCode, currentLocale)}
            </h3>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex items-center justify-between group">
          <div className="space-y-1">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Expenses</p>
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              {formatCurrency(totals.expenses, currencyCode, currentLocale)}
            </h3>
          </div>
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <ArrowDownCircle size={24} />
          </div>
        </div>

        <div className="sm:col-span-2 lg:col-span-1 bg-slate-900 p-6 rounded-[24px] shadow-lg flex items-center justify-between group border-b-4 border-blue-600">
          <div className="space-y-1">
            <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest">Net Profit ({profitMargin}%)</p>
            <h3 className={`text-2xl md:text-3xl font-bold tracking-tight ${profit >= 0 ? 'text-white' : 'text-rose-400'}`}>
              {formatCurrency(profit, currencyCode, currentLocale)}
            </h3>
          </div>
          <div className={`w-12 h-12 ${profit >= 0 ? 'bg-blue-600' : 'bg-rose-600'} text-white rounded-2xl flex items-center justify-center shadow-lg`}>
            <Wallet size={24} />
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-4 md:p-8 rounded-[32px] border border-slate-100 shadow-sm relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center">
              <PieChart size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 tracking-tight">Analytics Overview</h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Cash Flow Visualizer</p>
            </div>
          </div>
          <div className="flex gap-2 p-1 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-md shadow-sm border border-slate-100">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[9px] font-bold uppercase text-slate-600">Income</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-md shadow-sm border border-slate-100">
              <div className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-[9px] font-bold uppercase text-slate-600">Burn</span>
            </div>
          </div>
        </div>

        <div className="h-[300px] md:h-[450px] w-full">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-blue-600" size={32} />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loading Chart...</p>
            </div>
          ) : reportData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4 opacity-60">
               <Sparkles size={48} strokeWidth={1} />
               <p className="font-bold uppercase text-[10px] tracking-widest">No transaction history</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}}
                  /* ✅ Chart axis update for k/m formatting */
                  tickFormatter={(value) => `${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`}
                />
                <Tooltip 
                  cursor={{fill: '#f8fafc', radius: 8}}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid #e2e8f0', 
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    padding: '12px',
                  }}
                  itemStyle={{ fontWeight: 700, fontSize: '12px' }}
                  /* ✅ Tooltip uses global formatter */
                  formatter={(value) => [formatCurrency(value, currencyCode, currentLocale), ""]}
                />
                <Bar 
                  dataKey="income" 
                  fill="#10b981" 
                  radius={[4, 4, 0, 0]} 
                  name="Income" 
                  barSize={window.innerWidth < 768 ? 12 : 32} 
                />
                <Bar 
                  dataKey="expense" 
                  fill="#ef4444" 
                  radius={[4, 4, 0, 0]} 
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