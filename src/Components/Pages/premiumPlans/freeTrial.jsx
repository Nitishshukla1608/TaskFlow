import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { 
  FiCheck, 
  FiArrowRight, 
  FiClock, 
  FiZap, 
  FiShield, 
  FiStar 
} from 'react-icons/fi';

function freeTrial() {
  const navigate = useNavigate();

  const features = [
    {
      title: "30-Day Full Access",
      desc: "Experience every premium feature with zero restrictions for a full month.",
      icon: <FiClock className="text-indigo-600" />
    },
    {
      title: "Unlimited Tasks",
      desc: "Create and manage as many tasks as you need for your personal projects.",
      icon: <FiZap className="text-amber-500" />
    },
    {
      title: "Collaboration Tools",
      desc: "Invite up to 3 team members to your workspace to test role-based access.",
      icon: <FiStar className="text-purple-500" />
    },
    {
      title: "Secure Data",
      desc: "Your data is encrypted and backed up daily on our secure cloud.",
      icon: <FiShield className="text-emerald-500" />
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 font-sans">
      <div className="max-w-4xl w-full bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Visual/Marketing */}
        <div className="md:w-5/12 bg-indigo-600 p-12 text-white flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center font-black text-2xl mb-8">
              T
            </div>
            <h1 className="text-3xl font-black tracking-tight leading-tight mb-4">
              Your journey to <br /> efficiency starts here.
            </h1>
            <p className="text-indigo-100 font-medium text-sm">
              No credit card required for the first 30 days. Cancel anytime with one click.
            </p>
          </div>
          
          <div className="hidden md:block">
            <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Current Plan</p>
              <p className="text-sm font-bold">Free Trial - Tier 1</p>
            </div>
          </div>
        </div>

        {/* Right Side: Features & Action */}
        <div className="md:w-7/12 p-10 md:p-14">
          <div className="mb-10">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Free Trial Features</h2>
            <div className="h-1 w-12 bg-indigo-600 rounded-full"></div>
          </div>

          <div className="grid gap-8 mb-12">
            {features.map((item, index) => (
              <div key={index} className="flex gap-5">
                <div className="flex-shrink-0 w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xl shadow-sm">
                  {item.icon}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1">{item.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Action Footer */}
          <div className="pt-8 border-t border-slate-50">
            <div className="flex flex-col gap-4">
            <Link to="payment">
  <button 
    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 group"
  >
    Activate Free Trial Now 
    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
  </button>
</Link>
              
              <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                After 30 days, your plan will revert to Basic unless you upgrade.
              </p>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}

export default freeTrial;