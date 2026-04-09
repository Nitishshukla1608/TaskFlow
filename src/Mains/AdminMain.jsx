import React, { useState, useRef, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { 
  FiPlus, FiFilter, FiSearch, FiMoreHorizontal, 
  FiMessageSquare, FiChevronRight, FiUserPlus, FiUser,
  FiDownload, FiArrowUpRight, FiInbox
} from "react-icons/fi";
import { setMessages, clearMessages } from "../Context/ChatContext";
import { subscribeToMessages, sendMessage } from "../Services/message";

/**
 * Enterprise Task Management Dashboard
 * Refactored for High Scalability and Performance
 */
const AdminMain = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const tasks = useSelector((state) => state.auth.tasks || []);
  const members = useSelector((state) => state.auth.members || []);
  const messages = useSelector((state) => state.chatList?.messages || []);

  // UI State
  const [view, setView] = useState("all"); // all, progress, completed, pending
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);

  // Derived Data (Memoized for performance)
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesSearch = t.taskTitle?.toLowerCase().includes(searchQuery.toLowerCase());
      if (view === "all") return matchesSearch;
      return matchesSearch && t.status?.toLowerCase().replace(" ", "") === view;
    });
  }, [tasks, searchQuery, view]);

  const stats = useMemo(() => ({
    total: tasks.length,
    active: tasks.filter(t => t.status === "In Progress").length,
    completed: tasks.filter(t => t.status === "Completed").length,
    pending: tasks.filter(t => t.status === "Pending" || t.status === "Assigned").length,
  }), [tasks]);

  if (!user) return <LoadingState />;

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans antialiased">
      {/* 1. TOP UTILITY BAR */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Workspace Control</h1>
          <nav className="flex items-center bg-slate-100 p-1 rounded-lg">
            {["all", "progress", "completed", "pending"].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all capitalize ${
                  view === v ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {v}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link  to="add-user"    className="flex items-center gap-2 px-3  py-2 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium border border-slate-200 transition-colors">
            <FiUser size={16} />     <FiPlus size={16} /> 
          </Link>
          <Link to="create-task" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 shadow-sm transition-all">
            <FiPlus /> New Task
          </Link>
        </div>
      </div>

      <main className="p-8 max-w-[1600px] mx-auto">
        {/* 2. ANALYTICS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <MetricCard label="Total Projects" value={stats.total} trend="+12% from last month" />
          <MetricCard label="In Flight" value={stats.active} trend="Active now" color="text-amber-600" />
          <MetricCard label="Completed" value={stats.completed} trend="98% success rate" color="text-emerald-600" />
          <MetricCard label="Resource Load" value={`${members.length} Members`} trend="Capacity: 85%" />
        </div>

        {/* 3. TASK REGISTRY CONTROL */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search tasks, IDs, or assignees..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg border border-slate-200"><FiFilter size={18} /></button>
              <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg border border-slate-200"><FiMoreHorizontal size={18} /></button>
            </div>
          </div>

          {/* 4. ENTERPRISE DATA TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Project Name</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Assignee</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Deadline</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => (
                    <TaskRow 
                      key={task.id} 
                      task={task} 
                      onOpenChat={() => { setSelectedTask(task); setChatOpen(true); }}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center opacity-40">
                        <FiInbox size={40} className="mb-2" />
                        <p className="text-sm font-medium">No matching tasks found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* 5. OVERLAY COMPONENTS */}
      {chatOpen && selectedTask && (
        <ChatSidebar 
          task={selectedTask} 
          user={user} 
          messages={messages} 
          onClose={() => { setChatOpen(false); dispatch(clearMessages()); }} 
        />
      )}
    </div>
  );
};

/* --- Sub-Components --- */

const MetricCard = ({ label, value, trend, color = "text-slate-900" }) => (
  <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
    <h3 className={`text-2xl font-bold ${color}`}>{value}</h3>
    <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
      <FiArrowUpRight size={12} className="text-emerald-500" /> {trend}
    </p>
  </div>
);

const TaskRow = ({ task, onOpenChat }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "Completed": return "bg-emerald-100 text-emerald-700";
      case "In Progress": return "bg-amber-100 text-amber-700";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <tr className="hover:bg-slate-50 transition-colors group cursor-default">
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-800">{task.taskTitle}</span>
          <span className="text-[10px] text-slate-400 font-mono">ID-{task.id?.substring(0, 6)}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${getStatusColor(task.status)}`}>
          {task.status || "Pending"}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
            {task.assignedToName?.charAt(0)}
          </div>
          <span className="text-xs font-medium text-slate-700">{task.assignedToName}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-xs font-medium text-slate-500">
        {task.completionDate || "Not Set"}
      </td>
      <td className="px-6 py-4 text-right">
        <button 
          onClick={onOpenChat}
          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
        >
          <FiMessageSquare size={18} />
        </button>
      </td>
    </tr>
  );
};

const ChatSidebar = ({ task, user, messages, onClose }) => {
  const scrollRef = useRef(null);
  const [text, setText] = useState("");

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-[100] border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-300">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <h3 className="text-sm font-bold text-slate-900">{task.taskTitle}</h3>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Team Discussion</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg transition-colors italic text-xs font-bold text-slate-400">Esc</button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.senderId === user.uid ? "items-end" : "items-start"}`}>
            <span className="text-[9px] font-bold text-slate-400 mb-1 px-1 capitalize">{m.senderName}</span>
            <div className={`max-w-[85%] p-3 rounded-xl text-sm ${
              m.senderId === user.uid ? "bg-indigo-600 text-white rounded-tr-none" : "bg-slate-100 text-slate-800 rounded-tl-none"
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 border-t border-slate-100 bg-white">
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
          <input 
            className="flex-1 bg-transparent border-none outline-none px-3 text-sm py-1.5"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 shadow-sm transition-all"><FiChevronRight /></button>
        </div>
      </div>
    </div>
  );
};

const LoadingState = () => (
  <div className="h-screen w-full flex items-center justify-center bg-white">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Initializing...</span>
    </div>
  </div>
);

export default AdminMain;