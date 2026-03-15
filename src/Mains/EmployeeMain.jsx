import React, { useState } from "react";
import { useSelector } from "react-redux";
import { 
  FiClock, 
  FiCheckCircle, 
  FiActivity, 
  FiLayers, 
  FiMaximize2, 
  FiX, 
  FiMoreVertical,
  FiCalendar,
  FiEdit2,
  FiUsers
} from "react-icons/fi";

function EmployeeMain() {
  const user = useSelector((state) => state.auth.user);
  const tasks = useSelector((state) => state.auth.tasks || []);
  
  // State for Modal
  const [showAllModal, setShowAllModal] = useState(false);
  const [modalFilter, setModalFilter] = useState("Total Assigned"); // Track which card is maximized
  const [selectedTask, setSelectedTask] = useState(null);

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // --- Filtering Logic for UI and Modal ---
  const pendingTasks = tasks.filter(t => 
    t.status === "Pending" || t.status === "Assigned" || !t.status
  );
  const inProgressTasks = tasks.filter(t =>
    t.status === "In Progress" || t.status === "Blocked" || t.status === "Under Review"
  );
  const completedTasks = tasks.filter(t => t.status === "Completed");

  // --- Function to get tasks based on the active modal filter ---
  const getFilteredTasks = () => {
    switch (modalFilter) {
      case "Pending": return pendingTasks;
      case "Active": return inProgressTasks;
      case "Completed": return completedTasks;
      default: return tasks; // Total Assigned
    }
  };

  const openMaximizedView = (filterName) => {
    setModalFilter(filterName);
    setShowAllModal(true);
  };

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen relative">
      
      {/* 1. Welcome Header */} 
      <div className="mb-10">
        <h1 className="text-[1.85rem] font-black text-slate-800 tracking-tight">
          Hello {user.name?.split(" ")[0]}
        </h1>
        <p className="text-slate-400 font-semibold mt-1">
          {pendingTasks.length > 0 
            ? `You have ${pendingTasks.length} tasks awaiting action.` 
            : "All caught up! No pending tasks."}
        </p>
      </div>

      {/* 2. Stats Grid - Added onMaximize prop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard title="Total Assigned" value={tasks.length} icon={<FiLayers />} color="bg-indigo-600" onMaximize={() => openMaximizedView("Total Assigned")} />
        <StatCard title="Pending" value={pendingTasks.length} icon={<FiClock />} color="bg-rose-500" onMaximize={() => openMaximizedView("Pending")} />
        <StatCard title="Active" value={inProgressTasks.length} icon={<FiActivity />} color="bg-amber-500" onMaximize={() => openMaximizedView("Active")} />
        <StatCard title="Completed" value={completedTasks.length} icon={<FiCheckCircle />} color="bg-emerald-500" onMaximize={() => openMaximizedView("Completed")} />
      </div>

      {/* 3. Focus Tasks (Recent 5) */}
      <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Focus Tasks</h2>
            <p className="text-xs text-slate-400 font-bold uppercase mt-1 tracking-widest">Recent Assignments</p>
          </div>
          <button 
            onClick={() => openMaximizedView("Total Assigned")}
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
              <thead>
                <tr className="bg-slate-50/50 text-[11px] font-black uppercase tracking-widest text-slate-400">
                  <th className="px-8 py-4">Task Details</th>
                  <th className="px-8 py-4">Category</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Assigned By</th>
                  <th className="px-8 py-4">Deadline</th>
                  <th className="px-8 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {tasks.slice(0, 5).map((task) => (
                    <TaskRow key={task.taskId || task.id} task={task} onSelect={setSelectedTask} />
                  ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* 4. Filtered View Modal */}
      {showAllModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowAllModal(false)} />
          
          <div className="relative w-full max-w-6xl h-[85vh] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FiLayers className="text-indigo-600" /> 
                {modalFilter} Tasks
                <span className="ml-2 px-3 py-1 bg-slate-50 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {getFilteredTasks().length} Results
                </span>
              </h2>
              <button onClick={() => setShowAllModal(false)} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-xl transition-all">
                <FiX size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar">
              {getFilteredTasks().length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 italic">
                   <FiLayers size={40} className="mb-4 opacity-20" />
                   No {modalFilter.toLowerCase()} tasks found.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 z-20 bg-white">
                    <tr className="bg-slate-50/50">
                      <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">Task Details</th>
                      <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">Category</th>
                      <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">Status</th>
                      <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">Assigned By</th>
                      <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">Deadline</th>
                      <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {getFilteredTasks().map((task) => (
                      <TaskRow 
                        key={task.taskId || task.id} 
                        task={task} 
                        onSelect={(t) => {
                          setShowAllModal(false);
                          setSelectedTask(t);
                        }} 
                      />
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. Attractive Task Detail View (Stays the same) */}
      {selectedTask && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="absolute inset-0 bg-slate-900/60" onClick={() => setSelectedTask(null)} />
          
          <div className="relative bg-white rounded-[2.5rem] max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="h-2 bg-indigo-600 w-full" />
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                    {selectedTask.category || "General"}
                  </span>
                  <h3 className="text-2xl font-black text-slate-800 mt-3 leading-tight">
                    {selectedTask.taskTitle}
                  </h3>
                </div>
                <button className="p-2 hover:bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-colors">
                  <FiEdit2 size={20} />
                </button>
              </div>

              <div className="mb-8">
                <p className="text-slate-500 text-sm leading-relaxed italic">
                  "{selectedTask.description || "No specific instructions provided for this task."}"
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                <InfoRow icon={<FiActivity />} label="Status" value={selectedTask.status} isStatus />
                <InfoRow icon={<FiCalendar />} label="Due Date" value={selectedTask.completionDate || "Not Set"} />
                <InfoRow icon={<FiUsers />} label="Assigned By" value={selectedTask.assignedByName || "Admin"} />
              </div>

              <button 
                onClick={() => setSelectedTask(null)}
                className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-indigo-600 transition-all active:scale-95"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- UI SUB-COMPONENTS ---------- */

const getFirstName = (name) => name ? name.split(" ")[0] : "User";

// Updated StatCard with Maximize Button
function StatCard({ title, value, icon, color, onMaximize }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group">
      <div className="flex items-center gap-5">
        <div className={`p-4 rounded-2xl text-white ${color} shadow-lg`}>
          {React.cloneElement(icon, { size: 22 })}
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
          <h3 className="text-2xl font-black text-slate-800 mt-0.5">{value}</h3>
        </div>
      </div>
      <button 
        onClick={onMaximize}
        className="p-2 text-slate-200 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
        title="Maximize View"
      >
        <FiMaximize2 size={16} />
      </button>
    </div>
  );
}

function InfoRow({ icon, label, value, isStatus }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600">
          {React.cloneElement(icon, { size: 14 })}
        </div>
        <span className="text-[11px] font-bold uppercase text-slate-400">{label}</span>
      </div>
      {isStatus ? (
        <span className="text-xs font-black text-indigo-600 bg-white px-3 py-1 rounded-full border border-indigo-100 shadow-sm">
          {value}
        </span>
      ) : (
        <span className="text-xs font-bold text-slate-700">{value}</span>
      )}
    </div>
  );
}

function TaskRow({ task, onSelect }) {
  if (!task) return null;

  const statusConfig = {
    Completed: { style: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <FiCheckCircle className="mr-1" /> },
    "In Progress": { style: "bg-amber-50 text-amber-700 border-amber-200", icon: <FiActivity className="mr-1" /> },
    Assigned: { style: "bg-indigo-50 text-indigo-700 border-indigo-200", icon: <FiClock className="mr-1" /> },
    Pending: { style: "bg-slate-50 text-slate-500 border-slate-200", icon: <FiClock className="mr-1" /> },
  };

  const currentStatus = statusConfig[task.status] || statusConfig.Pending;

  return (
    <tr className="group hover:bg-indigo-50/30 transition-all duration-200">
      <td className="px-8 py-5">
        <div className="flex flex-col text-left">
          <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">
            {task.taskTitle || "Untitled Task"}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            ID: {task.taskId || (task.id && task.id.slice(0, 8)) || "N/A"}
          </span>
        </div>
      </td>
      <td className="px-8 py-5">
        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded-lg">
          {task.category || "General"}
        </span>
      </td>
      <td className="px-8 py-5">
        <div className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border shadow-sm ${currentStatus.style}`}>
          {currentStatus.icon} {task.status || "Pending"}
        </div>
      </td>
      <td className="px-8 py-5 text-left">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
            {(task.assignedByName || "A").charAt(0)}
          </div>
          <span className="text-[12px] font-bold text-slate-600">{task.assignedByName || "Admin"}</span>
        </div>
      </td>
      <td className="px-8 py-5">
        <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-500">
          <FiCalendar className="text-slate-300" />
          {task.completionDate || "No Date"}
        </div>
      </td>
      <td className="px-8 py-5 text-right">
        <button 
          onClick={() => onSelect(task)}
          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
        >
          <FiMoreVertical size={18} />
        </button>
      </td>
    </tr>
  );
}

export default EmployeeMain;