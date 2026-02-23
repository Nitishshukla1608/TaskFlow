import React from "react";
import { Github, Twitter, Linkedin, Mail } from "lucide-react"; // Using Lucide for clean icons

function Footer() {
  return (
    <footer className="w-full bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Brand Identity */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-white rotate-45" />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900">
                Task<span className="text-indigo-600">Flow</span>
              </span>
            </div>
            <p className="text-gray-500 text-sm">Streamlining your productivity, one task at a time.</p>
          </div>

          {/* Social Links */}
          <div className="flex gap-5">
            <SocialIcon icon={<Twitter size={18} />} href="#" />
            <SocialIcon icon={<Github size={18} />} href="#" />
            <SocialIcon icon={<Linkedin size={18} />} href="#" />
            <SocialIcon icon={<Mail size={18} />} href="#" />
          </div>
        </div>

        <hr className="my-8 border-gray-100" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} TaskFlow Inc. All rights reserved.</p>
          
          <div className="flex gap-8">
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Helper component for cleaner code
function SocialIcon({ icon, href }) {
  return (
    <a 
      href={href} 
      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all duration-300"
    >
      {icon}
    </a>
  );
}

export default Footer;