import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogIn, Lock, Mail, AlertCircle, Building, Phone, UserPlus, Globe } from 'lucide-react';

export default function AuthPage() {
  const [mode, setMode] = useState('login'); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  // 🌍 Global Markets Config
  const [selectedCountry, setSelectedCountry] = useState("IN");
  const markets = [
    { code: "IN", name: "India", lang: "en", currency: "INR", symbol: "₹" },
    { code: "US", name: "USA", lang: "en", currency: "USD", symbol: "$" },
    { code: "AE", name: "Dubai", lang: "ar", currency: "AED", symbol: "د.إ" },
    { code: "SG", name: "Singapore", lang: "en", currency: "SGD", symbol: "S$" },
    { code: "FR", name: "France", lang: "fr", currency: "EUR", symbol: "€" },
    { code: "DE", name: "Germany", lang: "de", currency: "EUR", symbol: "€" },
    { code: "PL", name: "Poland", lang: "pl", currency: "PLN", symbol: "zł" },
    { code: "RU", name: "Russia", lang: "ru", currency: "RUB", symbol: "₽" },
    { code: "CA", name: "Canada", lang: "en", currency: "CAD", symbol: "$" },
  ];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [gymName, setGymName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) navigate('/dashboard', { replace: true });
    };
    checkUser();
  }, [navigate]);

  // ✅ Helper to save global config
  const saveGlobalConfig = () => {
    const market = markets.find(m => m.code === selectedCountry);
    localStorage.setItem("gym_config", JSON.stringify(market));
    localStorage.setItem("gym_country", market.code); // For backward compatibility
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    // Save configuration before proceeding
    saveGlobalConfig();

    if (mode === 'register') {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            gym_name: gymName,
            phone: phone,
            country: selectedCountry // Store country in user metadata
          }
        }
      });
      if (signUpError) setError(signUpError.message);
      else setMessage("Registration successful! Please check your email for verification.");
    } 
    else if (mode === 'login') {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) setError(signInError.message);
      else navigate('/dashboard', { replace: true });
    }
    else if (mode === 'forgot') {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
      if (resetError) setError(resetError.message);
      else setMessage("Password reset link sent to your email!");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden transition-all border border-slate-700/10">
        <div className="p-8">
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="bg-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3 shadow-lg">
              {mode === 'register' ? <UserPlus className="text-white" size={28} /> : <Lock className="text-white" size={28} />}
            </div>
            <h2 className="text-2xl font-black text-slate-800 italic uppercase">
              {mode === 'login' && "Admin Login"}
              {mode === 'register' && "Create Account"}
              {mode === 'forgot' && "Reset Password"}
            </h2>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            
            {/* 🌍 Global Market Selector (New Section) */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
              <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 mb-2">
                <Globe size={12}/> Select Your Market
              </label>
              <select 
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full bg-transparent font-bold text-slate-700 outline-none cursor-pointer text-sm"
              >
                {markets.map(m => (
                  <option key={m.code} value={m.code}>{m.name} ({m.currency})</option>
                ))}
              </select>
            </div>

            {error && <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-xs flex items-center gap-2 border border-rose-100"><AlertCircle size={16}/>{error}</div>}
            {message && <div className="bg-green-50 text-green-600 p-3 rounded-xl text-xs border border-green-100">Check your email!</div>}

            {mode === 'register' && (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Full Name</label>
                  <div className="relative">
                    <LogIn className="absolute left-3 top-3 text-slate-400" size={16} />
                    <input type="text" required className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="John Doe" value={name} onChange={(e)=>setName(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Gym Name</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 text-slate-400" size={16} />
                    <input type="text" required className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Power Gym" value={gymName} onChange={(e)=>setGymName(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 text-slate-400" size={16} />
                    <input type="text" required className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Contact No." value={phone} onChange={(e)=>setPhone(e.target.value)} />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={16} />
                <input type="email" required className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="admin@gym.com" value={email} onChange={(e)=>setEmail(e.target.value)} />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Password</label>
                  {mode === 'login' && <button type="button" onClick={()=>setMode('forgot')} className="text-[10px] font-bold text-blue-600 hover:underline">Forgot Password?</button>}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-slate-400" size={16} />
                  <input type="password" required className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="••••••••" value={password} onChange={(e)=>setPassword(e.target.value)} />
                </div>
              </div>
            )}

            <button disabled={loading} className="w-full bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest text-xs py-4 rounded-xl transition-all mt-4 shadow-lg active:scale-[0.98]">
              {loading ? "Initializing..." : (
                <>
                  {mode === 'login' && `Login to ${selectedCountry} Office`}
                  {mode === 'register' && "Start Global Empire"}
                  {mode === 'forgot' && "Send Reset Link"}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            {mode === 'login' ? (
              <p className="text-sm text-slate-500 font-medium">
                New to the platform? <button onClick={()=>setMode('register')} className="text-blue-600 font-bold">Register Now</button>
              </p>
            ) : (
              <p className="text-sm text-slate-500 font-medium">
                Already registered? <button onClick={()=>setMode('login')} className="text-blue-600 font-bold">Login Here</button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}