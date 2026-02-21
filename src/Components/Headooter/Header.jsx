import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  FiBell, 
  FiMessageSquare, 
  FiUser, 
  FiMoon, 
  FiSun,
  FiSearch
} from "react-icons/fi";
import { useSelector } from "react-redux";

function Header() {
  const [darkMode, setDarkMode] = useState(false);
  const [text, setText] = useState("")
  
  // 1. Get user data from Redux
  const user = useSelector((state) => state.auth.user);
  
  // 2. Logic for display name and role
  // We use user?.name (from Firestore) or fallback to display/email
  const fullName = user?.name || user?.displayName || user?.email?.split('@')[0] || 'User';
  const firstName = fullName.split(' ')[0];
  const userRole = user?.role || "Member"; // Pulls 'Admin' or 'Employee'

  return (
    <header className="sticky top-0 z-50 w-full h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 shadow-sm">
      
      {/* LEFT: BRANDING */}
      <div className="flex items-center gap-4">
        <div className="group w-11 h-11 bg-indigo-600 text-white flex items-center justify-center rounded-2xl font-black text-xl shadow-lg shadow-indigo-200 transform hover:rotate-6 transition-transform cursor-pointer">
          T
        </div>
        <div className="hidden md:block">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Task<span className="text-indigo-600">Flow</span>
          </h1>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
            Workspace v2.0
          </p>
        </div>
      </div>

      {/* CENTER: SEARCH BAR (Adds to the "Professional" look) */}
      <div className="hidden lg:flex flex-1 max-w-md mx-10">
        <div className="relative w-full">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
  type="text" 
  placeholder="Search tasks or team member..."
  onChange={(e) => setText(e.target.value)}
  value={text}
  className="w-full bg-slate-50 border-none rounded-2xl py-2.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
/>
        </div>
      </div>

      {/* RIGHT: USER ACTIONS */}
      <div className="flex items-center gap-3">
        
        {/* User Info & Role Tag */}
        <div className="flex flex-col items-end text-right">
       
          <span className={`mt-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter ${
            userRole === 'Admin' 
            ? 'bg-amber-100 text-amber-700 border border-amber-200' 
            : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
          }`}>
            {userRole}
          </span>
        </div>

        <div className="h-8 w-[1px] bg-slate-100 mx-2 hidden sm:block"></div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-2">

{/* Messages */}
        <button className="relative p-2.5 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all group">
            <FiMessageSquare size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full group-hover:scale-125 transition-transform"></span>
          </button>

          {/* Notifications */}
          <button className="relative p-2.5 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all group">
            <FiBell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full group-hover:scale-125 transition-transform"></span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all"
          >
            {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>
        </div>

        {/* Profile Avatar */}
        <Link
          to="/profile"
          className="ml-2 flex items-center gap-2 group p-1 pr-3 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
        >
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center rounded-xl shadow-md group-hover:shadow-indigo-200 transition-all">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="profile" className="w-full h-full rounded-xl object-cover" />
            ) : (
              <FiUser size={20} className="text-white" />
            )}
          </div>
        </Link>
      </div>
    </header>
  );
}

export default Header;