import React from "react";
import { Github, Twitter, Linkedin, Mail, ExternalLink } from "lucide-react";

const FOOTER_LINKS = [
  {
    title: "Product",
    links: [
      { name: "Features", href: "/features" },
      { name: "Integrations", href: "/integrations" },
      { name: "Enterprise", href: "/enterprise" },
      { name: "Solutions", href: "/solutions" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "Documentation", href: "/docs" },
      { name: "API Reference", href: "/api" },
      { name: "Community", href: "/community" },
      { name: "Status", href: "/status" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About Us", href: "/about" },
      { name: "Careers", href: "/careers" },
      { name: "Press Kit", href: "/press" },
      { name: "Contact", href: "/contact" },
    ],
  },
];

const SOCIAL_LINKS = [
  { icon: <Twitter size={18} />, href: "#", label: "Twitter" },
  { icon: <Github size={18} />, href: "#", label: "GitHub" },
  { icon: <Linkedin size={18} />, href: "#", label: "LinkedIn" },
];

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          
          {/* Brand & Newsletter Section */}
          <div className="lg:col-span-4 flex flex-col space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-indigo-600 rounded flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-white rotate-45" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Task<span className="text-indigo-600">Flow</span>
              </span>
            </div>
            
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
              The operating system for modern teams. Secure, scalable, and 
              designed for global collaboration.
            </p>

            <div className="pt-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
                Subscribe to our newsletter
              </h4>
              <form className="flex gap-2 max-w-sm" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  placeholder="Enter your work email"
                  className="flex-1 px-4 py-2 text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                <button className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded hover:bg-slate-800 transition-colors">
                  Join
                </button>
              </form>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {FOOTER_LINKS.map((section) => (
              <div key={section.title}>
                <h4 className="text-sm font-semibold text-slate-900 mb-5">{section.title}</h4>
                <ul className="space-y-4">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <a 
                        href={link.href} 
                        className="text-sm text-slate-500 hover:text-indigo-600 transition-colors inline-flex items-center group"
                      >
                        {link.name}
                        {link.name === "Status" && (
                          <span className="ml-2 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Utility Bar */}
        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-2 text-[13px] text-slate-400">
            <p>© {new Date().getFullYear()} TaskFlow Inc.</p>
            <a href="#" className="hover:text-slate-600">Privacy Policy</a>
            <a href="#" className="hover:text-slate-600">Terms of Service</a>
            <a href="#" className="hover:text-slate-600">Trust Center</a>
          </div>

          <div className="flex items-center gap-4">
            {SOCIAL_LINKS.map((social) => (
              <a 
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="text-slate-400 hover:text-slate-900 transition-colors"
              >
                {social.icon}
              </a>
            ))}
            <div className="h-4 w-[1px] bg-slate-200 mx-2" />
            <button className="flex items-center gap-1.5 text-[13px] font-medium text-slate-600 hover:text-indigo-600">
              <Mail size={14} />
              Support
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}