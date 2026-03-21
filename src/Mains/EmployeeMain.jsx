import React, { useState } from "react";
import { useSelector } from "react-redux";
import { 
  FiClock, FiCheckCircle, FiActivity, FiLayers, 
  FiMaximize2, FiX, FiMoreVertical, FiCalendar,
  FiEdit2, FiUsers, FiSave, FiLoader 
} from "react-icons/fi";
import { updateTaskStatus } from "../Services/authService";

function EmployeeMain() {
  const user = useSelector((state) => state.auth.user);
  const tasks = useSelector((state) => state.auth.tasks || []);

  // --- States ---
  const [localStatus, setLocalStatus] = useState("");
  const [showAllModal, setShowAllModal] = useState(false);
  const [modalFilter, setModalFilter] = useState("Total Assigned");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Renamed to avoid function conflict
  const [selectedTask, setSelectedTask] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-600"></div>
      </div>
    );
  }

  // --- Filtering Logic ---
  const pendingTasks = tasks.filter(t => t.status === "Pending" || t.status === "Assigned" || !t.status);
  const inProgressTasks = tasks.filter(t => ["In Progress", "Blocked", "Under Review"].includes(t.status));
  const completedTasks = tasks.filter(t => t.status === "Completed");

  const getFilteredTasks = () => {
    switch (modalFilter) {
      case "Pending": return pendingTasks;
      case "Active": return inProgressTasks;
      case "Completed": return completedTasks;
      default: return tasks;
    }
  };

  const openMaximizedView = (filterName) => {
    setModalFilter(filterName);
    setShowAllModal(true);
  };

  // --- Corrected Update Function ---
  const handleUpdateStatus = async () => { 
    if (!selectedTask || !localStatus) return;

    setIsSaving(true);
    try {
      await updateTaskStatus(selectedTask.taskId, localStatus); 
      setIsEditModalOpen(false);
      setSelectedTask(null); // Clear selection after update
      // Note: In a real app, you should dispatch a Redux action here to update the UI
    } catch (error) {
      console.error("Update Failed:", error);
      alert("Failed to update status. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen relative font-sans text-slate-900">
      
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

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard title="Total Assigned" value={tasks.length} icon={<FiLayers />} color="bg-indigo-600" onMaximize={() => openMaximizedView("Total Assigned")} />
        <StatCard title="Pending" value={pendingTasks.length} icon={<FiClock />} color="bg-rose-500" onMaximize={() => openMaximizedView("Pending")} />
        <StatCard title="Active" value={inProgressTasks.length} icon={<FiActivity />} color="bg-amber-500" onMaximize={() => openMaximizedView("Active")} />
        <StatCard title="Completed" value={completedTasks.length} icon={<FiCheckCircle />} color="bg-emerald-500" onMaximize={() => openMaximizedView("Completed")} />
      </div>

      {/* 3. Focus Tasks Table */}
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
            <div className="py-20 text-center text-slate-400 font-medium italic">No tasks assigned yet.</div>
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

      {/* 4. Filtered List Modal */}
      {showAllModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowAllModal(false)} />
          <div className="relative w-full max-w-6xl h-[85vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FiLayers className="text-indigo-600" /> {modalFilter} Tasks
              </h2>
              <button onClick={() => setShowAllModal(false)} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-xl">
                <FiX size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse">
                <tbody className="divide-y divide-slate-50">
                  {getFilteredTasks().map((task) => (
                    <TaskRow key={task.taskId || task.id} task={task} onSelect={(t) => { setShowAllModal(false); setSelectedTask(t); }} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. Edit Status Modal */}
      {isEditModalOpen && selectedTask && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-8 border-t-8 border-indigo-600">
            <h2 className="text-2xl font-black text-slate-800 mb-2">Update Status</h2>
            <p className="text-slate-400 text-sm mb-6">Updating: <span className="text-indigo-600 font-bold">{selectedTask.taskTitle}</span></p>
            
            <div className="grid grid-cols-2 gap-3 mb-8">
              {["Pending", "In Progress", "Under Review", "Completed"].map((statusOption) => {
                const isActive = (localStatus === statusOption);

                return ( 
                  <button 
                    key={statusOption}
                    type="button"
                    onClick={() => setLocalStatus(statusOption)}
                    className={`py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-200 ${
                      isActive 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg scale-105' 
                        : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-indigo-200'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {isActive && <FiCheckCircle size={14} />}
                      {statusOption} 
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button 
                disabled={isSaving}
                className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200" 
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                disabled={isSaving}
                onClick={handleUpdateStatus}
                className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 shadow-lg flex items-center justify-center gap-2"
              >
                {isSaving ? <FiLoader className="animate-spin" /> : <FiSave />}
                {isSaving ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Task Detail View */}
      {selectedTask && !isEditModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="absolute inset-0 bg-slate-900/60" onClick={() => setSelectedTask(null)} />
          <div className="relative bg-white rounded-[2.5rem] max-w-md w-full shadow-2xl overflow-hidden">
            <div className="h-2 bg-indigo-600 w-full" />
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                    {selectedTask.category || "General"}
                  </span>
                  <h3 className="text-2xl font-black text-slate-800 mt-3 leading-tight">{selectedTask.taskTitle}</h3>
                </div>
                <button 
                  onClick={() => {
                    setLocalStatus(selectedTask.status);
                    setIsEditModalOpen(true);
                  }}
                  className="p-2 hover:bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl"
                >
                  <FiEdit2 size={20} />
                </button>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed italic mb-8">"{selectedTask.description || "No specific instructions provided."}"</p>
              <div className="grid grid-cols-1 gap-4 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                <InfoRow icon={<FiActivity />} label="Status" value={selectedTask.status} isStatus />
                <InfoRow icon={<FiCalendar />} label="Due Date" value={selectedTask.completionDate || "Not Set"} />
                <InfoRow icon={<FiUsers />} label="Assigned By" value={selectedTask.assignedByName || "Admin"} />
              </div>
              <button onClick={() => setSelectedTask(null)} className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-indigo-600 transition-all">Close Details</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- UI SUB-COMPONENTS ---------- */

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
      <button onClick={onMaximize} className="p-2 text-slate-200 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
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
      <span className={`text-xs font-black ${isStatus ? 'text-indigo-600 bg-white px-3 py-1 rounded-full border border-indigo-100' : 'text-slate-700'}`}>
        {value || "Pending"}
      </span>
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
    <tr className="group hover:bg-indigo-50/30 transition-all duration-200 cursor-pointer" onClick={() => onSelect(task)}>
      <td className="px-8 py-5">
        <div className="flex flex-col text-left">
          <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{task.taskTitle}</span>
          <span className="text-[11px] text-slate-400 font-medium">ID: {task.taskId?.slice(0, 8) || "N/A"}</span>
        </div>
      </td>
      <td className="px-8 py-5">
        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded-lg">{task.category || "General"}</span>
      </td>
      <td className="px-8 py-5">
        <div className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border shadow-sm ${currentStatus.style}`}>
          {currentStatus.icon} {task.status || "Pending"}
        </div>
      </td>
      <td className="px-8 py-5 text-left"><span className="text-[12px] font-bold text-slate-600">{task.assignedByName || "Admin"}</span></td>
      <td className="px-8 py-5 text-left text-[12px] font-bold text-slate-500">{task.completionDate || "No Date"}</td>
      <td className="px-8 py-5 text-right"><FiMoreVertical className="text-slate-400 ml-auto" /></td>
    </tr>
  );
}

export default EmployeeMain;