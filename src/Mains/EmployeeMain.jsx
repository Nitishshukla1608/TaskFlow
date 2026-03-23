import React, { useState, useEffect, useRef } from "react"; // Fixed: Added useRef
import { useSelector, useDispatch } from "react-redux";
import { MdReply } from "react-icons/md";
import { 
  FiClock, FiCheckCircle, FiActivity, FiLayers, 
  FiMaximize2, FiX, FiMoreVertical, FiCalendar,
  FiEdit2, FiUsers, FiSave, FiLoader 
} from "react-icons/fi";
import { setMessages, clearMessages } from "../Context/ChatContext";
import { updateTaskStatus, subscribeToMessages, sendMessage } from "../Services/authService";

function EmployeeMain() {
  const user = useSelector((state) => state.auth.user);
  const tasks = useSelector((state) => state.auth.tasks || []);
  const messages = useSelector((state) => state.chatList?.messages || []);

  const scrollRef = useRef(null);
  const dispatch = useDispatch();

  // --- States ---
  const [localStatus, setLocalStatus] = useState("");
  const [showAllModal, setShowAllModal] = useState(false);
  const [modalFilter, setModalFilter] = useState("Total Assigned");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [msgPop, setMsgPop] = useState(false);
  const [text, setText] = useState("");
  const [msgError, setMsgError] = useState("");
  const [msgTask, setMsgTask] = useState(null);

  // --- Filtering Logic ---
  const pendingTasks = tasks.filter(t => t.status === "Pending" || t.status === "Assigned" || !t.status);
  const inProgressTasks = tasks.filter(t => ["In Progress", "Blocked", "Under Review"].includes(t.status));
  const completedTasks = tasks.filter(t => t.status === "Completed");

  // --- Auto-scroll Effect ---
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // --- Message Subscription ---
  useEffect(() => {
    if (!msgTask) return;
  
    const unsubscribe = subscribeToMessages(msgTask.taskId, (msgs) => {
      dispatch(setMessages(msgs)); 
    });
  
    return () => {
      unsubscribe();
      dispatch(clearMessages()); 
    };
  }, [msgTask, dispatch]);

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-600"></div>
      </div>
    );
  }

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

  const handleSend = async () => {
    if (!text.trim()) return setMsgError("Type something first!");
  
    const msgData = {
      text: text,
      senderId: user.uid,
      senderName: user.name,
    };
  
    try {
      await sendMessage(msgTask.taskId, msgData);
      setText("");
      setMsgError("");
    } catch (error) {
      setMsgError("Message not sent");
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

      {/* 2. Message Popup */}
      {msgPop && msgTask && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300" 
            onClick={() => { setMsgPop(false); setMsgTask(null); dispatch(clearMessages()); }}
          />

          <div className="relative w-full max-w-lg h-[87vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-slate-100 animate-in zoom-in-95 duration-200">
            
            {/* Header Section */}
            <div className="p-6 border-b border-slate-50 bg-white/95 backdrop-blur-md sticky top-0 z-10">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1.5">
                  <h2 className="font-black text-lg text-slate-800 tracking-tight leading-none">
                    {msgTask.taskTitle}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[8px] font-black text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md uppercase tracking-widest">
                      ID: {msgTask.taskId?.substring(0,8) || "N/A"}
                    </span>
                    <span className="text-[8px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-widest">
                      By: {msgTask.assignedByName || "Admin"}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => { setMsgPop(false); setMsgTask(null); dispatch(clearMessages()); }}
                  className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl transition-all"
                >
                  <FiX size={18} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div 
              className="flex-1 overflow-y-auto px-5 py-4 bg-[#fafbff] space-y-6 scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <style dangerouslySetInnerHTML={{ __html: `.scrollbar-hide::-webkit-scrollbar { display: none; }`}} />

              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-slate-300 opacity-50">
                  <FiActivity size={28} className="mb-3 animate-pulse" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No messages yet</p>
                </div>
              )}

              {messages.map((message, index) => {
                const isMe = message.senderId === user.uid;
                const msgDate = message.createdAt?.toDate ? message.createdAt.toDate() : new Date();
                const showDate = index === 0 || msgDate.toDateString() !== (messages[index-1].createdAt?.toDate ? messages[index-1].createdAt.toDate().toDateString() : "");

                return (
                  <div key={message.id || index}>
                    {showDate && (
                      <div className="flex items-center justify-center my-6">
                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">
                          {msgDate.toDateString()}
                        </span>
                      </div>
                    )}

                    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[85%]`}>
                        {!isMe && (
                          <span className="text-[9px] font-black text-slate-400 mb-1 ml-1 uppercase">
                            {message.senderName}
                          </span>
                        )}
                        <div className={`p-3.5 rounded-[1.2rem] shadow-sm border ${isMe ? "bg-indigo-600 border-indigo-500 text-white rounded-tr-none" : "bg-white border-slate-100 text-slate-700 rounded-tl-none"}`}>
                          <p className="text-[12px] leading-relaxed font-medium">{message.text}</p>
                          <div className={`text-[7px] font-black mt-1.5 uppercase ${isMe ? "text-indigo-200" : "text-slate-400"}`}>
                            {msgDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {/* ✨ THE SCROLL ANCHOR */}
              <div ref={scrollRef} />
            </div>

            {/* Input Section - Correctly placed outside of the message list */}
            <div className="p-5 bg-white border-t border-slate-50">
              <div className="relative flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-indigo-500/5 focus:bg-white outline-none transition-all placeholder:text-slate-400"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <button
                  disabled={!text.trim() || isSaving}
                  onClick={handleSend}
                  className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all ${text.trim() ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:scale-105" : "bg-slate-50 text-slate-300 border border-slate-100"}`}
                >
                  {isSaving ? <FiLoader className="animate-spin" size={18} /> : (
                    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 transform rotate-45 -translate-x-0.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  )}
                </button>
              </div>
              {msgError && <p className="mt-2 text-[10px] font-black text-rose-500 uppercase ml-1 tracking-widest">{msgError}</p>}
            </div>
          </div>
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
                <TaskRow key={task.taskId || task.id} task={task} onSelect={setSelectedTask} setMsgPop={setMsgPop} setMsgTask={setMsgTask} />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. Filter Modal */}
      {showAllModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowAllModal(false)} />
          <div className="relative w-full max-w-6xl h-[85vh] bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border border-slate-100">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">{modalFilter} Tasks</h2>
                <p className="text-xs text-slate-400 font-bold uppercase mt-1">Full list of filtered items</p>
              </div>
              <button onClick={() => setShowAllModal(false)} className="p-3 bg-white text-slate-400 hover:text-rose-500 rounded-2xl shadow-sm transition-all"><FiX size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <table className="w-full text-left border-collapse">
                <tbody className="divide-y divide-slate-50">
                  {getFilteredTasks().map((task) => (
                    <TaskRow key={task.taskId || task.id} task={task} onSelect={setSelectedTask} setMsgPop={setMsgPop} setMsgTask={setMsgTask} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. Edit Status Modal */}
      {isEditModalOpen && selectedTask && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-8 shadow-2xl border-t-8 border-indigo-600">
            <h2 className="text-2xl font-black text-slate-800 mb-6 tracking-tight">Update Status</h2>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {["Pending", "In Progress", "Under Review", "Completed"].map((opt) => (
                <button key={opt} onClick={() => setLocalStatus(opt)} className={`py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${localStatus === opt ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-indigo-200'}`}>{opt}</button>
              ))}
            </div>
            <div className="flex gap-3">
              <button className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
              <button onClick={handleUpdateStatus} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg">
                {isSaving ? <FiLoader className="animate-spin" /> : <FiSave />} Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Task Detail View */}
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

/* ---------- SUB-COMPONENTS ---------- */

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

function TaskRow({ task, onSelect, setMsgPop, setMsgTask }) {
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
              e.stopPropagation();
              setMsgPop(true);
              setMsgTask(task);
            }}
            className="p-2 hover:bg-white text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100"
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