import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogIn, Lock, Mail, AlertCircle, Building, Phone, UserPlus, KeyRound } from 'lucide-react';

export default function AuthPage() {
  const [mode, setMode] = useState('login'); // login, register, forgot
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [gymName, setGymName] = useState('');
  const [phone, setPhone] = useState('');

  // ✅ Check if user is already logged in to prevent viewing AuthPage
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/dashboard', { replace: true });
      }
    };
    checkUser();
  }, [navigate]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (mode === 'register') {
      // 1. Register User in Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            gym_name: gymName, // Ye hi username ki tarah treat hoga
            phone: phone
          }
        }
      });
      if (signUpError) setError(signUpError.message);
      else setMessage("Registration successful! Please check your email for verification.");
    } 
    
    else if (mode === 'login') {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) setError(signInError.message);
      else {
        // ✅ Using replace: true to clean history
        navigate('/dashboard', { replace: true });
      }
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
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden transition-all">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3 shadow-lg">
              {mode === 'register' ? <UserPlus className="text-white" size={28} /> : <Lock className="text-white" size={28} />}
            </div>
            <h2 className="text-2xl font-black text-slate-800 italic uppercase">
              {mode === 'login' && "Admin Login"}
              {mode === 'register' && "Create Account"}
              {mode === 'forgot' && "Reset Password"}
            </h2>
            <p className="text-slate-500 text-sm mt-1">Gym Manager Pro</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {error && <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-xs flex items-center gap-2 border border-rose-100"><AlertCircle size={16}/>{error}</div>}
            {message && <div className="bg-green-50 text-green-600 p-3 rounded-xl text-xs flex items-center gap-2 border border-green-100">Check your email!</div>}

            {/* Registration Fields */}
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
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Gym Name (Username)</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 text-slate-400" size={16} />
                    <input type="text" required className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Power Gym" value={gymName} onChange={(e)=>setGymName(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 text-slate-400" size={16} />
                    <input type="text" required className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="9876543210" value={phone} onChange={(e)=>setPhone(e.target.value)} />
                  </div>
                </div>
              </>
            )}

            {/* Common Fields (Email) */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={16} />
                <input type="email" required className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="admin@gym.com" value={email} onChange={(e)=>setEmail(e.target.value)} />
              </div>
            </div>

            {/* Password Field (Login & Register only) */}
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

            <button disabled={loading} className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3 rounded-xl transition-all mt-4 flex justify-center items-center gap-2 shadow-lg">
              {loading ? "Processing..." : (
                <>
                  {mode === 'login' && "Login"}
                  {mode === 'register' && "Register Now"}
                  {mode === 'forgot' && "Send Reset Link"}
                </>
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-3">
            {mode === 'login' ? (
              <p className="text-sm text-slate-500">
                New to Gym Manager? <button onClick={()=>setMode('register')} className="text-blue-600 font-bold hover:underline">Register Now</button>
              </p>
            ) : (
              <p className="text-sm text-slate-500">
                Already have an account? <button onClick={()=>setMode('login')} className="text-blue-600 font-bold hover:underline">Login Here</button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}