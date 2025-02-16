const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const Message = require("./models/Message");
const Group = require("./models/groupModel");
const User = require("./models/user");
const multer = require("multer");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const axios = require("axios");
const groupsRouter = require("./routes/groups");

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*" },
  maxHttpBufferSize: 1e8,
  pingTimeout: 60000,
});

const COHERE_API_KEY = process.env.COHERE_API_KEY;

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Multer configuration for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 100,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Failed:", err));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/groups", groupsRouter);


// API to send a message
app.post("/api/messages", async (req, res) => {
  try {
    const { groupId, senderId, message, fileData } = req.body;

    if (!senderId) {
      return res.status(400).json({ error: "Sender ID is required." });
    }

    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(404).json({ error: "Sender not found." });
    }

    const group = await Group.findById(groupId);
    if (!group || !group.members.includes(senderId)) {
      return res.status(403).json({ error: "User is not a member of this group." });
    }

    const newMessage = new Message({
      groupId,
      senderId,
      message,
      fileData: fileData
        ? {
            data: Buffer.from(fileData.data, "base64"),
            contentType: fileData.contentType,
            fileName: fileData.fileName,
          }
        : undefined,
      senderName: sender.name,
    });

    await newMessage.save();

    const messageToSend = newMessage.toObject();
    if (messageToSend.fileData) {
      messageToSend.fileData.data = messageToSend.fileData.data.toString("base64");
    }

    io.to(groupId).emit("newMessage", messageToSend);
    res.status(201).json(messageToSend);
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ error: "Failed to send message." });
  }
});

// API to upload a file
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileData = {
      data: req.file.buffer.toString("base64"),
      contentType: req.file.mimetype,
      fileName: req.file.originalname,
    };

    res.json({ fileData });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "Failed to upload file" });
  }
});

// API to fetch messages for a group
app.get("/api/messages/:groupId", async (req, res) => {
  try {
    const messages = await Message.find({ groupId: req.params.groupId })
      .populate("senderId", "name")
      .sort({ timestamp: 1 });

    const messagesToSend = messages.map((msg) => {
      const msgObj = msg.toObject();
      if (msgObj.fileData && msgObj.fileData.data) {
        msgObj.fileData.data = msgObj.fileData.data.toString("base64");
      }
      return msgObj;
    });

    res.status(200).json(messagesToSend);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// API to edit a message
app.put("/api/messages/:messageId", async (req, res) => {
  try {
    const { message } = req.body;
    const updatedMessage = await Message.findByIdAndUpdate(
      req.params.messageId,
      { message, edited: true },
      { new: true }
    ).populate("senderId", "name");

    if (!updatedMessage) {
      return res.status(404).json({ error: "Message not found" });
    }

    const messageToSend = updatedMessage.toObject();
    if (messageToSend.fileData && messageToSend.fileData.data) {
      messageToSend.fileData.data = messageToSend.fileData.data.toString("base64");
    }

    io.to(updatedMessage.groupId).emit("messageEdited", messageToSend);
    res.status(200).json(messageToSend);
  } catch (error) {
    console.error("Error editing message:", error);
    res.status(500).json({ error: "Failed to edit message" });
  }
});

// API to delete a message
app.delete("/api/messages/:messageId", async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    await Message.findByIdAndDelete(req.params.messageId);
    io.to(message.groupId).emit("messageDeleted", req.params.messageId);
    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ error: "Failed to delete message" });
  }
});

// Socket.io Connection
io.on("connection", (socket) => {
  console.log("New client connected");
  let currentUser = null;

  socket.on("setUser", (userId) => {
    currentUser = userId;
    socket.join(`user_${userId}`);
    console.log(`User ${userId} connected`);
  });

  socket.on("joinGroup", (groupId) => {
    socket.join(groupId);
    console.log(`User joined group: ${groupId}`);
  });

  socket.on("leaveGroup", (groupId) => {
    if (groupId) {
      socket.leave(groupId);
      console.log(`User left group: ${groupId}`);
    }
  });
  socket.on("generate", async (data) => {
    try {
      const response = await axios.post(
        "https://api.cohere.ai/v1/generate",
        {
          model: "command",
          prompt: data.prompt,
          max_tokens: 1000
        },
        {
          headers: {
            Authorization: `BEARER ${COHERE_API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );

      socket.emit("generateResponse", response.data);
    } catch (error) {
      console.error("Generation error:", error);
      socket.emit("generateError", { message: error.message });
    }
  });

  socket.on("sendMessage", async (message) => {
    try {
      const newMessage = new Message({
        ...message,
        readBy: [message.senderId], // Mark as read by sender
      });
      await newMessage.save();

      // Broadcast to all users in the group
      socket.to(message.groupId).emit("newMessage", newMessage);

      // Get group members
      const group = await Group.findById(message.groupId);
      if (group) {
        // Emit unreadMessage event to all group members except sender
        group.members.forEach((memberId) => {
          if (memberId.toString() !== message.senderId.toString()) {
            io.to(`user_${memberId}`).emit("newMessage", newMessage);
          }
        });
      }
    } catch (error) {
      console.error("Error handling message:", error);
    }
  });

  socket.on("markMessagesAsRead", async ({ groupId, userId }) => {
    try {
      await Message.updateMany(
        {
          groupId,
          senderId: { $ne: userId },
          readBy: { $nin: [userId] },
        },
        {
          $addToSet: { readBy: userId },
        }
      );

      // Emit to all connected clients that messages were marked as read
      io.emit("messagesMarkedAsRead", { groupId, userId });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  });

  socket.on("disconnect", () => {
    if (currentUser) {
      socket.leave(`user_${currentUser}`);
    }
    console.log("User disconnected");
  });
});

// API to get unread counts per group for a user
app.get("/api/messages/unread/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    // Use the 'new' keyword to create an ObjectId instance
    const userObjId = new mongoose.Types.ObjectId(userId);
    // Aggregate unread message counts per group
    const counts = await Message.aggregate([
      {
        $match: {
          senderId: { $ne: userObjId },
          // For array field "readBy", use $nin to filter out messages read by the user
          readBy: { $nin: [userObjId] },
        },
      },
      {
        $group: {
          _id: "$groupId",
          count: { $sum: 1 },
        },
      },
    ]);

    // Format the response as an array of { groupId, count }
    const unreadCounts = counts.map((c) => ({
      groupId: c._id,
      count: c.count,
    }));
    res.json(unreadCounts);
  } catch (error) {
    console.error("Error getting unread counts:", error);
    res.status(500).json({ error: "Failed to get unread counts" });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
