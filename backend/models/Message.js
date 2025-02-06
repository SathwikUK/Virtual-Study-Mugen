const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "studentGroup", required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "studentUser", required: true },
  message: { type: String, required: false },
  fileUrl: { type: String, required: false },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", MessageSchema);
