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
    <div className="p-2 bg-[#12121f] border-t border-[#2a2a4a] relative">
      {showEmojiPicker && (
        <div className="absolute bottom-full right-2 mb-2 shadow-[0_0_15px_rgba(139,139,255,0.2)] rounded-lg overflow-hidden">
          <div className="bg-[#1a1a2e] p-1 rounded-lg">
            <EmojiPicker 
              onEmojiClick={onEmojiClick} 
              width={250} 
              height={350}
              searchPlaceholder="Search emojis..."
              previewConfig={{ showPreview: false }}
              theme="dark"
              emojiStyle="native"
            />
          </div>
        </div>
      )}
      <div className="flex items-center gap-1 max-w-full mx-auto bg-[#1a1a2e] p-1 rounded-lg shadow-[0_0_10px_rgba(139,139,255,0.1)]">
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 text-[#8b8bff] hover:bg-[#2a2a4a] rounded-lg transition-all duration-300"
          type="button"
        >
          <Smile size={16} />
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
          className="p-2 text-[#8b8bff] hover:bg-[#2a2a4a] rounded-lg transition-all duration-300"
          disabled={uploading}
          type="button"
        >
          <Paperclip size={16} />
        </button>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
          placeholder={uploading ? "Uploading file..." : "Type a message..."}
          className="flex-1 p-2 bg-transparent text-[#8b8bff] placeholder-[#4a4a6a] focus:outline-none text-sm"
          disabled={uploading}
        />
        <button
          onClick={handleSendMessage}
          className={`p-2 rounded-lg transition-all duration-300 ${
            message.trim() || uploading
              ? "bg-[#8b8bff] text-[#0a0a0f] hover:bg-[#9d9dff] shadow-[0_0_8px_rgba(139,139,255,0.3)]"
              : "bg-[#2a2a4a] text-[#4a4a6a] cursor-not-allowed"
          }`}
          disabled={!message.trim() || uploading}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
