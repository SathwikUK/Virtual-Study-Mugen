import React from "react";
import { FiUsers, FiX } from "react-icons/fi";

const GroupProfileModal = ({ selectedGroup, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="bg-gray-900 text-white p-6 rounded-xl shadow-lg w-11/12 sm:w-1/2 md:w-1/3 border-2 border-blue-500 neon-glow">
        <h2 className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-blue-500 to-green-400 bg-clip-text text-transparent">
          Group Profile
        </h2>

        {/* Group Image */}
        <div className="flex justify-center mb-4">
          {selectedGroup?.image ? (
            <img
              src={
                selectedGroup.image.startsWith("data:image") ||
                selectedGroup.image.startsWith("https://")
                  ? selectedGroup.image
                  : `data:image/jpeg;base64,${selectedGroup.image}`
              }
              alt="Group"
              className="w-32 h-32 object-cover rounded-full border-4 border-blue-500 shadow-lg"
            />
          ) : (
            <div className="w-32 h-32 flex items-center justify-center rounded-full bg-gray-700 border-4 border-blue-500 shadow-lg">
              <span className="text-xl font-semibold text-gray-300">
                {selectedGroup?.name?.charAt(0) || "G"}
              </span>
            </div>
          )}
        </div>

        {/* Group Details */}
        <p className="mb-2">
          <strong className="text-blue-400">Name:</strong>{" "}
          {selectedGroup?.name || "No name available"}
        </p>
        <p className="mb-4">
          <strong className="text-green-400">Description:</strong>{" "}
          {selectedGroup?.description || "No description available"}
        </p>

        {/* Members Section */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-md mb-4">
          <h3 className="text-lg font-semibold mb-2 text-blue-300 flex items-center">
            <FiUsers className="mr-2 text-blue-400" /> Members
          </h3>
          {selectedGroup?.members?.length > 0 ? (
            <ul className="max-h-40 overflow-y-auto space-y-2 scrollbar-hide">
              {selectedGroup.members.map((member, index) => (
                <li
                  key={index}
                  className="flex items-center bg-gray-700 p-2 rounded-lg hover:bg-gray-600 transition-all"
                >
                  {member.image ? (
                    <img
                      src={
                        member.image.startsWith("data:image") ||
                        member.image.startsWith("https://")
                          ? member.image
                          : `data:image/jpeg;base64,${member.image}`
                      }
                      alt={member.name}
                      className="w-8 h-8 rounded-full border-2 border-blue-500 mr-3 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full border-2 border-blue-500 mr-3 flex items-center justify-center bg-gray-700">
                      <span className="text-sm text-gray-300">
                        {member.name?.charAt(0) || "?"}
                      </span>
                    </div>
                  )}
                  <span className="text-gray-300">{member.name}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm">No members in this group.</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-all flex items-center"
          >
            <FiX className="mr-2" /> Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupProfileModal;
