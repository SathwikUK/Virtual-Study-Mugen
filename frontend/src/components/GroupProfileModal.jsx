import React from "react";

const GroupProfileModal = ({ selectedGroup, onClose, onEdit }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-md w-11/12 sm:w-1/2 md:w-1/3 lg:w-1/3">
        <h2 className="text-xl text-center font-bold mb-4">Group Profile</h2>

        {/* Display group image if available */}
        {selectedGroup?.image ? (
          <div className="flex justify-center mb-4">
            <img
              src={
                selectedGroup.image.startsWith("data:image")
                  ? selectedGroup.image
                  : `data:image/jpeg;base64,${selectedGroup.image}`
              }
              alt="Group"
              className="w-32 h-32 object-cover rounded-full border"
            />
          </div>
        ) : (
          <p className="text-center text-gray-500 mb-4">No Image Available</p>
        )}

        {/* Group details */}
        <p>
          <strong>Name:</strong> {selectedGroup?.name || "No name available"}
        </p>
        <p>
          <strong>Description:</strong>{" "}
          {selectedGroup?.description || "No description available"}
        </p>

        {/* Action buttons */}
        <div className="flex justify-end space-x-4 mt-4">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white text-xl py-1 px-3 rounded hover:bg-gray-600"
          >
            Close
          </button>
          <button
            onClick={() => onEdit(selectedGroup)}
            className="bg-yellow-500 text-white text-xl py-1 px-3 rounded hover:bg-yellow-600"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupProfileModal;
