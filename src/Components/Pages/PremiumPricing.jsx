import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { FiCheck, FiZap, FiStar, FiShield, FiArrowRight } from "react-icons/fi";
import { FaCrown } from "react-icons/fa";
import { Link } from "react-router-dom";
// Ensure this path aligns with your Redux store structure
import { setPlanData, setIsFreeTrial } from "../../Context/PlanContext";

/* ---------- SHARED STYLES ---------- */
const CARD_BASE = "bg-white rounded-[2.5rem] p-10 transition-all duration-300 relative overflow-hidden";
const BADGE_TEXT = "text-[10px] font-black uppercase tracking-[0.2em]";

const PremiumPricing = () => {
  const [billingCycle, setBillingCycle] = useState("monthly");
  const dispatch = useDispatch();

  const plans = {
    monthly: { price: "9.99", period: "month", savings: "5% Off", actualPrice: "10.52", type: "monthly" },
    quarterly: { price: "24.99", period: "3 months", savings: "15% Off", actualPrice: "29.44", type: "quarterly" },
    semi: { price: "45.99", period: "6 months", savings: "25% Off", actualPrice: "61.32", type: "semi-annual" },
    annual: { price: "79.99", period: "year", savings: "35% Off", actualPrice: "122.92", type: "annual" },
  };

  const handleSelection = (key, isTrial) => {
    dispatch(setPlanData(plans[key]));
    dispatch(setIsFreeTrial(isTrial));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 md:p-16 font-sans text-slate-900 antialiased">
      {/* Header Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full mb-6 shadow-sm shadow-amber-100/50">
          <FaCrown size={12} />
          <span className={BADGE_TEXT}>Premium Access</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
          Scale your <span className="text-indigo-600">Operations</span>
        </h2>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px] max-w-md mx-auto">
          Choose a velocity that matches your team's ambition.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        
        {/* LEFT: THE EXPLORER TIER (FREE) */}
        <div className={`${CARD_BASE} border border-slate-200 hover:border-slate-300 group`}>
          <div className="absolute top-0 right-0 p-10 opacity-5 text-slate-900 group-hover:rotate-12 transition-transform">
            <FiZap size={120} />
          </div>
          
          <div className="relative z-10 h-full flex flex-col">
            <h3 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tight">Free Explorer</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-5xl font-black text-slate-900">$0</span>
              <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">/ 30 Days</span>
            </div>
            
            <p className="text-[13px] leading-relaxed text-slate-500 mb-10 font-medium">
              A risk-free entry point to standardize your personal productivity and explore Pro features.
            </p>

            <ul className="space-y-5 mb-12 flex-grow">
              <FeatureItem text="Up to 5 active projects" />
              <FeatureItem text="Basic task analytics" />
              <FeatureItem text="Community support" />
              <FeatureItem text="Mobile App access" />
              <FeatureItem text="Max 50 team members" />
            </ul>

            <Link to="/free-trial" className="block">
              <button
                onClick={() => handleSelection("monthly", true)}
                className="w-full py-4.5 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98]"
              >
                Initialize Free Trial <FiArrowRight />
              </button>
            </Link>
          </div>
        </div>

        {/* RIGHT: THE PRO TIER (PAID) */}
        <div className={`${CARD_BASE} border-2 border-indigo-600 shadow-[0_30px_60px_rgba(79,70,229,0.15)]`}>
          <div className="absolute top-0 right-0 bg-indigo-600 text-white px-8 py-2.5 rounded-bl-3xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
            Recommended
          </div>

          <div className="relative z-10 h-full flex flex-col">
            <h3 className="text-xl font-black text-slate-800 mb-8 uppercase tracking-tight">TaskFlow Pro</h3>
            
            {/* BILLING TOGGLE - INDUSTRIAL STYLE */}
            <div className="grid grid-cols-4 gap-1 p-1.5 bg-slate-100 rounded-[1.25rem] mb-10 border border-slate-200 shadow-inner">
              {Object.keys(plans).map((key) => (
                <button
                  key={key}
                  onClick={() => setBillingCycle(key)}
                  className={`py-2.5 text-[9px] font-black uppercase tracking-tighter rounded-xl transition-all ${
                    billingCycle === key 
                    ? "bg-white text-indigo-600 shadow-sm border border-slate-200" 
                    : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {key === 'semi' ? '6 Mon' : key === 'annual' ? '1 Year' : key === 'quarterly' ? '3 Mon' : '1 Mon'}
                </button>
              ))}
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-6xl font-black text-slate-900">${plans[billingCycle].price}</span>
              <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">/ {plans[billingCycle].period}</span>
            </div>
            
            <div className="flex items-center gap-3 mb-10">
                <span className="line-through text-sm font-bold text-rose-400 opacity-60">
                  ${plans[billingCycle].actualPrice}
                </span>
                <span className="text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                  Save {plans[billingCycle].savings}
                </span>
            </div>

            <ul className="space-y-5 mb-12 flex-grow">
              <FeatureItem text="Unlimited Projects" isPro />
              <FeatureItem text="Full Data Analytics" isPro />
              <FeatureItem text="24/7 Priority Concierge" isPro />
              <FeatureItem text="Custom Organizational Branding" isPro />
              <FeatureItem text="Unlimited Team Nodes" isPro />
            </ul>

            <Link to="/paidplan" className="block"> 
              <button 
                onClick={() => handleSelection(billingCycle, false)}
                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-indigo-500 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                Activate Subscription <FiStar className="fill-current" />
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Trust Signifiers */}
      <div className="mt-20 flex flex-wrap justify-center gap-12 opacity-30 grayscale hover:opacity-50 transition-opacity duration-500">
        <div className="flex items-center gap-3 font-black text-[10px] uppercase tracking-[0.3em] text-slate-500"><FiShield size={18}/> Secure SSL Encryption</div>
        <div className="flex items-center gap-3 font-black text-[10px] uppercase tracking-[0.3em] text-slate-500"><FiStar size={18}/> Industry Standard SLA</div>
      </div>
    </div>
  );
};

const FeatureItem = ({ text, isPro }) => (
  <li className="flex items-center gap-4">
    <div className={`p-1.5 rounded-lg shadow-sm ${isPro ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"}`}>
      <FiCheck size={12} strokeWidth={4} />
    </div>
    <span className={`text-[13px] font-bold ${isPro ? "text-slate-800" : "text-slate-400"}`}>{text}</span>
  </li>
);

export default PremiumPricing;