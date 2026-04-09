import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  FiClock, FiCheckCircle, FiActivity, FiLayers, 
  FiMaximize2, FiX, FiCalendar, FiEdit3, 
  FiLoader, FiSend, FiMessageSquare, FiUsers, FiSave 
} from "react-icons/fi";
import { MdReply } from "react-icons/md";
import { setMessages, clearMessages } from "../Context/ChatContext";
import { subscribeToMessages, sendMessage } from "../Services/message";
import { updateTaskStatus } from "../Services/taskService";

/**
 * @component EmployeeDashboard
 * @description Enterprise-grade Task & Communication Management Interface
 */
function EmployeeDashboard() {
  const dispatch = useDispatch();
  const scrollRef = useRef(null);

  // --- Redux State ---
  const user = useSelector((state) => state.auth.user);
  const tasks = useSelector((state) => state.auth.tasks || []);
  const messages = useSelector((state) => state.chatList?.messages || []);

  // --- UI State ---
  const [focusedCategory, setFocusedCategory] = useState(null); // For the "Maximize" feature
  const [activeTask, setActiveTask] = useState(null);           // For detailed view
  const [isEditMode, setIsEditMode] = useState(false);          // For status update modal
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatTask, setChatTask] = useState(null);
  
  const [localStatus, setLocalStatus] = useState("");
  const [messageText, setMessageText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // --- Memoized Analytics ---
  const stats = useMemo(() => {
    const pending = tasks.filter(t => ["Pending", "Assigned"].includes(t.status) || !t.status);
    const active = tasks.filter(t => ["In Progress", "Blocked", "Under Review"].includes(t.status));
    const completed = tasks.filter(t => t.status === "Completed");
    
    return {
      "Total Assigned": { count: tasks.length, data: tasks, color: "slate", icon: <FiLayers /> },
      "Pending": { count: pending.length, data: pending, color: "rose", icon: <FiClock /> },
      "Active": { count: active.length, data: active, color: "amber", icon: <FiActivity /> },
      "Completed": { count: completed.length, data: completed, color: "emerald", icon: <FiCheckCircle /> }
    };
  }, [tasks]);

  // --- Messaging Logic ---
  useEffect(() => {
    if (!chatTask) return;
    const unsubscribe = subscribeToMessages(chatTask.taskId, (msgs) => dispatch(setMessages(msgs)));
    return () => { unsubscribe(); dispatch(clearMessages()); };
  }, [chatTask, dispatch]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !chatTask) return;
    try {
      await sendMessage(chatTask.taskId, {
        text: messageText,
        senderId: user.uid,
        senderName: user.name,
      });
      setMessageText("");
    } catch (err) { console.error("Sync Error:", err); }
  };

  const handleUpdateStatus = async () => {
    if (!activeTask || !localStatus) return;
    setIsProcessing(true);
    try {
      await updateTaskStatus(activeTask.taskId, localStatus);
      setIsEditMode(false);
      setActiveTask(null);
    } catch (err) { alert("Status sync failed."); }
    finally { setIsProcessing(false); }
  };

  if (!user) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased">
      <div className="max-w-[1600px] mx-auto p-6 lg:p-10">
        
        {/* Top Header */}
        <header className="mb-10">
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Operational Console</h1>
          <p className="text-slate-500 text-sm font-medium">Internal Management Hub • {user.name}</p>
        </header>

        {/* Metric Grid (The Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {Object.entries(stats).map(([label, info]) => (
            <MetricCard 
              key={label}
              label={label}
              value={info.count}
              icon={info.icon}
              color={info.color}
              onMaximize={() => setFocusedCategory(label)}
            />
          ))}
        </div>

        {/* Main Task Ledger */}
        <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Primary Task Feed</h2>
            <button 
              onClick={() => setFocusedCategory("Total Assigned")}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1.5"
            >
              EXPAND VIEW <FiMaximize2 size={12}/>
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <th className="px-6 py-4">Reference</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Owner</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {tasks.slice(0, 6).map((task) => (
                  <TaskRow 
                    key={task.taskId} 
                    task={task} 
                    onOpen={() => setActiveTask(task)}
                    onChat={() => { setChatTask(task); setIsChatOpen(true); }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* --- OVERLAYS --- */}

      {/* Maximize Stat Modal */}
      {focusedCategory && (
        <CategoryModal 
          title={focusedCategory}
          tasks={stats[focusedCategory].data}
          onClose={() => setFocusedCategory(null)}
          onSelectTask={(t) => { setFocusedCategory(null); setActiveTask(t); }}
        />
      )}

      {/* Task Deep-Dive Modal */}
      {activeTask && !isEditMode && (
        <DetailModal 
          task={activeTask} 
          onClose={() => setActiveTask(null)} 
          onEdit={() => { setLocalStatus(activeTask.status); setIsEditMode(true); }}
        />
      )}

      {/* Status Update Modal */}
      {isEditMode && (
        <StatusModal 
          selection={localStatus}
          setSelection={setLocalStatus}
          onClose={() => setIsEditMode(false)}
          onSave={handleUpdateStatus}
          loading={isProcessing}
        />
      )}

      {/* Professional Chat Sidebar */}
      <ChatSidebar 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        task={chatTask}
        messages={messages}
        userId={user.uid}
        input={messageText}
        setInput={setMessageText}
        onSend={handleSendMessage}
        scrollRef={scrollRef}
      />
    </div>
  );
}

/* --- SUB-COMPONENTS --- */

const MetricCard = ({ label, value, icon, color, onMaximize }) => {
  const colors = {
    slate: "bg-slate-800 text-white",
    rose: "bg-white text-rose-600 border-slate-200",
    amber: "bg-white text-amber-600 border-slate-200",
    emerald: "bg-white text-emerald-600 border-slate-200"
  };

  return (
    <div className={`group relative p-6 rounded-xl border transition-all hover:shadow-md ${colors[color]}`}>
      <div className="flex justify-between items-start">
        <div className={`p-2 rounded-lg ${color === 'slate' ? 'bg-white/10' : 'bg-slate-50'}`}>{icon}</div>
        <button onClick={onMaximize} className="p-1 opacity-0 group-hover:opacity-100 hover:bg-black/5 rounded transition-all">
          <FiMaximize2 size={14} />
        </button>
      </div>
      <div className="mt-4">
        <p className={`text-[10px] font-bold uppercase tracking-widest ${color === 'slate' ? 'text-slate-400' : 'text-slate-400'}`}>{label}</p>
        <h3 className="text-3xl font-bold mt-1 tracking-tight">{value}</h3>
      </div>
    </div>
  );
};

const TaskRow = ({ task, onOpen, onChat }) => (
  <tr className="hover:bg-slate-50/80 transition-colors group cursor-pointer" onClick={onOpen}>
    <td className="px-6 py-4">
      <div className="text-sm font-semibold text-slate-700">{task.taskTitle}</div>
      <div className="text-[10px] font-mono text-slate-400 uppercase">{task.taskId?.substring(0,8)}</div>
    </td>
    <td className="px-6 py-4"><span className="text-[10px] font-bold px-2 py-1 rounded bg-slate-100 text-slate-500 uppercase">{task.category || "General"}</span></td>
    <td className="px-6 py-4">
      <span className="text-[10px] font-bold px-2 py-1 rounded-full border border-slate-200 text-slate-600 bg-white uppercase">
        {task.status || "Assigned"}
      </span>
    </td>
    <td className="px-6 py-4 text-sm font-medium text-slate-500">{task.assignedByName || "Admin"}</td>
    <td className="px-6 py-4 text-right">
      <button 
        onClick={(e) => { e.stopPropagation(); onChat(); }}
        className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
      >
        <FiMessageSquare size={18} />
      </button>
    </td>
  </tr>
);

const CategoryModal = ({ title, tasks, onClose, onSelectTask }) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
    <div className="bg-white w-full max-w-5xl h-[85vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
      <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">{title} Archive</h2>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg"><FiX size={20}/></button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left">
          <tbody className="divide-y divide-slate-50">
            {tasks.map(t => <TaskRow key={t.taskId} task={t} onOpen={() => onSelectTask(t)} />)}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const DetailModal = ({ task, onClose, onEdit }) => (
  <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
    <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl animate-in slide-in-from-bottom-4">
      <div className="p-6 border-b flex justify-between items-center">
        <h3 className="font-bold text-slate-800">Task Intelligence</h3>
        <button onClick={onEdit} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><FiEdit3 /></button>
      </div>
      <div className="p-8 space-y-6">
        <div>
          <h4 className="text-2xl font-bold text-slate-900 tracking-tight">{task.taskTitle}</h4>
          <span className="text-[10px] font-mono text-slate-400 mt-1 block uppercase">ID: {task.taskId}</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Status</p>
            <p className="text-sm font-semibold text-slate-700">{task.status || "Pending"}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Due Date</p>
            <p className="text-sm font-semibold text-slate-700">{task.completionDate || "Undefined"}</p>
          </div>
        </div>
        <button onClick={onClose} className="w-full py-3 bg-slate-900 text-white font-bold text-xs rounded-lg tracking-widest hover:bg-indigo-600 transition-all">DISMISS</button>
      </div>
    </div>
  </div>
);

const StatusModal = ({ selection, setSelection, onClose, onSave, loading }) => (
  <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
    <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-2xl">
      <h3 className="text-lg font-bold mb-6 text-slate-800">Change Lifecycle State</h3>
      <div className="space-y-2 mb-8">
        {["Pending", "In Progress", "Under Review", "Completed"].map(s => (
          <button 
            key={s} 
            onClick={() => setSelection(s)}
            className={`w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition-all ${selection === s ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 hover:bg-slate-50'}`}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 py-3 text-sm font-bold text-slate-400">Cancel</button>
        <button onClick={onSave} className="flex-1 py-3 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-lg flex items-center justify-center gap-2">
          {loading ? <FiLoader className="animate-spin" /> : <FiSave />} Commit
        </button>
      </div>
    </div>
  </div>
);

const ChatSidebar = ({ isOpen, onClose, task, messages, userId, input, setInput, onSend, scrollRef }) => {
  if (!isOpen || !task) return null;
  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-[400] flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-800">{task.taskTitle}</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Internal Thread</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg"><FiX /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
        {messages.map((m, i) => {
          const isMe = m.senderId === userId;
          return (
            <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] p-3.5 rounded-xl text-sm shadow-sm ${isMe ? "bg-indigo-600 text-white" : "bg-white border border-slate-100 text-slate-700"}`}>
                <p>{m.text}</p>
                <span className={`text-[8px] font-bold mt-2 block uppercase ${isMe ? "text-indigo-200" : "text-slate-400"}`}>
                   {m.senderName} • Just now
                </span>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex gap-2">
          <input 
            className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
            placeholder="Write a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSend()}
          />
          <button onClick={onSend} className="p-3.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">
            <FiSend size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="h-screen w-full flex items-center justify-center bg-white">
    <FiLoader className="animate-spin text-indigo-600" size={32} />
  </div>
);

export default EmployeeDashboard;