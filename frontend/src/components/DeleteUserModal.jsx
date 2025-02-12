import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { X, Loader2 } from "lucide-react"; // Icon for close & loading spinner

const DeleteUserModal = ({ selectedItem, closeDeleteModal, fetchUsers }) => {
  const [deleteInput, setDeleteInput] = useState("");
  const [loading, setLoading] = useState(false); // Spinner state

  const handleDelete = async () => {
    if (deleteInput !== selectedItem.name) {
      toast.error("Name does not match. Try again.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    setLoading(true); // Show spinner

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

      toast.success(`${selectedItem.name} has been deleted successfully.`, {
        position: "top-right",
        autoClose: 3000,
      });

      setTimeout(() => {
        setLoading(false);
        closeDeleteModal();
        setDeleteInput("");
        fetchUsers(); // Refresh users list after deletion
      }, 1000);
    } catch (error) {
      toast.error("Failed to delete user.", {
        position: "top-right",
        autoClose: 3000,
      });
      setLoading(false);
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-50 p-4">
      {/* Modal Container */}
      <div className="relative bg-gray-900 text-white p-8 rounded-xl w-full max-w-md border 
        border-gray-700 shadow-2xl">
        
        {/* Close Button */}
        <button 
          onClick={() => {
            closeDeleteModal();
            setDeleteInput("");
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition">
          <X size={24} />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-red-400 to-pink-500 
          bg-clip-text text-transparent mb-6">
          Confirm Deletion
        </h2>

        {/* Warning Message */}
        <p className="text-lg text-center mb-4">
          Are you sure you want to delete <strong className="text-red-400">{selectedItem.name}</strong>?
        </p>

        {/* Confirmation Input */}
        <input
          type="text"
          placeholder="Enter name to confirm"
          value={deleteInput}
          onChange={(e) => setDeleteInput(e.target.value)}
          className="w-full bg-gray-800 border border-gray-600 px-4 py-2 
            rounded-lg text-white focus:border-red-400 outline-none transition"
        />

        {/* Buttons */}
        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={() => {
              closeDeleteModal();
              setDeleteInput("");
            }}
            className="px-6 py-2 bg-gray-700 text-white rounded-lg transition
              hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-6 py-2 bg-red-500 text-white rounded-lg transition
              hover:bg-red-600 flex items-center justify-center"
          >
            {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default DeleteUserModal;
