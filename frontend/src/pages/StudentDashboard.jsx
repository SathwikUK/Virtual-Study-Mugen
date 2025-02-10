import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "./Sidebar";
import ChatArea from "./ChatArea";
import Modal from "./Modal";
import Whiteboard from "./Whiteboard";
import InviteGroupModal from "./InviteGroupModal";
import DashboardToolbar from "../components/DashboardToolbar";
import NotificationsPanel from "../components/NotificationsPanel";
import GroupDetailsPanel from "../components/GroupDetailsPanel";

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

      const response = await axios.get(
        "http://localhost:5000/api/auth/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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

      const response = await axios.get(
        "http://localhost:5000/api/auth/groups",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
  const toggleAttachmentMenu = () =>
    setIsAttachmentMenuOpen(!isAttachmentMenuOpen);

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

      <div className="flex-1 flex flex-col min-w-0">
        <DashboardToolbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          showGroupMembers={showGroupMembers}
          showNotifications={showNotifications}
          showGroupDetails={showGroupDetails}
          onToggleMembers={toggleGroupMembers}
          onToggleNotifications={toggleNotifications}
          onToggleDetails={toggleGroupDetails}
        />

        <div className="flex flex-1 overflow-hidden">
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

      <NotificationsPanel
        show={showNotifications}
        onClose={toggleNotifications}
        notifications={notifications}
        onStatusUpdate={handleNotificationUpdate}
      />

      <GroupDetailsPanel
        show={showGroupDetails}
        onClose={toggleGroupDetails}
        selectedChat={selectedChat}
        creatorDetails={creatorDetails}
        groupMembers={groupMembers}
        onInviteClick={() => setShowInviteModal(true)}
      />

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
