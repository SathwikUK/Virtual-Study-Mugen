import React, { useRef } from "react";
import { Send, Smile, Paperclip } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

const MessageInput = ({
  message,
  setMessage,
  handleSendMessage,
  showEmojiPicker,
  setShowEmojiPicker,
  onEmojiClick,
  handleFileUpload,
  uploading,
}) => {
  const fileInputRef = useRef(null);

  return (
    <div className="p-4 bg-white border-t relative">
      {showEmojiPicker && (
        <div className="absolute bottom-full right-4 mb-2">
          <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={400} />
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
          placeholder={uploading ? "Uploading file..." : "Type a message..."}
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
  );
};

export default MessageInput;
