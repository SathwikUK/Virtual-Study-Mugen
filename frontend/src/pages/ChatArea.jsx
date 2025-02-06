import React, { useState, useEffect } from "react";
import { FaPaperPlane } from "react-icons/fa";
import io from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:5000");

const ChatArea = ({ selectedChat, userId }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (selectedChat) {
      socket.emit("joinGroup", selectedChat._id);
      axios
        .get(`http://localhost:5000/api/messages/${selectedChat._id}`)
        .then((res) => {
          console.log("Messages fetched:", res.data); // Log the response data
          setMessages(res.data);
        })
        .catch((error) => {
          console.error("Error loading messages:", error.response || error);
        });
    }
  }, [selectedChat]);
  

  useEffect(() => {
    socket.on("newMessage", (newMsg) => {
      setMessages((prev) => [...prev, newMsg]);
    });

    return () => socket.off("newMessage");
  }, []);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const senderId = userId || localStorage.getItem("userId"); // Ensure senderId is set
    if (!senderId) {
      console.error("Error: senderId not found.");
      return;
    }

    const newMessage = { groupId: selectedChat._id, senderId, message };

    try {
      await axios.post("http://localhost:5000/api/messages", newMessage);
      socket.emit("sendMessage", newMessage);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {selectedChat ? (
        <>
          <div className="p-4 bg-blue-50 shadow-md flex items-center">
            <img src={selectedChat.image} alt="Group" className="w-10 h-10 rounded-full mr-3" />
            <h2 className="text-xl font-bold">{selectedChat.name}</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
          {messages.map((msg, index) => {
  const messageSenderId = msg.senderId._id || msg.senderId; // Ensure msg.senderId is properly accessed
  const currentUserId = userId || localStorage.getItem("userId"); // Get senderId for comparison

  return (
    <div key={index} className={`flex ${messageSenderId === currentUserId ? "justify-end" : "justify-start"}`}>
      <div className={`p-2 rounded-lg shadow-md max-w-xs ${messageSenderId === currentUserId ? "bg-blue-200" : "bg-gray-300"}`}>
        <p className="text-sm">{msg.message}</p>
        <span className="text-xs text-gray-600">{new Date(msg.timestamp).toLocaleTimeString()}</span>
      </div>
    </div>
  );
})}

          </div>

          <div className="p-4 flex items-center border-t">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 p-2 border rounded-lg"
            />
            <button onClick={handleSendMessage} className="ml-2 text-blue-500">
              <FaPaperPlane />
            </button>
          </div>
        </>
      ) : (
        <div className="p-4 text-gray-500">Select a chat to start messaging</div>
      )}
    </div>
  );
};

export default ChatArea;
