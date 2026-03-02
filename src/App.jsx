import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx"; 

import LandingPage from "./pages/LandingPage.jsx"; // ✅ Landing Page Import Kiya
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/" element={<LandingPage />} /> {/* ✅ Landing Page ab Main Path par hai */}
        <Route path="/login" element={<Login />} />

        {/* --- Protected Routes (Sirf Login ke baad) --- */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          
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