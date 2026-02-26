import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { 
  FiPlus, FiActivity, FiCheckCircle, FiClock, FiUsers, 
  FiMoreVertical, FiMaximize2, FiLayers, FiUserPlus, FiX,
  FiShield, FiUser, FiCopy, FiCheck
} from "react-icons/fi";

function AdminMain() {
  const user = useSelector((state) => state.auth.user);
  const tasks = useSelector((state) => state.auth.tasks);
  const members = useSelector((state) => state.auth.members || []);

  
  
  
  const [showAllModal, setShowAllModal] = useState(false);
  const [activeModal, setActiveModal] = useState(null);

  if (!user) {
    return (
      <div className="flex h-scre en items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const inProgress = tasks.filter((t) => t.status === "In Progress").length;
  const completed = tasks.filter((t) => t.status === "Completed").length;
  const pending = tasks.filter((t) => t.status === "Pending" || !t.status).length;

  const stats = [
    { id: 'total', title: "Total Tasks", value: user.yourTotal || 0, icon: <FiLayers />, color: "bg-indigo-600", renderContent: () => <p className="text-slate-400">Analytics coming soon.</p> },
    { id: 'progress', title: "In Progress", value: inProgress, icon: <FiActivity />, color: "bg-amber-500", renderContent: () => <p className="text-slate-400">Workflow tracking active.</p> },
    { id: 'completed', title: "Completed", value: completed, icon: <FiCheckCircle />, color: "bg-emerald-500", renderContent: () => <p className="text-slate-400">Goal milestones reached.</p> },
    { id: 'pending', title: "Pending Tasks", value: pending, icon: <FiClock />, color: "bg-rose-500", renderContent: () => <p className="text-slate-400">Action items pending.</p> },
    { 
      id: 'team', 
      title: "Team Members", 
      value: members.length || "0", 
      icon: <FiUsers />, 
      color: "bg-violet-600",
      renderContent: () => (
        <div className="w-full max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
          <div className="flex flex-col gap-3">
            {members.map((member) => (
              <div key={member.uid} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center font-black">
                    {member.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-bold text-slate-800">{member.name}</h4>
                    <div className="flex items-center gap-2">
                      <p className="text-[11px] text-slate-400 font-mono tracking-tighter uppercase">{member.uid.substring(0, 12)}...</p>
                      <CopyButton text={member.uid} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">
                  <FiShield size={10} className="text-violet-500" />
                  <span className="text-[10px] font-black text-slate-600 uppercase">{member.role || "Staff"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
  ];

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen relative">
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-[1.85rem] font-black text-slate-800 tracking-tight">
            {user.name?.split(" ")[0]}
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

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        {stats.map((stat) => (
          <OverviewCard key={stat.id} {...stat} onMaximize={() => setActiveModal(stat)} />
        ))}
      </div>

      {/* 3. Detail Modal Overlay (Active Modal) */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setActiveModal(null)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <button onClick={() => setActiveModal(null)} className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-xl">
              <FiX size={24} />
            </button>
            <div className="flex flex-col items-center text-center">
              <div className={`p-6 rounded-[2rem] text-white ${activeModal.color} shadow-2xl mb-6`}>
                {React.cloneElement(activeModal.icon, { size: 40 })}
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{activeModal.title}</p>
              <h3 className="text-5xl font-black text-slate-800 mb-8">{activeModal.value}</h3>
              <div className="w-full border-t border-slate-50 pt-8">
                {activeModal.renderContent()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Tasks Table Section */}
      <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FiClock className="text-indigo-600" /> Your Assigns
          </h2>
          <button 
            onClick={() => setShowAllModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-indigo-600 transition-all group"
          >
            View All Tasks
            <FiMaximize2 className="group-hover:scale-110 transition-transform" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Task Details</th>
                <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Assigned to</th>
                <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tasks.length === 0 ? (
                <tr><td colSpan="4" className="px-8 py-10 text-center text-slate-400 italic font-medium">No tasks found.</td></tr>
              ) : (
                tasks.slice(0, 5).map((task) => (
                  <TaskRow key={task.taskTitle} task = {task} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. View All Tasks Modal (The fix: Moved inside the return) */}
      {showAllModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" 
            onClick={() => setShowAllModal(false)} 
          />
          <div className="relative w-full max-w-6xl h-[85vh] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <div className="p-2 bg-indigo-50 rounded-xl">
                   <FiLayers className="text-indigo-600" size={20} />
                </div>
                All Assigned Tasks
              </h2>
              <button 
                onClick={() => setShowAllModal(false)}
                className="p-3 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-2xl transition-all"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10 bg-white">
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
                  {tasks.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-8 py-20 text-center text-slate-400 italic font-medium">
                        No tasks found in the database.
                      </td>
                    </tr>
                  ) : (
                    tasks.map((task) => (
                      <TaskRow key={task.id} task={task} />
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-6 bg-slate-50/30 border-t border-slate-50 flex justify-between items-center px-8">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Showing {tasks.length} total assignments
              </span>
              <button 
                onClick={() => setShowAllModal(false)}
                className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-indigo-600 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- HELPERS & SUB-COMPONENTS ---------- */

/* ---------- HELPERS & SUB-COMPONENTS ---------- */

// ✅ Added missing helper function
const getFirstName = (name) => {
  if (!name) return "Admin";
  return name.split(" ")[0];
};

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
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
    <div className="group bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl text-white ${color} shadow-lg group-hover:scale-110 transition-transform`}>
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
  
  // ✅ Fixed: Access status via task.status
  const currentStatus = statusConfig[task.status] || statusConfig.Pending;

  return (
    <tr className="group hover:bg-indigo-50/30 transition-all duration-200">
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

      <td className="px-6 py-4">
        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-md">
          {task.category || "General"}
        </span>
      </td>

      <td className="px-6 py-4">
        <div className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border shadow-sm ${currentStatus.style}`}>
          {currentStatus.icon}
          {task.status || "Pending"}
        </div>
      </td>

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

      <td className="px-6 py-4">
        <span className="text-[12px] font-bold text-slate-500">
          {task.completionDate ? (
            new Date(task.completionDate).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric'
            })
          ) : "No Date"}
        </span>
      </td>

      <td className="px-6 py-4 text-right">
        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all active:scale-95">
          <FiMoreVertical size={18} />
        </button>
      </td>
    </tr>
  );
}

export default AdminMain;