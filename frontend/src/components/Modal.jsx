import { useState } from 'react';

const Modal = ({ onClose, groupName, setGroupName, groupDescription, setGroupDescription, groupImage, setGroupImage, onSubmit }) => {
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setGroupImage(file);
  };

  return (
    <>
      <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/60">
        <div className="relative w-full max-w-md rounded-xl bg-white shadow-2xl">
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="text-lg font-bold text-gray-800">Create Group</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 focus:outline-none">✕</button>
          </div>

          {/* Modal Body */}
          <div className="px-6 py-6">
            {/* Group Name */}
            <div className="mb-6">
              <label htmlFor="group-name" className="block text-sm font-medium text-gray-700">Group Name</label>
              <input
                type="text"
                id="group-name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-300 sm:text-sm"
                placeholder="Enter group name"
              />
            </div>

            {/* Group Description */}
            <div className="mb-6">
              <label htmlFor="group-description" className="block text-sm font-medium text-gray-700">Group Description</label>
              <textarea
                id="group-description"
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-300 sm:text-sm"
                placeholder="Enter group description"
                rows="4"
              ></textarea>
            </div>

            {/* Profile Photo */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700">Profile Photo</label>
              <div className="mt-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="block w-full cursor-pointer rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-2 text-gray-600 file:mr-4 file:rounded-md file:border file:bg-blue-100 file:px-3 file:py-1 file:font-medium file:text-blue-700 hover:border-blue-500 hover:bg-gray-100"
                />
              </div>
              {groupImage && (
                <div className="mt-4 flex items-center space-x-4">
                  <img
                    src={URL.createObjectURL(groupImage)}
                    alt="Profile Preview"
                    className="h-12 w-12 rounded-full border border-gray-300 object-cover"
                  />
                  <span className="text-sm font-medium text-gray-600">{groupImage.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSubmit}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;