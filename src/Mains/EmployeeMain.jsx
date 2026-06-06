import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  FiClock, FiCheckCircle, FiActivity, FiLayers, 
  FiMaximize2, FiX, FiCalendar, FiEdit3, 
  FiLoader, FiSend, FiMessageSquare, FiSave, FiTag, 
  FiSearch, FiUsers
} from "react-icons/fi";
import { setMessages, clearMessages } from "../Context/ChatContext";
import { subscribeToMessages, sendMessage } from "../Services/messageService";
import { updateTaskStatus } from "../Services/taskService";

/**
 * @component EmployeeMain
 */
const EmployeeMain = () => {
  const dispatch = useDispatch();
  const scrollRef = useRef(null);

  // --- Redux State ---
  const user = useSelector((state) => state.auth.user);
  const tasks = useSelector((state) => state.auth.tasks || []);
  const messages = useSelector((state) => state.chatList?.messages || []);
  const members = useSelector((state) => state.auth.members || []);

  // --- UI State ---
  const [focusedCategory, setFocusedCategory] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatTask, setChatTask] = useState(null);
  const [localStatus, setLocalStatus] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // --- Analytics Logic ---
  const stats = useMemo(() => {
    const activeStatuses = ["In Progress", "Under Review", "Assigned", "Pending"];
    const active = tasks.filter(t => activeStatuses.includes(t.status));
    const completed = tasks.filter(t => t.status === "Completed");
    
    return {
      "Total Assigned": { count: tasks.length, data: tasks, color: "text-slate-900", icon: <FiLayers />, type: 'tasks' },
      "Active": { count: active.length, data: active, color: "text-amber-500", icon: <FiActivity />, type: 'tasks' },
      "Completed": { count: completed.length, data: completed, color: "text-emerald-500", icon: <FiCheckCircle />, type: 'tasks' },
      "Team": { count: members.length, data: members, color: "text-indigo-600", icon: <FiUsers />, type: 'members' }
    };
  }, [tasks, members]);

  // --- Messaging Subscription ---
  useEffect(() => {
    if (!chatTask?.taskId) return;
    const unsubscribe = subscribeToMessages(chatTask.taskId, (msgs) => dispatch(setMessages(msgs)));
    return () => { 
      unsubscribe(); 
      dispatch(clearMessages()); 
    };
  }, [chatTask, dispatch]);

  const handleUpdateStatus = async () => {
    if (!activeTask?.taskId || !localStatus) return;
    setIsProcessing(true);
    try {
      await updateTaskStatus(activeTask.taskId, localStatus);
      setIsEditMode(false);
      setActiveTask(null);
    } catch (err) { 
      console.error("Status Update Error:", err);
    } finally { 
      setIsProcessing(false); 
    }
  };

  if (!user) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased">
      <header className="sticky top-0 z-[100] bg-white/70 backdrop-blur-xl border-b border-slate-200/60 px-8 py-4 flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Operational Console</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Employee Portal • {user.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center px-4 py-2 bg-slate-100 rounded-xl text-[12px] font-bold text-slate-500 border border-slate-200/50">
            <FiCalendar className="mr-2" /> {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </div>
      </header>

      <main className="p-8 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {Object.entries(stats).map(([label, info]) => (
            <MetricCard 
              key={label}
              label={label}
              value={info.count}
              color={info.color}
              icon={info.icon}
              onMaximize={() => setFocusedCategory(label)}
            />
          ))}
        </div>

        <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden mb-10">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FiClock className="text-indigo-600" /> Current Assignments
            </h2>
            <button onClick={() => setFocusedCategory("Total Assigned")} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-indigo-600 transition-all group">
              View Full History <FiMaximize2 className="group-hover:rotate-90 transition-transform" />
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
                  <th className="px-8 py-4">Deadline</th>
                  <th className="px-8 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {tasks.length === 0 ? (
                  <tr><td colSpan="6" className="px-8 py-16 text-center text-slate-400 italic font-medium">No assignments found.</td></tr>
                ) : (
                  tasks.slice(0, 8).map((task) => (
                    <TaskRow key={task.taskId} task={task} onOpen={() => setActiveTask(task)} onChat={(e) => { e.stopPropagation(); setChatTask(task); setIsChatOpen(true); }} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* --- MODALS --- */}
      {focusedCategory && (
        <ShowAllModal 
          title={focusedCategory}
          type={stats[focusedCategory].type}
          items={stats[focusedCategory].data}
          onClose={() => setFocusedCategory(null)}
          onSelectTask={(t) => { setFocusedCategory(null); setActiveTask(t); }}
          onChat={(t) => { setFocusedCategory(null); setChatTask(t); setIsChatOpen(true); }}
        />
      )}

      {activeTask && !isEditMode && (
        <DetailModal task={activeTask} onClose={() => setActiveTask(null)} onEdit={() => { setLocalStatus(activeTask.status || "Pending"); setIsEditMode(true); }} />
      )}

      {isEditMode && (
        <StatusModal selection={localStatus} setSelection={setLocalStatus} onClose={() => setIsEditMode(false)} onSave={handleUpdateStatus} loading={isProcessing} />
      )}

      <ChatSidebar isOpen={isChatOpen} onClose={() => { setIsChatOpen(false); setChatTask(null); }} task={chatTask} messages={messages} user={user} scrollRef={scrollRef} />
    </div>
  );
};

/* --- SUB-COMPONENTS --- */

const MetricCard = ({ label, value, color, icon, onMaximize }) => (
  <div className="group bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm hover:shadow-md hover:border-indigo-200 transition-all relative">
    <button onClick={onMaximize} className="absolute top-4 right-4 p-2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
      <FiMaximize2 size={14} />
    </button>
    <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mb-4 transition-colors group-hover:bg-indigo-50 ${color}`}>
      {icon}
    </div>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <h3 className={`text-2xl font-black ${color}`}>{value}</h3>
  </div>
);

const TaskRow = ({ task, onOpen, onChat }) => (
  <tr className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={onOpen}>
    <td className="px-8 py-5">
      <div className="flex flex-col">
        <span className="text-[13.4px] font-bold text-slate-500 group-hover:text-indigo-600 transition-colors">{task.taskTitle || task.title}</span>
        <span className="text-[12px] font-bold text-slate-600 tracking-tighter uppercase">ID: {task.taskId?.substring(0, 12)}</span>
      </div>
    </td>
    <td className="px-8 py-5 text-[12px] font-bold text-slate-500">{task.category || "General"}</td>
    <td className="px-8 py-5">
      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${
        task.status === "Completed" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
      }`}>
        {task.status || "Assigned"}
      </span>
    </td>
    <td className="px-8 py-5 flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold">{task.assignedByName?.charAt(0)}</div>
      <span className="text-[12px] font-semibold text-slate-600">{task.assignedByName}</span>
    </td>
    <td className="px-8 py-5 text-[12px] font-bold text-slate-500">{task.deadline || "No Date"}</td>
    <td className="px-8 py-5 text-right">
      <button onClick={onChat} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><FiMessageSquare size={18} /></button>
    </td>
  </tr>
);

const ShowAllModal = ({ title, items, type, onClose, onSelectTask, onChat }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = useMemo(() => {
    return items.filter(item => {
      if (type === 'tasks') {
        const matchesSearch = (item.taskTitle || item.title || "").toLowerCase().includes(searchTerm.toLowerCase()) || (item.taskId || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filter === "All" ? true : item.status === filter;
        return matchesSearch && matchesStatus;
      }
      return (item.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || (item.role || "").toLowerCase().includes(searchTerm.toLowerCase())  || (item.uid || "").toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [items, searchTerm, filter, type]);

  const getBorderColor = () => {
    if (type === 'members') return "border-indigo-200";
    if (filter === "Completed" || title === "Completed") return "border-emerald-400";
    return "border-amber-400";
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-[#F8FAFC] w-full max-w-6xl h-[750px] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-8 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-black text-slate-900">{title} Perspective</h2>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">{type === 'tasks' ? 'Workflows' : 'Team Directory'} • {filtered.length} entries</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-rose-50 rounded-2xl transition-all text-slate-400"><FiX size={24} /></button>
        </div>
        <div className="px-8 py-5 bg-white border-b flex flex-wrap gap-4 items-center shrink-0">
          <div className="flex-1 min-w-[300px] relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>  
          {type === 'tasks' && (
            <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
              {["All", "Pending", "In Progress", "Under Review", "Completed"].map((s) => (
                <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${filter === s ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>{s}</button>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-8 bg-[#F8FAFC]">
          {filtered.length > 0 ? (
            <div className={`bg-white rounded-[2.5rem] border-2 transition-all duration-500 ${getBorderColor()} overflow-hidden shadow-sm`}>
              <table className="w-full text-left">
                <tbody className="divide-y divide-slate-50">
                  {type === 'tasks' ? filtered.map(t => <TaskRow key={t.taskId} task={t} onOpen={() => onSelectTask(t)} onChat={(e) => { e.stopPropagation(); onChat(t); }} />) 
                  : filtered.map(m => (
                    <tr key={m.uid} className="hover:bg-slate-50 transition-all">
                      <td className="px-8 py-5 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">{m.name?.charAt(0)}</div>
                        <div><p className="text-sm font-bold text-slate-800">{m.name}</p><p className="text-[10px] text-slate-400 font-bold uppercase">{m.role || 'Member'}</p></div>
                      </td>



                      <td className="px-8 py-5  items-center gap-4">
<div className="text-sm font-bold text-slate-400 uppercase">{m.position}</div>
                      </td>



                      <td className="px-8 py-5 text-right"><span className="text-[12px] font-bold text-slate-500">UID: {m.uid?.substring(0,12)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <div className="h-full flex flex-col items-center justify-center opacity-40 py-20 text-slate-400 font-bold"><FiSearch size={48} className="mb-4" /><p>No results found</p></div>}
        </div>
        <div className="px-8 py-4 bg-white border-t border-slate-100 flex justify-end shrink-0">
          <button onClick={onClose} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[11px] font-black tracking-widest hover:bg-indigo-600 transition-colors">CLOSE VIEW</button>
        </div>
      </div>
    </div>
  );
};

const DetailModal = ({ task, onClose, onEdit }) => (
  <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
    <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
      <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div className="flex flex-col gap-1">
          <h3 className="font-black text-slate-400 text-[12px] uppercase tracking-[0.15em]">Assignment Intelligence</h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
            <span className="font-bold text-indigo-600 text-[12px] tracking-tight">Issued by: {task.assignedByName}</span>
          </div>
        </div>
        <button onClick={onEdit} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[11px] font-black hover:bg-indigo-700 transition-all active:scale-95"><FiEdit3 size={14} /> UPDATE STATUS</button>
      </div>
      <div className="p-10 space-y-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 bg-slate-900 text-white text-[9px] font-black rounded-lg uppercase tracking-widest">Task</span>
            <span className="text-[10px] font-mono font-bold text-slate-300">UID: {task.assignedByUid?.substring(0, 12)}...</span>
          </div>
          <h4 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{task.taskTitle || task.title}</h4>
          <div className="mt-4 p-5 bg-slate-50/80 rounded-2xl border border-slate-100"><p className="text-[13px] text-slate-600 font-medium leading-relaxed">{task.description || "No specific instructions."}</p></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
            <p className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">Lifecycle State</p>
            <div className="flex items-center gap-2"><div className={`w-1.5 h-1.5 rounded-full ${task.status === 'Completed' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div><p className="text-sm font-black text-slate-700">{task.status || "Pending"}</p></div>
          </div>
          <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
            <p className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">Time Limit</p>
            <p className="text-sm font-black text-slate-700">{task.deadline || "ASAP"}</p>
          </div>
        </div>
        <button onClick={onClose} className="w-full py-4 bg-slate-900 text-white font-black text-[11px] rounded-2xl tracking-[0.2em] hover:bg-slate-800 transition-all">DISMISS PREVIEW</button>
      </div>
    </div>
  </div>
);

const StatusModal = ({ selection, setSelection, onClose, onSave, loading }) => (
  <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
    <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 shadow-2xl">
      <h3 className="text-lg font-black mb-6 text-slate-900">Mark Status</h3>
      <div className="space-y-2 mb-8">
        {["Pending", "In Progress", "Under Review", "Completed"].map(s => (
          <button key={s} onClick={() => setSelection(s)} className={`w-full text-left px-5 py-4 rounded-xl border text-sm font-bold transition-all flex justify-between items-center ${selection === s ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 text-slate-500'}`}>
            {s} {selection === s && <FiCheckCircle />}
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 py-4 text-xs font-black text-slate-400 uppercase">Cancel</button>
        <button onClick={onSave} disabled={loading} className="flex-1 py-4 bg-indigo-600 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 uppercase tracking-widest">{loading ? <FiLoader className="animate-spin" /> : <FiSave />} Commit</button>
      </div>
    </div>
  </div>
);

const ChatSidebar = ({ isOpen, onClose, task, messages, user, scrollRef }) => {
  const [text, setText] = useState("");
  useEffect(() => { if (isOpen) scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isOpen, scrollRef]);
  const handleSend = async (e) => {
    e?.preventDefault();
    if (!text.trim() || !task) return;
    try {
      await sendMessage(task.taskId, { text: text.trim(), senderId: user.uid, senderName: user.name, timestamp: new Date() });
      setText("");
    } catch (err) { console.error(err); }
  };
  if (!isOpen || !task) return null;
  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-[420px] bg-white shadow-2xl z-[400] flex flex-col border-l border-slate-200">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
        <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white"><FiMessageSquare size={20} /></div><div><h3 className="text-[13px] font-bold text-slate-900">{task.taskTitle || task.title}</h3><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Live Feedback</p></div></div>
        <button onClick={onClose} className="p-2.5 text-slate-400 hover:bg-slate-50 rounded-xl transition-all"><FiX size={18}/></button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FDFDFD]">
        {messages.map((m) => {
          const isMe = m.senderId === user.uid;
          return (
            <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
              <span className="text-[9px] font-bold text-slate-400 mb-1.5 px-1 uppercase tracking-tighter">{isMe?"You":m.senderName}</span>
              <div className={`max-w-[85%] p-3.5 rounded-2xl text-[13px] font-medium shadow-sm ${isMe ? "bg-indigo-600 text-white rounded-tr-none" : "bg-white border border-slate-100 text-slate-700 rounded-tl-none"}`}>{m.text}</div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>
      <form onSubmit={handleSend} className="p-6 bg-white border-t border-slate-100 flex gap-2">
        <input className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="Clarify something..." value={text} onChange={(e) => setText(e.target.value)} />
        <button type="submit" className="bg-indigo-600 text-white p-3.5 rounded-xl hover:bg-indigo-700 transition-all shadow-lg"><FiSend size={18} /></button>
      </form>
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="h-screen w-full flex items-center justify-center bg-white"><div className="flex flex-col items-center gap-4"><FiLoader className="animate-spin text-indigo-600" size={32} /><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Booting Dashboard</span></div></div>
);

export default EmployeeMain;