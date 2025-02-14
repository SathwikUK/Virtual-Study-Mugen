// Sidebar.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  FaTimes,
  FaBars,
  FaPlus,
  FaUserCircle,
  FaArrowLeft,
  FaSearch,
  FaBell,
  FaCube, // icon representing the OpenAI toggle (or 3D model)
} from "react-icons/fa";
import io from "socket.io-client";
import NotificationsPanel from "../components/NotificationsPanel";
import axios from "axios";

// Create socket instance (outside the component to avoid re-creation)
const socket = io("http://localhost:5000", {
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
  transports: ["websocket"],
});

// Create an axios instance with default settings
const api = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
  },
});

const Sidebar = ({
  isOpen,
  onToggle,
  onSelectChat,
  chats,
  setModalOpen,
  userId,
  searchTerm,
  setSearchTerm,
  notifications,
  showNotifications,
  onToggleNotifications,
  onStatusUpdate = () => {},
  onGroupUpdate = () => {},
  // NEW: For toggling the OpenAI middle panel
  showOpenAI,
  onToggleOpenAI,
}) => {
  const [userName, setUserName] = useState("Loading...");
  const [userProfileImage, setUserProfileImage] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [activeChat, setActiveChat] = useState(null);
  const [localChats, setLocalChats] = useState(chats || []);
  const [isLoading, setIsLoading] = useState(true);

  // ----- Fetch Groups -----
  const fetchGroups = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !userId) return;

      const response = await api.get("/api/auth/groups", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.groups) {
        setLocalChats(response.data.groups);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // ----- Fetch Unread Counts -----
  const fetchUnreadCounts = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await api.get(`/api/messages/unread/${userId}`);
      const counts = response.data.reduce((acc, { groupId, count }) => {
        acc[groupId] = count;
        return acc;
      }, {});
      setUnreadCounts((prev) => ({ ...prev, ...counts }));
    } catch (error) {
      console.error("Error fetching unread counts:", error);
    }
  }, [userId]);

  // ----- Fetch User Profile -----
  const fetchUserProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await api.get("/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUserName(response.data.name || "User");

      if (response.data.image?.data) {
        const base64String = btoa(
          String.fromCharCode.apply(null, new Uint8Array(response.data.image.data))
        );
        setUserProfileImage(`data:image/png;base64,${base64String}`);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUserName("User");
    }
  }, []);

  // ----- Socket Event Handlers -----
  const handleNewMessage = useCallback(
    (message) => {
      if (message.senderId !== userId && message.groupId !== activeChat) {
        setUnreadCounts((prev) => ({
          ...prev,
          [message.groupId]: (prev[message.groupId] || 0) + 1,
        }));
        fetchGroups();
      }
    },
    [userId, activeChat, fetchGroups]
  );

  const handleMessagesRead = useCallback(
    ({ groupId, userId: readByUserId }) => {
      if (readByUserId === userId) {
        setUnreadCounts((prev) => ({
          ...prev,
          [groupId]: 0,
        }));
      }
    },
    [userId]
  );

  // ----- Initial Setup -----
  useEffect(() => {
    Promise.all([fetchGroups(), fetchUnreadCounts(), fetchUserProfile()]);

    const groupsInterval = setInterval(fetchGroups, 5000);
    const unreadCountsInterval = setInterval(fetchUnreadCounts, 5000);

    return () => {
      clearInterval(groupsInterval);
      clearInterval(unreadCountsInterval);
    };
  }, [fetchGroups, fetchUnreadCounts, fetchUserProfile]);

  // ----- Socket Setup -----
  useEffect(() => {
    if (userId) {
      socket.connect();
      socket.emit("setUser", userId);

      socket.on("newMessage", handleNewMessage);
      socket.on("messagesMarkedAsRead", handleMessagesRead);

      return () => {
        socket.off("newMessage", handleNewMessage);
        socket.off("messagesMarkedAsRead", handleMessagesRead);
        socket.disconnect();
      };
    }
  }, [userId, handleNewMessage, handleMessagesRead]);

  // ----- Select Chat -----
  const handleChatSelection = useCallback(
    (chat) => {
      setActiveChat(chat._id);
      onSelectChat(chat);
      socket.emit("markMessagesAsRead", { groupId: chat._id, userId });
      setUnreadCounts((prev) => ({ ...prev, [chat._id]: 0 }));
    },
    [userId, onSelectChat]
  );

  // ----- Filter Chats by Search Term -----
  const filteredChats = useMemo(() => {
    return localChats.filter((chat) =>
      chat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [localChats, searchTerm]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-b from-black to-[#1A1A1D] shadow-lg rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="relative p-4 h-full flex flex-col bg-gradient-to-b from-black to-[#1A1A1D] text-white shadow-lg rounded-lg overflow-visible z-10">
      {/* Header: Logo & Navigation (if needed) */}
      

      {/* Top Section: Search & Action Buttons */}
      <div className="mb-4 py-1 flex items-center justify-between">
        {isOpen && (
          <div className="relative flex-1 max-w-[200px]">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-2 py-1 w-full rounded-md bg-[#2A2A2D] text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        )}

        <div className={`flex items-center ${!isOpen ? "flex-col space-y-2" : "space-x-2"}`}>
          <button
            className="p-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-pink-600 hover:to-purple-600 transition-colors duration-200"
            onClick={() => setModalOpen(true)}
          >
            <FaPlus />
          </button>

          <div className="relative">
            <button
              className="p-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-pink-600 hover:to-purple-600 transition-colors duration-200"
              onClick={onToggleNotifications}
            >
              <FaBell />
            </button>
            {showNotifications && (
              <div className="absolute top-full right-[-40px] mt-2 z-50">
                <NotificationsPanel
                  show={showNotifications}
                  onClose={onToggleNotifications}
                  notifications={notifications}
                  onStatusUpdate={onStatusUpdate}
                  onGroupUpdate={onGroupUpdate}
                />
              </div>
            )}
          </div>

          {/* Sidebar Toggle Button */}
          <button
            className="p-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-pink-600 hover:to-purple-600 transition-colors duration-200"
            onClick={onToggle}
          >
            {isOpen ? <FaArrowLeft /> : <FaBars />}
          </button>

          {/* OpenAI Toggle Button (3D model/logo icon) */}
          <button
            className="p-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-pink-600 hover:to-purple-600 transition-colors duration-200"
            onClick={onToggleOpenAI}
          >
            <FaCube />
          </button>
        </div>
      </div>

      <div className="my-2 border-t border-[#333]"></div>

      {/* Chat List */}
      {isOpen && (
        <>
          <h2 className="text-xl font-semibold mb-4 text-center text-purple-400">Chats</h2>
          <div className="flex-1 overflow-y-auto">
            <ul className="">
              {filteredChats.length > 0 ? (
                filteredChats.map((chat) => (
                  <li
                    key={chat._id}
                    onClick={() => handleChatSelection(chat)}
                    className={`p-2 mb-2 rounded-md cursor-pointer flex items-center gap-2 transition-colors bg-[#2A2A2D] hover:bg-[#3A3A3D] ${
                      activeChat === chat._id ? "bg-gradient-to-r from-purple-700 to-purple-800" : ""
                    }`}
                  >
                    <div className="w-10 h-10 relative rounded-full overflow-hidden bg-gray-500">
                      {chat.image ? (
                        <img
                          src={chat.image}
                          alt={chat.name}
                          className="object-cover w-full h-full"
                          loading="lazy"
                        />
                      ) : (
                        <FaUserCircle className="text-2xl text-gray-200 m-auto" />
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
                      <p className="text-sm text-gray-400 truncate">{chat.lastMessage}</p>
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

      <div className="my-4 border-t border-[#333]"></div>

      {/* User Profile Section */}
      <div className={`mt-auto flex items-center ${!isOpen ? "flex-col space-y-2" : "gap-2"}`}>
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-600 ring-2 ring-purple-500">
          {userProfileImage ? (
            <img
              src={userProfileImage}
              alt="User Profile"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <FaUserCircle className="text-gray-300 text-3xl" />
          )}
        </div>
        {isOpen && <div className="font-medium text-gray-100 truncate">{userName}</div>}
      </div>
    </div>
  );
};

export default Sidebar;
