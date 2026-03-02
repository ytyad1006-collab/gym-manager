import React from 'react';
import { History, User } from 'lucide-react';

// Props mein onViewAll add kiya hai button activate karne ke liye
const RecentActivity = ({ payments = [], onViewAll }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <History size={18} className="text-blue-600" />
          Recent Payments
        </h3>
      </div>

      <div className="divide-y divide-slate-50">
        {payments.length > 0 ? (
          payments.map((p) => (
            <div key={p.id} className="p-4 hover:bg-slate-50 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                    <User size={16} />
                  </div>
                  <div>
                    {/* YAHAN MEMBER KA NAAM DIKHEGA */}
                    <p className="text-sm font-bold text-slate-700">
                      {p.members?.name || "Unknown Member"}
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase font-medium">
                      {p.payment_date} • {p.payment_mode || 'Cash'}
                    </p>
                  </div>
                </div>
                <div className="text-sm font-black text-emerald-600">
                  +₹{p.amount}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-10 text-center text-slate-400 text-sm italic">
            No recent payments found.
          </div>
        )}
      </div>

      <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
        {/* Button par onClick event add kar diya gaya hai */}
        <button 
          onClick={onViewAll} 
          className="text-xs font-bold text-blue-600 hover:text-blue-700 w-full"
        >
          View All Transactions
        </button>
      </div>
    </div>
  );
};

export default RecentActivity;