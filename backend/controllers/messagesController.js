// controllers/messagesController.js
const mongoose = require("mongoose");
const Message = require("../models/Message");
const Group = require("../models/groupModel");
const User = require("../models/user");

exports.sendMessage = async (req, res) => {
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
      return res
        .status(403)
        .json({ error: "User is not a member of this group." });
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

    // Get the io instance from the app and emit the new message
    const io = req.app.get("io");
    io.to(groupId).emit("newMessage", messageToSend);

    res.status(201).json(messageToSend);
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ error: "Failed to send message." });
  }
};

exports.fetchMessages = async (req, res) => {
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
};

exports.editMessage = async (req, res) => {
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

    const io = req.app.get("io");
    io.to(updatedMessage.groupId).emit("messageEdited", messageToSend);

    res.status(200).json(messageToSend);
  } catch (error) {
    console.error("Error editing message:", error);
    res.status(500).json({ error: "Failed to edit message" });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    await Message.findByIdAndDelete(req.params.messageId);

    const io = req.app.get("io");
    io.to(message.groupId).emit("messageDeleted", req.params.messageId);

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ error: "Failed to delete message" });
  }
};

exports.getUnreadCounts = async (req, res) => {
  try {
    const { userId } = req.params;
    const userObjId = new mongoose.Types.ObjectId(userId);

    const counts = await Message.aggregate([
      {
        $match: {
          senderId: { $ne: userObjId },
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

    const unreadCounts = counts.map((c) => ({
      groupId: c._id,
      count: c.count,
    }));

    res.json(unreadCounts);
  } catch (error) {
    console.error("Error getting unread counts:", error);
    res.status(500).json({ error: "Failed to get unread counts" });
  }
};
