import { NavLink, Outlet } from "react-router-dom";

function SetupLayout() {
  // Active link ke liye styling
  const activeStyle = "border-b-2 border-blue-600 text-blue-600 pb-2 font-semibold";
  const inactiveStyle = "text-gray-500 hover:text-gray-700 pb-2 transition";

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">System Setup</h2>
      
      {/* Sub-navigation Menu */}
      <nav className="flex gap-8 border-b border-gray-200 mb-8">
        <NavLink 
          to="membership" 
          className={({ isActive }) => isActive ? activeStyle : inactiveStyle}
        >
          Membership Plans
        </NavLink>
        
        <NavLink 
          to="trainers" 
          className={({ isActive }) => isActive ? activeStyle : inactiveStyle}
        >
          Trainers & Staff
        </NavLink>
      </nav>

      {/* Yahan aapka Membership ya Trainers component render hoga */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-50 p-2">
        <Outlet />
      </div>
    </div>
  );
}

export default SetupLayout;