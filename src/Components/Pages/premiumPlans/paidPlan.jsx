import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from "react-router-dom";
import { 
  FiCheck, FiShield, FiArrowRight, 
  FiAlertCircle, FiCreditCard, FiLock 
} from "react-icons/fi";

const INCLUDED_FEATURES = [
  "Unlimited Project Workspaces",
  "Advanced Role-Based Permissions",
  "Team Performance Analytics",
  "24/7 Priority Engineer Support",
  "White-label Organization Branding",
  "Enterprise-grade Security (SOC2)"
];

export default function PlanConfirmation({ onActivate }) {
  const planData = useSelector((state) => state.plan?.currentPlanData);
  const isFreeTrial = useSelector((state) => state.plan?.isFreeTrial);

  // Robust Error State
  if (!planData || !planData.price) {
    return (
      <div className="max-w-md mx-auto my-20 p-12 text-center bg-white border border-slate-200 rounded-lg shadow-sm">
        <FiAlertCircle className="mx-auto text-slate-300 mb-4" size={32} />
        <h3 className="text-base font-bold text-slate-900">Session Timeout</h3>
        <p className="text-slate-500 text-sm mt-2 mb-6">Your plan selection could not be retrieved. Please restart the checkout process.</p>
        <Link to="/pricing" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 underline">Return to Pricing</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Progress Tracker (Simplified) */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <div className="h-1 w-12 bg-indigo-600 rounded-full" />
          <div className="h-1 w-12 bg-indigo-600 rounded-full" />
          <div className="h-1 w-12 bg-slate-200 rounded-full" />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-5">
          
          {/* Left: Value Stack (3/5 Columns) */}
          <div className="lg:col-span-3 p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-slate-100">
            <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">Order Summary</h2>
            <h1 className="text-2xl font-bold text-slate-900 mb-8">
              {isFreeTrial ? "Verify Your Trial Activation" : "Finalize Your Subscription"}
            </h1>

            <div className="space-y-4">
              <p className="text-sm font-semibold text-slate-700 mb-4">Included in {planData.title || 'Pro'} Plan:</p>
              <div className="grid grid-cols-1 gap-3">
                {INCLUDED_FEATURES.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 text-slate-600">
                    <div className="flex-shrink-0 w-5 h-5 bg-emerald-50 rounded-full flex items-center justify-center">
                      <FiCheck className="text-emerald-600" size={12} />
                    </div>
                    <span className="text-sm font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12 p-6 bg-slate-50 rounded-lg border border-slate-100 flex gap-4">
              <FiShield className="text-slate-400 mt-1" size={20} />
              <div>
                <h4 className="text-sm font-bold text-slate-900">Enterprise Security Pledge</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Your workspace is protected by 256-bit AES encryption. Access can be revoked by the administrator at any time.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Checkout Sidebar (2/5 Columns) */}
          <div className="lg:col-span-2 p-8 lg:p-12 bg-slate-50/30 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-medium text-slate-500">Plan Type</span>
                <span className="text-sm font-bold text-slate-900 uppercase tracking-tighter">{planData.period}</span>
              </div>
              
              <div className="space-y-3 pt-6 border-t border-slate-200">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="text-slate-900 font-medium">${planData.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Discount Applied</span>
                  <span className="text-emerald-600 font-medium">{isFreeTrial ? "-$"+planData.price : "$0.00"}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                  <span className="text-base font-bold text-slate-900">Total Due</span>
                  <span className="text-2xl font-bold text-slate-900 tracking-tighter">
                    ${isFreeTrial ? "0.00" : planData.price}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-12 space-y-4">
              <Link 
                to="/dashboard/payment"
                onClick={onActivate}
                className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
              >
                {isFreeTrial ? "Activate Now" : "Complete Purchase"}
                <FiArrowRight />
              </Link>
              
              <div className="flex items-center justify-center gap-2 text-slate-400">
                <FiLock size={12} />
                <span className="text-[10px] font-bold uppercase tracking-[0.15em]">
                  Encrypted Checkout
                </span>
              </div>
            </div>
          </div>
          
        </div>

        <p className="text-center mt-8 text-xs text-slate-400 font-medium">
          By clicking activate, you agree to our <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}