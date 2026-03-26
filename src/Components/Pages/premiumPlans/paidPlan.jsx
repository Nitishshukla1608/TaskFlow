import React from 'react';
import { useSelector } from 'react-redux';
import { FiCheckCircle, FiZap, FiShield, FiArrowRight, FiInfo } from "react-icons/fi";
// FIX 1: Correct import source
import { Link } from "react-router-dom";

function PaidPlan({ onActivate }) {
  const planData = useSelector((state) => state.plan?.currentPlanData);
  const isFreeTrial = useSelector((state) => state.plan?.isFreeTrial);

  if (!planData || !planData.price) {
    return (
      <div className="p-12 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
        <FiInfo className="mx-auto text-slate-300 mb-4" size={40} />
        <h3 className="text-lg font-bold text-slate-800">No plan selected</h3>
        <p className="text-slate-500 text-sm">Please go back and select a workspace plan.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto my-10">
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-indigo-100/50 overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-indigo-600 p-8 text-white relative">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <FiZap size={120} />
          </div>
          <div className="relative z-10">
            <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest">
              {isFreeTrial ? "Trial Activation" : "Premium Member"}
            </span>
            <h2 className="text-3xl font-black mt-2">
              {isFreeTrial ? "30 Days Free" : `${planData.period} Pro`}
            </h2>
            <p className="opacity-80 text-sm font-medium mt-1">
              Unlocking full access to TaskFlow's advanced features.
            </p>
          </div>
        </div>

        {/* Features List */}
        <div className="p-10">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">
            Included in your plan
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            <PlanFeature text="Unlimited Projects" />
            <PlanFeature text="Role-based Security" />
            <PlanFeature text="Team Analytics" />
            <PlanFeature text="Priority Support" />
            <PlanFeature text="Custom Branding" />
            <PlanFeature text="Unlimited Storage" />
          </div>

          {/* Pricing Summary */}
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 mb-8">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Billing Cycle</p>
                <p className="font-black text-slate-800 uppercase tracking-tight">
                    {planData.period}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-500 uppercase">Total to Pay</p>
                <p className="text-2xl font-black text-indigo-600">
                    ${isFreeTrial ? "0.00" : planData.price}
                </p>
              </div>
            </div>
          </div>

          {/* Action Button - FIX 2: Using Link as the container for better HTML structure */}
          <Link 
            to="payment"
            onClick={onActivate} // Runs activation logic before navigating
            className="group w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-3"
          >
            {isFreeTrial ? "Activate Free Trial" : "Confirm & Pay Now"}
            <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>

          <div className="mt-6 flex items-center justify-center gap-2 text-slate-400">
            <FiShield size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">
                Secure 256-bit encrypted activation
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const PlanFeature = ({ text }) => (
  <div className="flex items-center gap-3">
    <FiCheckCircle className="text-emerald-500 shrink-0" size={18} />
    <span className="text-sm font-bold text-slate-700">{text}</span>
  </div>
);

export default PaidPlan;