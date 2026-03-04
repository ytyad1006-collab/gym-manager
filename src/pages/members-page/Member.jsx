import { NavLink, Outlet, useLocation, Navigate } from "react-router-dom";

export default function Member() {
  const location = useLocation();
  const baseClasses = "px-6 py-2 rounded-t-lg transition-all duration-200 font-medium text-sm md:text-base";

  const getNavClass = ({ isActive }) =>
    `${baseClasses} ${
      isActive
        ? "bg-white text-blue-600 border-t border-x border-gray-200 -mb-[1px] shadow-sm z-10"
        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-t border-x border-transparent"
    }`;

  // Redirect to list if we are exactly on /member (optional but helpful)
  if (location.pathname === "/member" || location.pathname === "/member/") {
    return <Navigate to="list" replace />;
  }

  return (
    <div className="p-4 md:p-6 min-h-screen bg-gray-50/30">
      <h2 className="text-2xl font-black text-gray-800 mb-6 tracking-tight italic uppercase">
        Member Management
      </h2>

      {/* Sub Navigation (Tab Style) */}
      <div className="flex overflow-x-auto no-scrollbar gap-1 border-b border-gray-200">
        <NavLink to="list" className={getNavClass}>
          Members List
        </NavLink>

        <NavLink to="add" className={getNavClass}>
          Add Member
        </NavLink>

        <NavLink to="payments" className={getNavClass}>
          Payment History
        </NavLink>
      </div>

      {/* Nested Route Output */}
      <div className="bg-white p-4 md:p-8 rounded-b-2xl rounded-tr-2xl shadow-sm border border-gray-200 border-t-0 animate-in fade-in duration-500">
        <Outlet />
      </div>
    </div>
  );
}