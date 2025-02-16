import { useState, useEffect, useRef } from "react";
import {
  Send,
  Sparkles,
  User,
  Menu,
  X,
  Clock,
  MessageSquare,
  Trash2,
  Loader2,
  Check,
  ArrowLeft, // Added back arrow from lucide-react
} from "lucide-react";
import { io } from "socket.io-client";
import { useToast } from "../hooks/use-toast";
import katex from "katex";
import openAiGif from "../assets/hina.gif";

const socket = io("http://localhost:5000", {
  transports: ["websocket"],
  upgrade: false,
});

const VsmChat = ({ onBack }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeChat, setActiveChat] = useState(null);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const { toast } = useToast();
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editContent, setEditContent] = useState("");

  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      title: "Previous Chat 1",
      timestamp: "2 hours ago",
      messages: [
        { type: "user", content: "Hello" },
        { type: "ai", content: "Hi there! How can I help you today?" },
      ],
    },
    {
      id: 2,
      title: "Previous Chat 2",
      timestamp: "5 hours ago",
      messages: [
        { type: "user", content: "What's the weather like?" },
        {
          type: "ai",
          content:
            "I don't have access to real-time weather data, but I can help you find weather information!",
        },
      ],
    },
  ]);

  const processMathExpressions = (text) => {
    text = text.replace(/\$(.+?)\$/g, (match, math) => {
      try {
        return katex.renderToString(math, { displayMode: false });
      } catch (err) {
        console.error("KaTeX error:", err);
        return match;
      }
    });
    text = text.replace(/\$\$([\s\S]+?)\$\$/g, (match, math) => {
      try {
        return katex.renderToString(math, { displayMode: true });
      } catch (err) {
        console.error("KaTeX error:", err);
        return match;
      }
    });
    return text;
  };

  useEffect(() => {
    socketRef.current = io("http://localhost:5000", {
      transports: ["websocket"],
      upgrade: false,
    });

    socketRef.current.on("connect", () => {
      console.log("Connected to server");
      toast({
        title: "Connected to server",
        description: "Real-time chat is now enabled",
      });
    });

    socketRef.current.on("disconnect", () => {
      console.log("Disconnected from server");
      toast({
        title: "Disconnected from server",
        description: "Attempting to reconnect...",
        variant: "destructive",
      });
    });

    socketRef.current.on("error", (error) => {
      console.error("Socket error:", error);
      toast({
        title: "Connection error",
        description: "Please check your internet connection",
        variant: "destructive",
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleEdit = (messageId, content) => {
    setEditingMessageId(messageId);
    setEditContent(content);
  };

  const handleSaveEdit = (messageId) => {
    setMessages((prev) =>
      prev.map((msg, idx) =>
        idx === messageId ? { ...msg, content: editContent } : msg
      )
    );
    setEditingMessageId(null);
    setEditContent("");

    if (activeChat) {
      const updatedMessages = messages.map((msg, idx) =>
        idx === messageId ? { ...msg, content: editContent } : msg
      );
      updateChatHistory(updatedMessages, activeChat);
    }
  };

  const formatMessage = (content) => {
    const paragraphs = content.split("\n\n");
    return paragraphs.map((para, idx) => {
      if (para.startsWith("- ")) {
        return (
          <ul key={idx} className="list-disc ml-4 mb-2">
            {para.split("\n").map((item, i) => (
              <li
                key={i}
                className="mb-1"
                dangerouslySetInnerHTML={{
                  __html: processMathExpressions(item.replace("- ", "")),
                }}
              />
            ))}
          </ul>
        );
      }
      if (para.includes("$")) {
        return (
          <p
            key={idx}
            className="mb-2"
            dangerouslySetInnerHTML={{
              __html: processMathExpressions(para),
            }}
          />
        );
      }
      return (
        <p key={idx} className="mb-2">
          {para}
        </p>
      );
    });
  };

  const updateChatHistory = (newMessages, chatId = null) => {
    if (chatId) {
      setChatHistory((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                messages: newMessages,
                timestamp: "Just now",
                title:
                  newMessages[newMessages.length - 2]?.content?.slice(0, 30) +
                    "..." || chat.title,
              }
            : chat
        )
      );
    } else {
      const newChat = {
        id: Date.now(),
        title: newMessages[0]?.content?.slice(0, 30) + "...",
        timestamp: "Just now",
        messages: newMessages,
      };
      setChatHistory((prev) => [newChat, ...prev]);
      setActiveChat(newChat.id);
    }
  };

  const handleGenerate = async () => {
    if (!input.trim()) return;

    const userMessage = { type: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      if (!socketRef.current?.connected) {
        throw new Error("Not connected to server");
      }

      socketRef.current.emit("generate", { prompt: input });

      const response = await new Promise((resolve, reject) => {
        socketRef.current.once("generateResponse", resolve);
        socketRef.current.once("generateError", reject);
        setTimeout(() => reject(new Error("Request timeout")), 30000);
      });

      const aiResponse = { type: "ai", content: response.generations[0].text };
      const newMessages = [...messages, userMessage, aiResponse];
      setMessages(newMessages);

      if (activeChat) {
        updateChatHistory(newMessages, activeChat);
      } else {
        updateChatHistory(newMessages);
      }
    } catch (error) {
      console.error("Generation error:", error);
      const errorMessage = {
        type: "ai",
        content: "Error generating text. Please try again.",
      };
      const newMessages = [...messages, userMessage, errorMessage];
      setMessages(newMessages);
      updateChatHistory(newMessages, activeChat);

      toast({
        title: "Error",
        description: "Failed to generate response. Please try again.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const loadChat = async (chatId) => {
    setIsLoadingChat(true);
    try {
      const chat = chatHistory.find((c) => c.id === chatId);
      if (chat) {
        setMessages(chat.messages);
        setActiveChat(chat.id);
      }
    } catch (error) {
      console.error("Error loading chat:", error);
      toast({
        title: "Error",
        description: "Failed to load chat history",
        variant: "destructive",
      });
    }
    setIsLoadingChat(false);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const deleteChat = (chatId, e) => {
    e.stopPropagation();
    setChatHistory((prev) => prev.filter((chat) => chat.id !== chatId));
    if (activeChat === chatId) {
      setMessages([]);
      setActiveChat(null);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setActiveChat(null);
  };

  const handleCopy = async (messageId, content) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      toast({
        title: "Copied!",
        description: "Message copied to clipboard",
      });
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy message",
        variant: "destructive",
      });
    }
  };

  const MessageContent = ({ message, index }) => {
    const formattedContent = formatMessage(message.content);
    return (
      <div className="relative group">
        <div
          className={`relative rounded-2xl backdrop-blur-sm transition-all duration-300 ${
            message.type === "user"
              ? "bg-purple-600/90 text-white ml-1 w-auto h-auto p-1.5 text-sm hover:shadow-[0_0_25px_rgba(147,51,234,0.9)] shadow-[0_0_15px_rgba(147,51,234,0.7)]"
              : "bg-gradient-to-r from-cyan-500/90 to-blue-500/90 text-white w-fit max-w-[80%] p-1.5 hover:shadow-[0_0_25px_rgba(59,130,246,0.9)] shadow-[0_0_15px_rgba(59,130,246,0.7)]"
          }`}
        >
          <div
            className={`prose prose-invert max-w-none ${
              message.type === "user" ? "prose-sm leading-relaxed" : ""
            }`}
          >
            {formattedContent}
          </div>

          {/* Controls for messages */}
          <div
            className={`absolute ${
              message.type === "user" ? "-left-12 top-1" : "-right-12 top-1"
            } flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity`}
          >
            {message.type === "user" && (
              <button
                onClick={() => handleEdit(index, message.content)}
                className="p-1 rounded-full bg-purple-500/80 text-white hover:bg-purple-400 transition-all duration-300 hover:shadow-[0_0_15px_rgba(147,51,234,0.8)] shadow-[0_0_10px_rgba(147,51,234,0.6)]"
                title="Edit message"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  <path d="m15 5 4 4" />
                </svg>
              </button>
            )}
            <button
              onClick={() => handleCopy(index, message.content)}
              className={`p-1 rounded-full ${
                message.type === "user"
                  ? "bg-purple-500/80 hover:bg-purple-400 hover:shadow-[0_0_15px_rgba(147,51,234,0.8)] shadow-[0_0_10px_rgba(147,51,234,0.6)]"
                  : "bg-blue-500/80 hover:bg-blue-400 hover:shadow-[0_0_15px_rgba(59,130,246,0.8)] shadow-[0_0_10px_rgba(59,130,246,0.6)]"
              } text-white transition-all duration-300`}
              title="Copy message"
            >
              {copiedMessageId === index ? (
                <Check className="w-3 h-3 text-white" />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Edit overlay */}
        {editingMessageId === index && message.type === "user" && (
          <div className="mt-2 w-full max-w-[60%] ml-auto">
            <input
              type="text"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleSaveEdit(index);
              }}
              className="w-full p-1.5 text-sm rounded-lg bg-purple-700/90 text-white border border-purple-400 focus:outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.5)]"
              autoFocus
            />
            <div className="flex gap-2 mt-1.5 justify-end">
              <button
                onClick={() => setEditingMessageId(null)}
                className="px-2 py-0.5 rounded-md text-xs text-purple-200 hover:text-white hover:bg-purple-600/50 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveEdit(index)}
                className="px-2 py-0.5 rounded-md text-xs bg-purple-600 text-white hover:bg-purple-500 transition-all duration-300 shadow-[0_0_10px_rgba(147,51,234,0.5)]"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-screen w-full flex bg-black overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "w-64" : "w-0"
        } transition-all duration-300 bg-black backdrop-blur-sm border-r border-gray-700/50 flex flex-col overflow-hidden shadow-[5px_0_15px_rgba(0,0,0,0.3)]`}
      >
        <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Chat History</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={startNewChat}
          className="m-4 p-2 bg-purple-600/90 text-white rounded-lg hover:bg-purple-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(147,51,234,0.5)]"
        >
          <MessageSquare className="w-4 h-4" />
          New Chat
        </button>

        <div className="flex-1 overflow-y-auto  scrollbar-hidden">
          {chatHistory.map((chat) => (
            <div
              key={chat.id}
              onClick={() => loadChat(chat.id)}
              className={`p-4 border-b border-gray-700/50 hover:bg-gray-700/50 cursor-pointer relative group transition-all duration-300 ${
                activeChat === chat.id ? "bg-gray-700/70" : ""
              }`}
            >
              <div className="flex items-center gap-2 text-gray-300">
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm font-medium truncate flex-1">
                  {chat.title}
                </span>
                <button
                  onClick={(e) => deleteChat(chat.id, e)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition-all duration-300"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2 mt-2 text-gray-500 text-xs">
                <Clock className="w-3 h-3" />
                <span>{chat.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-gray-700/50 bg-black backdrop-blur-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className={`text-gray-400 hover:text-white transition-colors ${
              isSidebarOpen ? "hidden" : ""
            }`}
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center justify-center flex-1">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              I'm Hina
            </h1>
            <Sparkles className="ml-2 w-6 h-6 text-purple-400 animate-pulse" />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent p-4 space-y-6">
          {isLoadingChat ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.type === "ai" && (
                    <div className="flex-shrink-0">
                      <img src={openAiGif} alt="AI" className="w-12 h-12  " />
                    </div>
                  )}
                  <MessageContent message={message} index={index} />
                  {message.type === "user" && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-80 transition duration-200 flex items-center justify-center shadow-[0_0_10px_rgba(147,51,234,0.5)]">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3 justify-start">
                  <div className="flex-shrink-0">
                    <img
                      src={openAiGif}
                      alt="AI"
                      className="w-8 h-8 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                    />
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-700/90 backdrop-blur-sm text-gray-100 shadow-[0_0_15px_rgba(55,65,81,0.3)]">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Section */}
        <div className="p-4 border-t border-purple-900 bg-black backdrop-blur-sm">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleGenerate()}
              placeholder="Type your message..."
              className="w-full p-3 pr-12 rounded-lg bg-gray-700/90 text-white placeholder-gray-400 border-2 border-gray-600 focus:border-purple-500 focus:ring-purple-500 focus:outline-none transition-all duration-300 shadow-[0_0_15px_rgba(147,51,234,0.3)]"
            />
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700 transition-all duration-300 shadow-[0_0_15px_rgba(147,51,234,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VsmChat;
