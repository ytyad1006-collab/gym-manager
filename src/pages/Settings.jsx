import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { User, Building, LogOut, Save, ShieldCheck, Lock, Mail, Bell, Globe, Eye, EyeOff, CalendarDays, Layers, Info } from "lucide-react";

function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  
  const [gymName, setGymName] = useState("My Iron Paradise");
  const [adminEmail, setAdminEmail] = useState("");

  const [country, setCountry] = useState("IN");

  // ✅ GLOBAL PLAN: Added New Regional Preferences
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [weekStart, setWeekStart] = useState("Monday");

  // 🌍 Global Expansion Countries List
  const countries = [
    { code: "IN", name: "India", currency: "INR", symbol: "₹" },
    { code: "US", name: "United States", currency: "USD", symbol: "$" },
    { code: "CA", name: "Canada", currency: "CAD", symbol: "$" },
    { code: "AE", name: "Dubai (UAE)", currency: "AED", symbol: "د.إ" },
    { code: "SG", name: "Singapore", currency: "SGD", symbol: "S$" },
    { code: "FR", name: "France", currency: "EUR", symbol: "€" },
    { code: "DE", name: "Germany", currency: "EUR", symbol: "€" },
    { code: "PL", name: "Poland", currency: "PLN", symbol: "zł" },
    { code: "RU", name: "Russia", currency: "RUB", symbol: "₽" },
    { code: "GB", name: "United Kingdom", currency: "GBP", symbol: "£" },
    { code: "EU", name: "Europe (General)", currency: "EUR", symbol: "€" },
  ];

  const [showPassword, setShowPassword] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });

  useEffect(() => {
    const fetchSettings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setAdminEmail(user.email);
        // Supabase metadata se preferences load karein agar exist karti hain
        if (user.user_metadata?.preferences) {
          setDateFormat(user.user_metadata.preferences.dateFormat || "DD/MM/YYYY");
          setWeekStart(user.user_metadata.preferences.weekStart || "Monday");
        }
      }
      
      const savedCountry = localStorage.getItem("gym_country");
      const savedGym = localStorage.getItem("gym_name");
      if (savedCountry) setCountry(savedCountry);
      if (savedGym) setGymName(savedGym);
    };
    fetchSettings();
  }, []);

  const handleSaveAll = async () => {
    setLoading(true);
    try {
      localStorage.setItem("gym_country", country);
      localStorage.setItem("gym_name", gymName);
      
      // ✅ GLOBAL PLAN: Save additional preferences to Supabase Metadata
      const selectedCountryData = countries.find(c => c.code === country);
      const { error: metaError } = await supabase.auth.updateUser({
        data: { 
          preferences: {
            dateFormat,
            weekStart,
            currency: selectedCountryData?.currency,
            countryCode: country
          }
        }
      });

      if (metaError) throw metaError;

      if (passwords.new && passwords.new === passwords.confirm) {
        const { error } = await supabase.auth.updateUser({ password: passwords.new });
        if (error) throw error;
      }

      alert("Global Sync Complete: Settings updated for " + selectedCountryData?.name);
      if (activeTab === "regional") window.location.reload(); 
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm("Confirm Sign Out?")) {
      await supabase.auth.signOut();
      window.location.href = "/";
    }
  };

  return (
    <div className="p-3 md:p-8 animate-page max-w-6xl mx-auto">
      
      {/* 🚀 Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 flex items-center gap-3">
          <Lock className="text-blue-600" size={28} /> System Control
        </h2>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-1">
          Authorized Personnel Only • Global Activation Ready
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* 🛠 Left Navigation (Sidebar) */}
        <div className="lg:col-span-1 space-y-3">
          <button 
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'profile' ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'}`}
          >
            <User size={18} /> Profile
          </button>
          <button 
            onClick={() => setActiveTab("regional")}
            className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'regional' ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'}`}
          >
            <Globe size={18} /> Regional
          </button>
          <button 
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'security' ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'}`}
          >
            <ShieldCheck size={18} /> Security
          </button>
          
          <hr className="my-4 border-slate-100" />
          
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-4 bg-rose-50 text-rose-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-rose-100 transition-all">
            <LogOut size={18} /> Sign Out
          </button>
        </div>

        {/* 📝 Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* TAB 1: Profile Details */}
          {activeTab === "profile" && (
            <div className="card-base animate-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-3 mb-8 border-b border-slate-50 pb-5">
                <Building className="text-blue-600" size={20} />
                <h3 className="font-black text-slate-800 uppercase text-sm">Gym Branding</h3>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Gym Name</label>
                  <input type="text" value={gymName} onChange={(e) => setGymName(e.target.value)} className="input-base" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Admin Email</label>
                  <input type="email" value={adminEmail} disabled className="input-base bg-slate-50 text-slate-400 italic cursor-not-allowed" />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Regional Settings (Enhanced with localization) */}
          {activeTab === "regional" && (
            <div className="card-base animate-in slide-in-from-bottom-2 duration-300 space-y-8">
              <div className="flex items-center gap-3 mb-2 border-b border-slate-50 pb-5">
                <Globe className="text-emerald-600" size={20} />
                <h3 className="font-black text-slate-800 uppercase text-sm">Global Localization</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Target Market</label>
                  <select value={country} onChange={(e) => setCountry(e.target.value)} className="input-base appearance-none cursor-pointer">
                    {countries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Currency Symbol</label>
                  <div className="input-base bg-slate-50 flex items-center justify-between opacity-80">
                    <span className="font-bold text-slate-800">{countries.find(c => c.code === country)?.currency}</span>
                    <span className="text-xl text-blue-600 font-black">{countries.find(c => c.code === country)?.symbol}</span>
                  </div>
                </div>
              </div>

              {/* ✅ NEW: Global Preferences Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <CalendarDays size={12} className="text-blue-500" /> Date Format
                  </label>
                  <select 
                    value={dateFormat} 
                    onChange={(e) => setDateFormat(e.target.value)} 
                    className="input-base cursor-pointer"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY (Asia/Europe)</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY (US Standard)</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (Scientific)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Layers size={12} className="text-purple-500" /> Week Start
                  </label>
                  <select 
                    value={weekStart} 
                    onChange={(e) => setWeekStart(e.target.value)} 
                    className="input-base cursor-pointer"
                  >
                    <option value="Monday">Monday</option>
                    <option value="Sunday">Sunday (US/Middle East)</option>
                  </select>
                </div>
              </div>

              <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex items-start gap-3">
                <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
                <p className="text-[9px] font-bold text-blue-700 uppercase leading-relaxed tracking-wider">
                  Changing regional settings will automatically reformat all financial charts, payment receipts, and member logs globally.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: Security Settings */}
          {activeTab === "security" && (
            <div className="card-base animate-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-3 mb-8 border-b border-slate-50 pb-5">
                <ShieldCheck className="text-rose-600" size={20} />
                <h3 className="font-black text-slate-800 uppercase text-sm">Access Control</h3>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">New Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••"
                      className="input-base" 
                      onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                    />
                    <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Confirm Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="input-base" 
                    onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 💾 Persistent Action Bar */}
          <div className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-[24px] shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Status: {loading ? "Syncing..." : "All Systems Nominal"}
              </p>
              <button 
                onClick={handleSaveAll}
                disabled={loading}
                className="btn-primary flex items-center gap-2"
              >
                {loading ? "Processing..." : <><Save size={16} /> Update Global Settings</>}
              </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Settings;