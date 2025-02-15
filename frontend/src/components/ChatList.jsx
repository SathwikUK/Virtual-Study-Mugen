// ChatList.jsx
import React from "react";
import { FaUserCircle } from "react-icons/fa";

const ChatList = ({ isOpen, chats, activeChat, unreadCounts, handleChatSelection, showSpinnerForChats }) => {
  return (
    <>
      <h2 className="text-lg font-semibold mb-3 text-center text-purple-300">Chats</h2>
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {showSpinnerForChats ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
          </div>
        ) : chats.length > 0 ? (
          <ul className="space-y-1">
            {chats.map((chat) => (
              <li
                key={chat._id}
                onClick={() => handleChatSelection(chat)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors hover:bg-purple-600 ${activeChat === chat._id ? "bg-purple-900" : ""}`}
              >
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-600">
                  {chat.image ? (
                    <img
                      src={chat.image}
                      alt={chat.name}
                      className="object-cover w-full h-full"
                      loading="lazy"
                    />
                  ) : (
                    <FaUserCircle className="text-2xl text-gray-300 m-auto" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-100 truncate">{chat.name}</p>
                    {unreadCounts[chat._id] > 0 && chat._id !== activeChat && (
                      <span className="bg-red-600 text-white rounded-full px-2 py-0.5 text-xs">
                        {unreadCounts[chat._id]}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-300 truncate">{chat.lastMessage}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500">No chats found</p>
        )}
      </div>
    </>
  );
};

export default ChatList;
