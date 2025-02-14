// NotificationsPanel.jsx
import React, { useMemo } from "react";
import { FaTimes } from "react-icons/fa";
import NotificationItem from "../pages/NotificationItem";

const NotificationsPanel = ({
  show,
  onClose,
  notifications,
  onStatusUpdate,
  onGroupUpdate,
}) => {
  // Don't render if panel isn't open
  if (!show) return null;

  // Sort notifications by creation date (most recent first)
  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return dateB - dateA;
    });
  }, [notifications]);

  return (
    <div
      className="
        relative
        w-72
        bg-[#1a1a1d]
        text-white
        p-4
        rounded-md
        shadow-lg
        border
        border-[#333]
        z-50
        animate-fadeIn
      "
    >
      {/* Arrow pointing up (triangle) */}
      <div
        className="
          absolute
          -top-3
          right-4
          w-0
          h-0
          
          border-l-8
          border-r-8
          border-transparent
          border-b-8
          border-b-[#1a1a1d]
        "
      />

      {/* Header with title & close button */}
      <div className="flex justify-between items-center border-b border-[#333] pb-2 mb-2 ml-8">
        <h3 className="text-pink-300 text-lg font-semibold">Notifications</h3>
        <button onClick={onClose} className="text-pink-400 hover:text-pink-300">
          <FaTimes />
        </button>
      </div>

      {/* Notification Items */}
      <div className="max-h-72 overflow-y-auto">
        {sortedNotifications.length > 0 ? (
          sortedNotifications.map((notification) => (
            <NotificationItem
              key={notification._id}
              notification={notification}
              onStatusUpdate={onStatusUpdate}
              onGroupUpdate={onGroupUpdate}
            />
          ))
        ) : (
          <p className="text-gray-400 text-center mt-4">No notifications found</p>
        )}
      </div>
    </div>
  );
};

export default NotificationsPanel;
