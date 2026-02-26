import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  FiType, FiUser, FiCalendar, FiLayers, 
  FiAlertCircle, FiClock, FiAlignLeft, FiPlusCircle 
} from "react-icons/fi";
import { addTask } from "../../../../Services/authService";

/* ---------- STATIC CONFIGURATION ---------- */
const CATEGORIES = [
  "Bug Fixing", "Feature Development", "Enhancement", "Code Review",
  "Testing", "Documentation", "Research", "UI/UX Design",
  "Performance Optimization", "Deployment", "Maintenance",
  "Database Management", "API Development", "Security Update",
  "Support & Issue Resolution"
];

const PRIORITIES = ["High", "Medium", "Low"];

const INPUT_CLASS = "w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-700 font-medium placeholder:text-slate-400";

const InputWrapper = ({ label, icon: Icon, children }) => (
  <div className="flex flex-col gap-2">
    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
      <Icon className="text-indigo-500" /> {label}
    </label>
    {children}
  </div>
);

function CRA_Task() {
  const [taskTitle, setTaskTitle] = useState("");
  const [description, setDescription] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [assignedToUid, setAssignedToUid] = useState("");
  const [assignedToName, setAssignedToName] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 🛡️ AUTH DATA FROM REDUX
  const loginUser = useSelector((state) => state.auth?.user) || null;
  const allMembers = useSelector((state) => state.auth?.members) || [];
  const existingTasks = useSelector((state) => state.auth?.tasks) || []; 

  // Filter out the logged-in user from the assignment list
  const members = allMembers.filter((member) => member.uid !== loginUser?.uid);

  const handleUserChange = (e) => {
    const selectedUid = e.target.value;
    setAssignedToUid(selectedUid);
    const member = members.find(m => m.uid === selectedUid);
    setAssignedToName(member ? member.name : "");
  };

  const handleAssign = async (e) => {
    if (e) e.preventDefault();

    if (!loginUser) {
      setError("Admin profile not loaded. Please try again.");
      return;
    }

    // Validation
    if (!taskTitle || !description || !completionDate || !assignedToUid || !category || !priority || !estimatedHours) {
      setError("All fields are mandatory.");
      return;
    }

    setLoading(true);
    setError("");

    const newTask = {
      // Generate a numeric ID or use Firebase's auto-ID (recommended)
      // Here we use a timestamp-based ID to ensure uniqueness across clients
      taskId: `TASK-${Date.now().toString().slice(-6)}`, 
      taskTitle,
      description,
      completionDate,
      assignedToUid,
      assignedToName,
      category,
      priority,
      status: "Pending",
      estimatedHours: Number(estimatedHours),
      assignedBy: loginUser.uid,
      assignedByName: loginUser.name || "Admin",
      organization: loginUser.organization || "",
      createdAt: new Date().toISOString()
    };

    try {
      // 🚀 Service call to Firebase
      await addTask("tasks", newTask);
      
      alert("🚀 Task Assigned Successfully!");

      // Reset Form
      setTaskTitle("");
      setDescription("");
      setCompletionDate("");
      setAssignedToUid("");
      setAssignedToName("");
      setCategory("");
      setPriority("");
      setEstimatedHours("");
    } catch (err) {
      console.error("Assignment Error:", err);
      setError("Failed to assign: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const isFormIncomplete = !taskTitle || !description || !completionDate || !assignedToUid || !category || !priority || !estimatedHours || loading;

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-2 pb-12 px-4 md:px-10">
      <div className="max-w-5xl mx-auto">
        
        <div className="mb-6 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-black mt-5 text-slate-800 tracking-tight">
            Create <span className="text-indigo-600">New Task</span>
          </h2>
          <p className="text-slate-500 font-medium mt-1 text-sm">
            Streamline your workflow by assigning tasks to your team.
          </p>
          {error && (
            <div className="bg-rose-50 text-rose-600 px-4 py-2 rounded-xl text-sm mt-4 font-bold border border-rose-100 animate-pulse">
               ⚠️ {error}
            </div>
          )}
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-indigo-100/50 border border-slate-100 p-6 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            
            <div className="lg:col-span-2">
              <InputWrapper label="Task Title" icon={FiType}>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Redesign Landing Page"
                  className={INPUT_CLASS}
                />
              </InputWrapper>
            </div>

            <InputWrapper label="Assign To" icon={FiUser}>
              <select
                value={assignedToUid}
                onChange={handleUserChange}
                className={INPUT_CLASS}
              >
                <option value="">Select Employee</option>
                {members.map((member) => (
                  <option key={member.uid} value={member.uid}>
                       {member?.name} • # {member?.uid?.toString().slice(0,6)} ({member?.role})
                  </option>
                ))}
              </select>
            </InputWrapper>

            <InputWrapper label="Deadline" icon={FiCalendar}>
              <input 
                type="date" 
                value={completionDate} 
                onChange={(e) => setCompletionDate(e.target.value)} 
                className={INPUT_CLASS} 
                min={new Date().toISOString().split("T")[0]} // Prevents past dates
              />
            </InputWrapper>

            <InputWrapper label="Category" icon={FiLayers}>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={INPUT_CLASS}>
                <option value="">Select Category</option>
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </InputWrapper>

            <InputWrapper label="Priority" icon={FiAlertCircle}>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className={INPUT_CLASS}>
                <option value="">Select Priority</option>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </InputWrapper>

            <InputWrapper label="Estimate (Hours)" icon={FiClock}>
              <input type="number" value={estimatedHours} onChange={(e) => setEstimatedHours(e.target.value)} className={INPUT_CLASS} placeholder="0" />
            </InputWrapper>

            <div className="md:col-span-2 lg:col-span-3">
              <InputWrapper label="Detailed Description" icon={FiAlignLeft}>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  rows={3} 
                  placeholder="What needs to be done?" 
                  className={`${INPUT_CLASS} resize-none`} 
                />
              </InputWrapper>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-t border-slate-50 pt-8 mt-6">
            <p className="text-slate-400 text-xs font-medium italic">
              * Assigned tasks will appear instantly on the employee dashboard.
            </p>
            <button
              onClick={handleAssign}
              className="group flex items-center gap-3 bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              disabled={isFormIncomplete}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                <>
                  <FiPlusCircle className="text-xl group-hover:rotate-90 transition-transform duration-300" />
                  Assign Task
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CRA_Task;