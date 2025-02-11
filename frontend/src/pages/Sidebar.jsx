import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaTimes,
  FaBars,
  FaPlus,
  FaUserCircle,
  FaArrowLeft,
  FaSearch,
} from "react-icons/fa";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

const Sidebar = ({ isOpen, onToggle, onSelectChat, chats, setModalOpen, userId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [userName, setUserName] = useState("Loading...");
  const [userProfileImage, setUserProfileImage] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [activeChat, setActiveChat] = useState(null);
  const [localChats, setLocalChats] = useState(chats || []);

  // Function to fetch groups
  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !userId) return;

      const response = await axios.get(
        "http://localhost:5000/api/auth/groups",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        }
      );

      if (response.data.groups) {
        setLocalChats(response.data.groups);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const fetchUnreadCounts = async () => {
    if (!userId) return;
    
    try {
      const response = await axios.get(`http://localhost:5000/api/messages/unread/${userId}`);
      const counts = {};
      response.data.forEach(({ groupId, count }) => {
        counts[groupId] = count;
      });
      setUnreadCounts(prev => ({
        ...prev,
        ...counts
      }));
    } catch (error) {
      console.error("Error fetching unread counts:", error);
    }
  };

  // Set up periodic refresh for groups and unread counts
  useEffect(() => {
    // Initial fetch
    fetchGroups();
    fetchUnreadCounts();

    // Set up intervals for periodic refresh
    const groupsInterval = setInterval(fetchGroups, 3000);
    const unreadCountsInterval = setInterval(fetchUnreadCounts, 3000);

    return () => {
      clearInterval(groupsInterval);
      clearInterval(unreadCountsInterval);
    };
  }, [userId]);

  // Socket connection and event listeners
  useEffect(() => {
    if (userId) {
      socket.connect();
      socket.emit("setUser", userId);

      const handleNewMessage = (message) => {
        if (message.senderId !== userId && message.groupId !== activeChat) {
          setUnreadCounts(prev => ({
            ...prev,
            [message.groupId]: (prev[message.groupId] || 0) + 1
          }));
          // Trigger a group refresh when new message arrives
          fetchGroups();
        }
      };

      const handleMessagesRead = ({ groupId, userId: readByUserId }) => {
        if (readByUserId === userId) {
          setUnreadCounts(prev => ({
            ...prev,
            [groupId]: 0
          }));
        }
      };

      socket.on("newMessage", handleNewMessage);
      socket.on("messagesMarkedAsRead", handleMessagesRead);

      return () => {
        socket.off("newMessage", handleNewMessage);
        socket.off("messagesMarkedAsRead", handleMessagesRead);
        socket.disconnect();
      };
    }
  }, [userId, activeChat]);

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found");
        }

        const response = await axios.get("http://localhost:5000/api/auth/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUserName(response.data.name);

        if (response.data.image && response.data.image.data) {
          const base64String = btoa(
            new Uint8Array(response.data.image.data).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              ""
            )
          );
          setUserProfileImage(`data:image/png;base64,${base64String}`);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setUserName("User");
      }
    };

    fetchUserProfile();
  }, []);

  const handleChatSelection = (chat) => {
    setActiveChat(chat._id);
    onSelectChat(chat);
    
    socket.emit("markMessagesAsRead", { groupId: chat._id, userId });
    
    setUnreadCounts(prev => ({
      ...prev,
      [chat._id]: 0
    }));
  };

  const filteredChats = localChats.filter((chat) =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="mb-4 py-1 flex items-center justify-between">
        {isOpen && (
          <div className="relative flex-1 max-w-[200px]">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 p-1 border rounded w-full"
            />
          </div>
        )}
        <div className={`flex items-center p-1 space-x-1 ${!isOpen ? "flex-col space-y-2" : ""}`}>
          <button 
            className="p-2 rounded-full bg-green-500 hover:bg-green-600 text-white" 
            onClick={() => setModalOpen(true)}
          >
            <FaPlus />
          </button>
          <button 
            className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white" 
            onClick={onToggle}
          >
            {isOpen ? <FaArrowLeft /> : <FaBars />}
          </button>
        </div>
      </div>

      <div className="my-2 border-t-2 border-gray-300"></div>

      {isOpen && (
        <>
          <h2 className="text-xl font-bold mb-4 text-center text-black">Chats</h2>
          <div className="flex-1 overflow-y-auto chat-scrollbar">
            <ul className={!isOpen ? "flex-col space-y-2" : ""}>
              {filteredChats.length > 0 ? (
                filteredChats.map((chat) => (
                  <li
                    key={chat._id}
                    className={`p-2 mb-2 rounded cursor-pointer hover:bg-gray-200 flex items-center gap-2 border-b border-gray-400 ${
                      activeChat === chat._id ? 'bg-gray-200' : ''
                    }`}
                    onClick={() => handleChatSelection(chat)}
                  >
                    <div className="w-10 h-10 relative">
                      <img 
                        src={chat.image} 
                        alt={chat.name} 
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold">{chat.name}</p>
                        {unreadCounts[chat._id] > 0 && chat._id !== activeChat && (
                          <span className="bg-red-500 text-white rounded-full px-2 py-1 text-xs">
                            {unreadCounts[chat._id]}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{chat.lastMessage}</p>
                    </div>
                  </li>
                ))
              ) : (
                <p className="text-center text-gray-500">No chats found</p>
              )}
            </ul>
          </div>
        </>
      )}

      <div className="my-4 border-t-2 border-gray-300"></div>

      <div className={`mt-auto flex justify-start items-center p-2 gap-2 ${!isOpen ? "flex-col space-y-2" : ""}`}>
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-300">
          {userProfileImage ? (
            <img 
              src={userProfileImage} 
              alt="User Profile" 
              className="w-full h-full object-cover" 
            />
          ) : (
            <FaUserCircle className="text-gray-500 text-3xl" />
          )}
        </div>
        {isOpen && <div className="text-black font-medium">{userName}</div>}
      </div>
    </div>
  );
};

export default Sidebar;