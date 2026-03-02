import { NavLink, Outlet } from "react-router-dom";

export default function Member() {
  const baseClasses = "px-6 py-2 rounded-t-lg transition-all duration-200 font-medium";

  const getNavClass = ({ isActive }) =>
    `${baseClasses} ${
      isActive
        ? "bg-white text-blue-600 border-t border-l border-r border-gray-200 -mb-[1px] shadow-sm"
        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
    }`;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Member Management
      </h2>

      {/* Sub Navigation (Tab Style) */}
      <div className="flex gap-2 border-b border-gray-200 mb-0">
        {/* NAYA TAB: Members List (Pehle ise rakhte hain takki default dikhe) */}
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
      <div className="bg-white p-8 rounded-b-xl rounded-tr-xl shadow-sm border border-gray-100">
        <Outlet />
      </div>
    </div>
  );
}