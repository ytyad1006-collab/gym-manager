import React, { useState } from "react"; 
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// ✅ AuthProvider Import kiya hai
import { AuthProvider } from "./context/AuthContext.jsx"; 
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

function App() {
  const [currentLang, setCurrentLang] = useState('en');

  return (
    // ✅ Pura app AuthProvider ke andar wrap kar diya hai
    <AuthProvider>
      <BrowserRouter>
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
  );
}

export default App;