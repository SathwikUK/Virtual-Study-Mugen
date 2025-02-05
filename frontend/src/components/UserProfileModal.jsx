import React from "react";

const UserProfileModal = ({ selectedItem, onClose, onEdit }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-md w-11/12 sm:w-1/2 md:w-1/3 lg:w-1/3">
        <h2 className="text-xl text-center font-bold mb-4">Profile</h2>
        {selectedItem.image && (
          <div className="flex justify-center mb-4">
            <img
              src={`data:image/jpeg;base64,${selectedItem.image}`}
              alt="Profile"
              className="w-32 h-32 object-cover rounded-full border"
            />
          </div>
        )}
        <p>
          <strong>Name:</strong> {selectedItem.name}
        </p>
        <p>
          <strong>Email:</strong> {selectedItem.email}
        </p>
        <div className="flex justify-end space-x-4 mt-4">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white text-xl py-1 px-3 rounded hover:bg-gray-600"
          >
            Close
          </button>
          <button
            onClick={() => onEdit(selectedItem)}
            className="bg-yellow-500 text-white text-xl py-1 px-3 rounded hover:bg-yellow-600"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
