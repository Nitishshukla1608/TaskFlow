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
  
  const [activeModal, setActiveModal] = useState(null);

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
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

      {/* 3. Modal Overlay */}
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
            <FiClock className="text-indigo-600" /> Recent Assignments
          </h2>
          <button className="text-sm font-bold text-indigo-600 hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Task Details</th>
                <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Assign to</th>
                <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tasks.length === 0 ? (
                <tr><td colSpan="4" className="px-8 py-10 text-center text-slate-400 italic font-medium">No tasks found.</td></tr>
              ) : (
                tasks.map((task) => (
                  <TaskRow key={task.id} {...task} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/* ---------- HELPERS & SUB-COMPONENTS ---------- */

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

function TaskRow({ title, employee, status, category }) {
  const statusStyles = {
    Completed: "bg-emerald-50 text-emerald-600 border-emerald-100",
    "In Progress": "bg-amber-50 text-amber-600 border-amber-100",
    Pending: "bg-slate-50 text-slate-500 border-slate-100",
  };
  const currentStyle = statusStyles[status] || statusStyles.Pending;

  return (
    <tr className="group hover:bg-slate-50/50 transition-colors">
      <td className="px-8 py-5">
        <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{title}</p>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">{category || "General"}</p>
      </td>
      <td className="px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center text-[10px] font-black text-indigo-600">
            {employee?.charAt(0) || "U"}
          </div>
          <span className="text-sm font-bold text-slate-600">{employee}</span>
        </div>
      </td>
      <td className="px-8 py-5">
        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border ${currentStyle}`}>
          {status || "Pending"}
        </span>
      </td>
      <td className="px-8 py-5">
        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
          <FiMoreVertical size={18} />
        </button>
      </td>
    </tr>
  );
}

export default AdminMain;