import React from "react";

function Footer() {
  return (
    <footer className="w-full h-14 bg-white border-t flex items-center justify-between px-6 text-sm text-gray-600">
      
      {/* Left side */}
      <p>
        © {new Date().getFullYear()}{" "}
        <span className="font-semibold text-indigo-600">
          TaskFlow
        </span>
        . All rights reserved.
      </p>

      {/* Right side */}
      <div className="flex gap-4">
        <a href="#" className="hover:text-indigo-600 transition">
          Privacy Policy
        </a>
        <a href="#" className="hover:text-indigo-600 transition">
          Terms
        </a>
        <a href="#" className="hover:text-indigo-600 transition">
          Support
        </a>
      </div>

    </footer>
  );
}

export default Footer;
