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
        return <Check className="w-4 h-4 text-purple-400" />;
      case "delivered":
        return (
          <div className="flex -space-x-1">
            <Check className="w-4 h-4 text-purple-400" />
            <Check className="w-4 h-4 text-purple-400" />
          </div>
        );
      case "read":
        return (
          <div className="flex -space-x-1">
            <Check className="w-4 h-4 text-purple-500" />
            <Check className="w-4 h-4 text-purple-500" />
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
            className="max-w-full rounded-lg cursor-pointer border border-purple-500 shadow-lg"
          />
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => handleDownload(base64Data, fileData.fileName)}
              className="p-2 bg-gray-900 bg-opacity-75 rounded-full text-purple-400 hover:text-purple-300 hover:bg-opacity-100 transition-all duration-300"
            >
              <Download size={16} />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg border border-purple-500 shadow-lg">
        <div className="p-2 bg-gray-800 rounded border border-purple-400">
          <File size={24} className="text-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-purple-300 truncate">
            {fileData.fileName}
          </p>
          <p className="text-xs text-purple-400">
            {fileData.contentType.split("/")[1].toUpperCase()}
          </p>
        </div>
        <button
          onClick={() => handleDownload(base64Data, fileData.fileName)}
          className="p-2 text-purple-400 hover:text-purple-300 transition-colors"
        >
          <Download size={20} />
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar"
        style={{
          '--scrollbar-color': '#7C3AED',
          '--scrollbar-bg': '#1F2937',
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--scrollbar-color) var(--scrollbar-bg)',
        }}
      >
        <style jsx global>{`
          /* For Webkit browsers (Chrome, Safari) */
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }

          .custom-scrollbar::-webkit-scrollbar-track {
            background: var(--scrollbar-bg);
            border-radius: 8px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: var(--scrollbar-color);
            border-radius: 8px;
            border: 2px solid var(--scrollbar-bg);
          }

          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #9061F9;
            box-shadow: 0 0 10px rgba(147, 51, 234, 0.5);
          }

          /* For Firefox */
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: var(--scrollbar-color) var(--scrollbar-bg);
          }

          /* Hide scrollbar when not hovering */
          .custom-scrollbar {
            transition: all 0.3s ease;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb {
            opacity: 0;
            transition: opacity 0.3s ease;
          }

          .custom-scrollbar:hover::-webkit-scrollbar-thumb {
            opacity: 1;
          }
        `}</style>

        {/* Rest of the component content remains the same */}
        {filteredMessages.map((msg, index) => {
          const messageSenderId = msg.senderId._id || msg.senderId;
          const isOwnMessage = messageSenderId === userId;
          const senderName = msg.senderName || "Unknown";
          const messageDate = formatDate(msg.timestamp);
          const showDateHeader =
            index === 0 ||
            formatDate(filteredMessages[index - 1].timestamp) !== messageDate;

          return (
            <React.Fragment key={msg._id || index}>
              {showDateHeader && (
                <div className="flex justify-center my-4">
                  <span className="bg-gray-800 text-purple-300 px-4 py-1 rounded-full text-sm border border-purple-500 shadow-[0_0_10px_rgba(147,51,234,0.3)]">
                    {messageDate}
                  </span>
                </div>
              )}
              <div
                className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} group`}
                onContextMenu={(e) => handleContextMenu(e, msg)}
              >
                <div
                  className={`max-w-[70%] ${
                    isOwnMessage ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`relative px-4 py-2 rounded-lg ${
                      isOwnMessage
                        ? "bg-purple-900 text-purple-100 rounded-br-none border border-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.4)]"
                        : "bg-gray-800 text-purple-100 rounded-bl-none border border-purple-400 shadow-[0_0_15px_rgba(147,51,234,0.2)]"
                    } transition-all duration-300 hover:shadow-[0_0_20px_rgba(147,51,234,0.5)]`}
                  >
                    {!isOwnMessage && (
                      <div className="text-xs font-medium text-purple-400 mb-1">
                        {senderName}
                      </div>
                    )}
                    {editingMessageId === msg._id ? (
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          value={editMessage}
                          onChange={(e) => setEditMessage(e.target.value)}
                          className="p-2 rounded border border-purple-500 bg-gray-800 text-purple-100 w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                          autoFocus
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleEditMessage(msg._id)}
                            className="p-1 hover:bg-purple-700 rounded text-purple-100 bg-purple-800 transition-colors"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="p-1 hover:bg-red-700 rounded text-red-100 bg-red-800 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {msg.fileData && renderFileContent(msg.fileData)}
                        {msg.message && (
                          <p className="text-sm break-words">{msg.message}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1 text-xs">
                          <span className="text-purple-300">
                            {formatTimestamp(msg.timestamp)}
                          </span>
                          {msg.edited && (
                            <span className="text-purple-400">• edited</span>
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
    </div>
  );
};

export default MessageList;