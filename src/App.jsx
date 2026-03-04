import React, { useState, useEffect } from "react"; 
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// ✅ AuthProvider Import kiya hai
import { AuthProvider, useAuth } from "./context/AuthContext.jsx"; 
import ProtectedRoute from "./components/ProtectedRoute.jsx"; 

import LandingPage from "./pages/LandingPage.jsx"; 
import Dashboard from "./pages/Dashboard.jsx";
import Member from "./pages/members-page/Member.jsx";
import AddMember from "./member/AddMember.jsx"; 
import PaymentHistory from "./member/PaymentHistorySection.jsx";
import MembersList from "./member/MembersList.jsx";

import Reports from "./pages/Reports.jsx";
import Settings from "./pages/Settings.jsx";
import Expenses from "./pages/Expenses.jsx"; 
import Attendance from "./pages/Attendance.jsx"; 
import Support from "./pages/Support.jsx"; 
import Profile from "./pages/Profile.jsx"; 
import Login from "./pages/Login.jsx"; 
import FeatureRequest from "./pages/FeatureRequest.jsx"; 

import SetupLayout from "./pages/setup/SetupLayout.jsx";
import MembershipPlans from "./pages/setup/MembershipPlans.jsx";
import Trainers from "./pages/setup/Trainers.jsx";

import LegalPages from "./pages/LegalPages.jsx"; 
import AIChatbot from "./components/AIChatbot.jsx"; 

// --- ✅ GLOBAL PLAN CHANGES BELOW ---

/**
 * 🌍 PreferenceSync: 
 * Login ke turant baad Supabase metadata se settings fetch karke 
 * localStorage mein dalta hai taaki utils.js auto-update ho jaye.
 */
const PreferenceSync = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (user?.user_metadata?.preferences) {
      const { countryCode, dateFormat, weekStart } = user.user_metadata.preferences;
      
      const currentCountry = localStorage.getItem("gym_country");
      
      // Agar settings change huyi hain, toh update karo aur refresh karo
      if (countryCode && currentCountry !== countryCode) {
        localStorage.setItem("gym_country", countryCode);
        localStorage.setItem("date_format", dateFormat || "DD/MM/YYYY");
        localStorage.setItem("week_start", weekStart || "Monday");
        
        // Refresh taaki poora UI naye currency/format mein load ho
        window.location.reload();
      }
    }
  }, [user]);

  return null;
};

// 1. Error Boundary: Agar internet slow ho ya fetch fail ho, toh app crash nahi hoga.
class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  componentDidCatch(error, errorInfo) { console.error("Critical Error:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
          <div className="max-w-md bg-white p-10 rounded-[40px] shadow-2xl border border-slate-100">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
            </div>
            <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Connection Error</h2>
            <p className="text-slate-500 font-medium text-sm mt-3 leading-relaxed">Your data is safe, but we encountered a technical glitch. Please refresh the page.</p>
            <button onClick={() => window.location.reload()} className="mt-8 w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-200">Reload App</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// 2. Localization Manager: SEO aur Global accessibility ke liye.
const GlobalLocaleManager = ({ lang }) => {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return null;
};

function App() {
  const [currentLang, setCurrentLang] = useState('en');

  return (
    // ✅ GLOBAL: Pura app ErrorBoundary ke andar hai taaki stability rahe.
    <GlobalErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          {/* ✅ PreferenceSync adds auto-localization on login */}
          <PreferenceSync />
          <GlobalLocaleManager lang={currentLang} />
          <AIChatbot currentLang={currentLang} />
          
          <Routes>
            {/* --- Public Routes --- */}
            <Route path="/" element={<LandingPage />} /> 
            <Route path="/login" element={<Login />} />
            
            <Route path="/privacy" element={<LegalPages type="privacy" />} />
            <Route path="/terms" element={<LegalPages type="terms" />} />

            {/* --- Protected Routes --- */}
            <Route element={<ProtectedRoute />}>
              <Route 
                path="/dashboard" 
                element={<Dashboard currentLang={currentLang} setLang={setCurrentLang} />} 
              />
              
              <Route path="/members" element={<Member />}>
                <Route index element={<Navigate to="add" replace />} />
                <Route path="list" element={<MembersList />} />
                <Route path="add" element={<AddMember />} />
                <Route path="payments" element={<PaymentHistory />} />
              </Route>

              <Route path="/expenses" element={<Expenses />} /> 
              <Route path="/reports" element={<Reports />} />
              <Route path="/attendance" element={<Attendance />} /> 
              <Route path="/support" element={<Support />} /> 
              
              <Route path="/suggestions" element={<FeatureRequest />} /> 

              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />

              <Route path="/setup" element={<SetupLayout />}>
                <Route index element={<Navigate to="membership" replace />} />
                <Route path="membership" element={<MembershipPlans />} />
                <Route path="trainers" element={<Trainers />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </GlobalErrorBoundary>
  );
}

export default App;