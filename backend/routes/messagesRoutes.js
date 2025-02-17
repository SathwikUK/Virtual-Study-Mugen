// routes/messagesRoutes.js
const express = require("express");
const router = express.Router();
const messagesController = require("../controllers/messagesController");

// POST /api/messages - Send a new message
router.post("/", messagesController.sendMessage);

// GET /api/messages/:groupId - Fetch messages for a group
router.get("/:groupId", messagesController.fetchMessages);

// PUT /api/messages/:messageId - Edit a message
router.put("/:messageId", messagesController.editMessage);

// DELETE /api/messages/:messageId - Delete a message
router.delete("/:messageId", messagesController.deleteMessage);

// GET /api/messages/unread/:userId - Get unread counts per group for a user
router.get("/unread/:userId", messagesController.getUnreadCounts);

module.exports = router;
