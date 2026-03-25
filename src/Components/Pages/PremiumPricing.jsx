import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { FiCheck, FiZap, FiStar, FiShield, FiArrowRight } from "react-icons/fi";
import { FaCrown } from "react-icons/fa";
import { Link } from "react-router-dom";
// Ensure this path matches your Redux slice file exactly
import { setPlanData, setIsFreeTrial } from "../../Context/PlanContext";

const PremiumPricing = () => {
  const [billingCycle, setBillingCycle] = useState("monthly");
  const dispatch = useDispatch();

  const plans = {
    monthly: { price: "9.99", period: "1 month", savings: "5% Off", actualPrice: "10.52", type: "monthly" },
    quarterly: { price: "24.99", period: "3 months", savings: "15% Off", actualPrice: "29.44", type: "quarterly" },
    semi: { price: "45.99", period: "6 months", savings: "25% Off", actualPrice: "61.32", type: "semi-annual" },
    annual: { price: "79.99", period: "1 year", savings: "35% Off", actualPrice: "122.92", type: "annual" },
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8 font-sans text-slate-900">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-full mb-4">
          <FaCrown size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">Upgrade to Pro</span>
        </div>
        <h2 className="text-4xl font-black text-slate-800 tracking-tight mb-3">
          Supercharge your <span className="text-indigo-600">Workflow</span>
        </h2>
        <p className="text-slate-400 font-medium max-w-md mx-auto">
          Choose the plan that fits your team's size and speed.
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* CARD 1: 1 MONTH FREE TRIAL */}
        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-indigo-100 transition-all">
          <div className="absolute top-0 right-0 p-8 opacity-5 text-slate-900">
            <FiZap size={100} />
          </div>
          
          <div className="relative z-10">
            <h3 className="text-xl font-black text-slate-800 mb-2">Free Explorer</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-5xl font-black text-slate-800">$0</span>
              <span className="text-slate-400 font-bold text-sm">/ 30 days</span>
            </div>
            
            <p className="text-sm text-slate-500 mb-8 font-medium">
              Perfect for getting started and organizing your personal tasks.
            </p>

            <ul className="space-y-4 mb-10">
              <FeatureItem text="Up to 5 active projects" />
              <FeatureItem text="Basic task analytics" />
              <FeatureItem text="Email support" />
              <FeatureItem text="Mobile App access" />
              <FeatureItem text="Only 50 members" />
              <FeatureItem text="Unlimited Tasks" />
            </ul>

            <Link to="free-trial">
              <button
                onClick={() => {
                  dispatch(setPlanData(plans.monthly)); // Trial is always based on monthly
                  dispatch(setIsFreeTrial(true));
                }}
                className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
              >
                Start Free Trial <FiArrowRight />
              </button>
            </Link>
          </div>
        </div>

        {/* CARD 2: PAID PLANS (TOGGLE) */}
        <div className="bg-white rounded-[2.5rem] p-10 border-2 border-indigo-600 shadow-2xl shadow-indigo-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-indigo-600 text-white px-6 py-2 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest">
            Most Popular
          </div>

          <div className="relative z-10">
            <h3 className="text-xl font-black text-slate-800 mb-6">TaskFlow Pro</h3>
            
            {/* Billing Cycle Selector */}
            <div className="grid grid-cols-4 gap-2 p-1.5 bg-slate-50 rounded-2xl mb-8 border border-slate-100">
              {Object.keys(plans).map((key) => (
                <button
                  key={key}
                  onClick={() => setBillingCycle(key)}
                  className={`py-2 text-[9px] font-black uppercase rounded-xl transition-all ${
                    billingCycle === key 
                    ? "bg-white text-indigo-600 shadow-sm border border-slate-100" 
                    : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {key === 'semi' ? '6 Mon' : key === 'annual' ? '1 Year' : key === 'quarterly' ? '3 Mon' : '1 Mon'}
                </button>
              ))}
            </div>

            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-5xl font-black text-slate-800">${plans[billingCycle].price}</span>
              <span className="text-slate-400 font-bold text-sm">/ {plans[billingCycle].period}</span>
            </div>
            
            <div className="flex items-center gap-2 mb-8">
               <span className="line-through text-sm font-bold text-red-400">
                 ${plans[billingCycle].actualPrice}
               </span>
               {plans[billingCycle].savings && (
                 <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-md">
                   Save {plans[billingCycle].savings}
                 </span>
               )}
            </div>

            <ul className="space-y-4 mt-8 mb-10">
              <FeatureItem text="Unlimited Projects" isPro />
              <FeatureItem text="Role-based permissions" isPro />
              <FeatureItem text="Advanced Team Analytics" isPro />
              <FeatureItem text="Priority 24/7 Support" isPro />
              <FeatureItem text="Custom Branding" isPro />
              <FeatureItem text="Unlimited Team size" isPro />
            </ul>

            <Link to="paidplan"> 
              <button 
                onClick={() => {
                  dispatch(setPlanData(plans[billingCycle]));
                  dispatch(setIsFreeTrial(false)); // Paid plan, not a trial
                }}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
              >
                Upgrade to Pro <FiStar />
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="mt-16 flex flex-wrap justify-center gap-10 opacity-40 grayscale">
        <div className="flex items-center gap-2 font-black text-slate-400"><FiShield /> SECURE PAYMENTS</div>
        <div className="flex items-center gap-2 font-black text-slate-400"><FiStar /> TOP RATED APP</div>
      </div>
    </div>
  );
};

const FeatureItem = ({ text, isPro }) => (
  <li className="flex items-center gap-3">
    <div className={`p-1 rounded-full ${isPro ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-400"}`}>
      <FiCheck size={12} strokeWidth={4} />
    </div>
    <span className={`text-sm font-semibold ${isPro ? "text-slate-700" : "text-slate-500"}`}>{text}</span>
  </li>
);

export default PremiumPricing;