import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const EditGroupModal = ({ selectedGroup, onClose, fetchGroups }) => {
  const [groupData, setGroupData] = useState({
    name: selectedGroup.name || "",
    description: selectedGroup.description || "",
  });
  const [groupPhoto, setGroupPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  useEffect(() => {
    setGroupData({
      name: selectedGroup.name || "",
      description: selectedGroup.description || "",
    });
    setPhotoPreview(
      selectedGroup.image ? `data:image/jpeg;base64,${selectedGroup.image}` : ""
    );
  }, [selectedGroup]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setGroupData({ ...groupData, [name]: value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setGroupPhoto(file);
      setPhotoPreview(fileUrl);
    } else {
      setGroupPhoto(null);
      setPhotoPreview("");
    }
  };

  const handleSave = async () => {
    try {
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
      onClose();
    } catch (error) {
      toast.error("Failed to update group.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <div>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md w-11/12 sm:w-1/2 md:w-1/3 lg:w-1/3">
          <h2 className="text-xl font-bold mb-4">Edit Group</h2>
          <div className="mb-4">
            <label className="block mb-2 font-medium">Name</label>
            <input
              type="text"
              name="name"
              value={groupData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-medium">Description</label>
            <textarea
              name="description"
              value={groupData.description}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              rows="4"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-medium">Group Photo</label>
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
                alt="Group Photo Preview"
                className="w-32 h-32 object-cover rounded-full border"
              />
            </div>
          )}
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="bg-gray-500 text-white py-1 px-3 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default EditGroupModal;