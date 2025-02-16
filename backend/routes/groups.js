// routes/groups.js
const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const Group = require("../models/groupModel");     // Adjust the path as needed
const Message = require("../models/Message"); // Adjust the path as needed

// DELETE /api/groups/:groupId/deleteAll
router.delete("/:groupId/deleteAll", protect, async (req, res) => {
  const { groupId } = req.params;
  try {
    // Find the group by ID
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    
    // Debug logging to verify IDs
    console.log("Group Creator ID:", group.createdBy.toString());
    console.log("User ID from token:", req.user._id);

    // Check if the logged-in user is the creator of the group
    if (group.createdBy.toString() !== req.user._id) {
      return res.status(403).json({ message: "You are not authorized to delete this group." });
    }
    
    // Delete all messages associated with the group
    await Message.deleteMany({ chatId: groupId });
    // Delete the group
    await Group.findByIdAndDelete(groupId);
    
    res.status(200).json({ message: "Group and its messages have been deleted successfully." });
  } catch (error) {
    console.error("Error deleting group:", error);
    res.status(500).json({ message: "Error deleting group. Please try again." });
  }
});

module.exports = router;
