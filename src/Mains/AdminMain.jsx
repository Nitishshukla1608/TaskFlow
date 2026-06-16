import React, { useState, useRef, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { 
  FiPlus, FiSearch, FiMessageSquare, FiChevronRight, FiUser,
  FiMaximize2, FiX, FiSend, FiClock, FiEdit2, FiTag, FiSave, FiLoader, 
  FiActivity, FiCalendar, FiUsers,FiLock 
} from "react-icons/fi";
import { setMessages, clearMessages } from "../Context/ChatContext";
import { updateTaskStatus } from "../Services/taskService";
import { subscribeToMessages, sendMessage } from "../Services/messageService";
import { useNavigate } from "react-router-dom";


const AdminMain = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const tasks = useSelector((state) => state.auth.tasks || []);
  const members = useSelector((state) => state.auth.members || []);
  const messages = useSelector((state) => state.chatList?.messages || []);

  // UI State
  const [view, setView] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null)
  const [chatOpen, setChatOpen] = useState(false);
  const [expandedMetric, setExpandedMetric] = useState(null);
  const [showAllModal, setShowAllModal] = useState(false);
  
  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [localStatus, setLocalStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Stats Logic
  const stats = useMemo(() => ({
    total: tasks.length,
    active: tasks.filter(t => ["In Progress", "Under Review", "Assigned", "Pending"].includes(t.status)).length,
    completed: tasks.filter(t => t.status === "Completed").length,

  }), [tasks]);

  // Filtering Logic
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const search = searchQuery.toLowerCase();
      const title = (t.taskTitle || t.title || "").toLowerCase();
      const assignee = (t.assignedToName || "").toLowerCase();
      const matchesSearch = title.includes(search) || assignee.includes(search);
      
      if (!matchesSearch) return false;
      if (view === "all") return true;
      
      const normalizedStatus = (t.status || "pending").toLowerCase().replace(/\s+/g, "");
      if (view === "progress") return normalizedStatus === "inprogress" || normalizedStatus === "underreview";
      if (view === "completed") return normalizedStatus === "completed";
      if (view === "pending") return ["pending", "assigned", "backlog"].includes(normalizedStatus);
      return true;
    });
  }, [tasks, searchQuery, view]);

  // Real-time Chat Subscription
  useEffect(() => {
    const taskId = selectedTask?.id || selectedTask?.taskId;
    if (chatOpen && taskId) {
      const unsubscribe = subscribeToMessages(taskId, (msgs) => {
        dispatch(setMessages(msgs));
      });
      return () => unsubscribe();
    }
  }, [chatOpen, selectedTask, dispatch]);

  const handleUpdateStatus = async () => { 
    const taskId = selectedTask?.taskId || selectedTask?.id;
    if (!taskId || !localStatus) return;
    setIsSaving(true);
    try {
      await updateTaskStatus(taskId, localStatus); 
      setIsEditModalOpen(false);
      setSelectedTask(null);
    } catch (error) {
      console.error("Update Failed:", error);
      alert("Failed to update status.");
    } finally {
      setIsSaving(false);
    }
  };

  const openTaskDetail = (task) => {
    setExpandedMetric(null)
    setShowAllModal(false)
    setSelectedTask(task);
    setLocalStatus(task.status);
    setIsEditModalOpen(false);
  };

  
  const openMemberDetail = (member) => {
    setExpandedMetric(null)
    setSelectedMember(member);
    setIsEditModalOpen(false);
   
    setExpandedMetric(null);
  };


  const openEditModal = (e, task) => {
    e.stopPropagation();
    setSelectedTask(task);
    setLocalStatus(task.status);
    setIsEditModalOpen(true);
  };

  const openChat = (e, task) => {
    e.stopPropagation();
    setSelectedTask(task);
    setChatOpen(true);
  };

  if (!user) return <LoadingState />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased">
      {/* 1. TOP UTILITY BAR */}
      <header className="sticky top-0 z-[100] bg-white/70 backdrop-blur-xl border-b border-slate-200/60 px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Workspace Control</h1>
        <div className="flex items-center gap-3">
          <Link to="add-user" className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-white hover:shadow-sm rounded-lg text-sm font-medium border border-slate-200 transition-all">
            <FiUser size={16} /> <FiPlus size={14} /> 
          </Link>
          <Link to="create-task" className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg transition-all">
            <FiPlus /> New Task
          </Link>
        </div>
      </header>

      <main className="p-8 max-w-[1600px] mx-auto">
        {/* 2. ANALYTICS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <MetricCard label="Total Projects" value={stats.total}   type="task"   trend="Across all cycles" onMaximize={() => setExpandedMetric({ label: 'Total Projects', data: tasks })} />
          <MetricCard label="In Flight" value={stats.active}    type="task"  trend="Active Work" color="text-amber-500" onMaximize={() => setExpandedMetric({ label: 'Active Projects', dataType:"tasks",  data: tasks.filter(t => ["In Progress", "Under Review", "Assigned"].includes(t.status)) })} />
          <MetricCard label="Completed" value={stats.completed}    type="task"  trend="Archive" color="text-emerald-500" onMaximize={() => setExpandedMetric({ label: 'Completed Projects', dataType:"tasks",  data: tasks.filter(t => t.status === "Completed") })} />
          <MetricCard label="Team Size" value={members.length}    type="member"  trend="Total Contributors" color="text-indigo-600" onMaximize={() => setExpandedMetric({ label: 'Team Members', dataType:"members",  data: members })} />
        </div>

        {/* 3. RECENT ASSIGNMENTS SECTION */}
        <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden mb-10">
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
                  <th className="px-8 py-4">Reference</th>
                  <th className="px-8 py-4">Task Details</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Assigned To</th>
                  <th className="px-8 py-4">Deadline</th>
                  <th className="px-8 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {tasks.length === 0 ? (
                  <tr><td colSpan="5" className="px-8 py-16 text-center text-slate-400 italic">No tasks found.</td></tr>
                ) : (
                  tasks.slice(0, 8).map((task) => (
                    <TaskRow 
                      key={task.id || task.taskId} 
                      task={task} 
                      onSelect={openTaskDetail}
                      onOpenTaskChat={openChat} 
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* --- MODALS --- */}

      {/* 1. Chat Sidebar */}
      {chatOpen && selectedTask && (
        <ChatSidebar 
          task={selectedTask} 
          user={user} 
          messages={messages} 
          onClose={() => { setChatOpen(false); setSelectedTask(null); dispatch(clearMessages()); }} 
        />
      )}

      {/* 2. Edit Status Modal */}
      {isEditModalOpen && selectedTask && (
        <div className="fixed inset-0 z-[900] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black text-slate-800 mb-6 tracking-tight">Update Status</h2>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {["Pending", "In Progress", "Under Review", "Completed", "Backlog"].map((opt) => (
                <button 
                  key={opt} 
                  onClick={() => setLocalStatus(opt)} 
                  className={`py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${localStatus === opt ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-indigo-200'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
              <button onClick={handleUpdateStatus} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg transition-all">
                {isSaving ? <FiLoader className="animate-spin" /> : <FiSave />} Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Task Detail Modal */}
      {selectedTask && !isEditModalOpen && !chatOpen && (
        <div className="fixed inset-0 z-[850] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedTask(null)} />
          <div className="relative bg-white rounded-[2.5rem] max-w-lg w-full shadow-2xl overflow-hidden p-8 border-t-8 border-indigo-600 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="mb-6">
              <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg uppercase tracking-widest">{selectedTask.category || "General"}</span>
              <h3 className="text-2xl font-black text-slate-800 mt-3 leading-tight">{selectedTask.taskTitle || selectedTask.title}</h3>
              <p className="text-slate-500 text-sm mt-3 leading-relaxed">{selectedTask.description || "No description provided."}</p>
            </div>
            
            <div className="space-y-3 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
              <InfoRow icon={<FiActivity />} label="Current Status" value={selectedTask.status} />
              <InfoRow icon={<FiCalendar />} label="Due Date" value={selectedTask.deadline || "Not Set"} />
              <InfoRow icon={<FiUsers />} label="Assigned To" value={selectedTask.assigneeName || "N/A"} />
              <InfoRow icon={<FiUser />} label="Created By" value={selectedTask.assignedByName || "System"} />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-8">
               <button onClick={(e) => openEditModal(e, selectedTask)} className="py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                 <FiEdit2 size={14}/> Edit Status
               </button>
               <button onClick={() => setSelectedTask(null) } className="py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-indigo-600 transition-all shadow-lg">
                 Close Details
               </button>
            </div>
          </div>
        </div>
      )}


        {/* 3. Member Detail Modal */}
{selectedMember && !isEditModalOpen && !chatOpen && (
  <div className="fixed inset-0 z-[850] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
    <div className="absolute inset-0" onClick={() => setSelectedMember(null)} />
    <div className="relative bg-white rounded-xl max-w-xl w-full shadow-xl overflow-hidden p-6 border border-slate-200 animate-in fade-in duration-200 max-h-[90vh] flex flex-col">
      
      {/* Profile Summary Header */}
      <div className="mb-5 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
              selectedMember.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-600 border-slate-200"
            }`}>
              {selectedMember.status || "Inactive"}
            </span>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">
              {selectedMember.role || "Employee"}
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mt-2 tracking-tight">
            {selectedMember.name}
          </h3>
          <p className="text-xs font-medium text-indigo-600 mt-0.5">
            {selectedMember.position || "Team Contributor"} — {selectedMember.organization || "N/A"}
          </p>
        </div>
        <button 
          type="button" 
          onClick={() => setSelectedMember(null)} 
          className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-all"
        >
          <FiX size={16} />
        </button>
      </div>

      {/* Profile Details Matrix Grid */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        
        {/* Contact Infrastructure */}
        <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg space-y-2.5">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Contact Information</h4>
          <InfoRow icon={<FiUser className="text-slate-400" />} label="Email Address" value={selectedMember.email} />
          <InfoRow icon={<FiActivity className="text-slate-400" />} label="Phone Line" value={selectedMember.phone} />
        </div>

        {/* Core Administrative Parameters */}
        <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg space-y-2.5">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Operational Metrics</h4>
          <InfoRow icon={<FiTag className="text-slate-400" />} label="Registration ID" value={selectedMember.regId} />
          <InfoRow icon={<FiUsers className="text-slate-400" />} label="Organization ID" value={selectedMember.orgId || "Not Configured"} />
          <InfoRow icon={<FiClock className="text-slate-400" />} label="Onboarded Frame" value={selectedMember.createdAt} />
          <InfoRow icon={<FiLock className="text-slate-400" />} label="Password Resets" value={selectedMember.isPasswordChangeable ? "Permitted" : "Restricted"} />
        </div>

        {/* Localization Matrix */}
        <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg space-y-2.5">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Regional Coordinates</h4>
          <InfoRow icon={<FiCalendar className="text-slate-400" />} label="City Node" value={selectedMember.city} />
          <InfoRow icon={<FiCalendar className="text-slate-400" />} label="State/Province" value={selectedMember.state || "Not Provided"} />
          <InfoRow icon={<FiTag className="text-slate-400" />} label="Postal Pin Code" value={selectedMember.pinCode} />
          <InfoRow icon={<FiUser className="text-slate-400" />} label="Country Ledger" value={selectedMember.country} />
          <div className="pt-2 border-t border-slate-200/60 flex flex-col gap-1 text-xs">
            <span className="text-slate-500 font-medium">Physical Deployment Address</span>
            <span className="font-semibold text-slate-800 leading-relaxed bg-white border border-slate-200 p-2 rounded.md mt-0.5">
              {selectedMember.address}
            </span>
          </div>
        </div>

      </div>

      {/* Identity Footnote Registry */}
      <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] font-mono text-slate-400">
        <span>System Entry UID:</span>
        <span className="uppercase font-semibold tracking-wider text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
          {selectedMember.uid || "N/A"}
        </span>
      </div>

    </div>
  </div>
)}



      {/* 4. Full List Modal */}
      {showAllModal && (
        <FullTaskListModal 
          tasks={filteredTasks} 
          view={view} 
          setView={setView} 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onClose={() => setShowAllModal(false)}
          onSelectTask={openTaskDetail}
          onOpenTaskChat={openChat}
        />
      )}

      {/* 5. Metrics Drill-down Modal */}
      {expandedMetric && (
        <MetricModal 
          metric={expandedMetric} 
          onClose={() => setExpandedMetric(null) } 
          onSelectTask={openTaskDetail}
          onSelectMember={openMemberDetail}
          onOpenMemberChat={(member) => {
            navigate("messages") 
            setExpandedMetric(null);
          }}
          onOpenTaskChat={(task) => {
            setSelectedTask(task);
            setChatOpen(true);
            setExpandedMetric(null);
          }}  
        />
      )}
    </div>
  );
};

/* --- REFACTORED SUB-COMPONENTS --- */

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2 text-slate-400">
      <span className="text-indigo-500">{icon}</span>
      <span className="text-[11px] font-bold uppercase tracking-tight">{label}</span>
    </div>
    <span className="text-xs font-black text-slate-700">{value || "N/A"}</span>
  </div>
);

const TaskRow = ({ task, onSelect, onOpenTaskChat }) => (
  <tr className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => onSelect(task)}>
    <td className="px-8 py-5">
      <span className="text-[11px] font-bold text-slate-400 font-mono tracking-tighter uppercase block">
        REF-{task.id?.substring(0, 8) || "N/A"}
      </span>
    </td>
    <td className="px-8 py-5">
      <div className="flex flex-col">
        <span className="text-[14px] font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{task.taskTitle || task.title}</span>
        <span className="text-[11px] text-slate-400 font-medium">{task.category || "General Task"}</span>
      </div>
    </td>
    <td className="px-8 py-5">
      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
        task.status === "Completed" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
        ["In Progress", "Under Review" , "Backllog" , "Pending"].includes(task.status) ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-slate-50 text-slate-500 border-slate-100"
      }`}>
        {task.status || "Pending"}
      </span>
    </td>
    <td className="px-8 py-5">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-[10px] font-black text-indigo-600 border border-indigo-100">
          {(task.assigneeName || "U").charAt(0)}
        </div>
        <span className="text-[13px] font-bold text-slate-600">{task.assigneeName || "Unassigned"}</span>
      </div>
    </td>
    <td className="px-8 py-5">
      <div className="flex items-center gap-2.5">
        <div className=" font-bold flex items-center justify-center text-[13px]  text-gray-400">
          {task.deadline}
        </div>

      </div>
    </td>
    <td className="px-8 py-5 text-right">
      <button 
        onClick={(e) => onOpenTaskChat(e, task)} 
        className="p-3 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"
      >
        <FiMessageSquare size={18} />
      </button>
    </td>
  </tr>
);

const FullTaskListModal = ({ tasks, view, setView, searchQuery, setSearchQuery, onClose, onSelectTask, onOpenTaskChat }) => (
  <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-10 bg-slate-900/60 backdrop-blur-md">
    <div className="bg-[#F8FAFC] w-full max-w-6xl max-h-full rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
      <div className="p-8 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-8">
          <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Task Explorer</h2>
          <nav className="flex items-center bg-slate-100 p-1.5 rounded-2xl">
            {["all", "progress", "completed", "pending"].map((v) => (
              <button 
                key={v} 
                onClick={() => setView(v)} 
                className={`px-5 py-2 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${view === v ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              >
                {v}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4 flex-1 md:flex-none justify-end">
          <div className="relative flex-1 md:w-80">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by title or member..." 
              className="w-full bg-slate-50 border border-slate-200 rounded-[1.2rem] py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
          </div>
          <button onClick={onClose} className="p-4 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-[1.2rem] transition-all"><FiX size={20} /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-8">
        <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left">
             <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                  <th className="px-8 py-5">Ref</th>
                  <th className="px-8 py-5">Task</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5">Member</th>
                  <th className="px-8 py-5 ">Deadline</th>
                  <th className="px-8 py-5 mr-10">Message</th>
                </tr>
              </thead>
            <tbody className="divide-y divide-slate-50">
              {tasks.length > 0 ? (
                tasks.map(task => (
                  <TaskRow 
                    key={task.id || task.taskId} 
                    task={task} 
                    onSelect={onSelectTask} 
                    onOpenTaskChat={onOpenTaskChat} 
                  />
                ))
              ) : (
                <tr><td colSpan="5" className="p-32 text-center text-slate-400 font-medium italic">No matching tasks found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);

const ChatSidebar = ({ task, user, messages, onClose }) => {
  const scrollRef = useRef(null);
  const [text, setText] = useState("");

  useEffect(() => { 
    scrollRef.current?.scrollIntoView({ behavior: "smooth" }); 
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    const taskId = task.id || task.taskId;
    if (!text.trim() || !taskId) return;
    try {
      await sendMessage(taskId, {
        text: text.trim(),
        senderId: user.uid,
        senderName: user.displayName || "Admin",
        timestamp: new Date()
      });
      setText("");
    } catch (err) { console.error(err); }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)] z-[1100] flex flex-col animate-in slide-in-from-right duration-300">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[1.2rem] bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <FiMessageSquare size={22} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 leading-none">{task.taskTitle || task.title}</h3>
            <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Live Discussion
            </p>
          </div>
        </div>
        <button onClick={onClose} className="p-3 text-slate-400 hover:bg-slate-50 rounded-2xl transition-all"><FiX size={20}/></button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 custom-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
             <FiMessageSquare size={40} className="mb-4 text-slate-300" />
             <p className="text-xs font-bold uppercase tracking-widest text-slate-400">No messages yet</p>
          </div>
        )}
        {messages.map((m) => {
          const isMe = m.senderId === user.uid;
          return (
            <div key={m.id || Math.random()} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
               {!isMe && <span className="text-[10px] font-black text-slate-400 uppercase mb-1 ml-2">{m.senderName}</span>}
              <div className={`p-4 rounded-[1.5rem] text-[13px] font-medium max-w-[85%] shadow-sm ${
                isMe ? "bg-indigo-600 text-white rounded-tr-none shadow-indigo-100" : "bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-slate-100"
              }`}>
                {m.text}
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>
      
      <form onSubmit={handleSend} className="p-6 bg-white border-t border-slate-100 flex gap-3">
        <input 
          className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium" 
          placeholder="Message the team..." 
          value={text} 
          onChange={(e) => setText(e.target.value)} 
        />
        <button type="submit" className="bg-indigo-600 text-white p-4 rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-90">
          <FiSend size={20} />
        </button>
      </form>
    </div>
  );
};

const MetricCard = ({ label, value, trend, color = "text-slate-900", onMaximize }) => (
  <div className="group bg-white border border-slate-200/60 p-7 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all relative overflow-hidden">
    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-slate-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 scale-50 group-hover:scale-100" />
    <button onClick={onMaximize} className="absolute top-5 right-5 p-2.5 opacity-0 group-hover:opacity-100 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm">
      <FiMaximize2 size={14} />
    </button>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
    <h3 className={`text-3xl font-black tracking-tighter ${color}`}>{value}</h3>
    <p className="text-[11px] font-bold text-slate-400 mt-3 flex items-center gap-1.5">
       <span className="w-1.5 h-1.5 rounded-full bg-slate-200" /> {trend}
    </p>
  </div>
);

const MetricModal = ({ metric, onClose, onSelectTask,onSelectMember, onOpenTaskChat,onOpenMemberChat }) => (
  <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 md:p-6 bg-slate-900/40 backdrop-blur-md">
    <div className="bg-white w-full max-w-3xl max-h-[85vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300">
      <div className="px-8 py-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">{metric.label}</h2>
          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1.5">
            {metric.data.length} Total Records
          </p>
        </div>
        <button onClick={onClose} className="p-3 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-2xl shadow-sm border border-slate-100 transition-all"><FiX size={20} /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4 custom-scrollbar">
        {metric.dataType == "tasks" ? 
        (metric.data.length > 0 ? (
          metric.data.map((task) => (
            <div 
              key={task.id || task.taskId || Math.random()}
              onClick={() => onSelectTask(task)}
              className="group relative bg-white border border-slate-100 p-5 rounded-[1.8rem] hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-5">
                <div className={`w-1.5 h-10 rounded-full ${
                  task.status === "Completed" ? "bg-emerald-400" : 
                  ["In Progress", "Under Review"].includes(task.status) ? "bg-amber-400" : "bg-slate-200"
                }`} />
                
                <div>
                  <h4 className="text-sm font-black text-slate-800 group-hover:text-indigo-600 transition-colors">
                    {task.taskTitle || task.title || task.name}
                  </h4>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <FiTag size={10} /> {task.category || "Entity"}
                    </span>
                    {task.id && (
                       <span className="text-[11px] font-mono text-indigo-400 font-bold uppercase">
                         #{task.id.substring(0, 10)}
                       </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {task.status && (
                   <button 
                    onClick={(e) => onOpenTaskChat(e, task)}
                    className="p-3 bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white rounded-xl transition-all shadow-sm"
                  >
                    <FiMessageSquare size={16} />
                  </button>
                )}

                <div className="p-3 text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all">
                  <FiChevronRight size={20} />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center text-slate-300 italic font-medium">Empty Dataset.</div>
        ))
        :
        (metric.data.length > 0 ? (
          metric.data.map((member) => (
            <div 
              key={member.id || Math.random()}
               onClick={() => onSelectMember(member)}
              className="group relative bg-white border border-slate-100 p-5 rounded-[1.8rem] hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-5">
                <div className="w-1.5 h-10 rounded-full" />
                
                <div>
                  <h4 className="text-sm font-black text-slate-800 group-hover:text-indigo-600 transition-colors">
                    {member.name }
                  </h4>
                  <div className="flex items-center gap-3 mt-1.5">
                
                    {member.id && (
                       <span className="text-[11px] font-mono text-indigo-400 font-bold uppercase">
                         #{member.id.substring(0, 10)}
                       </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {member.id && (
                   <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenMemberChat(member);
                    }}
                    className="p-3 bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white rounded-xl transition-all shadow-sm"
                  >
                    <FiMessageSquare size={16} />
                  </button>
                )}

                <div className="p-3 text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all">
                  <FiChevronRight size={20} />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center text-slate-300 italic font-medium">Empty Dataset.</div>
        ))
          }
      </div>
    </div>
  </div>
);

const LoadingState = () => (
  <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
    <div className="relative flex items-center justify-center">
      <div className="w-16 h-16 border-[3px] border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
      <FiActivity className="absolute text-indigo-600 animate-pulse" size={20} />
    </div>
    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-6 ml-1">Synchronizing Control</span>
  </div>
);

export default AdminMain;