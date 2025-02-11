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
        <div className="absolute bottom-full right-4 mb-2 shadow-xl rounded-lg overflow-hidden">
          <EmojiPicker 
            onEmojiClick={onEmojiClick} 
            width={300} 
            height={400}
            searchPlaceholder="Search emojis..."
            previewConfig={{ showPreview: false }}
          />
        </div>
      )}
      <div className="flex items-center gap-2 max-w-4xl mx-auto bg-gray-50 p-2 rounded-full shadow-sm">
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-all"
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
          className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-all"
          disabled={uploading}
          type="button"
        >
          <Paperclip size={20} />
        </button>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
          placeholder={uploading ? "Uploading file..." : "Type a message..."}
          className="flex-1 p-3 bg-transparent focus:outline-none placeholder-gray-500"
          disabled={uploading}
        />
        <button
          onClick={() => handleSendMessage()}
          className={`p-3 rounded-full transition-all ${
            message.trim() || uploading
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
          disabled={!message.trim() || uploading}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;