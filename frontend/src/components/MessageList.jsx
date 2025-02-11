import React, { useEffect, useRef } from "react";
import { Download, File, Check, X } from "lucide-react";

const MessageList = ({
  selectedChat,
  filteredMessages,
  editingMessageId,
  editMessage,
  setEditMessage,
  handleEditMessage,
  cancelEditing,
  handleContextMenu,
  handleDownload,
  userId,
  messageStatuses,
}) => {
  const messagesEndRef = useRef(null);

  // Scroll to the latest message when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [filteredMessages]);

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

  const getMessageStatus = (message) => {
    const status = messageStatuses[message._id];
    if (!status) return "sent";

    const readCount = status.readBy?.length || 0;
    const totalMembers = selectedChat.members.length - 1;

    if (readCount === 0) return "sent";
    if (readCount < totalMembers) return "delivered";
    return "read";
  };

  const MessageStatus = ({ status }) => {
    switch (status) {
      case "sent":
        return <Check className="w-4 h-4 text-gray-400" />;
      case "delivered":
        return (
          <div className="flex -space-x-1">
            <Check className="w-4 h-4 text-gray-400" />
            <Check className="w-4 h-4 text-gray-400" />
          </div>
        );
      case "read":
        return (
          <div className="flex -space-x-1">
            <Check className="w-4 h-4 text-blue-500" />
            <Check className="w-4 h-4 text-blue-500" />
          </div>
        );
      default:
        return null;
    }
  };

  const renderFileContent = (fileData) => {
    if (!fileData) return null;

    const base64Data = `data:${fileData.contentType};base64,${fileData.data}`;

    if (fileData.contentType.startsWith("image/")) {
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
            {fileData.contentType.split("/")[1].toUpperCase()}
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
                <div className={`max-w-[70%] ${isOwnMessage ? "items-end" : "items-start"}`}>
                  <div
                    className={`relative px-4 py-2 rounded-lg shadow-sm ${
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
                        {msg.message && <p className="text-sm break-words">{msg.message}</p>}
                        <div className="flex items-center gap-2 mt-1 text-xs">
                          <span className={isOwnMessage ? "text-blue-100" : "text-gray-500"}>
                            {formatTimestamp(msg.timestamp)}
                          </span>
                          {msg.edited && <span className="text-gray-500">• edited</span>}
                          {isOwnMessage && <MessageStatus status={getMessageStatus(msg)} />}
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
    </div>
  );
};

export default MessageList;
