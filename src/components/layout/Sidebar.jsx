import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, Users, UserPlus, CreditCard, 
  BarChart3, Settings, HelpCircle, LogOut, 
  ChevronLeft, ChevronRight, ClipboardList, Dumbbell 
} from "lucide-react";
import { supabase } from "../../lib/supabase";

function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const menuItems = [
    { path: "/dashboard", name: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { path: "/members/list", name: "Members List", icon: <Users size={20} /> },
    { path: "/members/add", name: "Add Member", icon: <UserPlus size={20} /> },
    { path: "/members/payments", name: "Payments", icon: <CreditCard size={20} /> },
    { path: "/attendance", name: "Attendance", icon: <ClipboardList size={20} /> },
    { path: "/expenses", name: "Expenses", icon: <CreditCard size={20} /> },
    { path: "/reports", name: "Reports", icon: <BarChart3 size={20} /> },
    { path: "/setup", name: "Setup Gym", icon: <Settings size={20} /> },
    { path: "/support", name: "Support", icon: <HelpCircle size={20} /> },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div
      style={{
        width: isCollapsed ? "85px" : "280px",
        height: "100vh",
        background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)", // Rich Gradient
        color: "white",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        borderRight: "1px solid rgba(255,255,255,0.05)",
        boxShadow: "10px 0 30px rgba(0,0,0,0.1)",
      }}
    >
      {/* --- Toggle Button --- */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          position: "absolute",
          right: "-12px",
          top: "40px",
          background: "#3b82f6",
          border: "4px solid #0f172a",
          borderRadius: "50%",
          width: "28px",
          height: "28px",
          color: "white",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 10px rgba(59, 130, 246, 0.4)",
          zIndex: 100,
          transition: "transform 0.3s ease"
        }}
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* --- Logo Section --- */}
      <div style={{ padding: "40px 24px", display: "flex", alignItems: "center", gap: "14px" }}>
        <div style={{ 
          background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", 
          padding: "10px", 
          borderRadius: "14px",
          boxShadow: "0 8px 16px rgba(59, 130, 246, 0.2)"
        }}>
          <Dumbbell size={24} color="white" strokeWidth={2.5} />
        </div>
        {!isCollapsed && (
          <span style={{ 
            fontWeight: "900", 
            fontSize: "20px", 
            letterSpacing: "-0.5px",
            background: "linear-gradient(to right, #ffffff, #94a3b8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            GYM PRO
          </span>
        )}
      </div>

      {/* --- Navigation Links --- */}
      <nav style={{ flex: 1, padding: "0 18px", marginTop: "10px", overflowY: "auto", overflowX: "hidden" }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                padding: "14px 16px",
                color: isActive ? "#ffffff" : "#94a3b8",
                textDecoration: "none",
                borderRadius: "14px",
                marginBottom: "8px",
                background: isActive ? "rgba(59, 130, 246, 0.15)" : "transparent",
                border: isActive ? "1px solid rgba(59, 130, 246, 0.2)" : "1px solid transparent",
                transition: "all 0.2s ease",
                overflow: "hidden",
                whiteSpace: "nowrap",
                position: "relative"
              }}
              onMouseEnter={(e) => {
                if(!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.03)";
              }}
              onMouseLeave={(e) => {
                if(!isActive) e.currentTarget.style.background = "transparent";
              }}
            >
              {/* Active Indicator Bar */}
              {isActive && (
                <div style={{
                  position: "absolute",
                  left: "0",
                  height: "20px",
                  width: "4px",
                  background: "#3b82f6",
                  borderRadius: "0 4px 4px 0"
                }} />
              )}
              
              <span style={{ 
                minWidth: "20px", 
                color: isActive ? "#3b82f6" : "inherit",
                transition: "color 0.3s ease"
              }}>
                {item.icon}
              </span>
              
              {!isCollapsed && (
                <span style={{ 
                  fontSize: "14px", 
                  fontWeight: isActive ? "700" : "500",
                  letterSpacing: "0.3px"
                }}>
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* --- Logout Section --- */}
      <div style={{ padding: "24px 18px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "15px",
            padding: "14px 16px",
            background: "rgba(248, 113, 113, 0.05)",
            border: "1px solid rgba(248, 113, 113, 0.1)",
            color: "#f87171",
            cursor: "pointer",
            borderRadius: "14px",
            transition: "all 0.3s ease",
            overflow: "hidden",
            whiteSpace: "nowrap"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(248, 113, 113, 0.15)";
            e.currentTarget.style.border = "1px solid rgba(248, 113, 113, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(248, 113, 113, 0.05)";
            e.currentTarget.style.border = "1px solid rgba(248, 113, 113, 0.1)";
          }}
        >
          <span style={{ minWidth: "20px" }}><LogOut size={20} /></span>
          {!isCollapsed && <span style={{ fontSize: "14px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px" }}>Logout</span>}
        </button>
      </div>
    </div>
  );
}

export default Sidebar;