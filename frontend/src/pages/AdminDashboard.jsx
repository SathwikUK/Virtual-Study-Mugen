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

  // Helper function to convert image data to base64 if needed
  const getImageSrc = (img) => {
    if (!img) return "https://via.placeholder.com/150";
    if (typeof img === "string" && img.startsWith("data:image")) return img;
    if (typeof img === "object" && img.data) {
      return `data:image/jpeg;base64,${btoa(
        new Uint8Array(img.data).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      )}`;
    }
    return img;
  };

  return (
    <div
      className="
        fixed
        right-0
        top-16         /* Shift down from top so it's not the full screen */
        w-64           /* Keep the panel narrow horizontally */
        max-h-[80vh]   /* Limit vertical size to 80% of the viewport */
        bg-gradient-to-br from-gray-800 to-black
        shadow-[0_0_20px_rgba(236,72,153,0.7)]
        rounded-xl
        transform
        transition-transform
        duration-300
        ease-out
        z-50
        flex
        flex-col
      "
    >
      {/* Header */}
      <div className=" border-b border-pink-500 flex justify-between items-center">
        <h3 className="text-xl font-semibold text-pink-500">Group Details</h3>
        <button
          onClick={onClose}
          className="text-pink-400 hover:text-white transition-colors duration-200"
        >
          <FaTimes className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Content in the middle */}
      <div className="flex-1 overflow-y-auto">
        {/* Group Info */}
        <div className="p-6 flex flex-col items-center">
          <div className="relative w-20 h-20 mb-4">
            <img
              src={getImageSrc(selectedChat.image)}
              alt={selectedChat.name}
              className="
                w-full
                h-full
                rounded-full
                object-cover
                ring-4
                ring-pink-500
                shadow-lg
              "
            />
          </div>
          <h2 className="text-lg font-bold text-pink-500 mb-2 text-center">
            {selectedChat.name}
          </h2>
          <p className="text-sm text-gray-300 text-center px-2">
            {selectedChat.description}
          </p>
        </div>

        {/* Creator Details */}
        {creatorDetails && (
          <div className="px-6 py-4 border-t border-pink-500">
            <h4 className="font-semibold text-pink-500 mb-4">Created by</h4>
            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-pink-500/10 transition-colors">
              <img
                src={getImageSrc(creatorDetails.image)}
                alt={creatorDetails.name}
                className="
                  w-12
                  h-12
                  rounded-full
                  object-cover
                  ring-2
                  ring-pink-500
                  shadow-md
                "
              />
              <div>
                <h5 className="font-medium text-white">{creatorDetails.name}</h5>
                <p className="text-sm text-gray-400">{creatorDetails.role}</p>
              </div>
            </div>
          </div>
        )}

        {/* Group Members */}
        <div className="px-6 py-4 border-t border-pink-500">
          <h4 className="font-semibold text-pink-500 mb-4">
            Members ({groupMembers.length})
          </h4>
          <div className="space-y-3">
            {groupMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-pink-500/10 transition-colors"
              >
                <img
                  src={getImageSrc(member.image)}
                  alt={member.name}
                  className="
                    w-12
                    h-12
                    rounded-full
                    object-cover
                    ring-2
                    ring-pink-500
                    shadow-md
                  "
                />
                <div>
                  <h5 className="font-medium text-white">{member.name}</h5>
                  <p className="text-sm text-gray-400">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Invite Button */}
      <div className="p-4 border-t border-pink-500">
        <button
          onClick={onInviteClick}
          className="
            w-full
            py-2
            px-4
            bg-pink-500
            text-white
            rounded-lg
            hover:bg-pink-600
            transition-colors
            duration-200
            flex
            items-center
            justify-center
            gap-2
          "
        >
          <FaUserPlus className="w-5 h-5" />
          <span>Invite Members</span>
        </button>
      </div>
    </div>
  );
};

export default GroupDetailsPanel;
