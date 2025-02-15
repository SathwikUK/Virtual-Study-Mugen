// SidebarBottom.jsx
import React from "react";
import { FaSignOutAlt } from "react-icons/fa";

const SidebarBottom = ({ isOpen, userProfileImage, userName, onProfileClick, handleLogout }) => {
  return (
    <div className={`mt-auto flex ${isOpen ? "flex-row items-center justify-between" : "flex-col items-center space-y-2"}`}>
      <div className="flex items-center gap-2 cursor-pointer" onClick={onProfileClick}>
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-600 ring-2 ring-purple-500">
          {userProfileImage ? (
            <img
              src={userProfileImage}
              alt="User Profile"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="text-gray-300 text-3xl">U</div>
          )}
        </div>
        {isOpen && <div className="font-medium text-gray-100 truncate">{userName}</div>}
      </div>
      <button
        onClick={handleLogout}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-red-600 to-purple-600 hover:opacity-80 transition duration-200"
        title="Logout"
      >
        <FaSignOutAlt className="text-xl" />
      </button>
    </div>
  );
};

export default SidebarBottom;
