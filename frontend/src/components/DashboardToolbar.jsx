// DashboardToolbar.jsx
import React, { useEffect, useState } from "react";
import { FaUsers, FaBell, FaInfoCircle } from "react-icons/fa";
import axios from "axios";

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
  const [notificationCount, setNotificationCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(
        "http://localhost:5000/api/auth/notifications",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Count only pending notifications
      const pendingCount = response.data.notifications.filter(
        (notif) => !notif.status || notif.status === "pending"
      ).length;

      setNotificationCount(pendingCount);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Set up polling for real-time updates
  useEffect(() => {
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Update count when notifications panel is closed
  useEffect(() => {
    if (!showNotifications) {
      fetchNotifications();
    }
  }, [showNotifications]);

  return (
    <div className="flex gap-4 bg-gray-50/80 backdrop-blur-sm p-4 shadow-sm border-b border-gray-200 items-center justify-end flex-shrink-0">
      <div className="flex gap-4 items-center">
        
        <Tooltip message="Notifications">
          <button
            onClick={onToggleNotifications}
            className="p-3 rounded-full bg-white hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow border border-gray-100 relative"
          >
            <FaBell
              className="w-5 h-5"
              color={showNotifications ? "#4A90E2" : "#6B7280"}
            />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>
        </Tooltip>
        <Tooltip message="Group Details">
          <button
            onClick={onToggleDetails}
            className="p-3 rounded-full bg-white hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow border border-gray-100"
          >
            <FaUsers
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
