import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, Mail, Phone, Building, Lock, Save, Loader2, KeyRound, AlertCircle, CheckCircle2, Camera, Trash2 } from 'lucide-react';

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gymName: "",
    avatarUrl: "" // Image ke liye
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

  // --- Image Upload Logic ---
  const handleImageUpload = async (e) => {
    try {
      setUpdating(true);
      const file = e.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // 1. Supabase Storage mein upload karein
      let { error: uploadError } = await supabase.storage
        .from('gym_assets') // Make sure aapne ye bucket banaya hai Supabase mein
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Public URL lein
      const { data } = supabase.storage.from('gym_assets').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      // 3. User Metadata update karein
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) throw updateError;

      setFormData({ ...formData, avatarUrl: publicUrl });
      setMessage({ type: 'success', text: 'Profile picture updated!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setUpdating(false);
    }
  };

  // --- Image Remove Logic ---
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
    <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Account Settings</h2>
        {message.text && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {message.type === 'success' ? <CheckCircle2 size={16}/> : <AlertCircle size={16}/>}
            {message.text}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Avatar Upload Section */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-lg">
                {formData.avatarUrl ? (
                  <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <User size={64} />
                  </div>
                )}
              </div>
              <label className="absolute bottom-1 right-1 bg-blue-600 p-2 rounded-full text-white cursor-pointer hover:bg-blue-700 transition-all shadow-md">
                <Camera size={18} />
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={updating} />
              </label>
            </div>
            <div className="space-y-2 text-center md:text-left">
              <h3 className="font-bold text-slate-700">Profile Picture</h3>
              <p className="text-xs text-slate-400 max-w-[200px]">PNG, JPG up to 2MB. This image will be visible on your dashboard.</p>
              {formData.avatarUrl && (
                <button onClick={handleRemoveImage} className="text-xs text-red-500 font-bold flex items-center gap-1 hover:underline mt-2 mx-auto md:mx-0">
                  <Trash2 size={14} /> Remove Photo
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <User className="text-blue-600" size={20} />
              <h3 className="font-bold text-slate-700">Personal & Gym Details</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Full Name</label>
                <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Gym Name</label>
                <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" value={formData.gymName} onChange={(e) => setFormData({...formData, gymName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Email (Read Only)</label>
                <input type="email" disabled className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed" value={formData.email} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Phone Number</label>
                <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              </div>
            </div>
            <button type="submit" disabled={updating} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-black transition-all">
              {updating ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>}
              Save Changes
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <form onSubmit={handleChangePassword} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <KeyRound className="text-blue-600" size={20} />
              <h3 className="font-bold text-slate-700">Security</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">New Password</label>
                <input type="password" required placeholder="••••••••" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" value={passwords.newPassword} onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Confirm Password</label>
                <input type="password" required placeholder="••••••••" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" value={passwords.confirmPassword} onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})} />
              </div>
            </div>
            <button type="submit" disabled={updating} className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}