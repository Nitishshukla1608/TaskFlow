import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  FiBell, 
  FiMessageSquare, 
  FiUser, 
  FiSearch,
  FiCommand,
  FiHelpCircle,
  FiSettings
} from "react-icons/fi";
import { useSelector } from "react-redux";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();

  // Handle subtle blur effect on scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const displayName = user?.name || "Member";
  const userRole = user?.role || "User";

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-200 border-b 
      ${isScrolled ? "bg-white/90 backdrop-blur-md border-slate-200 shadow-sm" : "bg-white border-transparent"}`}>
      
      <div className="max-w-[1600px] mx-auto h-16 flex items-center justify-between px-6">
        
        {/* LEFT: BRANDING & PRIMARY NAV */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-slate-900 flex items-center justify-center rounded-lg text-white font-bold transition-all group-hover:bg-indigo-600">
              T
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight hidden sm:block">
              TaskFlow <span className="text-slate-400 font-medium">Enterprise</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {['Dashboard', 'Projects', 'Team'].map((item) => (
              <Link 
                key={item}
                to={`/${item.toLowerCase()}`}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors 
                  ${location.pathname.includes(item.toLowerCase()) 
                    ? "bg-slate-100 text-slate-900" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
              >
                {item}
              </Link>
            ))}
          </nav>
        </div>

        {/* CENTER: GLOBAL COMMAND SEARCH */}
        <div className="hidden lg:flex flex-1 max-w-lg mx-8">
          <div className="relative w-full group">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search or jump to..."
              className="w-full bg-slate-100 border border-transparent rounded-lg py-1.5 pl-10 pr-12 text-sm text-slate-900 placeholder:text-slate-500 focus:bg-white focus:border-slate-300 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-40 group-focus-within:opacity-0 transition-opacity pointer-events-none">
              <FiCommand size={12} />
              <span className="text-xs font-bold font-sans text-[10px]">K</span>
            </div>
          </div>
        </div>

        {/* RIGHT: UTILITIES & PROFILE */}
        <div className="flex items-center gap-2">
          
          {/* Utility Buttons */}
          <div className="flex items-center border-r border-slate-200 pr-4 mr-2 gap-1">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors relative" title="Help">
              <FiHelpCircle size={18} />
            </button>
            <Link to="messages"     className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors relative" title="Messages">
              <FiMessageSquare size={18} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
            </Link>
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors relative" title="Notifications">
              <FiBell size={18} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full ring-2 ring-white"></span>
            </button>
          </div>

          {/* User Profile Hook */}
          <div className="flex items-center gap-3 pl-2">
            <div className="hidden xl:flex flex-col items-end">
              <span className="text-sm font-semibold text-slate-900 leading-none">
                {displayName}
              </span>
              <span className={`mt-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                ${userRole === 'Admin' 
                  ? 'bg-amber-50 text-amber-700 border border-amber-200/50' 
                  : 'bg-slate-50 text-slate-600 border border-slate-200'
                }`}>
                {userRole}
              </span>
            </div>

            <Link
              to="profile"
              className="w-9 h-9 bg-slate-200 rounded-lg overflow-hidden border border-slate-200 hover:ring-2 hover:ring-indigo-500/20 transition-all"
            >
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 bg-slate-100 uppercase text-xs font-bold">
                  {displayName.charAt(0)}
                </div>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;