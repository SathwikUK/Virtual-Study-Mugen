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

const Sidebar = ({ isOpen, onToggle, onSelectChat, chats, setModalOpen }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [userName, setUserName] = useState("Loading...");
  const [userProfileImage, setUserProfileImage] = useState(null);

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

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChatSelection = (chat) => {
    console.log("Selected Chat ID:", chat._id);
    onSelectChat(chat);
  };

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
          <button className="p-2 rounded-full bg-green-500 hover:bg-green-600 text-white" onClick={() => setModalOpen(true)}>
            <FaPlus />
          </button>
          <button className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white" onClick={onToggle}>
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
                filteredChats.map((chat, index) => (
                  <li
                    key={chat.id || index}
                    className="p-2 mb-2 rounded cursor-pointer hover:bg-gray-200 flex items-center gap-2 border-b border-gray-400 opacity-60"
                    onClick={() => handleChatSelection(chat)}
                  >
                    <div className="w-10 h-10 relative">
                      {chat.isLive && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      )}
                      <img src={chat.image} alt={chat.name} className="w-10 h-10 rounded-full object-cover" />
                    </div>
                    <div>
                      <p className="font-bold">{chat.name}</p>
                      <p className="text-sm text-gray-600">{chat.message}</p>
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
            <img src={userProfileImage} alt="User Profile" className="w-full h-full object-cover" />
          ) : (
            <FaUserCircle className="text-gray-500 text-3xl" />
          )}
        </div>
        <div className="text-black font-medium">{userName}</div>
      </div>
    </div>
  );
};

export default Sidebar;
