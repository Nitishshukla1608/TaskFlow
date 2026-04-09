import React, { useState } from "react";
import { FiShield, FiCheckCircle, FiCreditCard, FiSmartphone, FiArrowLeft, FiShoppingBag, FiLock } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getFunctions, httpsCallable } from "firebase/functions";
import { setIsFreeTrial } from "../../Context/PlanContext";

function PaymentPage() {
  const navigate = useNavigate();    
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  // 1. Data Retrieval with Fallbacks
  const rawPlanData = useSelector((state) => state.plan?.currentPlanData);
  const isFreeTrial = useSelector((state) => state.plan?.isFreeTrial);
  const user = useSelector((state) => state.auth?.user);

  // Safety net: ensure we always have numbers to work with
  const planData = rawPlanData || { price: 0, actualPrice: 0, period: "Monthly" };
  const numPrice = Number(planData.price) || 0;
  const numActualPrice = Number(planData.actualPrice) || 0;
  
  // 2. Dynamic Pricing Logic
  const planName = isFreeTrial ? `${planData.period} Pro (Trial)` : `${planData.period} Subscription`;
  const originalPrice = numActualPrice;
  const discountAmount = isFreeTrial ? numActualPrice : (numActualPrice - numPrice);
  const totalAmount = isFreeTrial ? 0 : numPrice;

  const handleRazorpay = async () => {
    if (loading) return;
    setLoading(true);

    // Placeholder for Production Key
    const RAZORPAY_KEY = "YOUR_RAZORPAY_KEY_ID"; 

    try {
      // Logic for Free Trials (Skip Razorpay if $0)
      if (totalAmount === 0 && isFreeTrial) {
        // Here you would call a 'startFreeTrial' cloud function instead
        alert("Free trial activated! Redirecting...");
        navigate("/AdminDashboard", { state: { trialStarted: true } });
        return;
      }

      const functions = getFunctions();
      const createOrder = httpsCallable(functions, "createOrder");

      const response = await createOrder({
        amount: totalAmount,
        planType: planData,
      });

      const { order } = response.data;

      const options = {
        key: RAZORPAY_KEY,
        amount: order.amount,
        currency: order.currency,
        name: "TaskFlow Premium",
        description: planName,
        order_id: order.id,
        prefill: {
          name: user?.name || "TaskFlow User",
          email: user?.email || "",
        },
        theme: { color: "#4f46e5" },
        handler: async function (response) {
          console.log("Transaction ID:", response.razorpay_payment_id);
          navigate("/AdminDashboard", { state: { paymentSuccess: true } });
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Gateway Error:", error);
      alert("Payment gateway unavailable. Please try again later.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-12 font-sans text-slate-900">
      {/* Navigation */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] mb-10 transition-all group"
      >
        <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> 
        Return to Tiers
      </button>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* LEFT: ORDER ANALYSIS */}
        <div className="lg:col-span-7">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-8">Checkout Analysis</h2>

          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] mb-6">
            <div className="flex justify-between items-center mb-8 pb-8 border-b border-slate-50">
              <div className="flex items-center gap-5">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner ${
                  isFreeTrial ? "bg-indigo-50 text-indigo-600" : "bg-amber-50 text-amber-600"
                }`}>
                  {isFreeTrial ? <FiCheckCircle size={32} /> : <FiShoppingBag size={32} />}
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-lg capitalize">{planName}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                    {isFreeTrial ? "30-Day Evaluation" : `Recurring ${planData.period}`}
                  </p>
                </div>
              </div>
              <span className="font-black text-slate-900 text-lg">${originalPrice.toFixed(2)}</span>
            </div>

            <div className="space-y-5">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-slate-400 uppercase tracking-wider">Base Price</span>
                <span className="text-slate-900">${originalPrice.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-sm font-bold">
                <span className="text-emerald-500 uppercase tracking-wider">
                  {isFreeTrial ? "Trial Waiver" : "Bundle Savings"}
                </span>
                <span className="text-emerald-500">-${discountAmount.toFixed(2)}</span>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                <div>
                  <span className="text-sm font-black text-slate-900 uppercase tracking-widest">Total Commitment</span>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">No hidden processing fees</p>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-black text-indigo-600">${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl">
            <FiLock className="text-indigo-400 shrink-0" size={20} />
            <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
              <strong className="text-white uppercase tracking-tighter mr-1">Encrypted Session:</strong>
              Your financial data never touches our servers. Processed via 256-bit SSL encryption provided by Razorpay.
            </p>
          </div>
        </div>

        {/* RIGHT: GATEWAY SELECTION */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-[2rem] p-1 border border-slate-100 shadow-2xl">
            <div className="bg-slate-900 rounded-[1.8rem] p-10 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xl font-black mb-10 tracking-tight uppercase border-b border-white/10 pb-4">
                  Payment Method
                </h3>

                <div className="space-y-3 mb-12">
                  <PaymentMethodRow icon={<FiCreditCard />} label="Cards" subtext="Visa, MC, Amex" />
                  <PaymentMethodRow icon={<FiSmartphone />} label="UPI / Net" subtext="GPay, PhonePe, Banks" />
                </div>

                <button
                  onClick={handleRazorpay}
                  disabled={loading}
                  className={`w-full py-5 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${
                    loading
                      ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_15px_30px_rgba(79,70,229,0.4)] active:scale-[0.98]"
                  }`}
                >
                  {loading ? (
                    <LoaderIcon />
                  ) : (
                    <>Authorize Payment <ArrowRight /></>
                  )}
                </button>

                <div className="mt-8 flex justify-center items-center gap-4 opacity-30 grayscale">
                   {/* You can add small SVGs of Visa/Mastercard here */}
                   <span className="text-[10px] font-black uppercase tracking-widest">PCI DSS Compliant</span>
                </div>
              </div>

              {/* Decorative Aura */}
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- SUB-COMPONENTS ---------- */

const PaymentMethodRow = ({ icon, label, subtext }) => (
  <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group">
    <div className="flex items-center gap-4">
      <div className="text-indigo-400 group-hover:scale-110 transition-transform">{icon}</div>
      <div>
        <span className="text-[13px] font-black text-white block leading-none">{label}</span>
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">{subtext}</span>
      </div>
    </div>
    <div className="w-4 h-4 rounded-full border-2 border-slate-700 group-hover:border-indigo-500 transition-colors" />
  </div>
);

const LoaderIcon = () => (
  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
);

const ArrowRight = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

export default PaymentPage;