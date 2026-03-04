import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase"; 
import { Search, Download, Loader2, Globe, Calendar, CreditCard, Filter, ArrowUpDown, TrendingUp, Users, Banknote, FileText } from "lucide-react";

// ✅ GLOBAL PLAN: Receipt Generator Utility Import
import { generateReceipt } from "../lib/receipts";

function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // 🌍 Global Settings (Fetched from localStorage to match your Settings.jsx)
  const [gymName, setGymName] = useState("My Iron Paradise");
  const [currencySymbol, setCurrencySymbol] = useState("₹");
  const [currencyCode, setCurrencyCode] = useState("INR");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");

  useEffect(() => {
    fetchPayments();
    
    // Global Settings Load
    const savedGym = localStorage.getItem("gym_name");
    const savedCountry = localStorage.getItem("gym_country");
    if (savedGym) setGymName(savedGym);
    
    // Map country to currency for receipt generator
    if (savedCountry) {
      const countries = [
        { code: "IN", currency: "INR", symbol: "₹" },
        { code: "US", currency: "USD", symbol: "$" },
        { code: "AE", currency: "AED", symbol: "د.إ" },
        { code: "GB", currency: "GBP", symbol: "£" },
        { code: "EU", currency: "EUR", symbol: "€" },
      ];
      const match = countries.find(c => c.code === savedCountry);
      if (match) {
        setCurrencySymbol(match.symbol);
        setCurrencyCode(match.currency);
      }
    }
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("payments")
        .select(`
          id, amount, payment_date, payment_mode, created_at,
          members!fk_member_final ( name )
        `) 
        .eq("user_id", user.id)
        .order("payment_date", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (err) {
      console.error("Error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter((p) => {
    const memberName = p.members?.name || "Unknown Member";
    return memberName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalRevenue = filteredPayments.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const getModeStyle = (mode) => {
    switch (mode?.toLowerCase()) {
      case 'online': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'cash': return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'card': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'due': return 'bg-red-50 text-red-700 border-red-100'; 
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  // ✅ GLOBAL PLAN: PDF Download Handler
  const handleDownload = (payment) => {
    const receiptData = {
      id: payment.id,
      amount: payment.amount,
      member_name: payment.members?.name || "Member",
      created_at: payment.payment_date,
      plan_name: "Gym Membership", // Aap yahan database se plan_name bhi fetch kar sakte hain
      currency: currencyCode
    };

    const preferences = {
      currency: currencyCode,
      dateFormat: dateFormat
    };

    generateReceipt(receiptData, { name: gymName }, preferences);
  };

  return (
    <div className="p-3 md:p-8 space-y-4 md:space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto overflow-x-hidden">
      
      {/* 🚀 Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex items-center justify-between overflow-hidden relative group">
          <div className="z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Collection</p>
            <h4 className="text-3xl font-black text-slate-900 italic flex items-center">
              <span className="text-emerald-500 mr-1 not-italic font-bold">{currencySymbol}</span>
              {totalRevenue.toLocaleString()}
            </h4>
          </div>
          <TrendingUp className="text-slate-50 absolute -right-4 -bottom-4 group-hover:text-emerald-50 transition-colors" size={100} />
        </div>
        
        <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex items-center justify-between overflow-hidden relative group">
          <div className="z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Logs</p>
            <h4 className="text-3xl font-black text-slate-900 italic">{filteredPayments.length}</h4>
          </div>
          <CreditCard className="text-slate-50 absolute -right-4 -bottom-4 group-hover:text-blue-50 transition-colors" size={100} />
        </div>
      </div>

      {/* 🔍 Header & Search Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-[24px] shadow-sm border border-slate-100">
        <div>
          <h3 className="text-xl md:text-2xl font-black text-slate-800 italic uppercase tracking-tight flex items-center gap-2">
            <ArrowUpDown className="text-blue-600" size={24} /> Payment Logs
          </h3>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1 italic">World-Class Transaction Sync</p>
        </div>

        <div className="relative group w-full md:w-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search member name..." 
            className="pl-12 pr-6 py-3 md:py-4 w-full md:w-80 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 font-bold text-slate-700 text-sm transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 📊 Transaction Table/List */}
      <div className="bg-white rounded-[24px] md:rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-blue-600" size={40} />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Syncing Global Records...</span>
          </div>
        ) : filteredPayments.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Member</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Method</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-all group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-[10px] font-black shadow-md uppercase group-hover:scale-110 transition-transform">
                            {p.members?.name?.substring(0, 2) || '??'}
                          </div>
                          <span className="font-black text-slate-700 group-hover:text-blue-600 transition-colors uppercase text-sm tracking-tight">{p.members?.name || 'Deleted Member'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center font-black text-slate-900 italic text-lg">
                          <span className="text-emerald-500 mr-1 not-italic font-bold">{currencySymbol}</span>
                          {p.amount.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black border uppercase tracking-widest ${getModeStyle(p.payment_mode)}`}>
                          {p.payment_mode || 'N/A'}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-tighter">
                          <Calendar size={14} className="text-slate-300" />
                          {new Date(p.payment_date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        {/* ✅ Receipt Download Button */}
                        <button 
                          onClick={() => handleDownload(p)}
                          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95"
                        >
                          <Download size={14} /> Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredPayments.map((p) => (
                <div key={p.id} className="p-5 flex flex-col gap-4 active:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-[10px] font-black uppercase shadow-sm">
                        {p.members?.name?.substring(0, 2) || '??'}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-sm tracking-tight uppercase">{p.members?.name || 'Deleted Member'}</p>
                        <p className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black mt-0.5 uppercase tracking-widest">
                          <Calendar size={10} />
                          {new Date(p.payment_date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <div className="flex items-center justify-end font-black text-slate-900 italic text-lg">
                        <span className="text-emerald-500 mr-1 not-italic font-bold">{currencySymbol}</span>
                        {p.amount.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black border uppercase tracking-widest ${getModeStyle(p.payment_mode)}`}>
                          {p.payment_mode || 'N/A'}
                        </span>
                        {/* ✅ Mobile Download Icon */}
                        <button 
                          onClick={() => handleDownload(p)}
                          className="p-2 bg-slate-100 text-slate-900 rounded-lg active:bg-blue-600 active:text-white transition-colors"
                        >
                          <FileText size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="py-24 text-center">
            <div className="flex flex-col items-center opacity-20">
              <Filter size={60} className="mb-4 text-slate-400" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">History Empty</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentHistory;