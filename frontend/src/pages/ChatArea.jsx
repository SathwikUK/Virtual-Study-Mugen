import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";
import { useContextMenu } from "react-contexify";
import "react-contexify/dist/ReactContexify.css";
import MessageList from "../components/MessageList";
import { Download, File, Search } from "lucide-react";
import MessageInput from "../components/MessageInput";
import MessageContext from "../components/MessageContext";

const socket = io("http://localhost:5000", {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: Infinity,
});

const MENU_ID = "message-context-menu";

const ChatArea = ({ selectedChat, userId, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editMessage, setEditMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [messageStatuses, setMessageStatuses] = useState({});
  const messagesEndRef = useRef(null);
  const { show } = useContextMenu({
    id: MENU_ID,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedChat) {
      socket.emit("joinGroup", selectedChat._id);
      fetchMessages();
    }
    return () => {
      socket.emit("leaveGroup", selectedChat?._id);
      setShowEmojiPicker(false);
    };
  }, [selectedChat]);

  useEffect(() => {
    const handleNewMessage = (newMsg) => {
      setMessages((prev) => {
        const messageExists = prev.some((msg) => msg._id === newMsg._id);
        if (!messageExists) {
          return [...prev, newMsg];
        }
        return prev;
      });
      setFilteredMessages((prev) => {
        const messageExists = prev.some((msg) => msg._id === newMsg._id);
        if (!messageExists) {
          return [...prev, newMsg];
        }
        return prev;
      });
    };

    const handleMessageDeleted = (deletedMessageId) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== deletedMessageId));
      setFilteredMessages((prev) =>
        prev.filter((msg) => msg._id !== deletedMessageId)
      );
    };

    const handleMessageEdited = (editedMessage) => {
      setMessages((prev) =>
        prev.map((msg) => (msg._id === editedMessage._id ? editedMessage : msg))
      );
      setFilteredMessages((prev) =>
        prev.map((msg) => (msg._id === editedMessage._id ? editedMessage : msg))
      );
    };

    const handleMessageRead = ({ messageId, readBy }) => {
      setMessageStatuses((prev) => ({
        ...prev,
        [messageId]: {
          ...prev[messageId],
          readBy: [...(prev[messageId]?.readBy || []), readBy],
        },
      }));
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messageDeleted", handleMessageDeleted);
    socket.on("messageEdited", handleMessageEdited);
    socket.on("messageRead", handleMessageRead);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messageDeleted", handleMessageDeleted);
      socket.off("messageEdited", handleMessageEdited);
      socket.off("messageRead", handleMessageRead);
    };
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredMessages(messages);
    } else {
      const filtered = messages.filter((msg) => {
        const messageText = msg.message?.toLowerCase() || "";
        const senderName = (
          msg.senderId.name ||
          msg.senderName ||
          ""
        )?.toLowerCase();
        const fileName = msg.fileData?.fileName?.toLowerCase() || "";
        const searchLower = searchQuery.toLowerCase();

        return (
          messageText.includes(searchLower) ||
          senderName.includes(searchLower) ||
          fileName.includes(searchLower)
        );
      });
      setFilteredMessages(filtered);
    }
  }, [searchQuery, messages]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/messages/${selectedChat._id}`
      );
      setMessages(response.data);
      setFilteredMessages(response.data);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const response = await axios.post(
        "http://localhost:5000/api/upload",
        formData
      );
      await handleSendMessage(null, response.data.fileData);
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSendMessage = async (text = null, fileData = null) => {
    const messageText = text || message;
    if (!messageText.trim() && !fileData) return;

    const senderId = userId || localStorage.getItem("userId");
    if (!senderId) {
      console.error("Error: senderId not found.");
      return;
    }

    const newMessage = {
      groupId: selectedChat._id,
      senderId,
      message: messageText.trim(),
      fileData,
      senderName: currentUser?.name,
    };

    try {
      const response = await axios.post(
        "http://localhost:5000/api/messages",
        newMessage
      );
      socket.emit("sendMessage", response.data);
      setMessage("");
      setShowEmojiPicker(false);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleDownload = (dataUrl, fileName) => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const onEmojiClick = (emojiObject) => {
    setMessage((prevMessage) => prevMessage + emojiObject.emoji);
  };

  const handleContextMenu = (e, message) => {
    e.preventDefault();
    const currentUserId = userId || localStorage.getItem("userId");
    if (
      message.senderId._id === currentUserId ||
      message.senderId === currentUserId
    ) {
      show({
        event: e,
        props: { messageId: message._id, senderId: message.senderId },
      });
    }
  };

  const handleDeleteMessage = async (args) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/messages/${args.props.messageId}`
      );
      setMessages((prev) =>
        prev.filter((msg) => msg._id !== args.props.messageId)
      );
      setFilteredMessages((prev) =>
        prev.filter((msg) => msg._id !== args.props.messageId)
      );
      socket.emit("messageDeleted", args.props.messageId);
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const startEditing = (messageId, currentMessage) => {
    setEditingMessageId(messageId);
    setEditMessage(currentMessage);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditMessage("");
  };

  const handleEditMessage = async (messageId) => {
    if (!editMessage.trim()) return;
    try {
      const response = await axios.put(
        `http://localhost:5000/api/messages/${messageId}`,
        { message: editMessage }
      );
      setMessages((prev) =>
        prev.map((msg) => (msg._id === messageId ? response.data : msg))
      );
      setFilteredMessages((prev) =>
        prev.map((msg) => (msg._id === messageId ? response.data : msg))
      );
      socket.emit("messageEdited", response.data);
      setEditingMessageId(null);
      setEditMessage("");
    } catch (error) {
      console.error("Error editing message:", error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with group info and search */}
      <div className="p-4 bg-white shadow-md">
        {selectedChat && (
          <div className="flex flex-col gap-4">
            {/* Group info section */}
            <div className="flex items-center gap-4">
              <img
                src={selectedChat.image}
                alt={selectedChat.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <h2 className="text-xl font-semibold">{selectedChat.name}</h2>
            </div>

            {/* Search bar below group info */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
            </div>
          </div>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        <MessageList
          selectedChat={selectedChat}
          filteredMessages={filteredMessages}
          editingMessageId={editingMessageId}
          editMessage={editMessage}
          setEditMessage={setEditMessage}
          handleEditMessage={handleEditMessage}
          cancelEditing={cancelEditing}
          handleContextMenu={handleContextMenu}
          handleDownload={handleDownload}
          userId={userId}
          messageStatuses={messageStatuses}
        />
      </div>

      {/* Fixed message input at bottom */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200">
        <MessageInput
          message={message}
          setMessage={setMessage}
          handleSendMessage={handleSendMessage}
          showEmojiPicker={showEmojiPicker}
          setShowEmojiPicker={setShowEmojiPicker}
          onEmojiClick={onEmojiClick}
          handleFileUpload={handleFileUpload}
          uploading={uploading}
        />
      </div>

      <MessageContext
        menuId={MENU_ID}
        onStartEditing={(messageId) =>
          startEditing(
            messageId,
            messages.find((m) => m._id === messageId)?.message
          )
        }
        onDeleteMessage={handleDeleteMessage}
      />
    </div>
  );
};

export default ChatArea;
