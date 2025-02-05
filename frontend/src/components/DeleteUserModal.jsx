import React, { useState } from "react";
import { toast } from "react-toastify";

const DeleteUserModal = ({ selectedItem, closeDeleteModal, fetchUsers }) => {
  const [deleteInput, setDeleteInput] = useState("");

  const handleDelete = async () => {
    if (deleteInput === selectedItem.name) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/admin/users/${selectedItem.email}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Error deleting user");
        }

        toast.success(`${selectedItem.name} has been deleted successfully.`);
        closeDeleteModal();
        setDeleteInput("");
        fetchUsers(); // Refresh users list after deletion
      } catch (error) {
        toast.error("Failed to delete user.");
        console.error(error);
      }
    } else {
      toast.error("Name does not match. Try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-md w-11/12 sm:w-1/2 md:w-1/3 lg:w-1/3">
        <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
        <p>
          Are you sure you want to delete <strong>{selectedItem.name}</strong>?
        </p>
        <input
          type="text"
          placeholder="Enter name to confirm"
          value={deleteInput}
          onChange={(e) => setDeleteInput(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 mt-4"
        />
        <div className="flex justify-end space-x-4 text-xl mt-4">
          <button
            onClick={() => {
              closeDeleteModal();
              setDeleteInput("");
            }}
            className="bg-gray-500 text-white py-1 px-3 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-500 text-white text-xl py-1 px-3 rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserModal;
