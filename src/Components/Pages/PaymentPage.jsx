import React, { useState } from "react";
import { FiShield, FiCheckCircle, FiCreditCard, FiSmartphone, FiArrowLeft, FiShoppingBag } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getFunctions, httpsCallable } from "firebase/functions";
import { setIsFreeTrial } from "../../Context/PlanContext";

function PaymentPage() {
  const navigate = useNavigate();    
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  // 1. Get plan information from Redux (Fallback to empty object if state is fresh/empty)
  const rawPlanData = useSelector((state) => state.plan?.currentPlanData);
  const isFreeTrial = useSelector((state) => state.plan?.isFreeTrial);
  const user = useSelector((state) => state.auth?.user);

  // Fallback safety to prevent app crashing on page refresh
  const planData = rawPlanData || { price: "0", actualPrice: "0", period: "month", savings: "0" };

  // 2. 🔥 Convert String Prices to Numbers to fix the toFixed() crash
  const numPrice = Number(planData.price) || 0;
  const numActualPrice = Number(planData.actualPrice) || 0;
  
  // 3. Dynamic Plan Calculations
  const planName = isFreeTrial ? "Monthly Pro (Trial)" : `${planData.period} plan`;
  const originalPrice = isFreeTrial ? numActualPrice : numActualPrice;
  const trialDiscount = isFreeTrial ? numActualPrice : (numActualPrice - numPrice);
  const totalAmount = isFreeTrial ? 0 : numPrice;
  

  const handleRazorpay = async () => {
    if (loading) return;  // it means payment is already in progress...
    setLoading(true);

    alert("Payment feature coming soon.....")
    setLoading(false);
    return;
   
    try {
      const functions = getFunctions();
      const createOrder = httpsCallable(functions, "createOrder");

      const response = await createOrder({
        amount: totalAmount, // Pass number
        planType: planData,
      });

      const order = response.data.order;

      const options = {
        key: "YOUR_RAZORPAY_KEY_ID", // Replace with your actual Key ID
        amount: order.amount,
        currency: order.currency,
        name: "TaskFlow Premium",
        description: isFreeTrial ? "30-Day Free Trial" : "Plan Subscription",
        order_id: order.id,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: {
          color: "#4f46e5",
        },
        handler: async function (response) {
          console.log("Payment success:", response);
          navigate("/AdminDashboard", { state: { paymentSuccess: true } });
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error("Payment Error:", error);
      alert("Failed to initialize payment. Please try again.");
      setLoading(false);
    }
  };





  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12 font-sans text-slate-900">
      <button
        onClick={() => {
          dispatch(setIsFreeTrial(true));
          navigate(-1);
        }}
        className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest mb-8 transition-all group"
      >
        <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Plans
      </button>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* LEFT: CART SUMMARY */}
        <div className="lg:col-span-7">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-8">Review your order</h2>

          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm mb-6">
            <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-50">
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    isFreeTrial ? "bg-indigo-50 text-indigo-600" : "bg-amber-50 text-amber-600"
                  }`}
                >
                  {isFreeTrial ? <FiCheckCircle size={28} /> : <FiShoppingBag size={28} />}
                </div>
                <div>
                  <h4 className="font-black text-slate-800 capitalize">{planName}</h4>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                    {isFreeTrial ? "Trial period: 30 Days" : `Billed every ${planData.period}`}
                  </p>
                </div>
              </div>
              <span className="font-black text-slate-800">${originalPrice.toFixed(2)}</span>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-4">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-slate-500">Subscription Price</span>
                <span className="text-slate-800">${originalPrice.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-sm font-medium">
                <span className="text-emerald-500">{isFreeTrial ? "Free Trial Discount" : "Bundle Savings"}</span>
                <span className="text-emerald-500">-${trialDiscount.toFixed(2)}</span>
              </div>

              <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                <span className="text-lg font-black text-slate-800">Total Due Today</span>
                <div className="text-right">
                  <span className="text-3xl font-black text-indigo-600">${totalAmount.toFixed(2)}</span>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                    Includes all taxes
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
            <FiShield className="text-indigo-600 shrink-0" />
            <p className="text-[11px] text-indigo-700 font-bold leading-relaxed">
              Safe & Secure: Your payment information is encrypted.{" "}
              {isFreeTrial
                ? "You will not be charged until your trial ends."
                : "Instant access will be granted after payment."}
            </p>
          </div>
        </div>

        {/* RIGHT: PAYMENT METHODS */}
        <div className="lg:col-span-5">
          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-black mb-8 tracking-tight">Payment Method</h3>

              <div className="space-y-4 mb-10">
                <PaymentMethodIcon icon={<FiCreditCard />} label="Credit / Debit Card" />
                <PaymentMethodIcon icon={<FiSmartphone />} label="UPI (GPay, PhonePe)" />
                <PaymentMethodIcon icon={<FiShield />} label="Net Banking" />
              </div>

              <button
                onClick={handleRazorpay}
                disabled={loading}
                className={`w-full py-5 rounded-2xl font-black text-sm transition-all shadow-xl flex items-center justify-center gap-2 ${
                  loading
                    ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/40"
                }`}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Pay with Razorpay"
                )}
              </button>

              <p className="text-center text-[10px] text-slate-500 mt-6 font-bold uppercase tracking-[0.2em]">
                Guaranteed Safe Checkout
              </p>
            </div>

            {/* Background blur effect */}
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

const PaymentMethodIcon = ({ icon, label }) => (
  <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all cursor-pointer group">
    <div className="text-indigo-400 group-hover:text-white transition-colors">{icon}</div>
    <span className="text-sm font-bold text-slate-300 group-hover:text-white">{label}</span>
  </div>
);

export default PaymentPage;