import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  FaBell,
  FaChalkboard,
  FaUsers,
  FaInfoCircle,
  FaMicrophone,
  FaHome,
  FaPaperPlane,
  FaSearch,
  FaEllipsisV,
  FaUserPlus,
  FaTimes,
  FaImage,
  FaVideo,
  FaFile,
  FaSmile,
} from "react-icons/fa";
import Sidebar from "./Sidebar";
import Modal from "./Modal";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ChatArea from "./ChatArea";
import NotificationItem from "./NotificationItem";
import InviteGroupModal from "./InviteGroupModal";
import Whiteboard from "./Whiteboard";

const StudentDashboard = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDetails, setNewGroupDetails] = useState("");
  const [activeTab, setActiveTab] = useState("default");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showGroupDetails, setShowGroupDetails] = useState(false);
  const [showGroupMembers, setShowGroupMembers] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [newGroupImage, setNewGroupImage] = useState(null);
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [groupMembers, setGroupMembers] = useState([]);
  const [creatorDetails, setCreatorDetails] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [attachmentType, setAttachmentType] = useState(null);
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  // Fetch user profile
  const fetchUserProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const response = await axios.get("http://localhost:5000/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUserName(response.data.name || "User");
      setUserId(response.data._id);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error("Failed to load user profile");
    }
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      if (!userId) return;

      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/auth/notifications",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        }
      );

      if (response.data.notifications) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, [userId]);

  // Refresh groups
  const refreshGroups = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !userId) return;

      const response = await axios.get("http://localhost:5000/api/auth/groups", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.groups) {
        setChats(response.data.groups);
      }
    } catch (error) {
      console.error("Error refreshing groups:", error);
    }
  };

  // Handle notification update
  const handleNotificationUpdate = async () => {
    try {
      if (!userId) return;

      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/auth/notifications",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.notifications) {
        setNotifications(response.data.notifications);
        await refreshGroups();
      }
    } catch (error) {
      console.error("Error updating notifications:", error);
    }
  };

  // Fetch member details
  const fetchMemberDetails = useCallback(async () => {
    if (!selectedChat?.members) return;

    try {
      const token = localStorage.getItem("token");
      const memberPromises = selectedChat.members.map(async (memberId) => {
        const cachedMember = sessionStorage.getItem(`member-${memberId}`);
        if (cachedMember) {
          return JSON.parse(cachedMember);
        }

        const response = await fetch(
          `http://localhost:5000/api/auth/user/${memberId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const userData = await response.json();
          const memberData = {
            id: memberId,
            name: userData.name,
            image: userData.image,
            status: "online",
            role: userData.role,
          };
          sessionStorage.setItem(
            `member-${memberId}`,
            JSON.stringify(memberData)
          );
          return memberData;
        }
        return null;
      });

      const memberDetails = await Promise.all(memberPromises);
      setGroupMembers(memberDetails.filter((member) => member !== null));
    } catch (error) {
      console.error("Error fetching member details:", error);
    }
  }, [selectedChat]);

  // Fetch creator details
  useEffect(() => {
    const fetchCreatorDetails = async () => {
      if (selectedChat?.createdBy) {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(
            `http://localhost:5000/api/auth/user/${selectedChat.createdBy}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (response.ok) {
            const userData = await response.json();
            setCreatorDetails({
              id: selectedChat.createdBy,
              name: userData.name,
              image: userData.image,
              status: "online",
              role: "Creator",
            });
          }
        } catch (error) {
          console.error("Error fetching creator details:", error);
        }
      }
    };

    fetchCreatorDetails();
  }, [selectedChat]);

  // Fetch groups
  const fetchGroups = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !userId) return;

      const response = await axios.get("http://localhost:5000/api/auth/groups", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      if (response.data.groups) {
        setChats(response.data.groups);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast.error("Failed to load groups");
    }
  }, [userId]);

  // Initial fetch user profile
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // Fetch groups periodically
  useEffect(() => {
    if (userId) {
      fetchGroups();
      const groupsInterval = setInterval(fetchGroups, 60000);
      return () => clearInterval(groupsInterval);
    }
  }, [userId, fetchGroups]);

  // Fetch notifications periodically
  useEffect(() => {
    if (userId) {
      fetchNotifications();
      const notificationsInterval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(notificationsInterval);
    }
  }, [userId, fetchNotifications]);

  // Fetch member details when selected chat changes
  useEffect(() => {
    fetchMemberDetails();
  }, [fetchMemberDetails]);

  // Filter chats based on search term
  const filteredChats = useMemo(() => {
    return chats.filter((chat) =>
      chat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [chats, searchTerm]);

  // Toggle functions
  const toggleNotifications = () => setShowNotifications(!showNotifications);
  const toggleGroupMembers = () => setShowGroupMembers(!showGroupMembers);
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  const toggleGroupDetails = () => setShowGroupDetails(!showGroupDetails);
  const toggleEmojiPicker = () => setIsEmojiPickerOpen(!isEmojiPickerOpen);
  const toggleAttachmentMenu = () => setIsAttachmentMenuOpen(!isAttachmentMenuOpen);

  // Handle file upload
  const handleFileUpload = async (file, type) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
      formData.append("chatId", selectedChat._id);

      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/messages/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success("File uploaded successfully");
        // Refresh messages or handle the uploaded file
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file");
    }
  };

  // Handle add group
  const handleAddGroup = async () => {
    if (!newGroupName.trim()) {
      toast.error("Group name is required!");
      return;
    }

    if (!newGroupDetails.trim()) {
      toast.error("Group description is required!");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    let imageToSend = newGroupImage;
    if (newGroupImage && newGroupImage instanceof File) {
      imageToSend = await convertToBase64(newGroupImage);
    }

    const newGroupData = {
      name: newGroupName,
      description: newGroupDetails,
      image: imageToSend,
      createdBy: userId,
      members: [userId],
    };

    try {
      const response = await fetch("http://localhost:5000/api/auth/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newGroupData),
      });

      if (response.ok) {
        const result = await response.json();
        setChats([...chats, result.group]);
        setModalOpen(false);
        setNewGroupName("");
        setNewGroupDetails("");
        setNewGroupImage(null);
        toast.success(result.message);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to create group");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error(error);
    }
  };

  // Convert file to base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Tooltip component
  const Tooltip = ({ children, message }) => {
    return (
      <div className="relative flex items-center group">
        {children}
        <span className="absolute top-full mt-2 hidden group-hover:flex items-center bg-gray-800 text-white text-sm px-3 py-1 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {message}
        </span>
      </div>
    );
  };

  // Handle send message
  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !selectedChat) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/messages",
        {
          chatId: selectedChat._id,
          content: currentMessage,
          type: "text",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setMessages([...messages, response.data.message]);
        setCurrentMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-r from-purple-50 via-blue-50 to-pink-50">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "w-[320px]" : "w-[72px]"
        } h-screen bg-gradient-to-b from-amber-200 to-purple-300 text-black border-r transition-all duration-300 flex-shrink-0 overflow-hidden`}
      >
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={toggleSidebar}
          onSelectChat={setSelectedChat}
          chats={filteredChats}
          setModalOpen={setModalOpen}
          userId={userId}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex gap-4 bg-blue-100 p-2 shadow-lg border-b border-gray-200 items-center justify-between flex-shrink-0">
          <div className="flex gap-4 items-center">
            <Tooltip message="Whiteboard">
              <div
                onClick={() => setActiveTab("whiteboard")}
                className={`cursor-pointer p-2 rounded-full ${
                  activeTab === "whiteboard"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                } hover:bg-blue-600 transition-colors duration-200`}
              >
                <FaChalkboard className="w-5 h-5" />
              </div>
            </Tooltip>
            <Tooltip message="Voice Chat">
              <div
                onClick={() => setActiveTab("voice")}
                className={`cursor-pointer p-2 rounded-full ${
                  activeTab === "voice"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                } hover:bg-blue-600 transition-colors duration-200`}
              >
                <FaMicrophone className="w-5 h-5" />
              </div>
            </Tooltip>
            <Tooltip message="Home">
              <div
                onClick={() => setActiveTab("default")}
                className={`cursor-pointer p-2 rounded-full ${
                  activeTab === "default"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                } hover:bg-blue-600 transition-colors duration-200`}
              >
                <FaHome className="w-5 h-5" />
              </div>
            </Tooltip>
          </div>

          {/* Right Icons */}
          <div className="flex gap-4 items-center ml-auto">
            <button
              onClick={toggleGroupMembers}
              className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
            >
              <FaUsers
                className="w-5 h-5"
                color={showGroupMembers ? "#4A90E2" : "#6B7280"}
              />
            </button>
            <button
              onClick={toggleNotifications}
              className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
            >
              <FaBell
                className="w-5 h-5"
                color={showNotifications ? "#4A90E2" : "#6B7280"}
              />
            </button>
            <button
              onClick={toggleGroupDetails}
              className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
            >
              <FaInfoCircle
                className="w-5 h-5"
                color={showGroupDetails ? "#4A90E2" : "#6B7280"}
              />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Dynamic Content */}
          <div className="flex-1 min-w-0 bg-white overflow-hidden">
            {activeTab === "whiteboard" && (
              <div className="h-full w-full overflow-hidden">
                <Whiteboard selectedChat={selectedChat} />
              </div>
            )}
            {activeTab === "voice" && (
              <div className="h-full flex items-center justify-center bg-gray-100">
                <h2 className="text-2xl text-gray-600">
                  Voice Chat Feature Coming Soon
                </h2>
              </div>
            )}
            {activeTab === "default" && (
              <div className="h-full flex items-center justify-center bg-gray-100">
                <h2 className="text-2xl text-gray-600">
                  Welcome to Student Dashboard
                </h2>
              </div>
            )}
          </div>

          {/* Chat Area */}
          <div className="w-[400px] border-l border-gray-200 flex-shrink-0 overflow-hidden">
            <ChatArea
              selectedChat={selectedChat}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              currentMessage={currentMessage}
              setCurrentMessage={setCurrentMessage}
              handleSendMessage={handleSendMessage}
              userId={userId}
              isTyping={isTyping}
              messages={messages}
              onlineUsers={onlineUsers}
            />
          </div>
        </div>
      </div>

      {/* Modals and Overlays */}
      {showGroupMembers && (
        <div className="fixed top-16 right-4 w-72 bg-white bg-opacity-75 backdrop-blur-md shadow-lg p-4 rounded-lg z-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              Group Members
            </h3>
            <button
              onClick={toggleGroupMembers}
              className="text-gray-800 hover:text-gray-600"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
          {selectedChat ? (
            <div className="space-y-2">
              {groupMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg"
                >
                  <img
                    src={member.image || "https://via.placeholder.com/40"}
                    alt={member.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-800">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center">
              Select a group to view members
            </p>
          )}
        </div>
      )}

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="fixed top-16 right-4 w-72 max-h-[60vh] bg-white bg-opacity-75 backdrop-blur-md shadow-lg p-4 rounded-lg z-50 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              Notifications
            </h3>
            <button
              onClick={toggleNotifications}
              className="text-gray-800 hover:text-gray-600"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-2">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification._id}
                  notification={notification}
                  onStatusUpdate={handleNotificationUpdate}
                />
              ))
            ) : (
              <p className="text-gray-500 text-center">
                No notifications found
              </p>
            )}
          </div>
        </div>
      )}

      {/* Group Details Panel */}
      {showGroupDetails && selectedChat && (
        <div className="fixed right-0 top-0 h-screen w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-out z-50 flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-800">
              Group Details
            </h3>
            <button
              onClick={toggleGroupDetails}
              className="text-gray-600 hover:text-gray-800"
            >
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
                    <p className="text-sm text-gray-500">
                      {creatorDetails.role}
                    </p>
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
                      <h5 className="font-medium text-gray-900">
                        {member.name}
                      </h5>
                      <p className="text-sm text-gray-500">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 border-t">
            <button
              onClick={() => setShowInviteModal(true)}
              className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <FaUserPlus className="w-5 h-5" />
              <span>Invite Members</span>
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {modalOpen && (
        <Modal
          onClose={() => setModalOpen(false)}
          groupName={newGroupName}
          setGroupName={setNewGroupName}
          groupDescription={newGroupDetails}
          setGroupDescription={setNewGroupDetails}
          groupImage={newGroupImage}
          setGroupImage={setNewGroupImage}
          onSubmit={handleAddGroup}
        />
      )}

      {showInviteModal && selectedChat && (
        <InviteGroupModal
          groupId={selectedChat._id}
          onClose={() => setShowInviteModal(false)}
        />
      )}

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        pauseOnFocusLoss
      />
    </div>
  );
};

export default StudentDashboard;