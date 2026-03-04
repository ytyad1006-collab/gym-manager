import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, Mail, Phone, Building, Lock, Save, Loader2, KeyRound, AlertCircle, CheckCircle2, Camera, Trash2, ShieldCheck, Sparkles } from 'lucide-react';

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gymName: "",
    avatarUrl: "" 
  });

  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    getProfile();
  }, []);

  async function getProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setFormData({
          name: user.user_metadata?.full_name || "",
          email: user.email || "",
          phone: user.user_metadata?.phone || "",
          gymName: user.user_metadata?.gym_name || "",
          avatarUrl: user.user_metadata?.avatar_url || ""
        });
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleImageUpload = async (e) => {
    try {
      setUpdating(true);
      const file = e.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      let { error: uploadError } = await supabase.storage
        .from('gym_assets') 
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('gym_assets').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) throw updateError;

      setFormData({ ...formData, avatarUrl: publicUrl });
      setMessage({ type: 'success', text: 'Profile picture updated!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Storage Error: Ensure "gym_assets" bucket exists.' });
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveImage = async () => {
    try {
      setUpdating(true);
      const { error } = await supabase.auth.updateUser({
        data: { avatar_url: null }
      });

      if (error) throw error;

      setFormData({ ...formData, avatarUrl: "" });
      setMessage({ type: 'success', text: 'Profile picture removed!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage({ type: '', text: '' });

    const { error } = await supabase.auth.updateUser({
      data: { 
        full_name: formData.name,
        phone: formData.phone,
        gym_name: formData.gymName
      }
    });

    if (error) setMessage({ type: 'error', text: error.message });
    else setMessage({ type: 'success', text: 'Profile updated successfully!' });
    
    setUpdating(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return setMessage({ type: 'error', text: 'Passwords do not match!' });
    }

    setUpdating(true);
    const { error } = await supabase.auth.updateUser({
      password: passwords.newPassword
    });

    if (error) setMessage({ type: 'error', text: error.message });
    else {
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswords({ newPassword: "", confirmPassword: "" });
    }
    setUpdating(false);
  };

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center flex-col gap-4">
       <Loader2 className="animate-spin text-slate-900" size={40} />
       <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading Vault...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-10 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* Header with Notification */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-3xl font-black text-slate-800 uppercase italic tracking-tight">Admin Console</h2>
           <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
             <ShieldCheck size={12} className="text-emerald-500" /> Security & Personal Preferences
           </p>
        </div>
        
        {message.text && (
          <div className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest animate-in slide-in-from-top-2 duration-300 shadow-sm border ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
          }`}>
            {message.type === 'success' ? <CheckCircle2 size={16}/> : <AlertCircle size={16}/>}
            {message.text}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Avatar Upload Section */}
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:rotate-12 transition-transform duration-700">
               <Sparkles size={120} />
            </div>
            
            <div className="relative">
              <div className="w-32 h-32 rounded-[40px] overflow-hidden bg-slate-50 border-4 border-white shadow-2xl flex items-center justify-center transition-all group-hover:scale-105 duration-500">
                {formData.avatarUrl ? (
                  <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white">
                    <span className="text-3xl font-black italic">{formData.name?.charAt(0) || 'G'}</span>
                  </div>
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 bg-blue-600 p-3 rounded-2xl text-white cursor-pointer hover:bg-black transition-all shadow-xl active:scale-90 border-4 border-white">
                <Camera size={18} />
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={updating} />
              </label>
            </div>

            <div className="space-y-2 text-center md:text-left z-10">
              <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest italic">Management Identity</h3>
              <p className="text-[10px] text-slate-400 font-bold max-w-[240px] leading-relaxed">
                UPLOAD HIGH-RESOLUTION JPG/PNG. IMAGE WILL BE SYNCED ACROSS ALL ACCESS POINTS.
              </p>
              {formData.avatarUrl && (
                <button onClick={handleRemoveImage} className="text-[10px] text-rose-500 font-black flex items-center gap-1 hover:text-rose-700 transition-all uppercase tracking-widest mt-2 mx-auto md:mx-0">
                  <Trash2 size={12} /> Purge Photo
                </button>
              )}
            </div>
          </div>

          {/* Form Details */}
          <form onSubmit={handleUpdateProfile} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
              <div className="w-1 h-6 bg-blue-600 rounded-full" />
              <h3 className="font-black text-slate-800 uppercase text-xs tracking-[0.2em]">Operational Credentials</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Legal Admin Name</label>
                <input type="text" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-500 font-bold text-slate-700 transition-all" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Organization / Gym Name</label>
                <input type="text" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-500 font-bold text-slate-700 transition-all uppercase" value={formData.gymName} onChange={(e) => setFormData({...formData, gymName: e.target.value})} />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">System Identifier (Read Only)</label>
                <div className="relative">
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input type="email" disabled className="w-full p-4 bg-slate-100 border border-slate-100 rounded-2xl text-sm font-bold text-slate-400 cursor-not-allowed" value={formData.email} />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Reference</label>
                <input type="text" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-500 font-bold text-slate-700 transition-all" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              </div>
            </div>
            
            <button type="submit" disabled={updating} className="flex items-center gap-2 bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50">
              {updating ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>}
              Commit Updates
            </button>
          </form>
        </div>

        {/* Security Column */}
        <div className="space-y-8">
          <form onSubmit={handleChangePassword} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
            <div className="flex items-center gap-3">
              <KeyRound className="text-blue-600" size={20} />
              <h3 className="font-black text-slate-800 uppercase text-xs tracking-[0.2em]">Access Protocol</h3>
            </div>
            <div className="space-y-5">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Secure Key</label>
                <input type="password" required placeholder="••••••••" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-500 font-bold transition-all" value={passwords.newPassword} onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})} />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Re-verify Key</label>
                <input type="password" required placeholder="••••••••" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-500 font-bold transition-all" value={passwords.confirmPassword} onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})} />
              </div>
            </div>
            <button type="submit" disabled={updating} className="w-full bg-blue-600 text-white px-6 py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-black transition-all shadow-lg shadow-blue-100 active:scale-95">
              Update Authentication
            </button>
          </form>

          <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100">
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Security Note</p>
             <p className="text-[10px] text-slate-500 font-medium leading-relaxed uppercase">
                Changing your password will re-authenticate all active sessions. Ensure your new key is at least 8 characters.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}