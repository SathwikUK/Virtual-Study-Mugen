import React, { useState } from "react";
import { toast } from "react-toastify";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const DeleteGroupModal = ({ selectedGroup, onClose, fetchGroups }) => {
  const [confirmationName, setConfirmationName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (confirmationName !== selectedGroup.name) {
      toast.error("Group name does not match. Please enter the correct group name.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/groups/${selectedGroup._id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        toast.success("✅ Group deleted successfully!");
        fetchGroups();
        onClose();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete group.");
      }
    } catch (error) {
      console.error(error);
      toast.error("❌ Error deleting the group. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
      <div className="bg-gray-900 text-white p-6 rounded-lg shadow-2xl w-full max-w-md border border-gray-800">
        <h2 className="text-2xl font-semibold text-center text-red-400 mb-4">Confirm Delete Group</h2>
        <p className="mb-4 text-gray-300 text-center">
          Are you sure you want to delete the group <strong>{selectedGroup.name}</strong>? This action cannot be undone.
        </p>
        <label htmlFor="confirmationName" className="block text-gray-400 text-sm font-medium mb-2">
          Enter the group name to confirm:
        </label>
        <input
          type="text"
          id="confirmationName"
          value={confirmationName}
          onChange={(e) => setConfirmationName(e.target.value)}
          placeholder="Enter group name"
          className="w-full p-2 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-all duration-200"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-md flex items-center justify-center hover:bg-red-700 transition-all duration-200"
            disabled={isLoading}
          >
            {isLoading ? <AiOutlineLoading3Quarters className="animate-spin mr-2" /> : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteGroupModal;
