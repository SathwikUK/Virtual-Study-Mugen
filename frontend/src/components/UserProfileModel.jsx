// UserProfileModal.jsx
import React, { useState } from "react";
import axios from "axios";
import { FaTimes, FaEdit, FaSave } from "react-icons/fa";
import { toast } from "react-toastify";

const UserProfileModel = ({ user, onClose, onProfileUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [updatedName, setUpdatedName] = useState(user.name || "");
  const [updatedRole, setUpdatedRole] = useState("student"); // default or from user if available
  const [updatedImage, setUpdatedImage] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUpdatedImage(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMsg("No authorization token found.");
        return;
      }
      const formData = new FormData();
      formData.append("name", updatedName);
      formData.append("role", updatedRole);
      if (updatedImage) {
        formData.append("image", updatedImage);
      }
      setIsUpdating(true);
      await axios.put(`http://localhost:5000/api/auth/users/${user.email}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setTimeout(() => {
        toast.success("Profile updated successfully!");
        onProfileUpdated && onProfileUpdated();
        setIsUpdating(false);
        setIsEditing(false);
        onClose();
      }, 1000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrorMsg(error.response?.data?.message || "Failed to update profile");
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-gray-800 p-6 rounded-lg w-80 relative shadow-xl">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-300 hover:text-white">
          <FaTimes />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-center text-purple-300">User Profile</h2>
        {errorMsg && <p className="text-red-400 text-sm mb-2 text-center">{errorMsg}</p>}
        <div className="flex justify-center mb-4">
          {user.image && !updatedImage ? (
            <img src={user.image} alt="User Avatar" className="w-20 h-20 rounded-full object-cover ring-2 ring-purple-500" />
          ) : updatedImage ? (
            <img src={URL.createObjectURL(updatedImage)} alt="New Avatar" className="w-20 h-20 rounded-full object-cover ring-2 ring-purple-500" />
          ) : (
            <div className="text-gray-400 text-6xl">U</div>
          )}
        </div>
        {isEditing && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">Update Profile Image</label>
            <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-gray-400" />
          </div>
        )}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
          {isEditing ? (
            <input
              type="text"
              value={updatedName}
              onChange={(e) => setUpdatedName(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none"
            />
          ) : (
            <p className="text-gray-200">{user.name}</p>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
          <p className="text-gray-200">{user.email}</p>
        </div>
        {isEditing ? (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
            <select
              value={updatedRole}
              onChange={(e) => setUpdatedRole(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none"
            >
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        ) : null}
        <div className="flex justify-end gap-4 mt-6">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-600 hover:bg-gray-500 text-white"
                title="Cancel"
              >
                <FaTimes />
              </button>
              <button
                onClick={handleSave}
                disabled={isUpdating}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-green-600 hover:bg-green-500 text-white"
                title="Save"
              >
                {isUpdating ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-white"></div>
                ) : (
                  <FaSave />
                )}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 text-white"
              title="Edit"
            >
              <FaEdit />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileModel;
