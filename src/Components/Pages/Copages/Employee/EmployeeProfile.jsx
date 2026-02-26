import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUser } from "../../../../Context/AuthContext";
import { 
  FiMail, FiShield, FiMapPin, FiBriefcase, FiPhone, 
  FiHash, FiGlobe, FiMap, FiCalendar, FiUser, FiEdit3, FiSave, FiX, FiLogOut 
} from "react-icons/fi";
import { editUser } from "../../../../Services/authService";

function EmployeeProfile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get employee data from Redux
  const user = useSelector((state) => state.auth.user);
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        country: user.country || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        pinCode: user.pinCode || "",
      });
    }
  }, [user, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setError("");
    setLoading(true);
    try {
      // Employees can only update their personal contact/address details
      await editUser("users", user.uid, formData);
      setIsEditing(false);
      alert("Personal details updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile. Please contact your Admin.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm("Logout from Employee Portal?")) {
      dispatch(setUser(null));
      navigate("/login");
    }
  };

  if (!user) return <div className="p-8 font-bold text-slate-500">Loading Employee Data...</div>;

  return (
    <div className="p-4 md:p-8 bg-[#fdfdfd] min-h-screen">
      <div className="max-w-5xl mx-auto">
        
        <div className="bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          
          {/* Employee Theme Banner (Emerald/Teal instead of Indigo) */}
          <div className="h-40 bg-gradient-to-r from-emerald-500 to-teal-600 w-full relative">
            <div className="absolute -bottom-12 left-10 flex items-end gap-6">
              <div className="w-32 h-32 bg-white rounded-[2.5rem] p-2 shadow-2xl shrink-0">
                <div className="w-full h-full bg-emerald-50 rounded-[2rem] flex items-center justify-center text-4xl font-black text-emerald-600">
                  {user.name?.charAt(0)}
                </div>
              </div>
              <div className="pb-12 hidden sm:block"> 
                <h2 className="text-3xl font-black text-white drop-shadow-md">{user.name}</h2>
                <p className="text-emerald-50 font-bold opacity-90">Employee • {user.position}</p>
              </div>
            </div>

            <div className="absolute bottom-6 right-6 flex items-center gap-3 z-20">
              {!isEditing && (
                <button onClick={handleLogout} className="flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-2xl font-bold hover:bg-rose-500 transition-all active:scale-95">
                  <FiLogOut /> <span className="hidden sm:inline">Logout</span>
                </button>
              )}
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg active:scale-95 ${
                  isEditing ? "bg-rose-500 text-white" : "bg-white text-slate-800"
                }`}
              >
                {isEditing ? <><FiX /> Cancel</> : <><FiEdit3 /> Update Info</>}
              </button>
            </div>
          </div>

          <div className="pt-20 px-10 pb-10">
            {error && <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 font-bold text-sm">{error}</div>}

            {isEditing && (
              <div className="mb-8 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between">
                <p className="text-emerald-700 text-sm font-bold">Update your contact and location details below.</p>
                <button onClick={handleSave} disabled={loading} className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold shadow-md hover:bg-emerald-700 disabled:opacity-50 transition-all">
                  {loading ? "Saving..." : "Save Profile"}
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* READ-ONLY SECTION */}
              <div className="lg:col-span-3">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 border-b border-slate-50 pb-2">Employment Information (Read Only)</h3>
              </div>
              <InfoBox icon={<FiBriefcase />} label="Current Position" value={user.position} />
              <InfoBox icon={<FiGlobe />} label="Organization" value={user.organization} />
              <InfoBox icon={<FiCalendar />} label="Joining Date" value={user.createdAt} />

              {/* EDITABLE SECTION */}
              <div className="lg:col-span-3 mt-4">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 border-b border-slate-50 pb-2">Personal & Contact</h3>
              </div>
              <InfoBox isEditing={isEditing} icon={<FiUser />} label="Full Name" name="name" value={formData.name} onChange={handleChange} />
              <InfoBox icon={<FiMail />} label="Email (Work)" value={user.email} />
              <InfoBox isEditing={isEditing} icon={<FiPhone />} label="Personal Phone" name="phone" value={formData.phone} onChange={handleChange} />

              <div className="lg:col-span-3 mt-4">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 border-b border-slate-50 pb-2">Mailing Address</h3>
              </div>
              <InfoBox isEditing={isEditing} icon={<FiMap />} label="City" name="city" value={formData.city} onChange={handleChange} />
              <InfoBox isEditing={isEditing} icon={<FiGlobe />} label="State" name="state" value={formData.state} onChange={handleChange} />
              <InfoBox isEditing={isEditing} icon={<FiHash />} label="Pin Code" name="pinCode" value={formData.pinCode} onChange={handleChange} />
              
              <div className="md:col-span-2 lg:col-span-3">
                <InfoBox isEditing={isEditing} icon={<FiMapPin />} label="Residential Address" name="address" value={formData.address} onChange={handleChange} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable InfoBox
function InfoBox({ icon, label, value, isEditing, name, onChange }) {
  return (
    <div className="flex flex-col gap-2 p-5 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-emerald-100 hover:bg-white transition-all group">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-white text-emerald-600 rounded-xl shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-all">
          {icon}
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      </div>
      {isEditing ? (
        <input 
          name={name}
          type="text" 
          value={value}
          onChange={onChange}
          className="mt-1 w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
        />
      ) : (
        <p className="text-sm font-bold text-slate-700 mt-1 truncate">{value || "---"}</p>
      )}
    </div>
  );
}

export default EmployeeProfile;