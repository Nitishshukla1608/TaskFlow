import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  FiBell, 
  FiMessageSquare, 
  FiUser, 
  FiMoon, 
  FiSun 
} from "react-icons/fi";
import { useSelector } from "react-redux";

function Header() {
  const [darkMode, setDarkMode] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const userName = user?.displayName || user?.email?.split('@')[0] || 'Admin';
  const displayUserName = userName.split(' ')[0] + "'s"; // Get first name and add 's'

  return (
    <header className="w-full h-16 bg-white shadow-md flex items-center justify-between px-6">
      
      {/* Left: Logo / Brand */}
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 bg-indigo-600 text-white flex items-center justify-center rounded-lg font-bold">
          T
        </div>
        <h1 className="text-xl font-bold text-indigo-600">
          TaskFlow
        </h1>
      </div>

      {/* Right: Icons */}
      <div className="flex items-center gap-8">

      <h6 className=" font-semibold text-indigo-600 flex items-center gap-1">
  {displayUserName} Dashboard
  <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
</h6>


        {/* Messages */}
        <button className="relative text-gray-600 hover:text-indigo-600 transition">
          <FiMessageSquare size={22} />
        </button>

        {/* Notifications */}
        <button className="relative text-gray-600 hover:text-indigo-600 transition">
          <FiBell size={22} />
          {/* Notification dot */}
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="text-gray-600 hover:text-indigo-600 transition"
        >
          {darkMode ? <FiSun size={22} /> : <FiMoon size={22} />}
        </button>

        {/* Account */}
        <Link
          to="/profile"
          className="w-9 h-9 bg-gray-100 flex items-center justify-center rounded-full hover:bg-indigo-100 transition"
        >
          <FiUser size={20} className="text-gray-700" />
        </Link>
      </div>
    </header>
  );
}

export default Header;
