import React, { useState } from "react";
import { useSelector } from "react-redux";
import { 
  FiClock, 
  FiCheckCircle, 
  FiActivity, 
  FiLayers, 
  FiMaximize2, 
  FiX, 
  FiMoreVertical
} from "react-icons/fi";

function EmployeeMain() {
  const user = useSelector((state) => state.auth.user);
  const tasks = useSelector((state) => state.auth.tasks || []);
  const [showAllModal, setShowAllModal] = useState(false);

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Derived Statistics
  const pendingTasks = tasks.filter(
    t => t.status === "Pending" || !t.status
  );
  
  const inProgressTasks = tasks.filter(
    t =>
      t.status === "Pending" ||
      t.status === "In Progress" ||
      t.status === "Blocked" ||
      t.status === "Under Review"
  );
  
  const completedTasks = tasks.filter(
    t => t.status === "Completed"
  );

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen relative">
      
      {/* 1. Welcome Header */}
      <div className="mb-10">
        <h1 className="text-[1.85rem] font-black text-slate-800 tracking-tight">
          {user.name?.split(" ")[0]}
        </h1>
        <p className="text-slate-400 font-semibold mt-1">
          Hello {user.name?.split(" ")[0]}, you have {pendingTasks.length} tasks awaiting action.
        </p>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard title="Total Assigned" value={tasks.length} icon={<FiLayers />} color="bg-indigo-600" />
        <StatCard title="Pending" value={pendingTasks.length} icon={<FiClock />} color="bg-rose-500" />
        <StatCard title="Active" value={inProgressTasks.length} icon={<FiActivity />} color="bg-amber-500" />
        <StatCard title="Completed" value={completedTasks.length} icon={<FiCheckCircle />} color="bg-emerald-500" />
      </div>

      {/* 3. Focus Tasks (Dashboard View) */}
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

        <div className="overflow-x-auto">
          {tasks.length === 0 ? (
            <div className="py-20 text-center text-slate-400 font-medium italic">
              No tasks assigned yet. Enjoy your clear schedule!
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <tbody className="divide-y divide-slate-50">
                {tasks.slice(0, 5).map((task) => (
                  <TaskRow key={task.taskTitle} task={task} />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* 4. Full View Modal */}
      {showAllModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowAllModal(false)} />
          
          <div className="relative w-full max-w-6xl h-[85vh] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
            
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FiClock className="text-indigo-600" /> 
                All Assignments
                <span className="ml-2 px-3 py-1 bg-slate-50 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {tasks.length} Total
                </span>
              </h2>
              <button onClick={() => setShowAllModal(false)} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-xl transition-all">
                <FiX size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-20 bg-white">
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">Task Details</th>
                    <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">Category</th>
                    <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">Status</th>
                    <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">Assigned By</th>
                    <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">Deadline</th>
                    <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {tasks.map((task) => (
                    <TaskRow key={task.id} task={task} />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 bg-slate-50/30 border-t border-slate-50 flex justify-end px-8">
              <button onClick={() => setShowAllModal(false)} className="px-8 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-indigo-600 transition-all active:scale-95">
                Close Full View
              </button>
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

function TaskRow({ task }) {
  if (!task) return null;

  const statusConfig = {
    Completed: {
      style: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: <FiCheckCircle className="mr-1" />,
    },
    "In Progress": {
      style: "bg-amber-50 text-amber-700 border-amber-200",
      icon: <FiActivity className="mr-1" />,
    },
    Assigned: {
      style: "bg-indigo-50 text-indigo-700 border-indigo-200",
      icon: <FiClock className="mr-1" />,
    },
    Pending: {
      style: "bg-slate-50 text-slate-500 border-slate-200",
      icon: <FiClock className="mr-1" />,
    },
  };

  const currentStatus = statusConfig[task.status] || statusConfig.Pending;

  const getFirstName = (name) => {
    if (!name) return "Admin";
    return name.split(" ")[0];
  };

  return (
    <tr className="group hover:bg-indigo-50/30 transition-all duration-200">
      {/* Task Title */}
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">
            {task.taskTitle || "Untitled Task"}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            ID: {task.taskId || "N/A"}
          </span>
        </div>
      </td>

      {/* Category */}
      <td className="px-6 py-4">
        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-md">
          {task.category || "General"}
        </span>
      </td>

      {/* Status Badge */}
      <td className="px-6 py-4">
        <div className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border shadow-sm ${currentStatus.style}`}>
          {currentStatus.icon}
          {task.status || "Pending"}
        </div>
      </td>

      {/* Assigned By */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
            {getFirstName(task.assignedByName).charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-bold text-slate-600">
              {getFirstName(task.assignedByName)}
            </span>
            <span className="text-[10px] text-slate-400">
              #{task.assignedBy?.slice(0, 6) || "000000"}
            </span>
          </div>
        </div>
      </td>

      {/* Deadline */}
      <td className="px-6 py-4">
        <span className="text-[12px] font-bold text-slate-500">
          {task.completionDate ? (
            new Date(task.completionDate).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric'
            })
          ) : "No Date"}
        </span>
      </td>

      {/* Actions */}
      <td className="px-6 py-4 text-right">
        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all active:scale-95">
          <FiMoreVertical size={18} />
        </button>
      </td>
    </tr>
  );
}

export default EmployeeMain;