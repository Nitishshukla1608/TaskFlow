import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { 
  FiBriefcase, FiUser, FiCalendar, FiClock, 
  FiTarget, FiFlag, FiInfo, FiChevronRight 
} from "react-icons/fi";
import { addTask } from "../../../../Services/taskService";

/* ---------- ARCHITECTURAL CONSTANTS ---------- */
const TASK_CATEGORIES = [
  { id: "DEV", label: "Development", color: "bg-blue-500" },
  { id: "BUG", label: "Bug Fixing", color: "bg-red-500" },
  { id: "DESIGN", label: "UI/UX Design", color: "bg-purple-500" },
  { id: "DOCS", label: "Documentation", color: "bg-slate-500" },
  { id: "QA", label: "Testing/QA", color: "bg-emerald-500" }
];

const PRIORITY_LEVELS = [
  { value: "High", color: "text-red-600", bg: "bg-red-50" },
  { value: "Medium", color: "text-amber-600", bg: "bg-amber-50" },
  { value: "Low", color: "text-emerald-600", bg: "bg-emerald-50" }
];

export default function TaskProvisioningModule() {
  const loginUser = useSelector((state) => state.auth?.user) || null;
  const members = useSelector((state) => state.auth?.members) || [];

  const [form, setForm] = useState({
    title: "",
    description: "",
    deadline: "",
    assigneeId: "",
    assigneeName: "",
    category: "",
    priority: "Medium",
    hours: ""
  });

  const [ui, setUi] = useState({ loading: false, error: null, success: false });

  // Filter members for the assignment dropdown
  const filteredMembers = useMemo(() => 
    members.filter(m => m.uid !== loginUser?.uid), 
  [members, loginUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Auto-map assignee name when ID is selected
    if (name === "assigneeId") {
      const selected = members.find(m => m.uid === value);
      setForm(prev => ({ ...prev, assigneeName: selected?.name || "" }));
    }
  };

  const executeAssignment = async (e) => {
    e.preventDefault();
    if (!loginUser) return setUi({ ...ui, error: "Authentication session expired." });

    setUi({ ...ui, loading: true, error: null });

    const payload = {
      ...form,
      taskId: `T-${Date.now().toString().slice(-5)}`,
      status: "Backlog",
      assignedBy: loginUser.uid,
      organization: loginUser.organization,
      timestamp: new Date().toISOString()
    };

    try {
      await addTask(payload);
      setUi({ loading: false, error: null, success: true });
      // Reset logic would go here
    } catch (err) {
      setUi({ loading: false, error: err.message, success: false });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-12 font-sans antialiased text-slate-900">
      <div className="max-w-6xl mx-auto">
        
        {/* Module Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <nav className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              <span>Task Management</span>
              <FiChevronRight />
              <span className="text-indigo-600">Provisioning</span>
            </nav>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Assign Project Milestone</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-500">Resource:</span>
            <div className="flex -space-x-2">
              {filteredMembers.slice(0, 4).map(m => (
                <div key={m.uid} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold">
                  {m.name.charAt(0)}
                </div>
              ))}
              {filteredMembers.length > 4 && (
                <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-white flex items-center justify-center text-[10px] text-white">
                  +{filteredMembers.length - 4}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Interface Grid */}
        <form onSubmit={executeAssignment} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Primary Input Column */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Task Heading</label>
                  <input 
                    name="title"
                    value={form.title}
                    onChange={handleInputChange}
                    placeholder="Brief objective (e.g., API Layer Optimization)"
                    className="w-full text-xl font-medium border-b border-slate-200 py-2 focus:border-indigo-600 outline-none transition-colors placeholder:text-slate-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Execution Brief</label>
                  <textarea 
                    name="description"
                    value={form.description}
                    onChange={handleInputChange}
                    rows={6}
                    placeholder="Provide detailed technical requirements and acceptance criteria..."
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all text-sm leading-relaxed"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Configuration Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-50 pb-4">
                Deployment Controls
              </h3>

              <div className="space-y-5">
                <SidebarField label="Target Assignee" icon={<FiUser />}>
                  <select name="assigneeId" value={form.assigneeId} onChange={handleInputChange} className="select-clean" required>
                    <option value="">Choose User</option>
                    {filteredMembers.map(m => (
                      <option key={m.uid} value={m.uid}>{m.name} ({m.role})</option>
                    ))}
                  </select>
                </SidebarField>

                <div className="grid grid-cols-2 gap-4">
                  <SidebarField label="Priority" icon={<FiFlag />}>
                    <select name="priority" value={form.priority} onChange={handleInputChange} className="select-clean">
                      {PRIORITY_LEVELS.map(p => (
                        <option key={p.value} value={p.value}>{p.value}</option>
                      ))}
                    </select>
                  </SidebarField>

                  <SidebarField label="Workload (h)" icon={<FiClock />}>
                    <input name="hours" type="number" value={form.hours} onChange={handleInputChange} className="input-clean" placeholder="Est." required />
                  </SidebarField>
                </div>

                <SidebarField label="Deadline" icon={<FiCalendar />}>
                  <input name="deadline" type="date" value={form.deadline} onChange={handleInputChange} className="input-clean" required />
                </SidebarField>

                <SidebarField label="Classification" icon={<FiTarget />}>
                  <select name="category" value={form.category} onChange={handleInputChange} className="select-clean" required>
                    <option value="">Uncategorized</option>
                    {TASK_CATEGORIES.map(c => (
                      <option key={c.id} value={c.label}>{c.label}</option>
                    ))}
                  </select>
                </SidebarField>
              </div>

              {ui.error && (
                <div className="mt-6 p-3 bg-red-50 border border-red-100 rounded text-red-600 text-[11px] font-medium flex gap-2 items-start">
                  <FiInfo className="mt-0.5 shrink-0" /> {ui.error}
                </div>
              )}

              <button 
                type="submit"
                disabled={ui.loading}
                className="w-full mt-8 py-4 bg-slate-900 text-white rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {ui.loading ? "Provisioning..." : "Initialize Task"}
              </button>
            </div>

            <div className="p-6 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200">
              <div className="flex items-center gap-3 mb-2">
                <FiBriefcase className="opacity-80" />
                <h4 className="font-bold text-sm">System Status</h4>
              </div>
              <p className="text-[11px] opacity-80 leading-relaxed">
                Task will be synchronized across the Project Ledger and notify the assignee via integrated workspace channels.
              </p>
            </div>
          </aside>
        </form>
      </div>

      <style jsx>{`
        .select-clean, .input-clean {
          @apply w-full bg-slate-50 border border-slate-200 rounded-md py-2 px-3 text-sm focus:border-indigo-600 outline-none transition-colors appearance-none;
        }
        .select-clean {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='flex m19 9l-7 7-7-7'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          background-size: 1rem;
        }
      `}</style>
    </div>
  );
}

const SidebarField = ({ label, icon, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
      {icon} {label}
    </label>
    {children}
  </div>
);