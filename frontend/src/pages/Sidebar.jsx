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
  FaTimes,
  FaEdit,
  FaSave,
} from "react-icons/fa";
import io from "socket.io-client";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NotificationsPanel from "../components/NotificationsPanel";
import openAiGif from "../assets/hina.gif";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ----- SOCKET INSTANCE -----
const socket = io("http://localhost:5000", {
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
  transports: ["websocket"],
});

// ----- AXIOS INSTANCE -----
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

  // User Profile Info
  const [userName, setUserName] = useState("Loading...");
  const [userEmail, setUserEmail] = useState("");
  const [userProfileImage, setUserProfileImage] = useState(null);

  // Chat/Sidebar State
  const [unreadCounts, setUnreadCounts] = useState({});
  const [activeChat, setActiveChat] = useState(null);
  const [localChats, setLocalChats] = useState(chats || []);
  const [isLoading, setIsLoading] = useState(true);

  // Profile Modal
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Keep track of component mount time to manage spinner vs. "No chats" message
  const mountTimeRef = useRef(Date.now());

  // -------------------- FETCH GROUPS --------------------
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

  // -------------------- FETCH UNREAD COUNTS --------------------
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

  // -------------------- FETCH USER PROFILE --------------------
  const fetchUserProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await api.get("/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = response.data;
      setUserName(userData.name || "User");
      setUserEmail(userData.email || "");

      if (userData.image?.data) {
        // Convert buffer to base64
        const bytes = new Uint8Array(userData.image.data);
        const chunkSize = 0x8000; // 32768 bytes
        let binary = "";
        for (let i = 0; i < bytes.length; i += chunkSize) {
          binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
        }
        const base64String = window.btoa(binary);
        setUserProfileImage(`data:image/png;base64,${base64String}`);
      } else {
        setUserProfileImage(null);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUserName("User");
    }
  }, []);

  // -------------------- SOCKET HANDLERS --------------------
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

  // -------------------- INITIAL SETUP --------------------
  useEffect(() => {
    Promise.all([fetchGroups(), fetchUnreadCounts(), fetchUserProfile()]);

    const groupsInterval = setInterval(fetchGroups, 5000);
    const unreadCountsInterval = setInterval(fetchUnreadCounts, 5000);

    return () => {
      clearInterval(groupsInterval);
      clearInterval(unreadCountsInterval);
    };
  }, [fetchGroups, fetchUnreadCounts, fetchUserProfile]);

  // -------------------- SOCKET SETUP --------------------
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

  // -------------------- SELECT CHAT --------------------
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

  // -------------------- FILTER CHATS BY SEARCH --------------------
  const filteredChats = useMemo(() => {
    return localChats.filter((chat) =>
      chat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [localChats, searchTerm]);

  // -------------------- LOGOUT --------------------
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Show spinner if still loading or if no chats have loaded within 3s
  const timeSinceMount = Date.now() - mountTimeRef.current;
  const showSpinnerForChats =
    isLoading || (localChats.length === 0 && timeSinceMount < 3000);

  // -------------------- RENDER --------------------
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
                        <p className="font-medium text-gray-100 truncate">
                          {chat.name}
                        </p>
                        {unreadCounts[chat._id] > 0 && chat._id !== activeChat && (
                          <span className="bg-red-600 text-white rounded-full px-2 py-0.5 text-xs">
                            {unreadCounts[chat._id]}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-300 truncate">
                        {chat.lastMessage}
                      </p>
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
          isOpen
            ? "flex-row items-center justify-between"
            : "flex-col items-center space-y-2"
        }`}
      >
        {/* Profile Image & Name */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setShowProfileModal(true)}
        >
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
          {isOpen && (
            <div className="font-medium text-gray-100 truncate">{userName}</div>
          )}
        </div>

        {/* Logout */}
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

      {/* Profile Modal */}
      {showProfileModal && (
        <UserProfileModal
          user={{
            name: userName,
            email: userEmail,
            image: userProfileImage,
          }}
          onClose={() => setShowProfileModal(false)}
          onProfileUpdated={fetchUserProfile}
        />
      )}

      {/* Toast Container */}
      <ToastContainer />

      {/* Inline style to hide scrollbar */}
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

/**
 * UserProfileModal component
 * Displays user info (name, email, image) and allows editing.
 * Uses PUT /api/auth/users/:email to update user profile.
 * Shows a spinner on save for 1s before displaying a success toast.
 */
const UserProfileModal = ({ user, onClose, onProfileUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [updatedName, setUpdatedName] = useState(user.name || "");
  const [updatedRole, setUpdatedRole] = useState("student"); // default or from user if available
  const [updatedImage, setUpdatedImage] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUpdatedImage(e.target.files[0]);
    }
  };

  // Save changes: call the update endpoint with a simulated 1s delay
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMsg("No authorization token found.");
        return;
      }
      // Use FormData for image upload
      const formData = new FormData();
      formData.append("name", updatedName);
      formData.append("role", updatedRole);
      if (updatedImage) {
        formData.append("image", updatedImage);
      }

      setIsUpdating(true);
      await axios.put(`http://localhost:5000/api/auth/users/${user.email}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      // Simulate a 1-second loading period
      setTimeout(() => {
        toast.success("Profile updated successfully!");
        onProfileUpdated && onProfileUpdated();
        setIsUpdating(false);
        setIsEditing(false);
        onClose();
      }, 1000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrorMsg(error.response?.data?.message || "Failed to update profile");
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-gray-800 p-6 rounded-lg w-80 relative shadow-xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-300 hover:text-white"
        >
          <FaTimes />
        </button>

        <h2 className="text-2xl font-bold mb-4 text-center text-purple-300">
          User Profile
        </h2>

        {errorMsg && (
          <p className="text-red-400 text-sm mb-2 text-center">{errorMsg}</p>
        )}

        {/* Display or edit image */}
        <div className="flex justify-center mb-4">
          {user.image && !updatedImage ? (
            <img
              src={user.image}
              alt="User Avatar"
              className="w-20 h-20 rounded-full object-cover ring-2 ring-purple-500"
            />
          ) : updatedImage ? (
            <img
              src={URL.createObjectURL(updatedImage)}
              alt="New Avatar"
              className="w-20 h-20 rounded-full object-cover ring-2 ring-purple-500"
            />
          ) : (
            <FaUserCircle className="text-6xl text-gray-400" />
          )}
        </div>

        {/* If editing, show file input */}
        {isEditing && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Update Profile Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-400"
            />
          </div>
        )}

        {/* Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Name
          </label>
          {isEditing ? (
            <input
              type="text"
              value={updatedName}
              onChange={(e) => setUpdatedName(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none"
            />
          ) : (
            <p className="text-gray-200">{user.name}</p>
          )}
        </div>

        {/* Email (read-only) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Email
          </label>
          <p className="text-gray-200">{user.email}</p>
        </div>

        {/* Role (optional) */}
        {isEditing ? (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Role
            </label>
            <select
              value={updatedRole}
              onChange={(e) => setUpdatedRole(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none"
            >
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        ) : null}

        {/* Bottom buttons */}
        <div className="flex justify-end gap-4 mt-6">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-600 hover:bg-gray-500 text-white"
                title="Cancel"
              >
                <FaTimes />
              </button>
              <button
                onClick={handleSave}
                disabled={isUpdating}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-green-600 hover:bg-green-500 text-white"
                title="Save"
              >
                {isUpdating ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-white"></div>
                ) : (
                  <FaSave />
                )}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 text-white"
              title="Edit"
            >
              <FaEdit />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
