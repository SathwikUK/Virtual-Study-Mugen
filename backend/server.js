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

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*" },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("uploads"));

// File Upload Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Failed:", err));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// API to send a message
app.post("/api/messages", async (req, res) => {
    try {
      const { groupId, senderId, message, fileUrl } = req.body;
  
      if (!senderId) {
        return res.status(400).json({ error: "Sender ID is required." });
      }
  
      // Check if sender exists
      const sender = await User.findById(senderId);
      if (!sender) {
        return res.status(404).json({ error: "Sender not found." });
      }
  
      // Check if sender is a member of the group
      const group = await Group.findById(groupId);
      if (!group || !group.members.includes(senderId)) {
        return res.status(403).json({ error: "User is not a member of this group." });
      }
  
      // Save the message
      const newMessage = new Message({ groupId, senderId, message, fileUrl });
      await newMessage.save();
  
      // Emit message via Socket.io
      io.to(groupId).emit("newMessage", newMessage);
      res.status(201).json(newMessage);
    } catch (error) {
      console.error("Error saving message:", error);
      res.status(500).json({ error: "Failed to send message." });
    }
  });
  
// API to fetch messages for a group
app.get("/api/messages/:groupId", async (req, res) => {
    try {
        const messages = await Message.find({ groupId: req.params.groupId })
        .populate("senderId", "name")  // This should work if 'senderId' refers to 'studentUser' model
        .sort({ timestamp: 1 });
      
  
      if (!messages) {
        console.log(`No messages found for group: ${req.params.groupId}`);
      }
      
      res.status(200).json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });
  
// API to upload a file
app.post("/api/upload", upload.single("file"), (req, res) => {
  res.json({ fileUrl: `http://localhost:5000/${req.file.filename}` });
});

// Socket.io Connection
io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("joinGroup", (groupId) => {
    socket.join(groupId);
  });

  socket.on("sendMessage", async (messageData) => {
    const newMessage = new Message(messageData);
    await newMessage.save();
    io.to(messageData.groupId).emit("newMessage", newMessage);
  });

  socket.on("disconnect", () => console.log("User disconnected"));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
