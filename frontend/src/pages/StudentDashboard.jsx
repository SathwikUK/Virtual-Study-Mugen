import React, { useState,useEffect,useCallback, useMemo } from "react";
import { FaBell, FaChalkboard,FaUsers, FaInfoCircle,FaMicrophone, FaHome,  FaPaperPlane } from "react-icons/fa"; 
import Sidebar from "./Sidebar";
import Modal from "./Modal";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';  // Ensure both are imported
import 'react-toastify/dist/ReactToastify.css';  // Import the necessary CSS for toasts
import ChatArea from "./ChatArea";
import NotificationItem from "./NotificationItem";
import InviteGroupModal from "./InviteGroupModal";

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
  

  // First, fetch the user profile to get the user ID
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
  // Then fetch notifications using the user ID
  const fetchNotifications = useCallback(async () => {
    try {
      if (!userId) return;
      
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/auth/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          // Add cache control headers
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (response.data.notifications) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [userId]);

  //refresh groups

  const refreshGroups = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !userId) return;

      const response = await axios.get("http://localhost:5000/api/auth/groups", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.groups) {
        setChats(response.data.groups);
      }
    } catch (error) {
      console.error("Error refreshing groups:", error);
    }
  };

  const handleNotificationUpdate = async () => {
    try {
      if (!userId) return;
      
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/auth/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.notifications) {
        setNotifications(response.data.notifications);
        await refreshGroups(); // Refresh groups after notification update
      }
    } catch (error) {
      console.error('Error updating notifications:', error);
    }
  };


  
  const fetchMemberDetails = useCallback(async () => {
    if (!selectedChat?.members) return;

    try {
      const token = localStorage.getItem("token");
      const memberPromises = selectedChat.members.map(async (memberId) => {
        // Add caching for member details
        const cachedMember = sessionStorage.getItem(`member-${memberId}`);
        if (cachedMember) {
          return JSON.parse(cachedMember);
        }

        const response = await fetch(`http://localhost:5000/api/auth/user/${memberId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const userData = await response.json();
          const memberData = {
            id: memberId,
            name: userData.name,
            image: userData.image,
            status: 'online',
            role: userData.role
          };
          // Cache the member data
          sessionStorage.setItem(`member-${memberId}`, JSON.stringify(memberData));
          return memberData;
        }
        return null;
      });

      const memberDetails = await Promise.all(memberPromises);
      setGroupMembers(memberDetails.filter(member => member !== null));
    } catch (error) {
      console.error("Error fetching member details:", error);
    }
  }, [selectedChat]);

  useEffect(() => {
    const fetchCreatorDetails = async () => {
      if (selectedChat?.createdBy) {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(`http://localhost:5000/api/auth/user/${selectedChat.createdBy}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const userData = await response.json();
            setCreatorDetails({
              id: selectedChat.createdBy,
              name: userData.name,
              image: userData.image,
              status: 'online', // You can implement real status logic later
              role: 'Creator'
            });
          }
        } catch (error) {
          console.error("Error fetching creator details:", error);
        }
      }
    };

    fetchCreatorDetails();
  }, [selectedChat]);
  
 
  // const notifications = [
  //   "New message received in Chat 1.",
  //   "You have a new group invite.",
  //   "Your document was shared with you.",
  //   "Your profile was updated successfully.",
  //   "A new member joined your group.",
  //   "Chat 3 has been archived.",
  // ];

  // Fetch groups from the backend when the component mounts
  // Empty dependency array means this runs only once when the component mounts
  const fetchGroups = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !userId) return;

      const response = await axios.get("http://localhost:5000/api/auth/groups", {
        headers: {
          Authorization: `Bearer ${token}`,
          // Add cache control headers
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (response.data.groups) {
        setChats(response.data.groups);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast.error("Failed to load groups");
    }
  }, [userId]);
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  useEffect(() => {
    if (userId) {
      fetchGroups();
      const groupsInterval = setInterval(fetchGroups, 60000); // Refresh every minute
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

  // Memoize filtered chats
  const filteredChats = useMemo(() => {
    return chats.filter((chat) =>
      chat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [chats, searchTerm]);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const toggleGroupMembers = () => {
    setShowGroupMembers(!showGroupMembers);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

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

  // Convert image to base64 if present
  let imageToSend = newGroupImage;
  if (newGroupImage && newGroupImage instanceof File) {
    imageToSend = await convertToBase64(newGroupImage);
  }

    const newGroupData = {
    name: newGroupName,
    description: newGroupDetails, // Include the group description
    image: imageToSend,
    createdBy: userId,
    members: [userId]
   
};
console.log("Group data being sent:", newGroupData);
   

  try {
    const response = await fetch("http://localhost:5000/api/auth/groups", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newGroupData),
    });

    

    if (response.ok) {
      const result = await response.json();
      setChats([...chats, result.group]);
      setModalOpen(false);
      setNewGroupName("");
      setNewGroupDetails(""); // Reset the group description
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



// Helper function to convert the file to base64
const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file); // Convert the file to base64
  });
};

const Tooltip = ({ children, message }) => {
  return (
    <div className="relative flex items-center group">
      {children}
      <span className="absolute top-full mt-2 hidden group-hover:flex items-center bg-gray-400 text-white text-sm px-3 py-1 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {message}
      </span>
    </div>
  );
};



  const handleDeleteGroup = (id) => {
    setChats((prevChats) => prevChats.filter((chat) => chat.id !== id));
    alert("Group deleted successfully!");
  };

  const handleSendMessage = () => {
    if (selectedChat && currentMessage.trim()) {
      const updatedChats = chats.map((chat) =>
        chat.id === selectedChat.id
          ? { ...chat, message: currentMessage }
          : chat
      );
      setChats(updatedChats);
      setCurrentMessage("");
    }
  };

  const toggleGroupDetails = () => {
    setShowGroupDetails(!showGroupDetails);
  };

  
   
      return (
        <div className="flex h-screen bg-gradient-to-r from-purple-50 via-blue-50 to-pink-50">
          <div className={`${isSidebarOpen ? "w-72" : "w-16"} h-screen bg-gradient-to-b from-amber-200 to-purple-300 text-black border-r transition-all duration-300 overflow-x-hidden`}>
            <Sidebar
              isOpen={isSidebarOpen}
              onToggle={toggleSidebar}
              onSelectChat={setSelectedChat}
              chats={filteredChats} // Use filteredChats instead of chats
              setModalOpen={setModalOpen}
              userId={userId}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </div>
  
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col bg-gray-900 overflow-hidden">
          {/* Toolbar - Now always visible */}
          <div className="flex gap-4 bg-blue-100 p-2 shadow-lg border-b border-gray-200 items-center justify-between">
            <div className="flex gap-4 items-center">
              <Tooltip message="Whiteboard">
                <div
                  onClick={() => setActiveTab("whiteboard")}
                  className={`cursor-pointer p-2 rounded-full ${
                    activeTab === "whiteboard"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  } hover:bg-blue-600`}
                >
                  <FaChalkboard />
                </div>
              </Tooltip>
              <Tooltip message="Voice Chat">
                <div
                  onClick={() => setActiveTab("voice")}
                  className={`cursor-pointer p-2 rounded-full ${
                    activeTab === "voice" ? "bg-blue-500 text-white" : "bg-gray-200"
                  } hover:bg-blue-600`}
                >
                  <FaMicrophone />
                </div>
              </Tooltip>
              <Tooltip message="Home">
                <div
                  onClick={() => setActiveTab("default")}
                  className={`cursor-pointer p-2 rounded-full ${
                    activeTab === "default" ? "bg-blue-500 text-white" : "bg-gray-200"
                  } hover:bg-blue-600`}
                >
                  <FaHome />
                </div>
              </Tooltip>
            </div>
  
            {/* Right-aligned Icons Container */}
            <div className="flex gap-4 items-center ml-auto">
              <button
                onClick={toggleGroupMembers}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center"
              >
                <FaUsers size={24} color={showGroupMembers ? "#4A90E2" : "#6B7280"} />
              </button>
              <button
                onClick={toggleNotifications}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center"
              >
                <FaBell
                  size={24}
                  color={showNotifications ? "#4A90E2" : "#6B7280"}
                />
              </button>
              <button
                onClick={toggleGroupDetails}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center"
              >
                <FaInfoCircle size={24} color={showGroupDetails ? "#4A90E2" : "#6B7280"} />
              </button>
            </div>
          </div>
         {/* Group Members Panel */}
         {showGroupMembers && (
          <div className="fixed top-16 right-4 w-72 bg-white bg-opacity-75 backdrop-blur-md shadow-lg p-4 rounded-lg z-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Group Members</h3>
              <button
                onClick={toggleGroupMembers}
                className="text-gray-800 text-xl font-semibold"
              >
                &times;
              </button>
            </div>
            {selectedChat ? (
              <div>
                <h4 className="font-semibold">Members:</h4>
                <ul>
                  {groupMembers.map((member) => (
                    <li key={member.id} className="text-gray-700">{member.name}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-gray-600">Select a group to view members</p>
            )}
          </div>
        )}
      
      
  {/* Notifications Panel */}
  {showNotifications && (
          <div className="fixed top-16 right-4 w-72 max-h-[60vh] bg-white bg-opacity-75 backdrop-blur-md shadow-lg p-4 overflow-y-auto z-50 rounded-lg">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Notifications
              </h3>
              <button
                onClick={toggleNotifications}
                className="text-gray-800 text-xl font-semibold"
              >
                &times;
              </button>
            </div>
            <div>
              {notifications && notifications.length > 0 ? (
                notifications.map((notification) => (
                  <NotificationItem
                    key={notification._id}
                    notification={notification}
                    onStatusUpdate={handleNotificationUpdate}
                  />
                ))
              ) : (
                <p className="text-gray-500 text-center">No notifications found</p>
              )}
            </div>
          </div>
        )}
      {/* Group Details Panel */}
      {showGroupDetails && (
  <div className="fixed top-0 right-0 w-80 h-screen bg-white shadow-2xl transform transition-transform duration-300 ease-out z-50 flex flex-col">
    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
      <h3 className="text-lg font-semibold text-gray-900">Group Details</h3>
      <button 
        onClick={() => setShowGroupDetails(false)}
        className="p-2 hover:bg-gray-100 rounded-full"
      >
        <FaInfoCircle className="text-gray-600" />
      </button>
    </div>

    {selectedChat ? (
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-6">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <img
              src={selectedChat.image || "https://via.placeholder.com/150"}
              alt={selectedChat.name}
              className="w-full h-full rounded-full object-cover ring-4 ring-white shadow-lg"
            />
          </div>
          <h2 className="text-xl font-bold text-center text-gray-900 mb-2">{selectedChat.name}</h2>
          <p className="text-center text-gray-500 text-sm">{selectedChat.description}</p>
        </div>

        {creatorDetails && (
          <div className="p-6 border-t border-gray-100">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <FaUsers className="text-blue-500" />
              Created by
            </h4>
            <div className="group flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200">
              <div className="relative">
                <img
                  src={creatorDetails.image 
                    ? `data:image/jpeg;base64,${btoa(
                        new Uint8Array(creatorDetails.image.data).reduce(
                          (data, byte) => data + String.fromCharCode(byte), ""
                        )
                      )}` 
                    : "https://via.placeholder.com/150"}
                  alt={creatorDetails.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm"
                />
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                  creatorDetails.status === 'online' ? 'bg-green-400' : 'bg-gray-300'
                }`}></div>
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="font-medium text-gray-900 truncate">{creatorDetails.name}</h5>
                <p className="text-sm text-gray-500">{creatorDetails.role}</p>
              </div>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 hover:bg-blue-50 rounded-full">
                <FaPaperPlane className="w-4 h-4 text-blue-500" />
              </button>
            </div>
          </div>
        )}

        <div className="p-6 border-t border-gray-100">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <FaUsers className="text-blue-500" />
            Members ({groupMembers.length})
          </h4>

          <div className="space-y-3">
            {groupMembers.map((member) => (
              <div 
                key={member.id}
                className="group flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200"
              >
                <div className="relative">
                  <img
                    src={member.image 
                      ? `data:image/jpeg;base64,${btoa(
                          new Uint8Array(member.image.data).reduce(
                            (data, byte) => data + String.fromCharCode(byte), ""
                          )
                        )}` 
                      : "https://via.placeholder.com/150"}
                    alt={member.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm"
                  />
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                    member.status === 'online' ? 'bg-green-400' : 'bg-gray-300'
                  }`}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium text-gray-900 truncate">{member.name}</h5>
                  <p className="text-sm text-gray-500">{member.role}</p>
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 hover:bg-blue-50 rounded-full">
                  <FaPaperPlane className="w-4 h-4 text-blue-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    ) : (
      <div className="p-6">
        <p className="text-gray-600 text-center">Select a group to view details</p>
      </div>
    )}

    <div className="p-4 border-t border-gray-100">
      <button 
        onClick={() => setShowInviteModal(true)} 
        className="w-full py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
      >
        Invite Group
      </button>
    </div>
  </div>
)}



       {/* Chat Area */}
       <ChatArea
          selectedChat={selectedChat}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentMessage={currentMessage}
          setCurrentMessage={setCurrentMessage}
          handleSendMessage={handleSendMessage}
          userId={userId}
        />
      </div>

      {showInviteModal && selectedChat && (
        <InviteGroupModal
          groupId={selectedChat._id}
          onClose={() => setShowInviteModal(false)}
        />
      )}

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
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} closeOnClick pauseOnHover draggable pauseOnFocusLoss />
    </div>
  );
};
export default StudentDashboard;