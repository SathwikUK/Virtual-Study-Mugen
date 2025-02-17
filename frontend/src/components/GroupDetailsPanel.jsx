import React, { useState } from "react";
import axios from "../api/axios";
import { FaTimes, FaUserPlus } from "react-icons/fa";

const GroupDetailsPanel = ({
  show,
  onClose,
  selectedChat,
  creatorDetails,
  groupMembers,
  onInviteClick,
  currentUser,
  onGroupDeleted,
}) => {
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [confirmGroupName, setConfirmGroupName] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [loading, setLoading] = useState(false);
  // State to show error popup when unauthorized
  const [errorPopup, setErrorPopup] = useState("");

  if (!show || !selectedChat) return null;

  // Utility function to get image source
  const getImageSrc = (img) => {
    if (!img) return "https://via.placeholder.com/150";
    if (typeof img === "string" && img.startsWith("data:image")) return img;
    if (typeof img === "object" && img.data) {
      return `data:image/jpeg;base64,${btoa(
        new Uint8Array(img.data).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      )}`;
    }
    return img;
  };

  // Handle delete button click with error popup instead of alert
  const handleDeleteGroupClick = () => {
    console.log("Current user ID:", currentUser?._id);
    console.log("Creator ID:", creatorDetails?._id);
    if (
      !currentUser ||
      !creatorDetails ||
      String(currentUser._id) !== String(creatorDetails._id)
    ) {
      setErrorPopup("You do not have authority to delete this group.");
      setTimeout(() => {
        setErrorPopup("");
      }, 2000);
      return;
    }
    setShowDeletePopup(true);
  };

  // Handle confirming deletion using Axios
  const handleConfirmDelete = async () => {
    if (confirmGroupName !== selectedChat.name) {
      setDeleteError("Group name does not match.");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/groups/${selectedChat._id}/deleteAll`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onGroupDeleted && onGroupDeleted(selectedChat._id);
      setShowDeletePopup(false);
      setConfirmGroupName("");
      setDeleteError("");
      onClose();
    } catch (error) {
      console.error("Error deleting group:", error.response || error);
      setDeleteError("Error deleting group. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed top-16 right-4 w-80 max-h-[80vh] bg-gradient-to-br from-purple-900 to-black rounded-xl shadow-[0_0_20px_rgba(192,132,252,0.7)] overflow-hidden z-50 flex flex-col font-sans tracking-wide text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <h3 className="text-xl font-bold text-purple-300 leading-snug">
          Group Details
        </h3>
        <button
          onClick={onClose}
          className="text-purple-300 hover:text-white transition-colors duration-300"
        >
          <FaTimes className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 hide-scrollbar">
        {/* Group Info */}
        <div className="flex flex-col items-center">
          <div className="relative w-20 h-20 mb-4">
            <img
              src={getImageSrc(selectedChat.image)}
              alt={selectedChat.name}
              className="w-full h-full rounded-full object-cover ring-4 ring-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.7)]"
            />
          </div>
          <h2 className="text-lg font-bold text-purple-300 mb-2 text-center">
            {selectedChat.name}
          </h2>
          <p className="text-sm text-purple-200 text-center">
            {selectedChat.description}
          </p>
        </div>

        {/* Creator Details */}
        {creatorDetails && (
          <div>
            <h4 className="text-purple-400 font-semibold mb-4">Created by</h4>
            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-500/20 transition-colors">
              <img
                src={getImageSrc(creatorDetails.image)}
                alt={creatorDetails.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-400 shadow-sm"
              />
              <div>
                <h5 className="font-medium text-white">
                  {creatorDetails.name}
                </h5>
                <p className="text-sm text-purple-200">{creatorDetails.role}</p>
              </div>
            </div>
          </div>
        )}

        {/* Group Members */}
        <div>
          <h4 className="text-purple-400 font-semibold mb-4">
            Members ({groupMembers.length})
          </h4>
          <div className="space-y-3">
            {groupMembers.map((member) => (
              <div
                key={member._id || member.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-500/20 transition-colors"
              >
                <img
                  src={getImageSrc(member.image)}
                  alt={member.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-400 shadow-sm"
                />
                <div>
                  <h5 className="font-medium text-white">{member.name}</h5>
                  <p className="text-sm text-purple-200">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 space-y-3">
        <button
          onClick={onInviteClick}
          className="w-full py-2 px-4 bg-purple-600 rounded-lg text-white font-bold flex items-center justify-center gap-2 hover:bg-purple-500 shadow-[0_0_10px_rgba(192,132,252,0.7)] transition duration-300 ease-in-out"
        >
          <FaUserPlus className="w-5 h-5" />
          <span>Invite Members</span>
        </button>
        <button
          onClick={handleDeleteGroupClick}
          className="w-full py-2 px-4 bg-red-600 rounded-lg text-white font-bold flex items-center justify-center gap-2 hover:bg-red-500 shadow-[0_0_10px_rgba(255,99,71,0.7)] transition duration-300 ease-in-out"
        >
          Delete Group
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeletePopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="bg-gray-800 rounded-lg shadow-xl p-6 z-10 w-80">
            <h4 className="text-xl font-bold mb-4 text-red-400">
              Confirm Deletion
            </h4>
            <p className="text-sm text-gray-300 mb-4">
              Are you sure? This action is irreversible. All messages and files
              will be permanently deleted.
              <br />
              Please enter the group name to confirm deletion:
            </p>
            <input
              type="text"
              value={confirmGroupName}
              onChange={(e) => {
                setConfirmGroupName(e.target.value);
                if (deleteError) setDeleteError("");
              }}
              className="w-full p-2 rounded mb-2"
              placeholder="Enter group name"
            />
            {deleteError && (
              <p className="text-xs text-red-400 mb-2">{deleteError}</p>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeletePopup(false);
                  setConfirmGroupName("");
                  setDeleteError("");
                }}
                className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-600 rounded hover:bg-red-500 transition-colors"
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Popup */}
      {errorPopup && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded shadow-lg z-50">
          {errorPopup}
        </div>
      )}

      {/* Inline style for hiding scrollbars */}
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default GroupDetailsPanel;
