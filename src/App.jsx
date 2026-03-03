import React, { useState } from "react"; // ✅ Added useState for Language
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

// ✅ Naya Import: Legal Pages aur AIChatbot
import LegalPages from "./pages/LegalPages.jsx"; 
import AIChatbot from "./components/AIChatbot.jsx"; // 🤖 AI Chatbot Import

function App() {
  // ✅ Language State: Ab ye fully activated hai
  const [currentLang, setCurrentLang] = useState('en');

  return (
    <BrowserRouter>
      {/* 🤖 Global AI Assistant - Ab ye currentLang ke sath synced hai */}
      <AIChatbot currentLang={currentLang} />
      
      {/* 🌐 Note: Maine purana floating div hata diya hai kyunki humne dropdown ko Dashboard header mein shift kar diya hai */}

      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/" element={<LandingPage />} /> 
        <Route path="/login" element={<Login />} />
        
        {/* ✅ Naye Public Routes: Privacy aur Terms ke liye */}
        <Route path="/privacy" element={<LegalPages type="privacy" />} />
        <Route path="/terms" element={<LegalPages type="terms" />} />

        {/* --- Protected Routes (Sirf Login ke baad) --- */}
        <Route element={<ProtectedRoute />}>
          {/* Dashboard pass currentLang and setLang for full activation */}
          <Route 
            path="/dashboard" 
            element={<Dashboard currentLang={currentLang} setLang={setCurrentLang} />} 
          />
          
          {/* Members Module */}
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

          {/* Setup Module */}
          <Route path="/setup" element={<SetupLayout />}>
            <Route index element={<Navigate to="membership" replace />} />
            <Route path="membership" element={<MembershipPlans />} />
            <Route path="trainers" element={<Trainers />} />
          </Route>
        </Route>

        {/* Catch All - Unknown pages ko landing par bhej dega */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;