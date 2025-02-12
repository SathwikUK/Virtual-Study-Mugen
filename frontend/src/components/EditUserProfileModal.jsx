import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { X, Loader2 } from "lucide-react"; // Loader2 for spinning effect

const EditUserProfileModal = ({ selectedItem, onClose, fetchUsers }) => {
  const [username, setUsername] = useState(selectedItem?.name || "");
  const [email, setEmail] = useState(selectedItem?.email || "");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(
    selectedItem?.image ? `data:image/jpeg;base64,${selectedItem.image}` : ""
  );
  const [loading, setLoading] = useState(false); // Loading state

  const updateProfile = async (updatedProfile, file) => {
    try {
      setLoading(true); // Show spinner

      const formData = new FormData();
      formData.append("name", updatedProfile.name);
      formData.append("email", updatedProfile.email);
      if (file) formData.append("image", file);

      const response = await fetch(
        `http://localhost:5000/api/admin/users/${updatedProfile.email}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Error updating profile");
      }

      toast.success(`Profile of ${updatedProfile.name} updated successfully!`, {
        position: "top-right",
        autoClose: 3000,
      });

      fetchUsers(); // Refresh users list after update
      setTimeout(() => {
        setLoading(false);
        onClose(); // Close modal after update
      }, 1000);
    } catch (error) {
      toast.error("Failed to update profile.", {
        position: "top-right",
        autoClose: 3000,
      });
      setLoading(false);
      console.error(error);
    }
  };

  const handleUpdate = () => {
    if (!username) {
      toast.error("Username is mandatory!", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const updatedProfile = {
      ...selectedItem,
      name: username,
      email: email,
    };

    updateProfile(updatedProfile, profilePhoto);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setProfilePhoto(file);
      setPhotoPreview(fileUrl);
    } else {
      setPhotoPreview("");
      setProfilePhoto(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-50 p-4">
      {/* Modal Container */}
      <div className="relative bg-gray-900 text-white p-8 rounded-xl w-full max-w-lg 
        border border-gray-700 shadow-2xl">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition">
          <X size={24} />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-cyan-400 to-blue-400 
          bg-clip-text text-transparent mb-6">
          Edit Profile
        </h2>

        {/* Profile Photo */}
        <div className="flex flex-col items-center mb-6">
          {photoPreview ? (
            <img
              src={photoPreview}
              alt="Profile Preview"
              className="w-32 h-32 rounded-full border-4 border-cyan-400 object-cover"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center 
              justify-center border-4 border-cyan-400">
              <span className="text-4xl text-white font-bold">
                {selectedItem.name?.charAt(0)}
              </span>
            </div>
          )}

          {/* Upload Button */}
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="mt-4 w-full text-sm text-gray-300 cursor-pointer 
              border border-gray-600 px-4 py-2 rounded-lg bg-gray-800 
              hover:border-blue-400 transition"
          />
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full bg-gray-800 border border-gray-600 px-4 py-2 
                rounded-lg text-gray-300 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 px-4 py-2 
                rounded-lg text-white focus:border-blue-400 outline-none transition"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-700 text-white rounded-lg transition
              hover:bg-gray-600"
            >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            className="px-6 py-2 bg-cyan-500 text-white rounded-lg transition
              hover:bg-cyan-600 flex items-center justify-center"
            >
              {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
              {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default EditUserProfileModal;
