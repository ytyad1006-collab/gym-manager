import { useState } from "react";
import { User, Building, LogOut, Save, ShieldCheck, Lock } from "lucide-react";

function Settings() {
  const [gymName, setGymName] = useState("My Iron Paradise");
  const [adminEmail, setAdminEmail] = useState("admin@gymmanager.com");

  const handleLogout = () => {
    // Yahan aap Supabase ka logout logic daal sakte hain
    // await supabase.auth.signOut();
    alert("Logging out...");
  };

  return (
    <div className="relative">
      {/* ✅ Coming Soon Overlay Layer */}
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-[4px] bg-white/30 rounded-3xl border border-white/20 shadow-xl overflow-hidden min-h-[500px]">
        <div className="bg-white/90 p-8 rounded-[32px] shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in duration-500">
           <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Lock size={32} />
           </div>
           <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 mb-2">Coming Soon</h2>
           <p className="text-slate-500 font-bold text-xs uppercase tracking-widest leading-relaxed">
             Settings module is under AI optimization.<br/>
             <span className="text-blue-600">Available in next update.</span>
           </p>
        </div>
      </div>

      {/* Existing Code Content (Blured behind overlay) */}
      <div className="max-w-4xl mx-auto space-y-6 opacity-40 pointer-events-none grayscale-[0.5]">
        <h2 className="text-2xl font-bold text-gray-800">Account Settings</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left Side: Sidebar style links */}
          <div className="md:col-span-1 space-y-2">
            <div className="p-4 bg-blue-600 text-white rounded-lg flex items-center gap-3 font-medium">
              <User size={18} /> General Settings
            </div>
            <div className="p-4 bg-white text-gray-600 rounded-lg flex items-center gap-3 hover:bg-gray-50 cursor-pointer transition">
              <ShieldCheck size={18} /> Security & Password
            </div>
          </div>

          {/* Right Side: Forms */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Gym Details */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-6 border-b pb-4">
                <Building className="text-gray-400" size={20} />
                <h3 className="font-bold text-gray-700">Gym Information</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Gym Name</label>
                  <input 
                    type="text" 
                    value={gymName}
                    onChange={(e) => setGymName(e.target.value)}
                    className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2">
                  <Save size={16} /> Save Changes
                </button>
              </div>
            </div>

            {/* Admin Account */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-6 border-b pb-4">
                <User className="text-gray-400" size={20} />
                <h3 className="font-bold text-gray-700">Admin Profile</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    value={adminEmail}
                    disabled
                    className="w-full p-2.5 border rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 p-6 rounded-xl border border-red-100">
              <h3 className="font-bold text-red-700 mb-2">Danger Zone</h3>
              <p className="text-sm text-red-600 mb-4">Mousam badalte hi session expire ho sakta hai ya aap manually logout kar sakte hain.</p>
              <button 
                onClick={handleLogout}
                className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition flex items-center gap-2"
              >
                <LogOut size={16} /> Sign Out from Dashboard
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;