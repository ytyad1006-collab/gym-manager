import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom"; 
import { PlusCircle, FileText, Users, ArrowUpRight, Sun, Moon, Sunrise, Sunset, Lightbulb, RefreshCw, Zap, TrendingUp } from "lucide-react"; 
import StatCard from "../components/ui/StatCard";
import RevenueChart from "../components/ui/RevenueChart";
import RecentActivity from "../components/ui/RecentActivity";

function Dashboard() {
  const navigate = useNavigate(); 
  const [gymName, setGymName] = useState("Your Gym"); 
  const [greeting, setGreeting] = useState({ text: "", icon: null }); 
  
  const [stats, setStats] = useState({
    todayCollection: 0, totalPaid: 0, totalDue: 0, totalExpenses: 0,
    totalMembers: 0, expiredMembers: 0, expiry7Days: 0, expiry3Days: 0,
    totalTrainers: 0, thisMonthRevenue: 0, totalRevenue: 0,
  });

  const [monthlyData, setMonthlyData] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    updateGreeting(); 
  }, []);

  const updateGreeting = async () => {
    const hour = new Date().getHours();
    let welcomeText = "";
    let welcomeIcon = null;

    if (hour >= 5 && hour < 12) {
      welcomeText = "Good Morning";
      welcomeIcon = <Sunrise className="text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]" size={28} />;
    } else if (hour >= 12 && hour < 17) {
      welcomeText = "Good Afternoon";
      welcomeIcon = <Sun className="text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" size={28} />;
    } else if (hour >= 17 && hour < 21) {
      welcomeText = "Good Evening";
      welcomeIcon = <Sunset className="text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]" size={28} />;
    } else {
      welcomeText = "Good Night";
      welcomeIcon = <Moon className="text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]" size={28} />;
    }

    const { data: { user } } = await supabase.auth.getUser();
    const name = user?.user_metadata?.gym_name || "Your Gym";
    
    setGymName(name);
    setGreeting({ text: welcomeText, icon: welcomeIcon });
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split("T")[0];
      const currentMonthKey = new Date().toISOString().slice(0, 7); 
      
      const date7 = new Date(); date7.setDate(date7.getDate() + 7);
      const date3 = new Date(); date3.setDate(date3.getDate() + 3);
      const d7Str = date7.toISOString().split("T")[0];
      const d3Str = date3.toISOString().split("T")[0];

      const [
        { data: payments }, 
        { data: members }, 
        { data: expenses }, 
        { data: trainers }
      ] = await Promise.all([
        supabase
          .from("payments")
          .select(`amount, payment_date, members (name)`)
          .order("payment_date", { ascending: false }),
        supabase.from("members").select("due_amount, expiry_date"),
        supabase.from("expenses").select("amount"),
        supabase.from("trainers").select("id")
      ]);

      const totalRevenue = payments?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0;
      const totalExpenses = expenses?.reduce((sum, e) => sum + (Number(e.amount) || 0), 0) || 0;
      
      const thisMonthRevenue = payments
        ?.filter(p => p.payment_date?.startsWith(currentMonthKey))
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0;

      const calculatedDue = members?.reduce((sum, m) => {
        return sum + (parseFloat(m.due_amount) || 0);
      }, 0) || 0;

      setStats({
        todayCollection: payments?.filter(p => p.payment_date === today).reduce((sum, p) => sum + Number(p.amount), 0) || 0,
        totalPaid: totalRevenue, 
        totalRevenue: totalRevenue, 
        thisMonthRevenue: thisMonthRevenue,
        totalDue: Math.round(calculatedDue), 
        totalExpenses,
        totalMembers: members?.length || 0,
        expiredMembers: members?.filter(m => m.expiry_date < today).length || 0,
        expiry7Days: members?.filter(m => m.expiry_date >= today && m.expiry_date <= d7Str).length || 0,
        expiry3Days: members?.filter(m => m.expiry_date >= today && m.expiry_date <= d3Str).length || 0,
        totalTrainers: trainers?.length || 0,
      });

      setRecentPayments(payments?.slice(0, 5) || []);
      
      const last6Months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthLabel = d.toLocaleString('default', { month: 'short' });
        const monthKey = d.toISOString().slice(0, 7); 

        const monthTotal = payments
          ?.filter(p => p.payment_date?.startsWith(monthKey))
          .reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0;

        last6Months.push({ month: monthLabel, revenue: monthTotal });
      }
      setMonthlyData(last6Months);
      
    } catch (err) {
      console.error("Dashboard Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="p-10 flex flex-col items-center justify-center h-[80vh] space-y-6">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
        <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-900 animate-pulse" size={20} />
      </div>
      <div className="text-center">
        <p className="text-slate-900 font-semibold uppercase tracking-[0.3em] text-xs">Syncing Performance</p>
        <p className="text-slate-400 text-[10px] mt-1 font-medium uppercase tracking-widest">Loading Gym Intelligence...</p>
      </div>
    </div>
  );

  const activeCount = stats.totalMembers - stats.expiredMembers;
  const activePercentage = stats.totalMembers > 0 ? Math.round((activeCount / stats.totalMembers) * 100) : 0;

  return (
    <div className="space-y-8 pb-10 animate-page px-2 md:px-0">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-50">
              {greeting.icon}
            </div>
            <h2 className="text-xl md:text-3xl font-bold text-slate-900 tracking-tight italic uppercase">
              {greeting.text}, <span className="text-blue-600">{gymName}</span>
            </h2>
          </div>
          <p className="text-[9px] md:text-xs text-slate-400 font-medium uppercase tracking-widest ml-1">
            System Status: <span className="text-emerald-500 font-semibold">Operational</span> • {new Date().toLocaleDateString('en-GB')}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button 
            onClick={() => navigate("/suggestions")}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-amber-600 py-2.5 px-4 rounded-xl text-[10px] md:text-xs font-semibold uppercase tracking-wider hover:bg-amber-50 transition-all border border-amber-100 shadow-sm"
          >
            <Lightbulb size={14} className="fill-amber-500/20" /> Suggest
          </button>

          <button 
            onClick={() => navigate("/members/add")}
            className="flex-[2] md:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white py-2.5 px-5 rounded-xl text-[10px] md:text-xs font-semibold uppercase tracking-wider hover:bg-blue-600 transition-all shadow-md active:scale-95"
          >
            <PlusCircle size={14} /> Add Member
          </button>
          
          <button 
            onClick={fetchDashboardData} 
            className="bg-white border border-slate-200 text-slate-400 p-2.5 rounded-xl hover:text-slate-900 hover:bg-slate-50 transition shadow-sm group"
          >
            <RefreshCw size={18} className="group-active:rotate-180 transition-transform duration-500" />
          </button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        <StatCard title="Today's Cash" value={`₹${stats.todayCollection}`} color="bg-emerald-500" />
        <StatCard title="This Month" value={`₹${stats.thisMonthRevenue}`} color="bg-blue-600" />
        <StatCard title="Life Revenue" value={`₹${stats.totalRevenue}`} color="bg-slate-900" />
        <StatCard title="Total Dues" value={`₹${stats.totalDue}`} color="bg-rose-600" />
        <StatCard title="Expired Now" value={stats.expiredMembers} color="bg-red-500" />
        <StatCard title="All Members" value={stats.totalMembers} color="bg-indigo-600" />
        <StatCard title="Staff/Trainers" value={stats.totalTrainers} color="bg-purple-600" />
        <StatCard title="Alert (3 Days)" value={stats.expiry3Days} color="bg-orange-500" />
        <StatCard title="Warning (7 Days)" value={stats.expiry7Days} color="bg-amber-500" />
        <StatCard title="All Expenses" value={`₹${stats.totalExpenses}`} color="bg-slate-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* GRAPH SECTION - Desktop pe 3/4 area occupy karega */}
        <div className="lg:col-span-3 space-y-6 w-full min-w-0">
            <div className="bg-white p-4 md:p-6 rounded-[24px] border border-slate-100 shadow-sm relative overflow-hidden flex flex-col h-full">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-emerald-500"></div>
              
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 uppercase tracking-tight italic text-lg md:text-xl">Revenue Analytics</h3>
                    <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">Last 6 Months Trends</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg border border-emerald-100">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest">Live</span>
                </div>
              </div>

              {/* ✅ Fixed Chart Container: Isko height aur width explicit di hai */}
              <div className="w-full flex-1 min-h-[320px] md:min-h-[400px] bg-slate-50/20 rounded-xl p-2 relative">
                <RevenueChart data={monthlyData} />
              </div>
            </div>

            {/* Retention Bar Section */}
            <div className="bg-slate-900 rounded-[24px] p-6 md:p-8 text-white flex flex-col md:flex-row items-center gap-6 md:gap-8 relative overflow-hidden shadow-lg">
               <div className="flex-1 relative z-10 w-full">
                 <div className="flex items-center gap-2 mb-1">
                    <Users size={16} className="text-blue-400" />
                    <h4 className="text-lg md:text-xl font-bold italic uppercase tracking-tight">Member Retention</h4>
                 </div>
                 <p className="text-slate-400 text-xs mb-6 font-medium">
                    <span className="text-white font-semibold">{activeCount}</span> loyal members out of <span className="text-white font-semibold">{stats.totalMembers}</span>.
                 </p>
                 <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden mb-2">
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full rounded-full transition-all duration-1000" style={{ width: `${activePercentage}%` }}></div>
                 </div>
                 <div className="flex justify-between">
                    <p className="text-blue-400 font-bold text-[10px] uppercase tracking-wider">{activePercentage}% Score</p>
                    <p className="text-slate-500 font-medium text-[10px] uppercase">Target: 90%</p>
                 </div>
               </div>
               <button onClick={() => navigate("/reports")} className="w-full md:w-auto bg-white text-slate-900 px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-50 transition-all shrink-0">
                 Details <ArrowUpRight size={14} />
               </button>
            </div>
        </div>

        {/* SIDEBAR - Recent Activity */}
        <div className="lg:col-span-1 w-full">
            <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden min-h-[400px] lg:h-full">
                <RecentActivity payments={recentPayments} onViewAll={() => navigate("/members/payments")} />
            </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;