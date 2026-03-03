import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom"; 
// ✅ AuthContext import kiya user data access karne ke liye
import { useAuth } from "../context/AuthContext"; 
import { PlusCircle, FileText, Users, ArrowUpRight, Sun, Moon, Sunrise, Sunset, Lightbulb, RefreshCw, Zap, TrendingUp, IndianRupee, Sparkles, Globe } from "lucide-react"; 
import StatCard from "../components/ui/StatCard";
import RevenueChart from "../components/ui/RevenueChart";
import RecentActivity from "../components/ui/RecentActivity";

function Dashboard({ currentLang = 'en', setLang }) {
  const navigate = useNavigate(); 
  // ✅ Context se user nikal liya
  const { user } = useAuth(); 
  const [gymName, setGymName] = useState("Your Gym"); 
  const [greeting, setGreeting] = useState({ text: "", icon: null }); 

  const t = {
    en: { welcome: "Dashboard", health: "AI Gym Health Score", add: "Add Member", suggest: "Suggest", status: "Operational", analysis: "AI Analysis: Revenue is predicted to grow.", retention: "Member Retention" },
    hi: { welcome: "डैशबोर्ड", health: "AI जिम हेल्थ स्कोर", add: "सदस्य जोड़ें", suggest: "सुझाव", status: "सक्रिय", analysis: "AI विश्लेषण: अगले महीने आय बढ़ने की उम्मीद है।", retention: "सदस्य प्रतिधारण" },
    mr: { welcome: "डॅशबोर्ड", health: "AI जिम हेल्थ स्कोअर", add: "सदस्य जोडा", suggest: "सुझाव", status: "कार्यरत", analysis: "AI विश्लेषण: पुढच्या महिन्यात महसूल वाढण्याची शक्यता आहे.", retention: "सदस्य टिकवून ठेवणे" },
    pa: { welcome: "ਡੈਸ਼ਬੋਰਡ", health: "AI ਜਿਮ ਹੈਲਥ ਸਕੋਰ", add: "ਮੈਂਬਰ ਜੋੜੋ", suggest: "ਸੁਝਾਅ", status: "ਚਾਲੂ", analysis: "AI ਵਿਸ਼ਲੇਸ਼ਣ: ਅਗਲੇ ਮਹੀਨੇ ਆਮਦਨ ਵਧਣ ਦੀ ਉਮੀਦ ਹੈ।", retention: "ਮੈਂਬਰ ਧਾਰਨ" },
    fr: { welcome: "Tableau de bord", health: "Score de santé IA", add: "Ajouter", suggest: "Suggérer", status: "Opérationnel", analysis: "Analyse IA : Le revenu devrait augmenter.", retention: "Rétention des membres" }
  };

  const currentT = t[currentLang] || t['en'];

  const [stats, setStats] = useState({
    todayCollection: 0, totalPaid: 0, totalDue: 0, totalExpenses: 0,
    totalMembers: 0, expiredMembers: 0, expiry7Days: 0, expiry3Days: 0,
    totalTrainers: 0, thisMonthRevenue: 0, totalRevenue: 0,
    // New fields for AI Logic
    aiScore: 88,
    dynamicAnalysis: ""
  });

  const [monthlyData, setMonthlyData] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ User session check karke gym name set karna
    if (user) {
      const name = user.user_metadata?.gym_name || "Your Gym";
      setGymName(name);
    }
    fetchDashboardData();
    updateGreeting(); 
  }, [currentLang, user]); // User change hone par bhi update hoga

  const updateGreeting = () => {
    const hour = new Date().getHours();
    let welcomeText = "";
    let welcomeIcon = null;

    if (hour >= 5 && hour < 12) {
      welcomeText = currentLang === 'hi' ? "शुभ प्रभात" : "Good Morning";
      welcomeIcon = <Sunrise className="text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]" size={24} />;
    } else if (hour >= 12 && hour < 17) {
      welcomeText = currentLang === 'hi' ? "नमस्कार" : "Good Afternoon";
      welcomeIcon = <Sun className="text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" size={24} />;
    } else if (hour >= 17 && hour < 21) {
      welcomeText = currentLang === 'hi' ? "शुभ संध्या" : "Good Evening";
      welcomeIcon = <Sunset className="text-orange-500 drop-shadow-[0_0_8_rgba(249,115,22,0.5)]" size={24} />;
    } else {
      welcomeText = currentLang === 'hi' ? "शुभ रात्रि" : "Good Night";
      welcomeIcon = <Moon className="text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]" size={24} />;
    }

    setGreeting({ text: welcomeText, icon: welcomeIcon });
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      if (!user) return;

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
          .eq('user_id', user.id)
          .order("payment_date", { ascending: false }),
        supabase
          .from("members")
          .select("due_amount, expiry_date")
          .eq('user_id', user.id),
        supabase
          .from("expenses")
          .select("amount")
          .eq('user_id', user.id),
        supabase
          .from("trainers")
          .select("id")
          .eq('user_id', user.id)
      ]);

      const totalRevenue = payments?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0;
      const totalExpenses = expenses?.reduce((sum, e) => sum + (Number(e.amount) || 0), 0) || 0;
      
      const thisMonthRevenue = payments
        ?.filter(p => p.payment_date?.startsWith(currentMonthKey))
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0;

      const calculatedDue = members?.reduce((sum, m) => {
        return sum + (parseFloat(m.due_amount) || 0);
      }, 0) || 0;

      // ✅ AI Score Logic (Based on active member ratio)
      const expiredCount = members?.filter(m => m.expiry_date < today).length || 0;
      const activeCount = (members?.length || 0) - expiredCount;
      const healthScore = members?.length > 0 ? Math.round((activeCount / members.length) * 100) : 0;

      // ✅ AI Analysis Text Logic
      let aiText = currentT.analysis;
      if (thisMonthRevenue < totalExpenses) {
        aiText = currentLang === 'hi' ? "AI विश्लेषण: खर्च बढ़ रहे हैं, मेम्बरशिप रिन्यूअल पर ध्यान दें।" : "AI Analysis: Expenses exceed revenue, focus on renewals.";
      }

      setStats({
        todayCollection: payments?.filter(p => p.payment_date === today).reduce((sum, p) => sum + Number(p.amount), 0) || 0,
        totalPaid: totalRevenue, 
        totalRevenue: totalRevenue, 
        thisMonthRevenue: thisMonthRevenue,
        totalDue: Math.round(calculatedDue), 
        totalExpenses,
        totalMembers: members?.length || 0,
        expiredMembers: expiredCount,
        expiry7Days: members?.filter(m => m.expiry_date >= today && m.expiry_date <= d7Str).length || 0,
        expiry3Days: members?.filter(m => m.expiry_date >= today && m.expiry_date <= d3Str).length || 0,
        totalTrainers: trainers?.length || 0,
        aiScore: healthScore || 88,
        dynamicAnalysis: aiText
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
    <div className="p-10 flex flex-col items-center justify-center h-[80vh] space-y-6 text-center">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
        <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600 animate-pulse" size={20} />
      </div>
      <p className="font-black uppercase tracking-widest text-xs">AI Gym Intelligence Syncing...</p>
    </div>
  );

  const activeCount = stats.totalMembers - stats.expiredMembers;
  const activePercentage = stats.totalMembers > 0 ? Math.round((activeCount / stats.totalMembers) * 100) : 0;

  return (
    <div className="space-y-6 md:space-y-8 pb-10 animate-page px-2 md:px-0 max-w-7xl mx-auto">
      
      {/* AI Health Score Card */}
      <div className="bg-gradient-to-br from-indigo-600 via-blue-700 to-purple-800 p-6 rounded-[32px] text-white shadow-2xl relative overflow-hidden group border border-white/10">
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <Sparkles className="text-yellow-300 animate-pulse" size={32} />
            </div>
            <div>
              <p className="text-indigo-100 text-xs font-black uppercase tracking-[0.2em] mb-1">{currentT.health}</p>
              <div className="flex items-end gap-2">
                <h2 className="text-5xl font-black italic">{stats.aiScore}<span className="text-xl opacity-50">/100</span></h2>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold mb-2 uppercase tracking-tighter ${stats.aiScore > 70 ? 'bg-emerald-500' : 'bg-orange-500'}`}>
                  {stats.aiScore > 70 ? 'Perfect' : 'Action Needed'}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-black/20 backdrop-blur-sm p-4 rounded-2xl border border-white/5 max-w-sm">
             <p className="text-[11px] leading-relaxed font-medium text-indigo-50">✨ <span className="font-bold">AI INSIGHT:</span> {stats.dynamicAnalysis || currentT.analysis}</p>
          </div>
        </div>
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-100 pb-6">
        <div className="w-full md:w-auto">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-50 shrink-0">
              {greeting.icon}
            </div>
            <h2 className="text-lg md:text-3xl font-black text-slate-900 tracking-tight italic uppercase leading-tight">
              {greeting.text}, <span className="text-blue-600 block md:inline">{gymName}</span>
            </h2>
          </div>
          <p className="text-[9px] md:text-xs text-slate-400 font-black uppercase tracking-widest ml-1 opacity-70">
            {currentT.status}: <span className="text-emerald-500 font-bold">Operational</span> • {new Date().toLocaleDateString('en-GB')}
          </p>
        </div>
        
        <div className="flex flex-row gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0 items-center">
          
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm shrink-0">
            <Globe size={14} className="text-slate-400" />
            <select 
              value={currentLang} 
              onChange={(e) => setLang(e.target.value)}
              className="bg-transparent text-[10px] font-black uppercase outline-none cursor-pointer text-slate-700"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="mr">मराठी</option>
              <option value="pa">ਪੰਜਾਬੀ</option>
              <option value="fr">French</option>
            </select>
          </div>

          <button 
            onClick={() => navigate("/suggestions")}
            className="flex-shrink-0 flex items-center justify-center gap-2 bg-white text-amber-600 py-2.5 px-4 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-wider hover:bg-amber-50 transition-all border border-amber-100 shadow-sm"
          >
            <Lightbulb size={14} className="fill-amber-500/20" /> {currentT.suggest}
          </button>

          <button 
            onClick={() => navigate("/members/add")}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white py-2.5 px-6 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-md active:scale-95"
          >
            <PlusCircle size={14} /> {currentT.add}
          </button>
          
          <button 
            onClick={fetchDashboardData} 
            className="bg-white border border-slate-200 text-slate-400 p-2.5 rounded-xl hover:text-slate-900 hover:bg-slate-50 transition shadow-sm group shrink-0"
          >
            <RefreshCw size={18} className="group-active:rotate-180 transition-transform duration-500" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        <StatCard title="Today's Cash" value={`₹${stats.todayCollection.toLocaleString()}`} color="bg-emerald-500" />
        <StatCard title="This Month" value={`₹${stats.thisMonthRevenue.toLocaleString()}`} color="bg-blue-600" />
        <StatCard title="Life Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} color="bg-slate-900" />
        <StatCard title="Total Dues" value={`₹${stats.totalDue.toLocaleString()}`} color="bg-rose-600" />
        <StatCard title="Expired Now" value={stats.expiredMembers} color="bg-red-500" />
        <StatCard title="All Members" value={stats.totalMembers} color="bg-indigo-600" />
        <StatCard title="Staff/Trainers" value={stats.totalTrainers} color="bg-purple-600" />
        <StatCard title="Alert (3 Days)" value={stats.expiry3Days} color="bg-orange-500" />
        <StatCard title="Warning (7 Days)" value={stats.expiry7Days} color="bg-amber-500" />
        <StatCard title="All Expenses" value={`₹${stats.totalExpenses.toLocaleString()}`} color="bg-slate-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <div className="lg:col-span-3 space-y-6 w-full min-w-0">
            <div className="bg-white p-4 md:p-6 rounded-[24px] border border-slate-100 shadow-sm relative overflow-hidden flex flex-col">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-emerald-500"></div>
              
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 uppercase tracking-tight italic text-base md:text-xl">Revenue Analytics</h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Trend Matrix</p>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg border border-emerald-100">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest">Live</span>
                </div>
              </div>

              <div className="w-full flex-1 min-h-[250px] md:min-h-[400px] bg-slate-50/20 rounded-xl p-1 md:p-2 relative">
                <RevenueChart data={monthlyData} />
              </div>
            </div>

            <div className="bg-slate-900 rounded-[24px] p-6 md:p-8 text-white flex flex-col md:flex-row items-center gap-6 md:gap-8 relative overflow-hidden shadow-lg border border-slate-800">
                <div className="flex-1 relative z-10 w-full">
                  <div className="flex items-center gap-2 mb-1">
                     <Users size={16} className="text-blue-400" />
                     <h4 className="text-lg md:text-xl font-black italic uppercase tracking-tight">{currentT.retention}</h4>
                  </div>
                  <p className="text-slate-400 text-[10px] md:text-xs mb-6 font-bold uppercase tracking-wide">
                    <span className="text-white font-black">{activeCount}</span> Active out of <span className="text-white font-black">{stats.totalMembers}</span>.
                  </p>
                  <div className="w-full bg-slate-800 h-2.5 md:h-3 rounded-full overflow-hidden mb-2">
                     <div className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(37,99,235,0.4)]" style={{ width: `${activePercentage}%` }}></div>
                  </div>
                  <div className="flex justify-between">
                     <p className="text-blue-400 font-black text-[9px] md:text-[10px] uppercase tracking-wider">{activePercentage}% Score</p>
                     <p className="text-slate-500 font-bold text-[9px] md:text-[10px] uppercase">Target: 90%</p>
                  </div>
                </div>
                <button onClick={() => navigate("/reports")} className="w-full md:w-auto bg-white text-slate-900 px-6 py-3.5 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all shrink-0 shadow-xl active:scale-95">
                  Get Report <ArrowUpRight size={14} />
                </button>
            </div>
        </div>

        <div className="lg:col-span-1 w-full mt-6 lg:mt-0">
            <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden min-h-[350px] lg:h-full">
                <RecentActivity payments={recentPayments} onViewAll={() => navigate("/members/payments")} />
            </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;