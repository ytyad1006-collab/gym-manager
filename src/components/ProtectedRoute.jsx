import { Navigate, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase"; 
import MainLayout from "./layout/MainLayout.jsx";

function ProtectedRoute() {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Current session check karein - Isse page refresh par login status barkarar rahega
    const checkSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setIsLoading(false);
    };

    checkSession();

    // 2. Auth state changes ko listen karein (Login/Logout)
    // ✅ Ye part back button security ke liye sabse zaruri hai
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setIsLoading(false); // Logout par turant action trigger karega
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div style={{ 
        display: "flex", 
        height: "100vh", 
        alignItems: "center", 
        justifyContent: "center",
        background: "#f8fafc",
        fontFamily: "sans-serif"
      }}>
        <div style={{ textAlign: "center" }}>
          <div className="spinner" style={{ 
            border: "4px solid #f3f3f3", 
            borderTop: "4px solid #3498db", 
            borderRadius: "50%", 
            width: "40px", 
            height: "40px", 
            animation: "spin 1s linear infinite",
            margin: "0 auto 15px"
          }}></div>
          <p style={{ color: "#64748b", fontWeight: "500" }}>Securing your session...</p> 
        </div>
        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  // ✅ Agar session hai toh MainLayout dikhao, nahi toh Login page pe bhejo
  // 'replace' property history clear rakhti hai taaki logout ke baad back button kaam na kare
  return session ? (
    <MainLayout>
      <Outlet />
    </MainLayout>
  ) : (
    <Navigate to="/login" replace />
  );
}

export default ProtectedRoute;