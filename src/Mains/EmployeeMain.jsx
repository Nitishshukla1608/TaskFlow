import React, { useState } from "react";
import { useSelector } from "react-redux";
import { MdReply } from "react-icons/md";
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [msgPop, setMsgPop] = useState(false);

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

  const handleUpdateStatus = async () => { 
    if (!selectedTask || !localStatus) return;
    setIsSaving(true);
    try {
      await updateTaskStatus(selectedTask.taskId, localStatus); 
      setIsEditModalOpen(false);
      setSelectedTask(null);
    } catch (error) {
      console.error("Update Failed:", error);
      alert("Failed to update status.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen relative font-sans text-slate-900">
      
      {/* 1. Header */} 
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

      {/* 2. Message Popup (Fixed Logic) */}
      {msgPop && (
        <div className="fixed top-10 right-10 z-[200] bg-white border border-slate-100 p-6 rounded-[2rem] shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-full"><MdReply size={18}/></div>
            <p className="font-black text-slate-800 tracking-tight">Quick Reply</p>
          </div>
          <p className="text-sm text-slate-500 mb-5 italic">"This feature is coming soon!"</p>
          <button 
            onClick={() => setMsgPop(false)} 
            className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-indigo-600 transition-all"
          >
            Close
          </button>
        </div>
      )}

      {/* 3. Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard title="Total Assigned" value={tasks.length} icon={<FiLayers />} color="bg-indigo-600" onMaximize={() => openMaximizedView("Total Assigned")} />
        <StatCard title="Pending" value={pendingTasks.length} icon={<FiClock />} color="bg-rose-500" onMaximize={() => openMaximizedView("Pending")} />
        <StatCard title="Active" value={inProgressTasks.length} icon={<FiActivity />} color="bg-amber-500" onMaximize={() => openMaximizedView("Active")} />
        <StatCard title="Completed" value={completedTasks.length} icon={<FiCheckCircle />} color="bg-emerald-500" onMaximize={() => openMaximizedView("Completed")} />
      </div>

      {/* 4. Table Section */}
      <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Focus Tasks</h2>
          <button onClick={() => openMaximizedView("Total Assigned")} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-indigo-600 transition-all group">
            View All Tasks <FiMaximize2 />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-[11px] font-black uppercase tracking-widest text-slate-400">
                <th className="px-8 py-4">Task Details</th>
                <th className="px-8 py-4">Category</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">Assigned By</th>
                <th className="px-8 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tasks.slice(0, 5).map((task) => (
                <TaskRow 
                  key={task.taskId || task.id} 
                  task={task} 
                  onSelect={setSelectedTask} 
                  setMsgPop={setMsgPop} 
                />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. Edit Status Modal */}
      {isEditModalOpen && selectedTask && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-8 shadow-2xl border-t-8 border-indigo-600">
            <h2 className="text-2xl font-black text-slate-800 mb-6 tracking-tight">Update Status</h2>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {["Pending", "In Progress", "Under Review", "Completed"].map((opt) => (
                <button 
                  key={opt}
                  onClick={() => setLocalStatus(opt)}
                  className={`py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${localStatus === opt ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-indigo-200'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
              <button onClick={handleUpdateStatus} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg">
                {isSaving ? <FiLoader className="animate-spin" /> : <FiSave />} Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Task Detail View */}
      {selectedTask && !isEditModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedTask(null)} />
          <div className="relative bg-white rounded-[2.5rem] max-w-md w-full shadow-2xl overflow-hidden p-8 border-t-2 border-slate-100">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg uppercase tracking-widest">{selectedTask.category || "General"}</span>
                <h3 className="text-2xl font-black text-slate-800 mt-2 leading-tight">{selectedTask.taskTitle}</h3>
              </div>
              <button onClick={() => { setLocalStatus(selectedTask.status); setIsEditModalOpen(true); }} className="p-2 hover:bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-colors"><FiEdit2 size={18} /></button>
            </div>
            <div className="space-y-4 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
              <InfoRow icon={<FiActivity />} label="Status" value={selectedTask.status} isStatus />
              <InfoRow icon={<FiCalendar />} label="Due Date" value={selectedTask.completionDate || "Not Set"} />
              <InfoRow icon={<FiUsers />} label="Assigned By" value={selectedTask.assignedByName || "Admin"} />
            </div>
            <button onClick={() => setSelectedTask(null)} className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-indigo-600 shadow-lg transition-all">Close Details</button>
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
        <div className={`p-4 rounded-2xl text-white ${color} shadow-lg`}>{icon}</div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
          <h3 className="text-2xl font-black text-slate-800">{value}</h3>
        </div>
      </div>
      <button onClick={onMaximize} className="opacity-0 group-hover:opacity-100 p-2 text-slate-200 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><FiMaximize2 size={16} /></button>
    </div>
  );
}

function InfoRow({ icon, label, value, isStatus }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white rounded-lg text-indigo-600 shadow-sm">{icon}</div>
        <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wide">{label}</span>
      </div>
      <span className={`text-xs font-black ${isStatus ? 'text-indigo-600 bg-white px-3 py-1 rounded-full border border-indigo-100' : 'text-slate-700'}`}>{value || "Pending"}</span>
    </div>
  );
}

function TaskRow({ task, onSelect, setMsgPop }) {
  if (!task) return null;
  const statusConfig = {
    "Completed": { style: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <FiCheckCircle className="mr-1" /> },
    "In Progress": { style: "bg-amber-50 text-amber-700 border-amber-200", icon: <FiActivity className="mr-1" /> },
    "Under Review": { style: "bg-blue-50 text-blue-700 border-blue-200", icon: <FiActivity className="mr-1" /> },
    "Assigned": { style: "bg-indigo-50 text-indigo-700 border-indigo-200", icon: <FiClock className="mr-1" /> },
    "Pending": { style: "bg-slate-50 text-slate-500 border-slate-200", icon: <FiClock className="mr-1" /> }
  };
  const currentStatus = statusConfig[task.status] || statusConfig["Pending"];

  return (
    <tr className="group hover:bg-indigo-50/30 transition-all cursor-pointer" onClick={() => onSelect(task)}>
      <td className="px-8 py-5">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{task.taskTitle}</span>
          <span className="text-[10px] text-slate-400">ID: {task.taskId?.slice(0, 8) || "N/A"}</span>
        </div>
      </td>
      <td className="px-8 py-5"><span className="text-[10px] font-black text-slate-400 uppercase bg-slate-100 px-2 py-1 rounded-lg tracking-widest">{task.category || "General"}</span></td>
      <td className="px-8 py-5">
        <div className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border shadow-sm ${currentStatus.style}`}>
          {currentStatus.icon} {task.status || "Pending"}
        </div>
      </td>
      <td className="px-8 py-5 text-sm font-bold text-slate-600">{task.assignedByName || "Admin"}</td>
      <td className="px-8 py-5 text-right">
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevents detail modal from opening
              setMsgPop(true);
            }}
            className="p-2 hover:bg-slate-100 text-slate-400 hover:text-indigo-600 rounded-xl transition-all"
          >
            <MdReply size={20} />
          </button>
          <FiMoreVertical className="text-slate-300 group-hover:text-slate-500" />
        </div>
      </td>
    </tr>
  );
}

export default EmployeeMain;