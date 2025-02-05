import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EditUserProfileModal = ({ selectedItem, onClose, fetchUsers }) => {
  const [username, setUsername] = useState(selectedItem?.name || "");
  const [email, setEmail] = useState(selectedItem?.email || "");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(
    selectedItem?.image ? `data:image/jpeg;base64,${selectedItem.image}` : ""
  );

  const updateProfile = async (updatedProfile, file) => {
    try {
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
      onClose();
    } catch (error) {
      toast.error("Failed to update profile.", {
        position: "top-right",
        autoClose: 3000,
      });
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
    <div>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md sm:w-full md:w-2/3 lg:w-1/3 xl:w-1/3">
          <h2 className="text-xl font-bold mb-4">Edit Profile</h2>

          <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center sm:space-x-4">
            <label className="block font-medium w-full sm:w-32">Email</label>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
            />
          </div>

          <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center sm:space-x-4">
            <label className="block font-medium w-full sm:w-32">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
              required
            />
          </div>

          <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center sm:space-x-4">
            <label className="block font-medium w-full sm:w-32">
              Profile Photo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
            />
          </div>

          {photoPreview && (
            <div className="mb-4 flex justify-center">
              <img
                src={photoPreview}
                alt="Profile Preview"
                className="w-32 h-32 object-cover rounded-full border"
              />
            </div>
          )}

          <div className="flex justify-end space-x-4 mt-4">
            <button
              onClick={onClose}
              className="bg-gray-500 text-white text-xl py-1 px-3 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              className="bg-blue-500 text-xl text-white py-1 px-3 rounded hover:bg-blue-600"
            >
              Update
            </button>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default EditUserProfileModal;
