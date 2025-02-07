import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Trash2,
  Edit,
  Check,
  X,
  Smile,
  Paperclip,
  Download,
  File,
  Search,
  Check as SingleCheck,
  CheckCheck as DoubleCheck,
} from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import io from "socket.io-client";
import axios from "axios";
import { Menu, Item, useContextMenu } from "react-contexify";
import "react-contexify/dist/ReactContexify.css";

const socket = io("http://localhost:5000");
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
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const { show } = useContextMenu({
    id: MENU_ID,
  });

  // Scroll to bottom when new messages arrive
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
    return () => setShowEmojiPicker(false);
  }, [selectedChat]);

  useEffect(() => {
    socket.on("newMessage", (newMsg) => {
      setMessages((prev) => {
        const messageExists = prev.some((msg) => msg._id === newMsg._id);
        if (!messageExists) {
          return [...prev, newMsg];
        }
        return prev;
      });
    });

    socket.on("messageDeleted", (deletedMessageId) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== deletedMessageId));
    });

    socket.on("messageEdited", (editedMessage) => {
      setMessages((prev) =>
        prev.map((msg) => (msg._id === editedMessage._id ? editedMessage : msg))
      );
    });

    socket.on("messageRead", ({ messageId, readBy }) => {
      setMessageStatuses((prev) => ({
        ...prev,
        [messageId]: {
          ...prev[messageId],
          readBy: [...(prev[messageId]?.readBy || []), readBy],
        },
      }));
    });

    return () => {
      socket.off("newMessage");
      socket.off("messageDeleted");
      socket.off("messageEdited");
      socket.off("messageRead");
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
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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
      await axios.post("http://localhost:5000/api/messages", newMessage);
      setMessage("");
      setShowEmojiPicker(false);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleDownload = (dataUrl, fileName) => {
    const link = document.createElement('a');
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

      setEditingMessageId(null);
      setEditMessage("");
    } catch (error) {
      console.error("Error editing message:", error);
    }
  };

  const getMessageStatus = (message) => {
    const status = messageStatuses[message._id];
    if (!status) return "sent";

    const readCount = status.readBy?.length || 0;
    const totalMembers = selectedChat.members.length - 1; // Excluding sender

    if (readCount === 0) return "sent";
    if (readCount < totalMembers) return "delivered";
    return "read";
  };

  const MessageStatus = ({ status }) => {
    switch (status) {
      case "sent":
        return <SingleCheck className="w-4 h-4 text-gray-400" />;
      case "delivered":
        return <DoubleCheck className="w-4 h-4 text-gray-400" />;
      case "read":
        return <DoubleCheck className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderFileContent = (fileData) => {
    if (!fileData) return null;

    const base64Data = `data:${fileData.contentType};base64,${fileData.data}`;

    if (fileData.contentType.startsWith('image/')) {
      return (
        <div className="relative group">
          <img
            src={base64Data}
            alt="Uploaded content"
            className="max-w-full rounded-lg cursor-pointer"
          />
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => handleDownload(base64Data, fileData.fileName)}
              className="p-2 bg-gray-800 bg-opacity-75 rounded-full text-white hover:bg-opacity-100"
            >
              <Download size={16} />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
        <div className="p-2 bg-gray-200 rounded">
          <File size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{fileData.fileName}</p>
          <p className="text-xs text-gray-500">
            {fileData.contentType.split('/')[1].toUpperCase()}
          </p>
        </div>
        <button
          onClick={() => handleDownload(base64Data, fileData.fileName)}
          className="p-2 text-blue-500 hover:text-blue-600"
        >
          <Download size={20} />
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {selectedChat ? (
        <>
          <div className="p-4 bg-white shadow-md flex flex-col gap-3 sticky top-0 z-10">
            <div className="flex items-center">
              <img
                src={selectedChat.image}
                alt="Group"
                className="w-10 h-10 rounded-full mr-3"
              />
              <h2 className="text-xl font-semibold text-gray-800">
                {selectedChat.name}
              </h2>
            </div>

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

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredMessages.map((msg, index) => {
              const messageSenderId = msg.senderId._id || msg.senderId;
              const currentUserId = userId || localStorage.getItem("userId");
              const isOwnMessage = messageSenderId === currentUserId;
              const senderName = msg.senderId.name || msg.senderName || "Unknown";
              const messageDate = formatDate(msg.timestamp);
              const showDateHeader =
                index === 0 ||
                formatDate(filteredMessages[index - 1].timestamp) !== messageDate;

              return (
                <React.Fragment key={msg._id || index}>
                  {showDateHeader && (
                    <div className="flex justify-center my-4">
                      <span className="bg-gray-200 text-gray-600 px-4 py-1 rounded-full text-sm">
                        {messageDate}
                      </span>
                    </div>
                  )}
                  <div
                    className={`flex ${
                      isOwnMessage ? "justify-end" : "justify-start"
                    } group`}
                    onContextMenu={(e) => handleContextMenu(e, msg)}
                  >
                    <div
                      className={`max-w-[70%] ${
                        isOwnMessage ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`relative px-4 py-2 rounded-lg shadow-sm
                          ${
                            isOwnMessage
                              ? "bg-blue-500 text-white rounded-br-none"
                              : "bg-white text-gray-800 rounded-bl-none"
                          }`}
                      >
                        {!isOwnMessage && (
                          <div className="text-xs font-medium text-blue-600 mb-1">
                            {senderName}
                          </div>
                        )}
                        {editingMessageId === msg._id ? (
                          <div className="flex flex-col gap-2">
                            <input
                              type="text"
                              value={editMessage}
                              onChange={(e) => setEditMessage(e.target.value)}
                              className="p-2 rounded border text-black w-full"
                              autoFocus
                            />
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => handleEditMessage(msg._id)}
                                className="p-1 hover:bg-blue-600 rounded text-white bg-blue-500"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="p-1 hover:bg-red-600 rounded text-white bg-red-500"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {msg.fileData && renderFileContent(msg.fileData)}
                            {msg.message && (
                              <p className="text-sm break-words">
                                {msg.message}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1 text-xs">
                              <span
                                className={
                                  isOwnMessage
                                    ? "text-blue-100"
                                    : "text-gray-500"
                                }
                              >
                                {formatTimestamp(msg.timestamp)}
                              </span>
                              {msg.edited && (
                                <span
                                  className={
                                    isOwnMessage
                                      ? "text-blue-100"
                                      : "text-gray-500"
                                  }
                                >
                                  • edited
                                </span>
                              )}
                              {isOwnMessage && (
                                <MessageStatus status={getMessageStatus(msg)} />
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t relative">
            {showEmojiPicker && (
              <div className="absolute bottom-full right-4 mb-2">
                <EmojiPicker
                  onEmojiClick={onEmojiClick}
                  width={300}
                  height={400}
                />
              </div>
            )}
            <div className="flex items-center gap-2 max-w-4xl mx-auto">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-3 text-gray-500 hover:text-gray-700 transition-colors"
                type="button"
              >
                <Smile size={20} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 text-gray-500 hover:text-gray-700 transition-colors"
                disabled={uploading}
                type="button"
              >
                <Paperclip size={20} />
              </button>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder={
                  uploading ? "Uploading file..." : "Type a message..."
                }
                className="flex-1 p-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={uploading}
              />
              <button
                onClick={() => handleSendMessage()}
                className="p-3 text-white bg-blue-500 rounded-full hover:bg-blue-600 transition-colors"
                disabled={uploading}
              >
                <Send size={20} />
              </button>
            </div>
          </div>

          <Menu id={MENU_ID}>
            <Item
              onClick={({ props }) =>
                startEditing(
                  props.messageId,
                  messages.find((m) => m._id === props.messageId)?.message
                )
              }
            >
              <Edit className="mr-2" size={16} />
              Edit Message
            </Item>
            <Item onClick={handleDeleteMessage}>
              <Trash2 className="mr-2" size={16} />
              Delete Message
            </Item>
          </Menu>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Select a chat to start messaging
        </div>
      )}
    </div>
  );
};

export default ChatArea;