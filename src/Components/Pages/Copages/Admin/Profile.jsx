import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  FiMail, FiShield, FiMapPin, FiBriefcase, FiPhone, 
  FiHash, FiGlobe, FiMap, FiCalendar, FiUser, FiEdit3, FiSave, FiX 
} from "react-icons/fi";
import {editUser} from "../../../../Services/authService"
function Profile() {
  const user = useSelector((state) => state.auth.user);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // 1. Local state to hold the editable field values
  const [formData, setFormData] = useState({});

  // Initialize formData when user data is available or when entering edit mode
  useEffect(() => {
    if (user) {
      setFormData({
        name:user.name,
        email: user.email || "",
        password:user.password,
        role:user.role,
        position:user.position,
        organization:user.organization,
        regId:user.regId,
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

  // 2. The function that runs when you click "Save Changes"
  const handleSave = async () => {
    console.log("Saving new values to database:", formData);
    setError("");
    setLoading(true);
    try{
        editUser(
            "users",
            user.uid,
          formData,
        )
    }catch(error){
        console.log("Error in editing details ", error.code , error.message)
    }
    
    setIsEditing(false); // Exit edit mode after saving
    alert("Profile updated successfully!");
  };

  if (!user) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-4 md:p-8 bg-[#f8fafc] min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
          
          {/* Top Banner Area */}
          <div className="h-40 bg-gradient-to-r from-indigo-600 to-violet-600 w-full relative">
            <div className="absolute -bottom-12 left-10 flex items-end gap-6">
              <div className="w-32 h-32 bg-white rounded-[2.5rem] p-2 shadow-2xl">
                <div className="w-full h-full bg-slate-100 rounded-[2rem] flex items-center justify-center text-4xl font-black text-indigo-600">
                  {user.name?.charAt(0)}
                </div>
              </div>
              <div className="mb-13"> {/* Fixed margin from 13 to 4 for better alignment */}
                <h2 className="text-3xl font-black text-white drop-shadow-md">{user.name}</h2>
                <p className="text-indigo-100 font-bold opacity-90">{user.organization} • {user.position}</p>
              </div>
            </div>

            <button 
              onClick={() => setIsEditing(!isEditing)}
              className={`absolute bottom-6 right-10 flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg active:scale-95 ${
                isEditing ? "bg-rose-500 text-white" : "bg-white text-slate-800"
              }`}
            >
              {isEditing ? <><FiX /> Cancel</> : <><FiEdit3 /> Edit Profile</>}
            </button>
          </div>

          <div className="pt-20 px-10 pb-10">
            {isEditing && (
              <div className="mb-8 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-between animate-in slide-in-from-top-4 duration-300">
                <p className="text-indigo-600 text-sm font-bold">You are currently in editing mode.</p>
                <button 
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-colors"
                >
                  <FiSave /> Save Changes
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-3">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 border-b border-slate-50 pb-2">Identification & Role</h3>
              </div>
              <InfoBox icon={<FiHash />} label="User UID" value={user.uid} />
              <InfoBox icon={<FiShield />} label="Registration ID" value={user.regId} />
              <InfoBox icon={<FiBriefcase />} label="System Role" value={user.role} />

              <div className="lg:col-span-3 mt-4">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 border-b border-slate-50 pb-2">Contact Details</h3>
              </div>
              {/* Editable Fields */}
              <InfoBox 
                isEditing={isEditing} 
                icon={<FiMail />} 
                label="Email Address" 
                name="email"
                value={formData.email} 
                onChange={handleChange}
              />
              <InfoBox 
                isEditing={isEditing} 
                icon={<FiPhone />} 
                label="Phone Number" 
                name="phone"
                value={formData.phone} 
                onChange={handleChange}
              />
              <InfoBox icon={<FiCalendar />} label="Joined Date" value={user.createdAt} />

              <div className="lg:col-span-3 mt-4">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 border-b border-slate-50 pb-2">Location Information</h3>
              </div>
              <InfoBox 
                isEditing={isEditing} 
                icon={<FiMap />} 
                label="City" 
                name="city"
                value={formData.city} 
                onChange={handleChange}
              />
              <InfoBox 
                isEditing={isEditing} 
                icon={<FiGlobe />} 
                label="State" 
                name="state"
                value={formData.state} 
                onChange={handleChange}
              />
              <InfoBox 
                isEditing={isEditing} 
                icon={<FiHash />} 
                label="Pin Code" 
                name="pinCode"
                value={formData.pinCode} 
                onChange={handleChange}
              />
              
              <div className="md:col-span-2 lg:col-span-3">
                <InfoBox 
                  isEditing={isEditing} 
                  icon={<FiMapPin />} 
                  label="Full Address" 
                  name="address"
                  value={formData.address} 
                  onChange={handleChange}
                />
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoBox({ icon, label, value, isEditing, name, onChange }) {
  return (
    <div className="flex flex-col gap-2 p-5 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-indigo-100 hover:bg-white transition-all group">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-white text-indigo-600 rounded-xl shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
          {icon}
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</p>
      </div>
      
      {isEditing ? (
        <input 
          name={name}
          type="text" 
          value={value}
          onChange={onChange}
          className="mt-1 w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        />
      ) : (
        <p className="text-sm font-bold text-slate-700 mt-1 pl-1 truncate" title={value}>
          {value || "---"}
        </p>
      )}
    </div>
  );
}

export default Profile;