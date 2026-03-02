import { useLocation, useNavigate } from "react-router-dom";
import { UserCircle, Bell, LogOut, ChevronDown, User, ShieldCheck, Clock, CheckCircle2, X, Menu } from "lucide-react"; // ✅ Menu icon add kiya
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase"; 

function Topbar({ onMenuClick }) { // ✅ onMenuClick prop receive kiya
  const location = useLocation();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // --- Real-time Notifications State (Aapka logic) ---
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Membership Expiring", desc: "Rahul's plan expires in 2 days", time: "5m ago", type: "alert" },
    { id: 2, title: "Payment Received", desc: "₹2,500 received from Sneha", time: "1h ago", type: "success" },
  ]);

  useEffect(() => {
    const welcomeNote = {
      id: Date.now(),
      title: "Welcome Back! 👋",
      desc: "Good to see you. Don't forget to check today's attendance.",
      time: "Just now",
      type: "success"
    };
    
    const profileNote = {
      id: Date.now() + 1,
      title: "Profile Setup",
      desc: "Complete your gym profile to attract more members.",
      time: "Just now",
      type: "alert"
    };

    setNotifications(prev => [welcomeNote, profileNote, ...prev]);
  }, []);

  const getPageTitle = () => {
    const path = location.pathname.split("/")[1];
    if (!path || path === "dashboard") return "Dashboard";
    const subPath = location.pathname.split("/")[2];
    const mainTitle = path.charAt(0).toUpperCase() + path.slice(1);
    return subPath ? `${mainTitle} / ${subPath.charAt(0).toUpperCase() + subPath.slice(1)}` : mainTitle;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear(); 
    sessionStorage.clear(); 
    window.location.replace("/"); 
  };

  const markAllRead = () => {
    setNotifications([]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div
      style={{
        height: "70px",
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: window.innerWidth <= 768 ? "0 15px" : "0 30px", // ✅ Mobile par padding adjust ki
        borderBottom: "1px solid #f1f5f9",
        position: "sticky",
        top: 0,
        zIndex: 40 
      }}
    >
      {/* Left Section: Menu + Title */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        
        {/* ✅ MOBILE HAMBURGER MENU: Sirf mobile par dikhega */}
        <button 
          onClick={onMenuClick}
          className="mobile-only-btn"
          style={{
            display: "none", // Default hidden
            background: "#f1f5f9",
            border: "none",
            padding: "8px",
            borderRadius: "10px",
            cursor: "pointer",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Menu size={20} color="#1e293b" />
        </button>

        <div className="desktop-only-bar" style={{ width: "4px", height: "20px", background: "#3b82f6", borderRadius: "10px" }}></div>
        
        <h3 style={{ 
          margin: 0, 
          fontSize: window.innerWidth <= 768 ? "14px" : "16px", // ✅ Mobile par title thoda chota
          fontStyle: "italic", 
          fontWeight: "800", 
          color: "#1e293b", 
          textTransform: "uppercase", 
          letterSpacing: "0.5px" 
        }}>
          {getPageTitle()}
        </h3>
      </div>

      {/* Right Section (Notifications + Profile) */}
      <div style={{ display: "flex", alignItems: "center", gap: window.innerWidth <= 768 ? "12px" : "25px" }}>
        
        {/* --- Notification Bell (Aapka original logic) --- */}
        <div style={{ position: "relative" }}>
          <div 
            onClick={() => setShowNotifications(!showNotifications)}
            style={{ 
              position: "relative", 
              cursor: "pointer", 
              color: showNotifications ? "#3b82f6" : "#64748b",
              padding: "8px",
              borderRadius: "12px",
              transition: "0.2s",
              background: showNotifications ? "#eff6ff" : "#f8fafc"
            }}
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                width: "10px",
                height: "10px",
                background: "#ef4444",
                borderRadius: "50%",
                border: "2px solid white",
                animation: "pulse 2s infinite"
              }}></span>
            )}
          </div>

          {showNotifications && (
            <div 
              onMouseLeave={() => setShowNotifications(false)}
              style={{
                position: "absolute",
                right: window.innerWidth <= 768 ? "-60px" : 0, // ✅ Mobile par alignment fix
                top: "50px",
                width: window.innerWidth <= 768 ? "280px" : "320px",
                background: "white",
                borderRadius: "20px",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                border: "1px solid #f1f5f9",
                padding: "15px",
                zIndex: 100,
                animation: "fadeIn 0.2s ease-out"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px", alignItems: "center" }}>
                <span style={{ fontWeight: "800", fontSize: "12px", textTransform: "uppercase", color: "#1e293b" }}>
                  Notifications ({notifications.length})
                </span>
                <span 
                  onClick={markAllRead}
                  style={{ fontSize: "10px", color: "#3b82f6", fontWeight: "bold", cursor: "pointer" }}
                >
                  Mark all as read
                </span>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "400px", overflowY: "auto" }}>
                {notifications.length === 0 ? (
                  <p style={{ textAlign: "center", fontSize: "12px", color: "#94a3b8", padding: "20px" }}>No new notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} style={{ padding: "12px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #f1f5f9", position: "relative" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ fontWeight: "700", fontSize: "13px", color: n.type === "alert" ? "#ef4444" : "#10b981", paddingRight: "15px" }}>{n.title}</span>
                        <X 
                          size={14} 
                          style={{ cursor: "pointer", color: "#94a3b8" }} 
                          onClick={() => removeNotification(n.id)}
                        />
                      </div>
                      <p style={{ margin: "4px 0", fontSize: "12px", color: "#64748b", lineHeight: "1.4" }}>{n.desc}</p>
                      <span style={{ fontSize: "10px", color: "#94a3b8", fontWeight: "600" }}>{n.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Section */}
        <div 
          style={{ position: "relative", cursor: "pointer" }}
          onClick={() => setShowMenu(!showMenu)}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Desktop only text */}
            <div className="desktop-only-text" style={{ textAlign: "right" }}>
                <p style={{ margin: 0, fontSize: "13px", fontWeight: "700", color: "#1e293b" }}>Admin User</p>
                <p style={{ margin: 0, fontSize: "10px", fontWeight: "600", color: "#3b82f6", textTransform: "uppercase" }}>Gym Manager</p>
            </div>
            
            <div style={{ 
              width: "38px", height: "38px", borderRadius: "12px", 
              background: "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", boxShadow: "0 4px 10px rgba(59, 130, 246, 0.3)", border: "2px solid #fff"
            }}>
                <User size={20} strokeWidth={2.5} />
            </div>
            
            <ChevronDown className="desktop-only-text" size={14} style={{ 
              color: "#94a3b8", transition: "0.3s", transform: showMenu ? "rotate(180deg)" : "none" 
            }} />
          </div>

          {/* Profile Dropdown (Original) */}
          {showMenu && (
            <div style={{
              position: "absolute",
              right: 0,
              top: "55px",
              background: "white",
              border: "1px solid #f1f5f9",
              borderRadius: "16px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
              width: "180px",
              padding: "8px",
              zIndex: 50,
              animation: "fadeIn 0.2s ease-out"
            }}>
              <button 
                onClick={() => { navigate("/profile"); setShowMenu(false); }}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: "12px",
                  padding: "12px", border: "none", background: "transparent",
                  color: "#475569", fontSize: "14px", fontWeight: "600",
                  cursor: "pointer", borderRadius: "10px", transition: "0.2s"
                }}
              >
                <div style={{ padding: "4px", background: "#eff6ff", borderRadius: "6px", color: "#3b82f6" }}>
                    <User size={14} />
                </div>
                My Profile
              </button>
              <div style={{ height: "1px", background: "#f1f5f9", margin: "6px 0" }} />
              <button 
                onClick={handleLogout}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: "12px",
                  padding: "12px", border: "none", background: "transparent",
                  color: "#ef4444", fontSize: "14px", fontWeight: "600",
                  cursor: "pointer", borderRadius: "10px", transition: "0.2s"
                }}
              >
                <div style={{ padding: "4px", background: "#fef2f2", borderRadius: "6px" }}>
                    <LogOut size={14} />
                </div>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* ✅ CSS for Responsive elements */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        @media (max-width: 768px) {
          .mobile-only-btn { display: flex !important; }
          .desktop-only-bar { display: none !important; }
          .desktop-only-text { display: none !important; }
        }
      `}</style>
    </div>
  );
}

export default Topbar;