// Sidebar.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  FaBars,
  FaPlus,
  FaUserCircle,
  FaArrowLeft,
  FaSearch,
  FaBell,
  FaHome,
  FaSignOutAlt,
} from "react-icons/fa";
import io from "socket.io-client";
import NotificationsPanel from "../components/NotificationsPanel";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Example GIF import (adjust path/name as needed)
import openAiGif from "../assets/hina.gif"; // e.g., "src/assets/hina.gif"

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
  showOpenAI,
  onToggleOpenAI,
}) => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Loading...");
  const [userProfileImage, setUserProfileImage] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [activeChat, setActiveChat] = useState(null);
  const [localChats, setLocalChats] = useState(chats || []);
  const [isLoading, setIsLoading] = useState(true);

  // Keep track of component mount time to manage spinner vs. "No chats" message
  const mountTimeRef = useRef(Date.now());

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
      // If a new message is sent to a chat that's not currently active, increment unread
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
      // If current user read the messages in groupId, set that unread count to 0
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
      // Mark messages as read for this chat
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

  // ----- Handle Logout -----
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Decide when to show spinner in the chat list area
  const timeSinceMount = Date.now() - mountTimeRef.current;
  const showSpinnerForChats =
    isLoading || (localChats.length === 0 && timeSinceMount < 3000);

  return (
    <div className="relative p-4 h-full flex flex-col bg-black text-white shadow-md rounded-lg overflow-visible z-10">
      {/* Top Section */}
      <div
        className={`mb-4 py-1 flex ${
          isOpen ? "flex-row items-center space-x-2" : "flex-col space-y-2"
        }`}
      >
        {/* Home */}
        <button
          onClick={() => navigate("/")}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-80 transition duration-200"
        >
          <FaHome className="text-xl" />
        </button>

        {/* Search */}
        {isOpen && (
          <div className="relative flex-1 max-w-[200px]">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-2 py-1 w-full rounded-full bg-[#2A2A2D] text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        )}

        {/* Plus */}
        <button
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-80 transition duration-200"
          onClick={() => setModalOpen(true)}
        >
          <FaPlus className="text-xl" />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-80 transition duration-200"
            onClick={onToggleNotifications}
          >
            <FaBell className="text-xl" />
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

        {/* Sidebar Toggle */}
        <button
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-80 transition duration-200"
          onClick={onToggle}
        >
          {isOpen ? <FaArrowLeft className="text-xl" /> : <FaBars className="text-xl" />}
        </button>

        {/* GIF Button */}
        <div className="relative">
          <button
            className="w-20 h-20 ml-[-10px] flex items-center justify-center overflow-hidden rounded-full bg-transparent"
            onClick={onToggleOpenAI}
          >
            <img src={openAiGif} alt="GIF" className="w-full h-full object-cover" />
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="my-2 border-t border-[#333]"></div>

      {/* Chat List */}
      {isOpen && (
        <>
          <h2 className="text-lg font-semibold mb-3 text-center text-purple-300">
            Chats
          </h2>
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {showSpinnerForChats ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
              </div>
            ) : filteredChats.length > 0 ? (
              <ul className="space-y-1">
                {filteredChats.map((chat) => (
                  <li
                    key={chat._id}
                    onClick={() => handleChatSelection(chat)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors hover:bg-purple-600 ${
                      activeChat === chat._id ? "bg-purple-900" : ""
                    }`}
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
      )}

      {/* Divider */}
      <div className="my-3 border-t border-[#333]"></div>

      {/* Bottom Section: User Profile + Logout */}
      <div
        className={`mt-auto flex ${
          isOpen ? "flex-row items-center justify-between" : "flex-col items-center space-y-2"
        }`}
      >
        <div className="flex items-center gap-2">
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
        <button
          onClick={handleLogout}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-red-600 to-purple-600 hover:opacity-80 transition duration-200"
          title="Logout"
        >
          <FaSignOutAlt className="text-xl" />
        </button>
      </div>

      {/* Spinner Overlay: Shows until groups are loaded */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-purple-500"></div>
        </div>
      )}

      {/* Inline style to hide scrollbar (Chrome/Firefox/IE) */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
