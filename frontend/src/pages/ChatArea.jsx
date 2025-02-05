import React from "react";
import { FaPaperPlane } from "react-icons/fa";
import Whiteboard from "./Whiteboard";


const ChatArea = ({
  selectedChat,
  activeTab,
  setActiveTab,
  currentMessage,
  setCurrentMessage,
  handleSendMessage,
}) => {
  return (
    <div className="flex-1 flex overflow-hidden">
      {selectedChat ? (
        <>
          {/* Active Tab Content */}
          {activeTab === "whiteboard" && (
            <div className="flex-1 bg-white shadow-lg rounded-xl p-4 border-2 border-blue-300 overflow-hidden">
              <Whiteboard selectedChat={selectedChat} />
            </div>
          )}
          {activeTab === "voice" && (
            <div className="flex-1 bg-white shadow-lg rounded-xl p-4 border-2 border-green-300">
              <p className="text-center text-green-600 font-bold">
                Voice functionality coming soon!
              </p>
            </div>
          )}
          {activeTab === "default" && (
            <div className="flex-1 bg-white shadow-lg rounded-xl p-4 border-2 border-gray-300">
              <p className="text-center text-gray-600">Default view!</p>
            </div>
          )}

          {/* Chat Details */}
          <div className="w-full lg:w-1/4 bg-white shadow-lg rounded-xl p-2 border-2 border-pink-300 flex flex-col">
            <div className="flex items-center p-4 bg-blue-50 shadow-md rounded-lg">
              <img
                src={selectedChat && selectedChat.image ? selectedChat.image : "/images/virat.jpg"}
                alt={`${selectedChat.name} Profile`}
                className="w-14 h-14 rounded-full mr-4 border-2 border-gray-200"
              />
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{selectedChat.name}</h2>
                <p className="text-sm text-gray-500">Active now</p>
              </div>
            </div>

            <div className="my-1 border-t-2 border-gray-300"></div>
            <div className="flex-1 flex flex-col overflow-y-auto">
              <div className="bg-gradient-to-r from-green-200 to-blue-200 p-2 rounded-lg self-start">
                {selectedChat.message || "This is an example message!"}
              </div>
            </div>
            <div className="mt-4 relative flex items-center">
              <input
                type="text"
                placeholder="Type a message..."
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                className="w-full p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200 pr-10"
              />
              {currentMessage.trim() && (
                <button
                  onClick={handleSendMessage}
                  className="absolute right-2 text-blue-500 hover:text-blue-700"
                >
                  <FaPaperPlane />
                </button>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center w-full bg-gray-200 p-4">
          <p className="text-gray-500">Please select a chat.</p>
        </div>
      )}
    </div>
  );
};

export default ChatArea;
