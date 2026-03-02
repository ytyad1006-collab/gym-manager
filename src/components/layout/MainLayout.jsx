import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function MainLayout({ children }) {
  return (
    // height: "100vh" screen ko fix rakhega, overflow hide karega
    <div style={{ display: "flex", height: "100vh", width: "100%", overflow: "hidden" }}>
      
      {/* Sidebar: Iska width Sidebar component ke andar control karein */}
      <Sidebar />

      <div style={{ 
        flex: 1, 
        display: "flex", 
        flexDirection: "column",
        minWidth: 0 // Ye flex child ko overflow hone se bachata hai
      }}>
        
        <Topbar />

        {/* Content Area */}
        <div
          style={{
            flex: 1,
            padding: "30px",
            overflowY: "auto", // Sirf ye hissa scroll hoga
            backgroundColor: "#f3f4f6",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default MainLayout;