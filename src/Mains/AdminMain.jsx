import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { 
  FiPlus, FiActivity, FiCheckCircle, FiClock, FiUsers, 
  FiMoreVertical, FiMaximize2, FiLayers, FiUserPlus, FiX,
  FiCopy, FiCheck, FiCalendar, FiEdit2
} from "react-icons/fi";

function AdminMain() {
  const user = useSelector((state) => state.auth.user);
  const tasks = useSelector((state) => state.auth.tasks || []); 
  const members = useSelector((state) => state.auth.members || []);
  
  const [selectedTask, setSelectedTask] = useState(null);
  const [showAllModal, setShowAllModal] = useState(false);
  const [activeModal, setActiveModal] = useState(null);

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // --- Statistics Logic ---
  const inProgressTasks = tasks.filter((t) => t.status === "In Progress");
  const completedTasks = tasks.filter((t) => t.status === "Completed");
  const pendingTasks = tasks.filter((t) => t.status === "Pending" || t.status === "Assigned" || !t.status);

  const stats = [
    { id: 'total', title: "Total Tasks", value: tasks.length, icon: <FiLayers />, color: "bg-indigo-600", filteredTasks: tasks },
    { id: 'progress', title: "In Progress", value: inProgressTasks.length, icon: <FiActivity />, color: "bg-amber-500", filteredTasks: inProgressTasks },
    { id: 'completed', title: "Completed", value: completedTasks.length, icon: <FiCheckCircle />, color: "bg-emerald-500", filteredTasks: completedTasks },
    { id: 'pending', title: "Pending", value: pendingTasks.length, icon: <FiClock />, color: "bg-rose-500", filteredTasks: pendingTasks },
    { 
      id: 'team', 
      title: "Team Size", 
      value: members.length, 
      icon: <FiUsers />, 
      color: "bg-violet-600",
      isTeam: true
    },
  ];

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen relative">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-[1.85rem] font-black text-slate-800 tracking-tight">
            Hello {user.name?.split(" ")[0]}
          </h1>
          <p className="text-slate-400 font-semibold mt-1">Workspace Overview</p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="add-user" className="flex items-center justify-center w-12 h-12 bg-white text-indigo-600 border border-slate-100 rounded-2xl font-bold shadow-sm hover:shadow-md transition-all active:scale-95">
            <FiUserPlus size={20} />
          </Link>
          <Link to="create-task" className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95">
            <FiPlus strokeWidth={3} /> Task
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        {stats.map((stat) => (
          <OverviewCard 
            key={stat.id} 
            {...stat} 
            onMaximize={() => setActiveModal(stat)} 
          />
        ))}
      </div>

      {/* Maximized Stats/Tasks/Team Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setActiveModal(null)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[3rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-xl transition-colors">
              <FiX size={24} />
            </button>
            
            <div className="flex items-center gap-4 mb-6">
              <div className={`p-4 rounded-2xl text-white ${activeModal.color} shadow-lg`}>
                {React.cloneElement(activeModal.icon, { size: 24 })}
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{activeModal.title}</p>
                <h3 className="text-2xl font-black text-slate-800">{activeModal.value} Records</h3>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {activeModal.isTeam ? (
                <div className="space-y-2">
                  {members.map((m) => (
                    <div key={m.uid || m.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold uppercase">
                          {m.name?.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-700">{m.name}</span>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase bg-white px-3 py-1 rounded-lg border border-slate-100">{m.role || 'Staff'}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {activeModal.filteredTasks.length > 0 ? (
                    activeModal.filteredTasks.map((t) => (
                      <div 
                        key={t.id} 
                        onClick={() => { setSelectedTask(t); setActiveModal(null); }}
                        className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/50 cursor-pointer transition-all group"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{t.taskTitle}</h4>
                            <p className="text-[11px] text-slate-400 font-medium mt-1 uppercase tracking-tighter">Due: {t.completionDate || "No Date"}</p>
                          </div>
                          <FiMaximize2 className="text-slate-300 group-hover:text-indigo-400" size={14} />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center text-slate-400 italic">No tasks found in this category.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Tasks Section */}
      <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FiClock className="text-indigo-600" /> Recent Assignments
          </h2>
          <button onClick={() => setShowAllModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-indigo-600 transition-all group">
            View All Tasks <FiMaximize2 className="group-hover:scale-110 transition-transform" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-[11px] font-black uppercase tracking-widest text-slate-400">
                <th className="px-8 py-4">Task Details</th>
                <th className="px-8 py-4">Category</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">Assigned To</th>
                <th className="px-8 py-4">Deadline</th>
                <th className="px-8 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-8 py-16 text-center text-slate-400 italic">No tasks found.</td>
                </tr>
              ) : (
                tasks.slice(0, 5).map((task) => (
                  <TaskRow key={task.id || task.taskId} task={task} onSelect={setSelectedTask} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Master Registry Modal */}
      {showAllModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowAllModal(false)} />
          <div className="relative w-full max-w-6xl h-[85vh] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <div className="p-2 bg-indigo-50 rounded-xl"><FiLayers className="text-indigo-600" size={20} /></div>
                Master Registry
              </h2>
              <button onClick={() => setShowAllModal(false)} className="p-3 text-slate-400 hover:text-slate-600 rounded-2xl transition-colors"><FiX size={24} /></button>
            </div>
            <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white shadow-sm z-10">
                  <tr className="bg-slate-50/50 text-[11px] font-black uppercase tracking-widest text-slate-400">
                    <th className="px-8 py-4">Task Details</th>
                    <th className="px-8 py-4">Category</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4">Assigned To</th>
                    <th className="px-8 py-4">Deadline</th>
                    <th className="px-8 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {tasks.map((task) => (
                    <TaskRow 
                      key={task.id || task.taskId} 
                      task={task} 
                      onSelect={(t) => { setShowAllModal(false); setSelectedTask(t); }} 
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
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
                  "{selectedTask.description || "No specific instructions provided."}"
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                <InfoRow icon={<FiActivity />} label="Status" value={selectedTask.status} isStatus />
                <InfoRow icon={<FiCalendar />} label="Due Date" value={selectedTask.completionDate || "Not Set"} />
                <InfoRow icon={<FiUsers />} label="Assigned To" value={selectedTask.assignedToName || "N/A"} />
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

/* ---------- HELPERS ---------- */

const getFirstName = (name) => name ? name.split(" ")[0] : "User";

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
          {value || "Pending"}
        </span>
      ) : (
        <span className="text-xs font-bold text-slate-700">{value}</span>
      )}
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e) => {
    e.stopPropagation();
    if(!text) return;
    navigator.clipboard.writeText(String(text));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="p-1 hover:bg-slate-200 rounded transition-colors text-slate-400">
      {copied ? <FiCheck size={12} className="text-emerald-500" /> : <FiCopy size={12} />}
    </button>
  );
}

function OverviewCard({ title, value, icon, color, onMaximize }) {
  return (
    <div className="group bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl text-white ${color} shadow-lg`}>
          {React.cloneElement(icon, { size: 18 })}
        </div>
        <button onClick={onMaximize} className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
          <FiMaximize2 size={16} />
        </button>
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
      <h3 className="text-2xl font-black text-slate-800 mt-1">{value}</h3>
    </div>
  );
}

function TaskRow({ task, onSelect }) {
  if (!task) return null;
  const statusConfig = {
    Completed: { style: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <FiCheckCircle size={12} className="mr-1" /> },
    "In Progress": { style: "bg-amber-50 text-amber-700 border-amber-200", icon: <FiActivity size={12} className="mr-1" /> },
    Assigned: { style: "bg-indigo-50 text-indigo-700 border-indigo-200", icon: <FiClock size={12} className="mr-1" /> },
    Pending: { style: "bg-slate-50 text-slate-500 border-slate-200", icon: <FiClock size={12} className="mr-1" /> },
  };
  const currentStatus = statusConfig[task.status] || statusConfig.Pending;
  const safeId = task.id ? String(task.id).substring(0, 8) : "N/A";

  return (
    <tr className="group hover:bg-indigo-50/30 transition-all duration-200">
      <td className="px-8 py-5">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-700">{task.taskTitle || "Untitled Task"}</span>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400 font-mono">ID: {safeId}</span>
            <CopyButton text={task.id} />
          </div>
        </div>
      </td>
      <td className="px-8 py-5">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-md">{task.category || "General"}</span>
      </td>
      <td className="px-8 py-5">
        <div className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border shadow-sm ${currentStatus.style}`}>
          {currentStatus.icon} {task.status || "Pending"}
        </div>
      </td>
      <td className="px-8 py-5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-black uppercase">
            {getFirstName(task.assignedToName).charAt(0)}
          </div>
          <span className="text-xs font-bold text-slate-600">{getFirstName(task.assignedToName)}</span>
        </div>
      </td>
      <td className="px-8 py-5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
          <FiCalendar size={12} className="text-slate-300" />
          {task.completionDate || "No Date"}
        </div>
      </td>
      <td className="px-8 py-5 text-right">
        <button onClick={() => onSelect(task)} className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
          <FiMoreVertical size={18} />
        </button>
      </td>
    </tr>
  );
}

export default AdminMain;