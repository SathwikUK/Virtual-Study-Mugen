import React from "react";
import {
  FaChalkboard,
  FaMicrophone,
  FaHome,
  FaUsers,
  FaBell,
  FaInfoCircle,
} from "react-icons/fa";

const Tooltip = ({ children, message }) => {
  return (
    <div className="relative flex items-center group">
      {children}
      <span className="absolute top-full mt-2 hidden group-hover:flex items-center bg-gray-800 text-white text-sm px-3 py-1 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {message}
      </span>
    </div>
  );
};

const DashboardToolbar = ({
  activeTab,
  setActiveTab,
  showGroupMembers,
  showNotifications,
  isWhiteboardActive,
  showGroupDetails,
  onToggleMembers,
  onToggleNotifications,
  onToggleDetails,
  isLiveSession,
  selectedChat,
}) => {
  const handleTabChange = (tab) => {
    if (tab === "whiteboard" && !isLiveSession) {
      return;
    }
    setActiveTab(tab);
  };

  return (    <div className="flex gap-4 bg-blue-100 p-2 shadow-lg border-b border-gray-200 items-center justify-between flex-shrink-0">
    <div className="flex gap-4 items-center">
      <Tooltip message="Whiteboard">
        <div
          onClick={() => isWhiteboardActive && setActiveTab("whiteboard")}
          className={`cursor-pointer p-2 rounded-full ${
            activeTab === "whiteboard" 
              ? "bg-blue-500 text-white" 
              : isWhiteboardActive ? "bg-gray-200" : "bg-gray-200 opacity-50 cursor-not-allowed"
          } transition-colors duration-200`}
          disabled={!isWhiteboardActive}
        >
          <FaChalkboard className="w-5 h-5" />
        </div>
        </Tooltip>
        <Tooltip message="Home">
          <div
            onClick={() => handleTabChange("default")}
            className={`cursor-pointer p-2 rounded-full ${
              activeTab === "default" ? "bg-blue-500 text-white" : "bg-gray-200"
            } hover:bg-blue-600 transition-colors duration-200`}
          >
            <FaHome className="w-5 h-5" />
          </div>
        </Tooltip>
      </div>

      <div className="flex gap-4 items-center ml-auto">
        <button
          onClick={onToggleMembers}
          className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
        >
          <FaUsers
            className="w-5 h-5"
            color={showGroupMembers ? "#4A90E2" : "#6B7280"}
          />
        </button>
        <button
          onClick={onToggleNotifications}
          className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
        >
          <FaBell
            className="w-5 h-5"
            color={showNotifications ? "#4A90E2" : "#6B7280"}
          />
        </button>
        <button
          onClick={onToggleDetails}
          className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
        >
          <FaInfoCircle
            className="w-5 h-5"
            color={showGroupDetails ? "#4A90E2" : "#6B7280"}
          />
        </button>
      </div>
    </div>
  );
};

export default DashboardToolbar;