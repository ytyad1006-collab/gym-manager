import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase"; 
import { Search, Download, Loader2, IndianRupee, Calendar, CreditCard, Filter, ArrowUpDown } from "lucide-react";

function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("payments")
        .select(`
          id, amount, payment_date, payment_mode, created_at,
          members!fk_member_final ( name )
        `) 
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

  const getModeStyle = (mode) => {
    switch (mode?.toLowerCase()) {
      case 'online': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cash': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'card': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="p-3 md:p-8 space-y-4 md:space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-[24px] shadow-sm border border-slate-100">
        <div>
          <h3 className="text-xl md:text-2xl font-black text-slate-800 italic uppercase tracking-tight flex items-center gap-2">
            <ArrowUpDown className="text-blue-600" size={24} /> Transaction Logs
          </h3>
          <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1">Real-time payment history</p>
        </div>

        <div className="relative group overflow-hidden rounded-2xl border border-slate-200 focus-within:border-blue-500 transition-all shadow-sm w-full md:w-auto">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Search member name..." 
            className="pl-12 pr-6 py-3 md:py-4 w-full md:w-80 outline-none font-bold text-slate-700 placeholder:text-slate-300 text-sm"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-white rounded-[24px] md:rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-blue-600" size={40} />
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Fetching Logs...</span>
          </div>
        ) : filteredPayments.length > 0 ? (
          <>
            {/* Desktop View: Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Member Profile</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction Value</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Payment Mode</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Log Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-all group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-slate-200 uppercase">
                            {p.members?.name?.substring(0, 2) || '??'}
                          </div>
                          <span className="font-black text-slate-700 group-hover:text-blue-600 transition-colors">{p.members?.name || 'Deleted Member'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-lg">
                        <div className="flex items-center font-black text-slate-900 italic">
                          <IndianRupee size={16} strokeWidth={3} className="text-emerald-500" />
                          {p.amount}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${getModeStyle(p.payment_mode)}`}>
                          {p.payment_mode || 'N/A'}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                          <Calendar size={14} className="text-slate-300" />
                          {new Date(p.payment_date).toLocaleDateString('en-GB', {
                            day: '2-digit', month: 'short', year: 'numeric'
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View: Cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredPayments.map((p) => (
                <div key={p.id} className="p-5 flex flex-col gap-4 active:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[10px] font-black uppercase">
                        {p.members?.name?.substring(0, 2) || '??'}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-sm tracking-tight">{p.members?.name || 'Deleted Member'}</p>
                        <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold mt-0.5">
                          <Calendar size={10} />
                          {new Date(p.payment_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end font-black text-slate-900 italic text-base">
                        <IndianRupee size={14} strokeWidth={3} className="text-emerald-500" />
                        {p.amount}
                      </div>
                      <span className={`mt-1 inline-block px-2 py-0.5 rounded-md text-[8px] font-black border uppercase tracking-tighter ${getModeStyle(p.payment_mode)}`}>
                        {p.payment_mode || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="py-20 text-center">
            <div className="flex flex-col items-center opacity-30">
              <Filter size={48} className="mb-4" />
              <p className="text-sm font-black uppercase tracking-widest text-slate-500">No transactions found</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentHistory;