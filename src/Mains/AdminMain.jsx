import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { 
  FiPlus, 
  FiActivity, 
  FiCheckCircle, 
  FiClock, 
  FiUsers, 
  FiMoreVertical, 
  FiLayers 
} from "react-icons/fi";

function AdminMain() {
  const user = useSelector((state) => state.auth.user);
  const tasks = useSelector((state) => state.auth.tasks);

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  /* ---------- DERIVED DATA ---------- */
  const inProgress = tasks.filter((t) => t.status === "In Progress").length;
  const completed = tasks.filter((t) => t.status === "Completed").length;
  // Dynamic pending count
  const pending = tasks.filter((t) => t.status === "Pending" || !t.status).length;

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen">
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-[1.55rem] font-black text-slate-800 tracking-tight">
          {user.name?.split(" ")[0]}'s <span className="text-indigo-600">Dashboard</span>
          </h1>
          <p className="text-slate-400 font-semibold mt-1">
            Welcome back. Here's what's happening today.
          </p>
        </div>

        <Link
          to="/adminDashboard/create-task"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all"
        >
          <FiPlus strokeWidth={3} />
          Create New Task
        </Link>
      </div>

      {/* 2. Stats Grid - Updated to include 5 cards or adjust for space */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        <OverviewCard 
          title="Total Tasks" 
          value={user.yourTotal || 0} 
          icon={<FiLayers />} 
          color="bg-indigo-600" 
        />
        <OverviewCard 
          title="In Progress" 
          value={inProgress} 
          icon={<FiActivity />} 
          color="bg-amber-500" 
        />
        <OverviewCard 
          title="Completed" 
          value={completed} 
          icon={<FiCheckCircle />} 
          color="bg-emerald-500" 
        />
        {/* NEW DYNAMIC PENDING CARD */}
        <OverviewCard 
          title="Pending Tasks" 
          value={pending} 
          icon={<FiClock />} 
          color="bg-rose-500" 
        />
        <OverviewCard 
          title="Team Members" 
          value="12" 
          icon={<FiUsers />} 
          color="bg-violet-600" 
        />
      </div>

      {/* 3. Tasks Table Section */}
      <section className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FiClock className="text-indigo-600" /> Recent Assignments
          </h2>
          <button className="text-sm font-bold text-indigo-600 hover:underline">View All</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Task Details</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Assign to</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-slate-400 italic">
                    No active tasks found in the system.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    title={task.title}
                    employee={task.employee}
                    status={task.status}
                    category={task.category || "General"}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/* ---------- REUSABLE COMPONENTS ---------- */

function OverviewCard({ title, value, icon, color }) {
  return (
    <div className="group bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl text-white ${color} shadow-lg shadow-inherit transition-transform group-hover:scale-110`}>
          {React.cloneElement(icon, { size: 18 })}
        </div>
        <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">+0%</span>
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
        <h3 className="text-2xl font-black text-slate-800 mt-1">{value}</h3>
      </div>
    </div>
  );
}

function TaskRow({ title, employee, status, category }) {
  const statusStyles = {
    Completed: "bg-emerald-50 text-emerald-600 border-emerald-100",
    "In Progress": "bg-amber-50 text-amber-600 border-amber-100",
    Pending: "bg-slate-50 text-slate-500 border-slate-100",
  };

  const currentStyle = statusStyles[status] || statusStyles.Pending;

  return (
    <tr className="group hover:bg-slate-50/50 transition-colors">
      <td className="px-6 py-4">
        <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{title}</p>
        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter mt-0.5">{category}</p>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-600">
            {employee?.charAt(0) || "U"}
          </div>
          <span className="text-sm font-semibold text-slate-600">{employee}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${currentStyle}`}>
          {status || "Pending"}
        </span>
      </td>
      <td className="px-6 py-4">
        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
          <FiMoreVertical />
        </button>
      </td>
    </tr>
  );
}

export default AdminMain;