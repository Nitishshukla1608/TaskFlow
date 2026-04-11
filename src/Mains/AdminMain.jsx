import React, { useState, useRef, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { 
  FiPlus, FiSearch, FiMoreHorizontal, 
  FiMessageSquare, FiChevronRight, FiUser,
  FiArrowUpRight, FiMaximize2, FiX, FiCheckCircle, FiClock, FiActivity, FiTrash2, FiSend, FiEdit2
} from "react-icons/fi";
import { setMessages, clearMessages } from "../Context/ChatContext";
import { subscribeToMessages, sendMessage, updateMessage, deleteMessage } from "../Services/messageService";

const AdminMain = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const tasks = useSelector((state) => state.auth.tasks || []);
  const members = useSelector((state) => state.auth.members || []);
  const messages = useSelector((state) => state.chatList?.messages || []);

  // UI State
  const [view, setView] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [expandedMetric, setExpandedMetric] = useState(null);

  // Derived Data
  const stats = useMemo(() => ({
    total: tasks.length,
    active: tasks.filter(t => t.status === "In Progress").length,
    completed: tasks.filter(t => t.status === "Completed").length,
    pending: tasks.filter(t => t.status === "Pending" || t.status === "Assigned").length,
  }), [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesSearch = t.taskTitle?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            t.assignedToName?.toLowerCase().includes(searchQuery.toLowerCase());
      if (view === "all") return matchesSearch;
      return matchesSearch && t.status?.toLowerCase().replace(" ", "") === view;
    });
  }, [tasks, searchQuery, view]);

  // Real-time Chat Subscription
  useEffect(() => {
    if (chatOpen && selectedTask?.id) {
      const unsubscribe = subscribeToMessages(selectedTask.id, (msgs) => {
        dispatch(setMessages(msgs));
      });
      return () => unsubscribe();
    }
  }, [chatOpen, selectedTask, dispatch]);

  if (!user) return <LoadingState />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased">
      {/* 1. TOP UTILITY BAR */}
      <div className="sticky top-0 z-[100] bg-white/70 backdrop-blur-xl border-b border-slate-200/60 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Workspace Control</h1>
          <nav className="flex items-center bg-slate-100/50 p-1 rounded-xl border border-slate-200/50">
            {["all", "progress", "completed", "pending"].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${
                  view === v ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {v}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link to="add-user" className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-white hover:shadow-sm rounded-lg text-sm font-medium border border-slate-200 transition-all">
            <FiUser size={16} /> <FiPlus size={14} /> 
          </Link>
          <Link to="create-task" className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">
            <FiPlus /> New Task
          </Link>
        </div>
      </div>

      <main className="p-8 max-w-[1600px] mx-auto">
        {/* 2. ANALYTICS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <MetricCard label="Total Projects" value={stats.total} trend="+12% month" onMaximize={() => setExpandedMetric({ label: 'Total Projects', data: tasks })} />
          <MetricCard label="In Flight" value={stats.active} trend="Active" color="text-amber-500" onMaximize={() => setExpandedMetric({ label: 'Active Projects', data: tasks.filter(t => t.status === "In Progress") })} />
          <MetricCard label="Completed" value={stats.completed} trend="98% success" color="text-emerald-500" onMaximize={() => setExpandedMetric({ label: 'Completed Projects', data: tasks.filter(t => t.status === "Completed") })} />
          <MetricCard label="Team Size" value={members.length} trend="85% capacity" onMaximize={() => setExpandedMetric({ label: 'Team Members', data: members })} />
        </div>

        {/* 3. TASK TABLE */}
        <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-4">
            <div className="relative w-full max-w-sm">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search projects..."
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <th className="px-6 py-4">Project</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Assignee</th>
                  <th className="px-6 py-4">Deadline</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.map((task) => (
                  <TaskRow key={task.id} task={task} onOpenChat={() => { setSelectedTask(task); setChatOpen(true); }} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* OVERLAYS */}
      {chatOpen && selectedTask && (
        <ChatSidebar 
          task={selectedTask} 
          user={user} 
          messages={messages} 
          onClose={() => { setChatOpen(false); dispatch(clearMessages()); }} 
        />
      )}

      {expandedMetric && (
        <MetricModal metric={expandedMetric} onClose={() => setExpandedMetric(null)} />
      )}
    </div>
  );
};

/* --- ENHANCED CHAT SIDEBAR --- */
/* --- UPDATED CHAT SIDEBAR (Right-aligned Auth User / Left-aligned Assignee) --- */
const ChatSidebar = ({ task, user, messages, onClose }) => {
  const scrollRef = useRef(null);
  const [text, setText] = useState("");
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!text.trim()) return;
    try {
      if (editingMessage) {
        await updateMessage(task.id, editingMessage.id, text.trim());
        setEditingMessage(null);
      } else {
        await sendMessage(task.id, {
          text: text.trim(),
          senderId: user.uid,
          senderName: user.displayName || "Admin",
          timestamp: new Date()
        });
      }
      setText("");
    } catch (err) { console.error(err); }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-[420px] bg-white shadow-2xl z-[500] border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <FiMessageSquare size={20} />
          </div>
          <div>
            <h3 className="text-[13px] font-bold text-slate-900 leading-tight">
              {isSelectionMode ? `${selectedIds.length} Selected` : task.taskTitle}
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              Chatting with {task.assignedToName}
              <p> {task.id}</p>
            </p>
          </div>
        </div>
        <button onClick={onClose} className="p-2.5 text-slate-400 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all">
          <FiX size={18}/>
        </button>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FDFDFD]" style={{ scrollbarWidth: 'none' }}>
        {messages.map((m) => {
          const isMe = m.senderId === user.uid; // Logged in user
          const isSelected = selectedIds.includes(m.id);
          
          return (
            <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
              {/* Name Tag - Only show for other users */}
              {!isMe && (
                <span className="text-[10px] font-extrabold text-slate-400 mb-1.5 ml-1 uppercase tracking-tighter">
                  {m.senderName.split(" ")[0]}
                </span>
              )}
              
              <div className={`flex items-center gap-2 max-w-[85%] ${isMe ? "flex-row" : "flex-row-reverse"}`}>
                {/* Checkbox for Selection Mode */}
                {isSelectionMode && (
                  <input 
                    type="checkbox" 
                    checked={isSelected} 
                    onChange={() => toggleSelect(m.id)} 
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                  />
                )}

                <div className="relative group">
                  <div 
                    onDoubleClick={() => { setIsSelectionMode(true); toggleSelect(m.id); }}
                    className={`p-3.5 rounded-2xl text-[13px] font-medium leading-relaxed transition-all shadow-sm ${
                      isSelected ? "ring-2 ring-indigo-500 ring-offset-2" : ""
                    } ${
                      isMe 
                        ? "bg-indigo-600 text-white rounded-tr-none shadow-indigo-100" 
                        : "bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-slate-100"
                    }`}
                  >
                    {m.text}
                  </div>

                  {/* Menu Button (Only for my messages) */}
                  {isMe && !isSelectionMode && (
                    <button 
                      onClick={() => setActiveMenuId(activeMenuId === m.id ? null : m.id)}
                      className="absolute -left-8 top-1/2 -translate-y-1/2 p-1 text-slate-300 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <FiMoreHorizontal size={14}/>
                    </button>
                  )}
                </div>
              </div>

              {/* Edit/Delete Dropdown */}
              {activeMenuId === m.id && (
                <div className="mt-2 bg-white border border-slate-200 shadow-xl rounded-xl py-1 z-50 w-28 animate-in fade-in zoom-in-95">
                  <button onClick={() => { setEditingMessage(m); setText(m.text); setActiveMenuId(null); }} className="w-full text-left px-3 py-2 text-[11px] font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                    <FiEdit2 size={12}/> Edit
                  </button>
                  <button onClick={async () => { if(window.confirm("Delete?")) await deleteMessage(task.id, m.id); setActiveMenuId(null); }} className="w-full text-left px-3 py-2 text-[11px] font-bold text-red-500 hover:bg-red-50 flex items-center gap-2">
                    <FiTrash2 size={12}/> Delete
                  </button>
                </div>
              )}
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white border-t border-slate-100">
        {editingMessage && (
          <div className="mb-3 flex items-center justify-between bg-indigo-50 p-2 rounded-lg border-l-4 border-indigo-500">
            <p className="text-[10px] font-bold text-indigo-700 px-2 uppercase">Editing your message</p>
            <button onClick={() => { setEditingMessage(null); setText(""); }} className="text-indigo-600 p-1"><FiX size={12}/></button>
          </div>
        )}
        
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input 
            className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all"
            placeholder="Type a response..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button type="submit" disabled={!text.trim()} className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 shadow-lg shadow-indigo-100 transition-all">
            {editingMessage ? <FiCheckCircle size={18} /> : <FiSend size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
};


/* --- Generic Metric Components --- */
const MetricCard = ({ label, value, trend, color = "text-slate-900", onMaximize }) => (
  <div className="group bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-200 transition-all relative">
    <button onClick={onMaximize} className="absolute top-4 right-4 p-2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
      <FiMaximize2 size={14} />
    </button>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <h3 className={`text-2xl font-black ${color}`}>{value}</h3>
    <div className="flex items-center gap-1.5 mt-2">
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
      <p className="text-[11px] font-medium text-slate-400">{trend}</p>
    </div>
  </div>
);

const TaskRow = ({ task, onOpenChat }) => (
  <tr className="hover:bg-slate-50/50 transition-colors group cursor-default">
    <td className="px-6 py-4">
      <div className="flex flex-col">
        <span className="text-[13px] font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{task.taskTitle}</span>
        <span className="text-[10px] text-slate-400 font-mono tracking-tighter">REF-{task.id?.substring(0, 8).toUpperCase()}</span>
      </div>
    </td>
    <td className="px-6 py-4">
      <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
        task.status === "Completed" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : 
        task.status === "In Progress" ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-slate-50 text-slate-500 border border-slate-100"
      }`}>
        {task.status || "Pending"}
      </span>
    </td>
    <td className="px-6 py-4">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 border border-slate-200">
          {task.assignedToName?.charAt(0)}
        </div>
        <span className="text-[12px] font-semibold text-slate-600">{task.assignedToName}</span>
      </div>
    </td>
    <td className="px-6 py-4 text-[12px] font-medium text-slate-400 italic">{task.completionDate || "Open Deadline"}</td>
    <td className="px-6 py-4 text-right">
      <button onClick={onOpenChat} className="p-2.5 text-slate-300 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-xl transition-all">
        <FiMessageSquare size={18} />
      </button>
    </td>
  </tr>
);

const MetricModal = ({ metric, onClose }) => (
  <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
    <div className="bg-white w-full max-w-2xl max-h-[80vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
      <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">{metric.label}</h2>
        <button onClick={onClose} className="p-2.5 hover:bg-slate-50 rounded-xl transition-all"><FiX size={20} /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-8 space-y-3">
        {metric.data.map((item, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-2xl hover:border-indigo-200 transition-all">
            <div className="text-sm font-bold text-slate-700">{item.taskTitle || item.name}</div>
            <FiChevronRight className="text-slate-300" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const LoadingState = () => (
  <div className="h-screen w-full flex items-center justify-center bg-white">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-[3px] border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Syncing Environment</span>
    </div>
  </div>
);

export default AdminMain;