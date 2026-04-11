import React, { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";
import { 
  FiBriefcase, FiMail, FiUsers, FiGlobe, 
  FiArrowLeft, FiLoader, FiShield, FiCheck 
} from "react-icons/fi";

import { addOrganization } from "../../Services/authService";
import { setOrganization } from "../../Context/AuthContext";

/* ---------- SHARED DESIGN TOKENS ---------- */
const INPUT_BASE = "block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-md text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all duration-200";
const LABEL_BASE = "block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5";
const SECTION_DESC = "text-xs text-slate-500 mb-4";

export default function OrganizationDeployment() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux state for enterprise plans
  const currentPlan = useSelector((state) => state.plan?.currentPlanData);
  const isFreeTrial = useSelector((state) => state.plan?.isFreeTrial);

  const [uiState, setUiState] = useState({ loading: false, error: null });
  const [formData, setFormData] = useState({
    name: "",
    orgEmail: "",
    industry: "",
    teamSize: "",
    location: "",
  });

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleDeployment = async (e) => {
    e.preventDefault();
    setUiState({ loading: true, error: null });

    try {
      // 1. Core Resource Provisioning
      const { orgId } = await addOrganization(formData, currentPlan, isFreeTrial);
      
      // 2. Global Context Update
      dispatch(setOrganization({ name: formData.name, id: orgId }));

      // 3. Communications Relay
      try {
        await emailjs.send(
          "service_d6r58da",
          "template_qj3cn0d",
          {
            email: formData.orgEmail,
            company_name: formData.name,
            industry:formData.industry,
            team_size:formData.teamSize,
            address:formData.location
          },
          "RG-epL79tbuC7qcZI"
        );
      } catch (err) {
        console.warn("Communication relay non-critical failure:", err);
      }

      navigate("/createdmin");
    } catch (err) {
      setUiState({ 
        loading: false, 
        error: err.message || "An infrastructure error occurred. Please contact system support." 
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 antialiased selection:bg-indigo-100">
      <div className="max-w-5xl w-full bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row overflow-hidden rounded-lg">
        
        {/* Left: Product Specification */}
        <div className="md:w-[380px] bg-slate-900 p-10 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-12">
              <div className="w-8 h-8 bg-indigo-600 flex items-center justify-center rounded">
                <FiShield className="text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">TaskFlow<span className="text-indigo-500">.</span></span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight leading-tight mb-6">
              Establish your organization's <span className="text-slate-400 font-normal italic">digital node.</span>
            </h1>

            <div className="space-y-6">
              <FeatureItem title="Enterprise Sovereignty" desc="Complete control over data encryption and user governance." />
              <FeatureItem title="Scalable Architecture" desc="Infrastructure adapts to your team load automatically." />
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800">
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
              v4.2.0-stable // NEXUS OS
            </p>
          </div>
        </div>

        {/* Right: Configuration Interface */}
        <div className="flex-1 p-8 lg:p-16">
          <div className="flex justify-between items-center mb-10">
            <Link to="/login" className="text-xs font-semibold text-slate-400 hover:text-indigo-600 flex items-center gap-2 transition-colors">
              <FiArrowLeft /> BACK TO PORTAL
            </Link>
            <div className="flex gap-1">
              <div className="h-1 w-6 bg-indigo-600 rounded-full" />
              <div className="h-1 w-6 bg-slate-100 rounded-full" />
            </div>
          </div>

          {uiState.error && (
            <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm flex items-center gap-3">
              <FiShield className="shrink-0" /> {uiState.error}
            </div>
          )}

          <form onSubmit={handleDeployment} className="space-y-8">
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-1">Organization Identity</h2>
              <p className={SECTION_DESC}>Specify the legal entity details for your workspace.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className={LABEL_BASE}>Entity Name</label>
                  <input name="name" required type="text" placeholder="Nexus Technologies Inc." className={INPUT_BASE} onChange={handleChange} />
                </div>
                <div>
                  <label className={LABEL_BASE}>Administrative Email</label>
                  <input name="orgEmail" required type="email" placeholder="admin@nexus.com" className={INPUT_BASE} onChange={handleChange} />
                </div>
                <div>
                  <label className={LABEL_BASE}>Region / Headquarters</label>
                  <input name="location" required type="text" placeholder="London, UK" className={INPUT_BASE} onChange={handleChange} />
                </div>
              </div>
            </section>

            <section className="pt-4">
              <h2 className="text-lg font-semibold text-slate-900 mb-1">System Capacity</h2>
              <p className={SECTION_DESC}>Select industry and initial user seating for resource allocation.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={LABEL_BASE}>Industry Sector</label>
                  <select name="industry" required className={INPUT_BASE} onChange={handleChange}>
                    <option value="">Choose sector...</option>
                    <option value="tech">Technology & SaaS</option>
                    <option value="finance">Banking & Fintech</option>
                    <option value="healthcare">Healthcare Systems</option>
                    <option value="logistics">Supply Chain</option>
                  </select>
                </div>
                <div>
                  <label className={LABEL_BASE}>Required Seats</label>
                  <select name="teamSize" required className={INPUT_BASE} onChange={handleChange}>
                    <option value="">Volume...</option>
                    <option value="1-20">1 - 20 Users</option>
                    <option value="21-100">21 - 100 Users</option>
                    <option value="100+">100+ (Enterprise)</option>
                  </select>
                </div>
              </div>
            </section>

            <div className="pt-6">
              <button 
                type="submit" 
                disabled={uiState.loading}
                className="w-full flex items-center justify-center gap-3 py-3.5 bg-slate-900 text-white rounded font-bold text-sm hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 disabled:opacity-50"
              >
                {uiState.loading ? (
                  <> <FiLoader className="animate-spin" /> PROVISIONING SYSTEM... </>
                ) : (
                  "DEPLOY ORGANIZATION ACCOUNT"
                )}
              </button>
              <p className="mt-4 text-[10px] text-slate-400 text-center uppercase tracking-widest leading-relaxed">
                By deploying, you agree to the <span className="underline cursor-pointer">Service Level Agreement</span> and <span className="underline cursor-pointer">DPA</span>.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ---------- INTERNAL UI HELPER ---------- */
const FeatureItem = ({ title, desc }) => (
  <div className="flex gap-4">
    <div className="mt-1 w-5 h-5 bg-indigo-500/20 rounded flex items-center justify-center shrink-0">
      <FiCheck className="text-indigo-400 text-xs" />
    </div>
    <div>
      <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{desc}</p>
    </div>
  </div>
);