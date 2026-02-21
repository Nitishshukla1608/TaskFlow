import React, { useState } from "react";
import { useSelector } from "react-redux";
import { 
  FiClock, 
  FiCheckCircle, 
  FiActivity, 
  FiLayers, 
  FiMaximize2, 
  FiX, 
  FiCalendar,
  FiArrowRight
} from "react-icons/fi";

function EmployeeDashboard() {
  const user = useSelector((state) => state.auth.user);
  const tasks = useSelector((state) => state.auth.tasks);
  const [showAllModal, setShowAllModal] = useState(false);

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Derived Statistics
  const pendingTasks = tasks.filter(t => t.status === "Pending" || !t.status);
  const inProgressTasks = tasks.filter(t => t.status === "In Progress");
  const completedTasks = tasks.filter(t => t.status === "Completed");

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen relative">
      
      {/* 1. Welcome Header */}
      <div className="mb-10">
      <h1 className="text-[1.55rem] font-black text-slate-800 tracking-tight">
          {user.name?.split(" ")[0]}'s <span className="text-indigo-600">Dashboard</span>
          </h1>
        <p className="text-slate-400 font-semibold mt-1">
          Hello {user.name?.split(" ")[0]}, you have {pendingTasks.length} tasks awaiting action.
        </p>
      </div>

      {/* 2. Stats Grid (5 Column Layout like Admin) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard title="Total Assigned" value={tasks.length} icon={<FiLayers />} color="bg-indigo-600" />
        <StatCard title="Pending" value={pendingTasks.length} icon={<FiClock />} color="bg-rose-500" />
        <StatCard title="Active" value={inProgressTasks.length} icon={<FiActivity />} color="bg-amber-500" />
        <StatCard title="Completed" value={completedTasks.length} icon={<FiCheckCircle />} color="bg-emerald-500" />
      </div>

      {/* 3. Main Task Section */}
      <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Focus Tasks</h2>
            <p className="text-xs text-slate-400 font-bold uppercase mt-1 tracking-widest">Recent Assignments</p>
          </div>
          <button 
            onClick={() => setShowAllModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-indigo-600 transition-all group"
          >
            View All Tasks
            <FiMaximize2 className="group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Task List (Minimal Version for Dashboard) */}
        <div className="p-4">
          {tasks.length === 0 ? (
            <div className="py-20 text-center text-slate-400 font-medium italic">
              No tasks assigned yet. Enjoy your clear schedule!
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.slice(0, 5).map((task) => (
                <EmployeeTaskRow key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. "VIEW ALL" MODAL OVERLAY */}
      {showAllModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10">
          <div className="absolute inset-0 bg-slate-500/60 backdrop-blur-md" onClick={() => setShowAllModal(false)} />
          
          <div className="relative w-full max-w-6xl h-[85vh] bg-[#f8fafc] rounded-[1rem] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
            <div className="p-5 bg-white border-b flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-800 italic">All Assigned Tasks</h2>
              <button 
                onClick={() => setShowAllModal(false)}
                className="p-3 hover:bg-slate-100 rounded-full transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- UI SUB-COMPONENTS ---------- */

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
      <div className={`p-4 rounded-2xl text-white ${color} shadow-lg shadow-inherit`}>
        {React.cloneElement(icon, { size: 22 })}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
        <h3 className="text-2xl font-black text-slate-800 mt-0.5">{value}</h3>
      </div>
    </div>
  );
}

function EmployeeTaskRow({ task }) {
  const statusColors = {
    Completed: "bg-emerald-500",
    "In Progress": "bg-amber-500",
    Pending: "bg-slate-300"
  };

  return (
    <div className="flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl border border-transparent hover:border-indigo-100 hover:bg-white transition-all group">
      <div className="flex items-center gap-4">
        <div className={`w-2 h-10 rounded-full ${statusColors[task.status] || "bg-slate-300"}`} />
        <div>
          <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{task.title}</h4>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1 flex items-center gap-2">
            <FiCalendar /> {task.category || "General"}
          </p>
        </div>
      </div>
      <button className="p-3 text-slate-300 group-hover:text-indigo-600 transition-colors">
        <FiArrowRight size={20} />
      </button>
    </div>
  );
}

function TaskCard({ task }) {
    const statusStyles = {
        Completed: "bg-emerald-50 text-emerald-600 border-emerald-100",
        "In Progress": "bg-amber-50 text-amber-600 border-amber-100",
        Pending: "bg-slate-100 text-slate-500 border-slate-200",
      };

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-4">
          <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${statusStyles[task.status] || statusStyles.Pending}`}>
            {task.status || "Pending"}
          </span>
          <FiLayers className="text-slate-200" size={20} />
        </div>
        <h4 className="text-lg font-black text-slate-800 leading-tight mb-2">{task.title}</h4>
        <p className="text-sm text-slate-500 line-clamp-2">{task.description || "No additional details provided for this task."}</p>
      </div>
      
      <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
        <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-300 uppercase">Deadline</span>
            <span className="text-xs font-bold text-slate-700">24 Oct 2026</span>
        </div>
        <button className="text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-800">Update Status</button>
      </div>
    </div>
  );
}

export default EmployeeDashboard;