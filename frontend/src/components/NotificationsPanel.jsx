import React from "react";
import { FaTimes } from "react-icons/fa";
import NotificationItem from "../pages/NotificationItem";

const NotificationsPanel = ({
  show,
  onClose,
  notifications,
  onStatusUpdate,
}) => {
  if (!show) return null;

  return (
    <div className="fixed top-16 right-4 w-72 max-h-[60vh] bg-white bg-opacity-75 backdrop-blur-md shadow-lg p-4 rounded-lg z-50 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Notifications</h3>
        <button onClick={onClose} className="text-gray-800 hover:text-gray-600">
          <FaTimes className="w-5 h-5" />
        </button>
      </div>
      <div className="space-y-2">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <NotificationItem
              key={notification._id}
              notification={notification}
              onStatusUpdate={onStatusUpdate}
            />
          ))
        ) : (
          <p className="text-gray-500 text-center">No notifications found</p>
        )}
      </div>
    </div>
  );
};

export default NotificationsPanel;