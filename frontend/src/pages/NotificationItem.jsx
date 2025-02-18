import React, { useState } from "react";
import axios from "../api/axios";
import { toast } from "react-toastify";

const NotificationItem = ({ notification, onStatusUpdate, onGroupUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null); // "accept" or "reject"
  const [hasShownToast, setHasShownToast] = useState(false); // Prevent duplicate toasts

  const getTimeAgo = (createdAt) => {
    if (!createdAt) return "Time unavailable";
    const now = new Date();
    const created = new Date(createdAt);
    const diffInSeconds = Math.floor((now - created) / 1000);
    if (isNaN(diffInSeconds)) return "Time unavailable";

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return `${Math.floor(diffInSeconds / 604800)}w ago`;
  };

  const formatTimestamp = (createdAt) => {
    if (!createdAt) return "";
    const date = new Date(createdAt);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleResponse = async (accept) => {
    setIsLoading(true);
    setSelectedAction(accept ? "accept" : "reject");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        if (!hasShownToast) {
          toast.error("Authentication required", {
            toastId: `notification-error-${notification._id}`,
          });
          setHasShownToast(true);
        }
        setIsLoading(false);
        setSelectedAction(null);
        return;
      }

      const response = await axios.post(
        "/auth/respond-group-invite",
        {
          notificationId: notification._id,
          groupId: notification.groupId,
          accept,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        const message = accept
          ? `Successfully joined ${notification.groupName}`
          : `Declined invitation to ${notification.groupName}`;

        // For accepted invites with onGroupUpdate provided,
        // assume the sidebar update will handle its own toast.
        // Otherwise, show the toast here—only once.
        if (!hasShownToast && (!accept || !onGroupUpdate)) {
          toast.success(message, {
            toastId: `notification-${notification._id}`,
          });
          setHasShownToast(true);
        }

        // Update notification status in the parent component.
        if (onStatusUpdate) {
          onStatusUpdate(notification._id);
        }

        // If accepted, fetch the updated groups list.
        if (accept && onGroupUpdate) {
          try {
            const groupsResponse = await axios.get("/auth/groups", {
              headers: { Authorization: `Bearer ${token}` },
            });
            onGroupUpdate(groupsResponse.data.groups);
          } catch (error) {
            console.error("Error fetching updated groups:", error);
          }
        }
      }
    } catch (error) {
      console.error("Error responding to invitation:", error);
      if (!hasShownToast) {
        toast.error(
          error.response?.data?.message || "Failed to respond to invitation",
          { toastId: `notification-error-${notification._id}` }
        );
        setHasShownToast(true);
      }
      // Reset selectedAction on error so the user can try again.
      setSelectedAction(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="
        mb-3
        rounded-lg
        border
        border-[#2f2f36]
        bg-[#1a1a1d]
        p-4
        shadow-[0_0_15px_rgba(255,0,255,0.05)]
        hover:border-pink-500
        transition-colors
        duration-300
      "
    >
      <div className="flex justify-between items-start">
        {/* Left Section */}
        <div className="flex-grow">
          <p className="text-sm text-gray-200 mb-2">
            You have been invited to join{" "}
            <span className="font-semibold text-pink-400">
              {notification.groupName}
            </span>
          </p>
          {notification.createdAt && (
            <div className="text-xs text-gray-400 flex gap-2">
              <span>{getTimeAgo(notification.createdAt)}</span>
              <span className="opacity-70">
                {formatTimestamp(notification.createdAt)}
              </span>
            </div>
          )}
        </div>

        {/* Right Section: Accept/Reject buttons or status */}
        <div className="flex flex-col items-end gap-1">
          {(!notification.status || notification.status === "pending") && (
            <>
              {selectedAction ? (
                // Show only one button with spinner if an action is selected
                <button
                  disabled
                  className="
                    px-3
                    py-1
                    rounded-md
                    bg-gray-600
                    text-white
                    text-sm
                    focus:outline-none
                    ring-1
                    ring-gray-400
                    ring-offset-2
                    ring-offset-black
                    transition-all
                    duration-200
                  "
                >
                  <div className="flex items-center">
                    <svg
                      className="animate-spin h-5 w-5 text-white mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      ></path>
                    </svg>
                    Processing...
                  </div>
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleResponse(true)}
                    disabled={isLoading}
                    className="
                      px-3
                      py-1
                      rounded-md
                      bg-gradient-to-r
                      from-green-600
                      to-green-700
                      text-white
                      text-sm
                      hover:from-green-500
                      hover:to-green-600
                      focus:outline-none
                      ring-1
                      ring-green-400
                      ring-offset-2
                      ring-offset-black
                      transition-all
                      duration-200
                    "
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleResponse(false)}
                    disabled={isLoading}
                    className="
                      px-3
                      py-1
                      rounded-md
                      bg-gradient-to-r
                      from-red-600
                      to-red-700
                      text-white
                      text-sm
                      hover:from-red-500
                      hover:to-red-600
                      focus:outline-none
                      ring-1
                      ring-red-400
                      ring-offset-2
                      ring-offset-black
                      transition-all
                      duration-200
                    "
                  >
                    Reject
                  </button>
                </div>
              )}
            </>
          )}

          {notification.status === "accepted" && (
            <span className="text-sm text-green-400 font-semibold">
              Accepted
            </span>
          )}
          {notification.status === "rejected" && (
            <span className="text-sm text-red-400 font-semibold">
              Rejected
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
