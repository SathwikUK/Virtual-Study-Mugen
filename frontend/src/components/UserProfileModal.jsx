import React from "react";

const UserProfileModal = ({ selectedItem, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/90 text-white p-6 rounded-xl border border-gray-800/50 
        shadow-2xl w-full max-w-lg transform transition-all duration-300 animate-fadeIn">
        
        {/* Header */}
        <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-purple-500 
          to-pink-500 bg-clip-text text-transparent">
          User Profile
        </h2>

        {/* Profile Container */}
        <div className="flex items-center space-x-6 mb-6">
          {/* Profile Image */}
          {selectedItem?.image ? (
            <img
              src={
                selectedItem.image.startsWith("data:image")
                  ? selectedItem.image
                  : `data:image/jpeg;base64,${selectedItem.image}`
              }
              alt="Profile"
              className="w-24 h-24 rounded-full border-2 border-purple-500 shadow-md object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-700 
              to-pink-600 flex items-center justify-center border-2 border-purple-500 shadow-md">
              <span className="text-3xl font-semibold">
                {selectedItem?.name?.charAt(0) || "?"}
              </span>
            </div>
          )}

          {/* User Details */}
          <div className="space-y-3">
            <div>
              <label className="text-gray-400 text-sm font-medium">Name</label>
              <p className="text-lg font-semibold">{selectedItem?.name || "N/A"}</p>
            </div>
            <div>
              <label className="text-gray-400 text-sm font-medium">Email</label>
              <p className="text-lg font-semibold">{selectedItem?.email || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-700 text-white rounded-lg shadow-lg 
              hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
