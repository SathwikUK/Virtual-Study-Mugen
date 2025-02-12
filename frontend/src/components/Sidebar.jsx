import React, { useState } from "react";
import { Users, UsersRound, LogOut, Menu } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import vsm from "../assets/vsmlogo.png";

// Utility function to merge Tailwind classes
const mergeClasses = (...classes) => twMerge(clsx(classes));

const Sidebar = ({ activeTab, setActiveTab, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'groups', label: 'Groups', icon: UsersRound },
  ];

  return (
    <>
      {/* Hamburger Button for Mobile */}
      <button 
        className="lg:hidden fixed top-5 left-5 z-50 bg-purple-700 p-2 rounded-full shadow-md shadow-purple-500 
        hover:scale-105 transition-all duration-300"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu className="text-white w-6 h-6" />
      </button>

      {/* Sidebar */}
      <div className={mergeClasses(
        "fixed lg:relative top-0 left-0 w-64 min-h-screen   bg-gray-900/50 backdrop-blur-xl border-r border-white/10",
        "shadow-2xl transition-all duration-500 ease-in-out group overflow-hidden",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        
        {/* Background Gradient Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-pink-500/10 opacity-50" />
        
        {/* Content Container */}
        <div className="relative z-10 p-6 h-full flex flex-col">
          
          {/* Logo and Title Section */}
          <div className="flex items-center space-x-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 
              flex items-center justify-center shadow-lg shadow-purple-500/25">
              <img src={vsm} className="w-full h-full object-contain" alt="VSM Logo" />
            </div>
            <h1 className="text-xl font-semibold font-futuristic bg-gradient-to-r from-white to-white/70 
              bg-clip-text text-transparent tracking-wider">
              Admin Portal
            </h1>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-grow space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false); // Close sidebar on mobile when an item is clicked
                }}
                className={mergeClasses(
                  "w-full px-4 py-3.5 rounded-xl transition-all duration-500 text-left flex items-center space-x-3 relative",
                  "hover:shadow-lg hover:shadow-purple-500/10",
                  activeTab === item.id
                    ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white shadow-lg"
                    : "text-gray-300 hover:bg-white/5"
                )}
              >
                <item.icon className={mergeClasses(
                  "w-5 h-5 transition-transform duration-500",
                  "group-hover/item:scale-110",
                  activeTab === item.id ? "text-purple-400" : "text-gray-400"
                )} />
                <span className="font-medium">{item.label}</span>

                {/* Active Indicator */}
                {activeTab === item.id && (
                  <div className="absolute right-2 w-2 h-2 rounded-full bg-purple-400 
                    shadow-lg shadow-purple-500/50 animate-pulse" />
                )}
              </button>
            ))}
          </nav>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="mt-6 w-full px-4 py-3.5 rounded-xl relative overflow-hidden
              group/logout transition-all duration-500
              hover:shadow-lg hover:shadow-pink-500/20"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 
              transition-opacity duration-500 opacity-0 group-hover/logout:opacity-100" />
            <div className="relative flex items-center justify-center space-x-2">
              <LogOut className="w-5 h-5 text-gray-300 transition-transform duration-500 
                group-hover/logout:scale-110 group-hover/logout:text-pink-400" />
              <span className="text-gray-300 font-medium">Logout</span>
            </div>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
