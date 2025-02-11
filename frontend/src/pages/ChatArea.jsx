import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";
import { useContextMenu } from "react-contexify";
import "react-contexify/dist/ReactContexify.css";
import MessageList from "../components/MessageList";
import { Search, Users, Bell, Phone, Video } from "lucide-react";
import MessageInput from "../components/MessageInput";
import MessageContext from "../components/MessageContext";

const socket = io("http://localhost:5000", {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: Infinity,
});

const MENU_ID = "message-context-menu";
const MESSAGES_PER_PAGE = 50;

const ChatArea = ({ selectedChat, userId, currentUser, onNewMessage = () => {} }) => {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editMessage, setEditMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [messageStatuses, setMessageStatuses] = useState({});
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const { show } = useContextMenu({
    id: MENU_ID,
  });

  const scrollToBottom = (behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const fetchMessages = async (pageNum = 1, scrollToEnd = true) => {
    if (!selectedChat?._id || loading) return;
    
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/api/messages/${selectedChat._id}?page=${pageNum}&limit=${MESSAGES_PER_PAGE}`
      );
      
      const newMessages = response.data;
      if (pageNum === 1) {
        setMessages(newMessages);
        setFilteredMessages(newMessages);
        if (scrollToEnd) {
          setTimeout(() => scrollToBottom("auto"), 100);
        }
      } else {
        setMessages(prev => [...newMessages, ...prev]);
        setFilteredMessages(prev => [...newMessages, ...prev]);
      }
      
      setHasMore(newMessages.length === MESSAGES_PER_PAGE);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (container && container.scrollTop === 0 && hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMessages(nextPage, false);
    }
  };

  useEffect(() => {
    if (selectedChat) {
      setPage(1);
      setHasMore(true);
      socket.emit("joinGroup", selectedChat._id);
      fetchMessages(1);
      socket.emit("markMessagesAsRead", { groupId: selectedChat._id, userId });
    }
    return () => {
      if (selectedChat?._id) {
        socket.emit("leaveGroup", selectedChat._id);
      }
      setShowEmojiPicker(false);
    };
  }, [selectedChat, userId]);

  useEffect(() => {
    const handleNewMessage = (newMsg) => {
      if (selectedChat && selectedChat._id === newMsg.groupId) {
        setMessages((prev) => {
          const messageExists = prev.some((msg) => msg._id === newMsg._id);
          if (!messageExists) {
            const newMessages = [...prev, newMsg];
            return newMessages;
          }
          return prev;
        });
        setFilteredMessages((prev) => {
          const messageExists = prev.some((msg) => msg._id === newMsg._id);
          if (!messageExists) {
            const newMessages = [...prev, newMsg];
            return newMessages;
          }
          return prev;
        });
        scrollToBottom();
        socket.emit("markMessagesAsRead", { groupId: newMsg.groupId, userId });
      }
      if (typeof onNewMessage === 'function') {
        onNewMessage(newMsg);
      }
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
      socket.off("messageEdited", handleMessageRead);
      socket.off("messageRead", handleMessageRead);
    };
  }, [selectedChat, userId, onNewMessage]);

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

  const startEditing = (messageId) => {
    const messageToEdit = messages.find((m) => m._id === messageId);
    if (messageToEdit) {
      setEditingMessageId(messageId);
      setEditMessage(messageToEdit.message || "");
    }
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

  if (!selectedChat) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center p-8 rounded-lg bg-white shadow-lg">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Welcome to Chat</h3>
          <p className="text-gray-600">Select a conversation to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="p-4 bg-white shadow-lg">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={selectedChat.image}
                  alt={selectedChat.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-purple-500"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{selectedChat.name}</h2>
                <p className="text-sm text-gray-500">
                  {selectedChat.members?.length || 0} members • Active now
                </p>
              </div>
            </div>
            
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search in conversation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
          </div>
        </div>
      </div>

      <div 
        className="flex-1 overflow-y-auto px-4 py-2" 
        ref={messagesContainerRef}
        onScroll={handleScroll}
      >
        {loading && page === 1 ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <>
            {loading && page > 1 && (
              <div className="text-center py-2">
                <div className="animate-spin inline-block rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
              </div>
            )}
            <MessageList
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
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <MessageInput
          message={message}
          setMessage={setMessage}
          handleSendMessage={() => handleSendMessage()}
          showEmojiPicker={showEmojiPicker}
          setShowEmojiPicker={setShowEmojiPicker}
          onEmojiClick={onEmojiClick}
          handleFileUpload={handleFileUpload}
          uploading={uploading}
        />
      </div>

      <MessageContext
        menuId={MENU_ID}
        onStartEditing={startEditing}
        onDeleteMessage={handleDeleteMessage}
      />
    </div>
  );
};

export default ChatArea;