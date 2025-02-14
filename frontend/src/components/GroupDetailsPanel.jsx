import React from "react";
import { FaTimes, FaUserPlus } from "react-icons/fa";

const GroupDetailsPanel = ({
  show,
  onClose,
  selectedChat,
  creatorDetails,
  groupMembers,
  onInviteClick,
}) => {
  if (!show || !selectedChat) return null;

  return (
    <div className="fixed right-0 top-0 h-screen w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-out z-50 flex flex-col">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-800">Group Details</h3>
        <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
          <FaTimes className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <img
              src={selectedChat.image || "https://via.placeholder.com/150"}
              alt={selectedChat.name}
              className="w-full h-full rounded-full object-cover ring-4 ring-white shadow-lg"
            />
          </div>
          <h2 className="text-xl font-bold text-center text-gray-900 mb-2">
            {selectedChat.name}
          </h2>
          <p className="text-center text-gray-500">
            {selectedChat.description}
          </p>
        </div>

        {creatorDetails && (
          <div className="p-6 border-t">
            <h4 className="font-semibold text-gray-900 mb-4">Created by</h4>
            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50">
              <img
                src={creatorDetails.image || "https://via.placeholder.com/48"}
                alt={creatorDetails.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm"
              />
              <div>
                <h5 className="font-medium text-gray-900">
                  {creatorDetails.name}
                </h5>
                <p className="text-sm text-gray-500">{creatorDetails.role}</p>
              </div>
            </div>
          </div>
        )}

        <div className="p-6 border-t">
          <h4 className="font-semibold text-gray-900 mb-4">
            Members ({groupMembers.length})
          </h4>
          <div className="space-y-3">
            {groupMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50"
              >
                <img
                  src={member.image || "https://via.placeholder.com/48"}
                  alt={member.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm"
                />
                <div>
                  <h5 className="font-medium text-gray-900">{member.name}</h5>
                  <p className="text-sm text-gray-500">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 border-t">
        <button
          onClick={onInviteClick}
          className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <FaUserPlus className="w-5 h-5" />
          <span>Invite Members</span>
        </button>
      </div>
    </div>
  );
};

export default GroupDetailsPanel;
