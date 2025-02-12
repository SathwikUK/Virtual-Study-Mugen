import React from "react";
import { FaUsers, FaBell, FaInfoCircle } from "react-icons/fa";
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
  showGroupMembers,
  showNotifications,
  showGroupDetails,
  onToggleMembers,
  onToggleNotifications,
  onToggleDetails,
}) => {
  return (
    <div className="flex gap-4 bg-gray-50/80 backdrop-blur-sm p-4 shadow-sm border-b border-gray-200 items-center justify-end flex-shrink-0">
      <div className="flex gap-4 items-center">
        <Tooltip message="Group Members">
          <button
            onClick={onToggleMembers}
            className="p-3 rounded-full bg-white hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow border border-gray-100"
          >
            <FaUsers
              className="w-5 h-5"
              color={showGroupMembers ? "#4A90E2" : "#6B7280"}
            />
          </button>
        </Tooltip>
        <Tooltip message="Notifications">
          <button
            onClick={onToggleNotifications}
            className="p-3 rounded-full bg-white hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow border border-gray-100"
          >
            <FaBell
              className="w-5 h-5"
              color={showNotifications ? "#4A90E2" : "#6B7280"}
            />
          </button>
        </Tooltip>
        <Tooltip message="Group Details">
          <button
            onClick={onToggleDetails}
            className="p-3 rounded-full bg-white hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow border border-gray-100"
          >
            <FaInfoCircle
              className="w-5 h-5"
              color={showGroupDetails ? "#4A90E2" : "#6B7280"}
            />
          </button>
        </Tooltip>
      </div>
    </div>
  );
};
export default DashboardToolbar;