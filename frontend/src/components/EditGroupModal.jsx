import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { X, Loader2 } from "lucide-react";
import axios from "axios";

const EditGroupModal = ({ selectedGroup, onClose, fetchGroups }) => {
  const [groupData, setGroupData] = useState({
    name: "",
    description: "",
  });

  const [groupPhoto, setGroupPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [loading, setLoading] = useState(false);

  // Load selected group's data into the modal
  useEffect(() => {
    setGroupData({
      name: selectedGroup?.name || "",
      description: selectedGroup?.description || "",
    });

    if (selectedGroup?.image) {
      if (selectedGroup.image.startsWith("http") || selectedGroup.image.startsWith("data")) {
        setPhotoPreview(selectedGroup.image); // If it's a direct URL or already in Base64 format
      } else {
        setPhotoPreview(`data:image/jpeg;base64,${selectedGroup.image}`); // Assume it's Base64
      }
    } else {
      setPhotoPreview(""); // No image found
    }

    console.log("Selected Group Image:", selectedGroup?.image); // Debugging log
  }, [selectedGroup]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setGroupData({ ...groupData, [name]: value });
  };

  // Handle image selection
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      console.log("New Image URL:", fileUrl); // Debugging log
      setGroupPhoto(file);
      setPhotoPreview(fileUrl);
    } else {
      setGroupPhoto(null);
      setPhotoPreview("");
    }
  };

  // Handle form submission
  const handleSave = async () => {
    if (!groupData.name) {
      toast.error("Group name is required!", { position: "top-right", autoClose: 3000 });
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", groupData.name);
      formData.append("description", groupData.description);
      if (groupPhoto) formData.append("image", groupPhoto);

      const response = await axios.put(
        `http://localhost:5000/api/admin/groups/${selectedGroup._id}`,
        formData
      );

      if (response.status !== 200) {
        throw new Error("Failed to update group.");
      }

      toast.success("Group updated successfully.", {
        position: "top-right",
        autoClose: 3000,
      });

      fetchGroups();
      setTimeout(() => {
        setLoading(false);
        onClose();
      }, 1000);
    } catch (error) {
      toast.error("Failed to update group.", {
        position: "top-right",
        autoClose: 3000,
      });
      console.error("Update Error:", error);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-50 p-4">
      <div className="relative bg-gray-900 text-white p-8 rounded-xl w-full max-w-lg border border-gray-700 shadow-2xl">
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition">
          <X size={24} />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-6">
          Edit Group
        </h2>

        {/* Image Upload */}
        <div className="flex flex-col items-center mb-6">
          {photoPreview ? (
            <img
              src={photoPreview}
              alt="Group Preview"
              className="w-32 h-32 rounded-full border-4 border-cyan-400 object-cover"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center border-4 border-cyan-400">
              <span className="text-4xl text-white font-bold">{groupData.name.charAt(0)}</span>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="mt-4 w-full text-sm text-gray-300 cursor-pointer border border-gray-600 px-4 py-2 rounded-lg bg-gray-800 hover:border-blue-400 transition"
          />
        </div>

        {/* Input Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-gray-400 mb-1">Group Name</label>
            <input
              type="text"
              name="name"
              value={groupData.name}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-600 px-4 py-2 rounded-lg text-white focus:border-blue-400 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">Description</label>
            <textarea
              name="description"
              value={groupData.description}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-600 px-4 py-2 rounded-lg text-white focus:border-blue-400 outline-none transition"
              rows="4"
            ></textarea>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-700 text-white rounded-lg transition hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-cyan-500 text-white rounded-lg transition hover:bg-cyan-600 flex items-center justify-center"
          >
            {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default EditGroupModal;
