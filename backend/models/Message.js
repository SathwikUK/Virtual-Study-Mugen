const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "studentGroup", required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "studentUser", required: true },
  message: { type: String, required: false },
  fileData: {
    data: Buffer,
    contentType: String,
    fileName: String
  },
  timestamp: { type: Date, default: Date.now },
  edited: { type: Boolean, default: false },
  senderName: { type: String }
});

module.exports = mongoose.model("Message", MessageSchema);