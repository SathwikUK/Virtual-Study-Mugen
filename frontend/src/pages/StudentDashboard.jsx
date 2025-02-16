import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "./Sidebar";
import ChatArea from "./ChatArea";
import Modal from "./Modal";
import { FaComments } from "react-icons/fa";
import InviteGroupModal from "./InviteGroupModal";
import GroupDetailsPanel from "../components/GroupDetailsPanel";
import VsmChat from "./VsmChat";
import { ArrowLeft } from "lucide-react";

// Import a background image for the chat placeholder
import chatBg from "../assets/vsm3.jpg";

// Stub component for OpenAI panel – replace with your actual component
const OpenAI = () => (
  <div className="h-full w-full flex items-center justify-center bg-white">
    <h2 className="text-2xl font-semibold text-gray-700">OpenAI Panel</h2>
  </div>
);

const StudentDashboard = () => {
  // ---------------- STATE DECLARATIONS ----------------
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDetails, setNewGroupDetails] = useState("");
  // Notifications
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  // Group details panel
  const [showGroupDetails, setShowGroupDetails] = useState(false);
  const [creatorDetails, setCreatorDetails] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  // Messages & user info
  const [currentMessage, setCurrentMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [newGroupImage, setNewGroupImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  // Controls whether the OpenAI (VsmChat) middle panel is visible.
  const [showOpenAI, setShowOpenAI] = useState(false);

  // ---------------- FETCH USER PROFILE ----------------
  const fetchUserProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication required");
        return;
      }
      const response = await axios.get(
        "http://localhost:5000/api/auth/profile",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserName(response.data.name || "User");
      setUserId(response.data._id);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error("Failed to load user profile");
    }
  }, []);

  // ---------------- FETCH NOTIFICATIONS ----------------
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

  // ---------------- FETCH GROUPS ----------------
  const fetchGroups = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !userId) return;
      const response = await axios.get(
        "http://localhost:5000/api/auth/groups",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.groups) {
        setChats(response.data.groups);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast.error("Failed to load groups");
    }
  }, [userId]);

  // ---------------- REFRESH GROUPS ----------------
  const refreshGroups = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !userId) return;
      const response = await axios.get(
        "http://localhost:5000/api/auth/groups",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.groups) {
        setChats(response.data.groups);
      }
    } catch (error) {
      console.error("Error refreshing groups:", error);
    }
  };

  // ---------------- HANDLE NOTIFICATION UPDATE ----------------
  const handleNotificationUpdate = async () => {
    try {
      if (!userId) return;
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/auth/notifications",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.notifications) {
        setNotifications(response.data.notifications);
        await refreshGroups();
      }
    } catch (error) {
      console.error("Error updating notifications:", error);
    }
  };

  // ---------------- FETCH MEMBER DETAILS ----------------
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
          { headers: { Authorization: `Bearer ${token}` } }
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

  useEffect(() => {
    const fetchCreatorDetails = async () => {
      if (selectedChat?.createdBy) {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(
            `http://localhost:5000/api/auth/user/${selectedChat.createdBy}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (response.ok) {
            const userData = await response.json();
            setCreatorDetails({
              _id: selectedChat.createdBy,
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

  // ---------------- INITIAL DATA FETCHES ----------------
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  useEffect(() => {
    if (userId) {
      fetchGroups();
      const groupsInterval = setInterval(fetchGroups, 60000);
      return () => clearInterval(groupsInterval);
    }
  }, [userId, fetchGroups]);

  useEffect(() => {
    if (userId) {
      fetchNotifications();
      const notificationsInterval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(notificationsInterval);
    }
  }, [userId, fetchNotifications]);

  useEffect(() => {
    fetchMemberDetails();
  }, [fetchMemberDetails]);

  // ---------------- FILTER CHATS BY SEARCH ----------------
  const filteredChats = useMemo(() => {
    return chats.filter((chat) =>
      chat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [chats, searchTerm]);

  // ---------------- TOGGLE FUNCTIONS ----------------
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const toggleNotifications = () => setShowNotifications((prev) => !prev);
  const toggleGroupDetails = () => setShowGroupDetails((prev) => !prev);

  // ---------------- ADD GROUP ----------------
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

  // ---------------- CONVERT FILE TO BASE64 ----------------
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // ---------------- HANDLE SEND MESSAGE ----------------
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
        { headers: { Authorization: `Bearer ${token}` } }
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

  // ---------------- PREPARE CURRENT USER ----------------
  const currentUser = useMemo(
    () => ({ _id: userId, name: userName }),
    [userId, userName]
  );

  // ---------------- CHAT PLACEHOLDER ----------------
  const renderChatPlaceholder = () => {
    if (chats.length === 0) {
      return (
        <div
          className="flex items-center justify-center h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${chatBg})` }}
        ></div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center h-full bg-black">
        <span className="text-purple-500 text-8xl">
          <FaComments />
        </span>
      </div>
    );
  };

  return (
    <>
      {/* MOBILE LAYOUT */}
      <div className="md:hidden h-screen bg-blue-700 overflow-hidden min-h-screen">
        {selectedChat || showOpenAI ? (
          // Render ChatArea or VsmChat with a header including a back arrow.
          <div className="flex flex-col h-full min-h-0">
            <div className="p-4 border-b border-gray-700/50 bg-gray-800/90 backdrop-blur-sm flex items-center">
              <button
                onClick={() => {
                  if (selectedChat) {
                    setSelectedChat(null);
                  } else {
                    setShowOpenAI(false);
                  }
                }}
                className="text-white mr-4"
                title="Go back"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-bold text-white">Back to Chats</h1>
            </div>
            {selectedChat ? (
              <ChatArea
                selectedChat={selectedChat}
                currentMessage={currentMessage}
                setCurrentMessage={setCurrentMessage}
                handleSendMessage={handleSendMessage}
                userId={userId}
                isTyping={isTyping}
                messages={messages}
                onlineUsers={onlineUsers}
                showGroupDetails={showGroupDetails}
                onToggleDetails={toggleGroupDetails}
                onBack={() => setSelectedChat(null)}
              />
            ) : (
              <VsmChat onBack={() => setShowOpenAI(false)} />
            )}
          </div>
        ) : (
          // Render the Sidebar (chat list)
          <div className="h-full">
            <Sidebar
              isOpen={isSidebarOpen}
              onToggle={toggleSidebar}
              onSelectChat={setSelectedChat}
              chats={filteredChats}
              setModalOpen={setModalOpen}
              userId={userId}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              notifications={notifications}
              showNotifications={showNotifications}
              onToggleNotifications={toggleNotifications}
              onStatusUpdate={handleNotificationUpdate}
              onGroupUpdate={setChats}
              showOpenAI={showOpenAI}
              onToggleOpenAI={() => setShowOpenAI((prev) => !prev)}
            />
          </div>
        )}
      </div>

      {/* DESKTOP LAYOUT */}
      <div className="hidden md:flex h-screen overflow-hidden bg-blue-700">
        {/* Sidebar */}
        <div
          className={
            isSidebarOpen
              ? "w-[30%] bg-gradient-to-b from-amber-200 to-purple-300 text-black border-r flex-shrink-0 overflow-hidden transition-all duration-300"
              : showOpenAI
              ? "w-[5%] bg-gradient-to-b from-amber-200 to-purple-300 text-black border-r flex-shrink-0 overflow-hidden transition-all duration-300"
              : "w-20 bg-gradient-to-b from-amber-200 to-purple-300 text-black border-r flex-shrink-0 overflow-hidden transition-all duration-300"
          }
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
            notifications={notifications}
            showNotifications={showNotifications}
            onToggleNotifications={toggleNotifications}
            onStatusUpdate={handleNotificationUpdate}
            onGroupUpdate={setChats}
            showOpenAI={showOpenAI}
            onToggleOpenAI={() => setShowOpenAI((prev) => !prev)}
          />
        </div>

        {/* Main Content */}
        {showOpenAI ? (
          isSidebarOpen ? (
            <>
              <div className="w-[40%] border-r border-gray-200 flex-shrink-0 overflow-hidden transition-all duration-300">
                <VsmChat />
              </div>
              <div className="w-[30%] transition-all duration-300">
                {selectedChat ? (
                  <ChatArea
                    selectedChat={selectedChat}
                    currentMessage={currentMessage}
                    setCurrentMessage={setCurrentMessage}
                    handleSendMessage={handleSendMessage}
                    userId={userId}
                    isTyping={isTyping}
                    messages={messages}
                    onlineUsers={onlineUsers}
                    showGroupDetails={showGroupDetails}
                    onToggleDetails={toggleGroupDetails}
                  />
                ) : (
                  renderChatPlaceholder()
                )}
              </div>
            </>
          ) : (
            <>
              <div className="w-[60%] border-r border-gray-200 flex-shrink-0 overflow-hidden transition-all duration-300">
                <VsmChat />
              </div>
              <div className="w-[35%] transition-all duration-300">
                {selectedChat ? (
                  <ChatArea
                    selectedChat={selectedChat}
                    currentMessage={currentMessage}
                    setCurrentMessage={setCurrentMessage}
                    handleSendMessage={handleSendMessage}
                    userId={userId}
                    isTyping={isTyping}
                    messages={messages}
                    onlineUsers={onlineUsers}
                    showGroupDetails={showGroupDetails}
                    onToggleDetails={toggleGroupDetails}
                  />
                ) : (
                  renderChatPlaceholder()
                )}
              </div>
            </>
          )
        ) : isSidebarOpen ? (
          <div className="w-[70%] transition-all duration-300">
            {selectedChat ? (
              <ChatArea
                selectedChat={selectedChat}
                currentMessage={currentMessage}
                setCurrentMessage={setCurrentMessage}
                handleSendMessage={handleSendMessage}
                userId={userId}
                isTyping={isTyping}
                messages={messages}
                onlineUsers={onlineUsers}
                showGroupDetails={showGroupDetails}
                onToggleDetails={toggleGroupDetails}
              />
            ) : (
              renderChatPlaceholder()
            )}
          </div>
        ) : (
          <div className="flex-1 transition-all duration-300">
            {selectedChat ? (
              <ChatArea
                selectedChat={selectedChat}
                currentMessage={currentMessage}
                setCurrentMessage={setCurrentMessage}
                handleSendMessage={handleSendMessage}
                userId={userId}
                isTyping={isTyping}
                messages={messages}
                onlineUsers={onlineUsers}
                showGroupDetails={showGroupDetails}
                onToggleDetails={toggleGroupDetails}
              />
            ) : (
              renderChatPlaceholder()
            )}
          </div>
        )}
      </div>

      {/* Group Details Panel */}
      <GroupDetailsPanel
        show={showGroupDetails}
        onClose={toggleGroupDetails}
        selectedChat={selectedChat}
        creatorDetails={creatorDetails}
        groupMembers={groupMembers}
        onInviteClick={() => setShowInviteModal(true)}
        currentUser={currentUser}
        onGroupDeleted={(deletedGroupId) => {
          setChats(chats.filter((chat) => chat._id !== deletedGroupId));
          if (selectedChat && selectedChat._id === deletedGroupId) {
            setSelectedChat(null);
          }
          toast.success("Group successfully deleted");
        }}
      />

      {/* Modal for Creating New Group */}
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

      {/* Invite Group Modal */}
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
    </>
  );
};

export default StudentDashboard;
