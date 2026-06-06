import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { 
  FiBriefcase, FiUser, FiCalendar, FiClock, FiCheck,
  FiTarget, FiFlag, FiAlertCircle, FiChevronRight
} from "react-icons/fi";
import { addTask } from "../../../../Services/taskService";
import { useNavigate } from "react-router-dom";

/* ---------- ARCHITECTURAL CONSTANTS ---------- */
const TASK_CATEGORIES = [
  { id: "DEV", label: "Development" },
  { id: "BUG", label: "Bug Fixing" },
  { id: "DESIGN", label: "UI/UX Design" },
  { id: "DOCS", label: "Documentation" },
  { id: "QA", label: "Testing/QA" }
];

const PRIORITY_LEVELS = [
  { value: "High", badgeColor: "bg-red-50 text-red-700 border-red-200" },
  { value: "Medium", badgeColor: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "Low", badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200" }
];

const INITIAL_FORM_STATE = {
  title: "",
  description: "",
  deadline: "",
  assigneeId: "",
  assigneeName: "",
  category: "",
  priority: "Medium",
  hours: ""
};

export default function TaskProvisioningModule() {
  const navigate = useNavigate();
  const loginUser = useSelector((state) => state.auth?.user) || null;
  const members = useSelector((state) => state.auth?.members) || [];

  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [ui, setUi] = useState({ loading: false, error: null, success: false });

  const filteredMembers = useMemo(() => 
    members.filter(m => m.uid !== loginUser?.uid), 
  [members, loginUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "assigneeId") {
      const selected = members.find(m => m.uid === value);
      setForm(prev => ({ 
        ...prev, 
        assigneeId: value,
        assigneeName: selected?.name || "" 
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const executeAssignment = async (e) => {
    e.preventDefault();
    if (!loginUser) return setUi({ ...ui, error: "Authentication session expired." });

    setUi({ loading: true, error: null, success: false });

    const payload = {
      ...form,
      taskId: `T-${Date.now().toString().slice(-5)}`,
      status: "Assigned",
      assignedByName: loginUser.name,
      assignedByUid: loginUser.uid,
      organization: loginUser.organization,
      timestamp: new Date().toISOString()
    };

    try {
      await addTask(payload);
      setForm(INITIAL_FORM_STATE);
      setUi({ loading: false, error: null, success: true });
      setTimeout(() => setUi(prev => ({ ...prev, success: false })), 4000);
    } catch (err) {
      setUi({ loading: false, error: err.message, success: false });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 lg:p-10 font-sans antialiased text-slate-900">
      <div className="max-w-5xl mx-auto">
        
        {/* Module Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-slate-200 gap-4">
          <div>
            <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
              <span className="hover:text-slate-700 cursor-pointer">Tasks</span>
              <FiChevronRight className="text-slate-400" size={14} />
              <span className="text-slate-900 font-semibold">Provisioning</span>
            </nav>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Assign Project Milestone</h1>
          </div>
          
          {/* Resource Stack */}
          <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm w-fit">
            <span className="text-xs font-medium text-slate-500">Available Team:</span>
            <div className="flex -space-x-1.5">
              {filteredMembers.slice(0, 4).map(m => (
                <div 
                  key={m.uid} 
                  title={m.name} 
                  className="w-7 h-7 rounded-full bg-slate-100 border border-white flex items-center justify-center text-xs font-semibold text-slate-700 shadow-sm"
                >
                  {m.name.charAt(0).toUpperCase()}
                </div>
              ))}
              {filteredMembers.length > 4 && (
                <div className="w-7 h-7 rounded-full bg-slate-900 border border-white flex items-center justify-center text-[10px] font-medium text-white shadow-sm">
                  +{filteredMembers.length - 4}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Interface Grid */}
        <form onSubmit={executeAssignment} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Primary Input Card */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 lg:p-8 shadow-sm space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Task Title
              </label>
              <input 
                name="title"
                type="text"
                value={form.title}
                onChange={handleInputChange}
                placeholder="e.g., Optimize database index routines"
                className="w-full text-base font-medium border border-slate-200 rounded-lg px-3.5 py-2.5 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all placeholder:text-slate-400 bg-slate-50/30"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Execution Brief & Scope
              </label>
              <textarea 
                name="description"
                value={form.description}
                onChange={handleInputChange}
                rows={10}
                placeholder="Detail the execution framework, technical barriers, and expected criteria..."
                className="w-full p-4 bg-slate-50/30 border border-slate-200 rounded-lg focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all text-sm leading-relaxed text-slate-700 placeholder:text-slate-400"
                required
              />
            </div>
          </div>

          {/* Configuration Sidebar */}
          <aside className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
                Deployment Meta
              </h3>

              {/* Target Assignee */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <FiUser className="text-slate-400" size={14} /> Assignee
                </label>
                <select 
                  name="assigneeId" 
                  value={form.assigneeId} 
                  onChange={handleInputChange} 
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all cursor-pointer" 
                  required
                >
                  <option value="">Select teammate...</option>
                  {filteredMembers.map(m => (
                    <option key={m.uid} value={m.uid}>
                      {m.name} ({m.uid.slice(0, 6)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Grid System for Mini Metadata Inputs */}
              <div className="grid grid-cols-2 gap-4">
                {/* Priority */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <FiFlag className="text-slate-400" size={14} /> Priority
                  </label>
                  <select 
                    name="priority" 
                    value={form.priority} 
                    onChange={handleInputChange} 
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all cursor-pointer"
                  >
                    {PRIORITY_LEVELS.map(p => (
                      <option key={p.value} value={p.value}>{p.value}</option>
                    ))}
                  </select>
                </div>

                {/* Workload */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <FiClock className="text-slate-400" size={14} /> Allocation
                  </label>
                  <div className="relative flex items-center">
                    <input 
                      name="hours" 
                      type="number" 
                      value={form.hours} 
                      onChange={handleInputChange} 
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-lg pl-3 pr-7 py-2 text-sm font-medium text-slate-800 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all" 
                      placeholder="0" 
                      min="1"
                      required 
                    />
                    <span className="absolute right-2.5 text-[11px] font-medium text-slate-400 pointer-events-none">hrs</span>
                  </div>
                </div>
              </div>

              {/* Deadline */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <FiCalendar className="text-slate-400" size={14} /> Deadline Target
                </label>
                <input 
                  name="deadline" 
                  type="date" 
                  value={form.deadline} 
                  onChange={handleInputChange} 
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all cursor-pointer" 
                  required 
                />
              </div>

              {/* Classification */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <FiTarget className="text-slate-400" size={14} /> Operational Category
                </label>
                <select 
                  name="category" 
                  value={form.category} 
                  onChange={handleInputChange} 
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all cursor-pointer" 
                  required
                >
                  <option value="">Select category...</option>
                  {TASK_CATEGORIES.map(c => (
                    <option key={c.id} value={c.label}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* System Banners (Error / Success States) */}
              {ui.error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-700 text-xs flex gap-2 items-start">
                  <FiAlertCircle className="shrink-0 mt-0.5" size={15} /> 
                  <span>{ui.error}</span>
                </div>
              )}

              {ui.success && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-800 text-xs flex gap-2 items-start">
                  <FiCheck className="shrink-0 mt-0.5 text-emerald-600" size={15} /> 
                  <span>Task initialization sync successful.</span>
                </div>
              )}

              <button 
                type="submit"
                disabled={ui.loading}
                className="w-full mt-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs transition-all duration-150 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm active:bg-slate-950"
              >
                {ui.loading ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  "Deploy Assignment"
                )}
              </button>
            </div>

            {/* Micro Compliance Callout */}
            <div className="p-4 bg-slate-100/70 border border-slate-200 rounded-xl flex gap-2.5 items-start">
              <FiBriefcase className="text-slate-400 shrink-0 mt-0.5" size={14} />
              <p className="text-[11px] text-slate-500 leading-normal">
                Submission executes an active environment update. The workspace event bus will instantly issue context details to your designated assignee.
              </p>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}