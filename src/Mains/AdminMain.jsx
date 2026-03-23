import React, { useState, useRef,useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { MdReply } from "react-icons/md";
import { 
  FiPlus, FiActivity, FiCheckCircle, FiClock, FiUsers, 
  FiMoreVertical, FiMaximize2, FiLayers, FiUserPlus, FiX,
  FiCopy, FiCheck, FiCalendar, FiLoader
} from "react-icons/fi";
import { setMessages, clearMessages } from "../Context/ChatContext";
import { subscribeToMessages, sendMessage } from "../Services/authService";

function AdminMain() {
  const user = useSelector((state) => state.auth.user);
  const tasks = useSelector((state) => state.auth.tasks || []); 
  const members = useSelector((state) => state.auth.members || []);
  const messages = useSelector((state) => state.chatList?.messages || []);


  const scrollRef = useRef(null);
  const dispatch = useDispatch();
  
  const [selectedTask, setSelectedTask] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [showAllModal, setShowAllModal] = useState(false);
  
  // Chat States
  const [msgPop, setMsgPop] = useState(false);
  const [text, setText] = useState("");
  const [msgTask, setMsgTask] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // --- 1. Message Subscription Effect ---
  useEffect(() => {
    if (!msgTask || !msgPop) return;

    const taskId = msgTask.taskId || msgTask.id;
    const unsubscribe = subscribeToMessages(taskId, (msgs) => {
      dispatch(setMessages(msgs));
    });

    return () => {
      unsubscribe();
      dispatch(clearMessages());
    };
  }, [msgTask, msgPop, dispatch]);

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // --- 2. Handlers ---
  const handleSend = async () => {
    if (!text.trim() || !msgTask) return;
    
    setIsSaving(true);
    const taskId = msgTask.taskId || msgTask.id;
    const msgData = {
      text: text.trim(),
      senderId: user.uid,
      senderName: user.name,
      createdAt: new Date(), // Fallback for immediate UI
    };

    try {
      await sendMessage(taskId, msgData);
      setText("");
    } catch (error) {
      console.error("Message not sent", error);
    } finally {
      setIsSaving(false);
    }
  };

 

// Auto-scroll to bottom whenever messages change
useEffect(() => {
  if (scrollRef.current) {
    scrollRef.current.scrollIntoView({ behavior: "smooth" });
  }
}, [messages]); // Dependency array ensures this runs when a new message arrives

  // --- 3. Statistics Logic ---
  const inProgressTasks = tasks.filter((t) => t.status === "In Progress");
  const completedTasks = tasks.filter((t) => t.status === "Completed");
  const pendingTasks = tasks.filter((t) => t.status === "Pending" || t.status === "Assigned" || !t.status);

  const stats = [
    { id: 'total', title: "Total Tasks", value: tasks.length, icon: <FiLayers />, color: "bg-indigo-600", filteredTasks: tasks },
    { id: 'progress', title: "In Progress", value: inProgressTasks.length, icon: <FiActivity />, color: "bg-amber-500", filteredTasks: inProgressTasks },
    { id: 'completed', title: "Completed", value: completedTasks.length, icon: <FiCheckCircle />, color: "bg-emerald-500", filteredTasks: completedTasks },
    { id: 'pending', title: "Pending", value: pendingTasks.length, icon: <FiClock />, color: "bg-rose-500", filteredTasks: pendingTasks },
    { id: 'team', title: "Team Size", value: members.length, icon: <FiUsers />, color: "bg-violet-600", isTeam: true },
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
          <OverviewCard key={stat.id} {...stat} onMaximize={() => setActiveModal(stat)} />
        ))}
      </div>

   
{/* --- 💬 MODAL: CHAT UI --- */}

{msgPop && msgTask && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" 
            onClick={() => { setMsgPop(false); setMsgTask(null); dispatch(clearMessages()); }}
          />
          
          {/* Modal Container */}
          <div className="relative w-full max-w-lg h-[87vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-slate-100 animate-in zoom-in-95 duration-200">
            
            {/* Header Section */}
            <div className="p-5 border-b border-slate-50 bg-white/95 backdrop-blur-md sticky top-0 z-10">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <h2 className="font-black text-lg text-slate-800 tracking-tight leading-none">
                    {msgTask.taskTitle}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[8px] font-black text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md uppercase tracking-widest">
                      ID: {msgTask.taskId?.substring(0,8) || msgTask.id?.substring(0,8) || "N/A"}
                    </span>
                    <span className="text-[8px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-widest">
                      To: {msgTask.assignedToName || "Admin"}
                    </span>
                  </div>
                </div>
                <button 
                                   onClick={() => { setMsgPop(false); setMsgTask(null); dispatch(clearMessages()); }}
                  className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-2xl transition-all"
                >
                  <FiX size={18} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div 
              className="flex-1 overflow-y-auto px-4 py-4 bg-[#fafbff] space-y-6 scrollbar-hide" 
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <style dangerouslySetInnerHTML={{ __html: `.scrollbar-hide::-webkit-scrollbar { display: none; }`}} />
              
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-slate-300 opacity-50 py-10">
                  <FiActivity size={32} className="mb-3 animate-pulse" />
                  <p className="text-[11px] font-black uppercase tracking-widest">No history</p>
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
                        <div className="h-[1px] bg-slate-100 flex-1" />
                        <span className="mx-4 text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">
                          {msgDate.toDateString()}
                        </span>
                        <div className="h-[1px] bg-slate-100 flex-1" />
                      </div>
                    )}

                    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[88%]`}>
                        {!isMe && (
                          <span className="text-[9px] font-black text-slate-400 mb-1 ml-2 uppercase">
                            {message.senderName}
                          </span>
                        )}
                        <div className={`p-3.5 rounded-[1.2rem] shadow-sm border ${
                          isMe 
                            ? "bg-indigo-600 border-indigo-500 text-white rounded-tr-none" 
                            : "bg-white border-slate-100 text-slate-700 rounded-tl-none"
                        }`}>
                          <p className="text-[12px] leading-relaxed font-medium">
                            {message.text}
                          </p>
                          <div className={`text-[7px] font-black mt-1.5 uppercase ${isMe ? "text-indigo-200" : "text-slate-400"}`}>
                            {msgDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* ✨ THE SCROLL ANCHOR - Keeps the view at the bottom */}
              <div ref={scrollRef} />
            </div>

            {/* Input Bar Section */}
            <div className="p-4 bg-white border-t border-slate-50">
              <div className="relative flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type message..."
                  className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-indigo-500/5 focus:bg-white outline-none transition-all"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <button
                  disabled={!text.trim() || isSaving}
                  onClick={handleSend}
                  className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all ${
                    text.trim() 
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700" 
                      : "bg-slate-50 text-slate-300 border border-slate-100"
                  }`}
                >
                  {isSaving ? (
                    <FiLoader className="animate-spin" size={18} />
                  ) : (
                    <svg 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      className="w-5 h-5 transform rotate-45 -translate-x-0.5" 
                      stroke="currentColor" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Stats Detail Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setActiveModal(null)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[3rem] p-8 shadow-2xl flex flex-col max-h-[90vh]">
            <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-xl"><FiX size={24} /></button>
            <div className="flex items-center gap-4 mb-6">
              <div className={`p-4 rounded-2xl text-white ${activeModal.color} shadow-lg`}>{React.cloneElement(activeModal.icon, { size: 24 })}</div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{activeModal.title}</p>
                <h3 className="text-2xl font-black text-slate-800">{activeModal.value} Records</h3>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {activeModal.isTeam ? (
                members.map((m) => (
                  <div key={m.uid || m.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold">{m.name?.charAt(0)}</div>
                      <span className="font-bold text-slate-700">{m.name}</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase bg-white px-3 py-1 rounded-lg border border-slate-100">{m.role || 'Staff'}</span>
                  </div>
                ))
              ) : (
                activeModal.filteredTasks.map((t) => (
                  <div key={t.id} onClick={() => { setSelectedTask(t); setActiveModal(null); }} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/50 cursor-pointer mb-2 group transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-800 group-hover:text-indigo-600">{t.taskTitle}</h4>
                        <p className="text-[11px] text-slate-400 font-medium mt-1 uppercase">Due: {t.completionDate || "No Date"}</p>
                      </div>
                      <FiMaximize2 className="text-slate-300 group-hover:text-indigo-400" size={14} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Table Section */}
      <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden mt-10">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FiClock className="text-indigo-600" /> Recent Assignments
          </h2>
          <button onClick={() => setShowAllModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-indigo-600 transition-all">
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
                <th className="px-8 py-4">Assigned To</th>
                <th className="px-8 py-4">Deadline</th>
                <th className="px-8 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tasks.slice(0, 5).map((task) => (
                <TaskRow key={task.id || task.taskId} task={task} onSelect={setSelectedTask} setMsgTask={setMsgTask} setMsgPop={setMsgPop} />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Master Registry Modal */}
      {showAllModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowAllModal(false)} />
          <div className="relative w-full max-w-6xl h-[85vh] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">Master Registry</h2>
              <button onClick={() => setShowAllModal(false)} className="p-3 text-slate-400 hover:text-slate-600 rounded-2xl"><FiX size={24} /></button>
            </div>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-white z-10 shadow-sm">
                  <tr className="bg-slate-50/50 text-[11px] font-black uppercase tracking-widest text-slate-400">
                    <th className="px-8 py-4">Task Details</th>
                    <th className="px-8 py-4">Category</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4">Assigned To</th>
                    <th className="px-8 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {tasks.map((task) => (
                    <TaskRow key={task.id} task={task} onSelect={setSelectedTask} setMsgTask={setMsgTask} setMsgPop={setMsgPop} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Task Detail View Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="absolute inset-0 bg-slate-900/60" onClick={() => setSelectedTask(null)} />
          <div className="relative bg-white rounded-[2.5rem] max-w-md w-full shadow-2xl p-8 overflow-hidden">
            <div className="h-2 bg-indigo-600 absolute top-0 left-0 w-full" />
            <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
              {selectedTask.category || "General"}
            </span>
            <h3 className="text-2xl font-black text-slate-800 mt-4 leading-tight">{selectedTask.taskTitle}</h3>
            <p className="text-slate-500 text-sm italic mt-4 mb-6 leading-relaxed">"{selectedTask.description || "No specific instructions."}"</p>
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
              <InfoRow icon={<FiActivity />} label="Status" value={selectedTask.status} isStatus />
              <InfoRow icon={<FiCalendar />} label="Due" value={selectedTask.completionDate || "Not Set"} />
              <InfoRow icon={<FiUsers />} label="Target" value={selectedTask.assignedToName || "N/A"} />
            </div>
            <button onClick={() => setSelectedTask(null)} className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-indigo-600 transition-all">Close</button>
          </div>
        </div>
      )}

    </div>
  );
}

/* ---------- 🛠️ COMPONENTS & HELPERS ---------- */

const getFirstName = (name) => (name ? name.split(" ")[0] : "User");

function InfoRow({ icon, label, value, isStatus }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600">{React.cloneElement(icon, { size: 14 })}</div>
        <span className="text-[11px] font-bold uppercase text-slate-400">{label}</span>
      </div>
      {isStatus ? (
        <span className="text-xs font-black text-indigo-600 bg-white px-3 py-1 rounded-full border border-indigo-100 shadow-sm">{value || "Pending"}</span>
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
    navigator.clipboard.writeText(String(text));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="p-1 hover:bg-slate-200 rounded text-slate-400 transition-all">
      {copied ? <FiCheck size={12} className="text-emerald-500" /> : <FiCopy size={12} />}
    </button>
  );
}

function OverviewCard({ title, value, icon, color, onMaximize }) {
  return (
    <div className="group bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl text-white ${color} shadow-lg`}>{React.cloneElement(icon, { size: 18 })}</div>
        <button onClick={onMaximize} className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><FiMaximize2 size={16} /></button>
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
      <h3 className="text-2xl font-black text-slate-800 mt-1">{value}</h3>
    </div>
  );
}

function TaskRow({ task, onSelect, setMsgTask, setMsgPop }) {
  if (!task) return null;
  const statusConfig = {
    Completed: { style: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <FiCheckCircle size={12} className="mr-1" /> },
    "In Progress": { style: "bg-amber-50 text-amber-700 border-amber-200", icon: <FiActivity size={12} className="mr-1" /> },
    Assigned: { style: "bg-indigo-50 text-indigo-700 border-indigo-200", icon: <FiClock size={12} className="mr-1" /> },
    Pending: { style: "bg-slate-50 text-slate-500 border-slate-200", icon: <FiClock size={12} className="mr-1" /> },
  };
  const currentStatus = statusConfig[task.status] || statusConfig.Pending;

  return (
    <tr className="group hover:bg-indigo-50/30 transition-all">
      <td className="px-8 py-5">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-700">{task.taskTitle}</span>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400 font-mono">ID: {String(task.id || task.taskId).substring(0,8)}</span>
            <CopyButton text={task.id || task.taskId} />
          </div>
        </div>
      </td>
      <td className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{task.category || "General"}</td>
      <td className="px-8 py-5">
        <div className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border shadow-sm ${currentStatus.style}`}>
          {currentStatus.icon} {task.status || "Pending"}
        </div>
      </td>
      <td className="px-8 py-5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-black uppercase">{getFirstName(task.assignedToName).charAt(0)}</div>
          <span className="text-xs font-bold text-slate-600">{getFirstName(task.assignedToName)}</span>
        </div>
      </td>
      <td className="px-8 py-5 text-xs font-bold text-slate-500">{task.completionDate || "N/A"}</td>
      <td className="px-8 py-5 text-right">
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => { setMsgTask(task); setMsgPop(true); }} className="p-2.5 hover:bg-white text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100">
            <MdReply size={20} />
          </button>
          <button onClick={() => onSelect(task)} className="p-2 text-slate-300 hover:text-indigo-600 rounded-xl transition-all"><FiMoreVertical size={18} /></button>
        </div>
      </td>
    </tr>
  );
}

export default AdminMain;