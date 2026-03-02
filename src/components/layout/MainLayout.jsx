import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function MainLayout({ children }) {
  // ✅ Mobile logic ke liye states
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Resize listener taaki screen size change hone par update ho
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(false); // Desktop par sidebar hamesha rahega
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%", overflow: "hidden" }}>
      
      {/* Sidebar: Mobile par overlay ki tarah kaam karega */}
      <div style={{
        position: isMobile ? "fixed" : "relative",
        zIndex: 100,
        height: "100vh",
        transition: "transform 0.3s ease",
        transform: isMobile && !isSidebarOpen ? "translateX(-100%)" : "translateX(0)",
      }}>
        <Sidebar onNavClick={() => isMobile && setIsSidebarOpen(false)} />
      </div>

      <div style={{ 
        flex: 1, 
        display: "flex", 
        flexDirection: "column",
        minWidth: 0 
      }}>
        
        {/* Topbar: Menu click handler pass kiya hai */}
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Content Area */}
        <div
          style={{
            flex: 1,
            padding: isMobile ? "15px" : "30px", // Mobile par padding thodi kam
            overflowY: "auto", 
            backgroundColor: "#f3f4f6",
          }}
        >
          {children}
        </div>
      </div>

      {/* ✅ Mobile Overlay: Sidebar khulne par peeche ka area dark karne ke liye */}
      {isMobile && isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 90,
            backdropFilter: "blur(2px)"
          }}
        />
      )}
    </div>
  );
}

export default MainLayout;