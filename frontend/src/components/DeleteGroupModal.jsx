import React, { useState } from "react";
import { toast } from "react-toastify";

const DeleteGroupModal = ({ selectedGroup, onClose, fetchGroups }) => {
  const [confirmationName, setConfirmationName] = useState("");

  const handleDelete = async () => {
    if (confirmationName !== selectedGroup.name) {
      toast.error(
        "Group name does not match. Please enter the correct group name."
      );
      return;
    }

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
        toast.success("Group deleted successfully.");
        fetchGroups();
        onClose();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete group.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error deleting the group.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Confirm Delete Group</h2>
        <p className="mb-4">
          Are you sure you want to delete the group{" "}
          <strong>{selectedGroup.name}</strong>? This action cannot be undone.
        </p>
        <label
          htmlFor="confirmationName"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Enter the group name to confirm:
        </label>
        <input
          type="text"
          id="confirmationName"
          value={confirmationName}
          onChange={(e) => setConfirmationName(e.target.value)}
          placeholder="Enter group name"
          className="w-full p-2 border border-gray-300 rounded-md mb-4"
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteGroupModal;
