import React, { useState } from "react";
import { toast } from "react-toastify";
import { FiLoader } from "react-icons/fi";

const DeleteGroupModal = ({ selectedGroup, onClose, fetchGroups }) => {
  const [confirmationName, setConfirmationName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirmationName !== selectedGroup.name) {
      toast.error("❌ Group name does not match. Please enter correctly!");
      return;
    }

    setIsDeleting(true); // Show spinner

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/groups/${selectedGroup._id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) throw new Error("Failed to delete group.");

      toast.success(` ${selectedGroup.name} deleted successfully!`);
      fetchGroups();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(" Error deleting the group.");
    } finally {
      setIsDeleting(false); // Hide spinner
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div className="bg-gray-900 text-white p-6 rounded-lg shadow-xl w-full max-w-md border border-gray-800">
        <h2 className="text-xl font-semibold mb-4 text-center bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
          Confirm Delete Group
        </h2>

        <p className="mb-4 text-gray-300">
          Are you sure you want to delete <strong>{selectedGroup.name}</strong>? This action
          cannot be undone.
        </p>

        <label className="block text-sm font-medium text-gray-400 mb-2">
          Enter the group name to confirm:
        </label>
        <input
          type="text"
          value={confirmationName}
          onChange={(e) => setConfirmationName(e.target.value)}
          placeholder="Enter group name"
          className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
        />

        <div className="flex justify-end space-x-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-all duration-200"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-all duration-200 flex items-center"
            disabled={isDeleting}
          >
            {isDeleting ? <FiLoader className="animate-spin mr-2" /> : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteGroupModal;
