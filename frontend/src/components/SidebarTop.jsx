// SidebarTop.jsx
import React from "react";
import {
  FaBars,
  FaArrowLeft,
  FaHome,
  FaSearch,
  FaPlus,
  FaBell,
} from "react-icons/fa";

const SidebarTop = ({
  navigate,
  isOpen,
  searchTerm,
  setSearchTerm,
  onToggleNotifications,
  showNotifications,
  onToggle,
  setModalOpen,
  onToggleOpenAI,
  openAiGif,
}) => {
  return (
    <div className={`mb-4 py-1 flex ${isOpen ? "flex-row items-center space-x-2" : "flex-col space-y-2"}`}>
      {/* Home Button */}
      <button
        onClick={() => navigate("/")}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-80 transition duration-200"
      >
        <FaHome className="text-xl" />
      </button>

      {/* Search */}
      {isOpen && (
        <div className="relative flex-1 max-w-[200px]">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-2 py-1 w-full rounded-full bg-[#2A2A2D] text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      )}

      {/* Plus Button */}
      <button
        className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-80 transition duration-200"
        onClick={() => setModalOpen(true)}
      >
        <FaPlus className="text-xl" />
      </button>

      {/* Notifications */}
      <div className="relative">
        <button
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-80 transition duration-200"
          onClick={onToggleNotifications}
        >
          <FaBell className="text-xl" />
        </button>
        {showNotifications && (
          <div className="absolute top-full right-[-40px] mt-2 z-50">
            {/* Render notifications panel in parent */}
          </div>
        )}
      </div>

      {/* Sidebar Toggle */}
      <button
        className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-80 transition duration-200"
        onClick={onToggle}
      >
        {isOpen ? <FaArrowLeft className="text-xl" /> : <FaBars className="text-xl" />}
      </button>

      {/* GIF Button */}
      <div className="relative">
        <button
          className="w-20 h-20 ml-[-10px] flex items-center justify-center overflow-hidden rounded-full bg-transparent"
          onClick={onToggleOpenAI}
        >
          <img src={openAiGif} alt="GIF" className="w-full h-full object-cover" />
        </button>
      </div>
    </div>
  );
};

export default SidebarTop;
